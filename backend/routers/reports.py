"""
FacilityDesk analytics reports — McKinsey-style PDFs.

Rendering pipeline: SQLAlchemy query → context dict → Jinja2 HTML template
(templates/reports/*.html) with hand-built inline SVG charts → WeasyPrint → PDF.
Routes, query params and audit logging are unchanged from the previous version.
"""
import io
import os
from datetime import datetime, timedelta
from collections import Counter, defaultdict
from html import escape
from typing import Optional

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session, joinedload

from jinja2 import Environment, FileSystemLoader, select_autoescape

from database import get_db
from models.ticket import Ticket
from models.feedback import Feedback
from models.office import Office
from utils.audit import log_audit
from utils import report_charts as charts

router = APIRouter(prefix="/api/reports", tags=["reports"])

# ── Jinja environment ──
_TEMPLATE_DIR = os.path.join(os.path.dirname(__file__), "..", "templates", "reports")
_env = Environment(
    loader=FileSystemLoader(_TEMPLATE_DIR),
    autoescape=select_autoescape(["html", "xml"]),
)


def _load_css() -> str:
    with open(os.path.join(_TEMPLATE_DIR, "report.css"), encoding="utf-8") as fh:
        return fh.read()


def _ist_now() -> datetime:
    return datetime.utcnow() + timedelta(hours=5, minutes=30)


def _date_range(period: str):
    now = _ist_now()
    if period == "weekly":
        return now - timedelta(days=7), "Weekly", 14
    elif period == "monthly":
        return now - timedelta(days=30), "Monthly", 30
    return now - timedelta(days=365), "Yearly", 30


def _pri_cls(p: str) -> str:
    return {"P1": "p1", "P2": "p2", "P3": "p3"}.get(p or "P3", "p3")


def _render_pdf(template_name: str, ctx: dict) -> io.BytesIO:
    # WeasyPrint is imported lazily: its native deps (Pango/Cairo) exist in the
    # container but not on every dev box, and a missing lib must not break app boot.
    from weasyprint import HTML

    ctx["css"] = _load_css()
    html_str = _env.get_template(template_name).render(**ctx)
    buf = io.BytesIO()
    HTML(string=html_str, base_url=_TEMPLATE_DIR).write_pdf(buf)
    buf.seek(0)
    return buf


# ═══════════════════════════════════════════════════════════════
#  TICKET REPORT
# ═══════════════════════════════════════════════════════════════
@router.get("/tickets")
def generate_ticket_report(
    period: str = Query("weekly", pattern="^(weekly|monthly|yearly)$"),
    office: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    start_date, period_label, trend_days = _date_range(period)

    q = db.query(Ticket).options(joinedload(Ticket.office)).filter(Ticket.created_at >= start_date)
    if office and office != "all":
        q = q.join(Ticket.office).filter(Office.name == office)
    tickets = q.order_by(Ticket.created_at.desc()).all()

    office_label = office if (office and office != "all") else "All Offices"

    # ── Metrics ──
    total = len(tickets)
    resolved = sum(1 for t in tickets if t.status in ("Resolved", "Closed"))
    open_count = sum(1 for t in tickets if t.status == "Open")
    in_progress = sum(1 for t in tickets if t.status == "In Progress")
    resolution_rate = round(resolved / total * 100, 1) if total else 0

    p1_count = sum(1 for t in tickets if t.priority == "P1")
    p2_count = sum(1 for t in tickets if t.priority == "P2")
    p3_count = sum(1 for t in tickets if t.priority == "P3")

    categories = Counter(t.category_name or "Uncategorized" for t in tickets)
    offices_count = Counter((t.office.name if t.office else "Unknown") for t in tickets)

    # Daily trend (opened vs resolved)
    opened_by_day = defaultdict(int)
    resolved_by_day = defaultdict(int)
    for t in tickets:
        key = t.created_at.strftime("%d %b")
        opened_by_day[key] += 1
        if t.status in ("Resolved", "Closed"):
            resolved_by_day[key] += 1
    sorted_days = sorted(opened_by_day.keys(), key=lambda d: datetime.strptime(d, "%d %b"))[-trend_days:]

    # ── Charts ──
    trend_svg = charts.line_chart(
        sorted_days,
        [
            {"name": "Opened", "color": charts.NAVY, "values": [opened_by_day[d] for d in sorted_days]},
            {"name": "Resolved", "color": charts.GREEN, "values": [resolved_by_day[d] for d in sorted_days]},
        ],
    ) if sorted_days else charts._empty(520, 230)

    pri_segments = []
    for lbl, val, col in [("P1 Critical", p1_count, charts.RED), ("P2 High", p2_count, charts.AMBER), ("P3 Normal", p3_count, charts.GREEN)]:
        if val:
            pri_segments.append({"label": lbl, "value": val, "color": col})
    priority_donut = charts.donut_chart(pri_segments, center_label=total, center_sub="tickets")
    priority_legend = [
        {"label": s["label"], "value": s["value"], "color": s["color"], "pct": round(s["value"] / total * 100)}
        for s in pri_segments
    ] if total else []

    cat_top = categories.most_common(7)
    # category chart sits in a half-width exhibit; office chart is full width
    category_hbar = charts.hbar_chart(cat_top, color=charts.CYAN, width=215, label_w=85)
    office_hbar = charts.hbar_chart(offices_count.most_common(), color=charts.NAVY)

    # ── Tables ──
    max_cat = cat_top[0][1] if cat_top else 1
    category_rows = []
    for cat, cnt in categories.most_common():
        cat_tickets = [t for t in tickets if (t.category_name or "Uncategorized") == cat]
        dom_pri = Counter(t.priority or "P3" for t in cat_tickets).most_common(1)[0][0]
        category_rows.append({
            "name": cat, "count": cnt,
            "pct": round(cnt / total * 100, 1) if total else 0,
            "pri": dom_pri, "pri_cls": _pri_cls(dom_pri),
            "bar": round(cnt / max_cat * 30, 1),
        })

    office_rows = []
    show_offices = len(offices_count) > 1
    if show_offices:
        for oname, ocnt in offices_count.most_common():
            o_tk = [t for t in tickets if (t.office.name if t.office else "Unknown") == oname]
            o_res = sum(1 for t in o_tk if t.status in ("Resolved", "Closed"))
            office_rows.append({
                "name": oname, "count": ocnt,
                "pct": round(ocnt / total * 100, 1) if total else 0,
                "p1": sum(1 for t in o_tk if t.priority == "P1"),
                "res": round(o_res / ocnt * 100) if ocnt else 0,
            })

    recent = [{
        "id": str(t.id)[:8].upper(),
        "category": (t.category_name or "N/A")[:20],
        "priority": t.priority or "P3", "pri_cls": _pri_cls(t.priority),
        "status": t.status or "Open",
        "office": (t.office.name if t.office else "N/A")[:14],
        "created": t.created_at.strftime("%d %b, %H:%M") if t.created_at else "N/A",
    } for t in tickets[:20]]

    # ── Narrative ──
    top_cat = categories.most_common(1)[0] if categories else ("N/A", 0)
    summary_html = (
        f"During the {period_label.lower()} window, <b>{total}</b> tickets were logged across "
        f"{office_label}, of which <b>{resolved}</b> reached resolution — a <b>{resolution_rate}%</b> "
        f"resolution rate. <b>{open_count}</b> remain open and <b>{in_progress}</b> are in progress. "
    )
    if p1_count:
        summary_html += f"Critically, <b>{p1_count}</b> P1 incidents demanded emergency response. "
    summary_html += (
        f"Demand concentrates in <b>{escape(top_cat[0])}</b> "
        f"({round(top_cat[1]/total*100) if total else 0}% of volume), signalling the clearest "
        f"opportunity for preventive intervention."
    )

    takeaways = []
    takeaways.append(
        f"Throughput held at <b>{resolution_rate}%</b> resolution "
        f"({'above' if resolution_rate >= 85 else 'below'} the 85% operational benchmark)."
    )
    takeaways.append(
        f"<b>{escape(top_cat[0])}</b> is the single largest demand driver at "
        f"{round(top_cat[1]/total*100) if total else 0}% of tickets — a candidate for root-cause elimination."
    )
    if p1_count:
        takeaways.append(f"<b>{p1_count}</b> P1 critical tickets require SLA scrutiny; each carries a 2-hour response obligation.")
    if show_offices and office_rows:
        busiest = office_rows[0]
        takeaways.append(f"<b>{escape(busiest['name'])}</b> carries the heaviest load ({busiest['pct']}% of volume) and should be prioritised for staffing review.")
    else:
        takeaways.append(f"Average daily intake is <b>{round(total/max(1,len(sorted_days)),1)}</b> tickets across the period.")

    # ── Insights ──
    insights = _ticket_insights(total, p1_count, p2_count, resolution_rate, categories, sorted_days)

    # Trend delta on KPI (opened first half vs second half)
    res_trend_cls, res_trend_txt = "flat", "—"
    if len(sorted_days) >= 4:
        half = len(sorted_days) // 2
        first = sum(resolved_by_day[d] for d in sorted_days[:half])
        second = sum(resolved_by_day[d] for d in sorted_days[half:])
        if second > first:
            res_trend_cls, res_trend_txt = "up", "▲ improving"
        elif second < first:
            res_trend_cls, res_trend_txt = "down", "▼ slipping"
        else:
            res_trend_cls, res_trend_txt = "flat", "▬ steady"

    ctx = {
        "report_title": "Facility Operations Report",
        "period_label": period_label,
        "office_label": office_label,
        "date_range": f"{start_date.strftime('%d %b %Y')} – {_ist_now().strftime('%d %b %Y')}",
        "generated_at": _ist_now().strftime("%d %b %Y, %H:%M IST"),
        "trend_days": len(sorted_days),
        "total": total, "resolved": resolved, "open_count": open_count,
        "in_progress": in_progress, "resolution_rate": resolution_rate,
        "p1_count": p1_count, "p2_count": p2_count, "p3_count": p3_count,
        "summary_html": summary_html, "takeaways": takeaways,
        "trend_svg": trend_svg,
        "priority_donut": priority_donut, "priority_legend": priority_legend,
        "category_hbar": category_hbar, "category_rows": category_rows,
        "show_offices": show_offices, "office_hbar": office_hbar, "office_rows": office_rows,
        "insights": insights, "recent": recent,
        "res_trend_cls": res_trend_cls, "res_trend_txt": res_trend_txt,
    }

    buf = _render_pdf("ticket_report.html", ctx)

    log_audit(
        db=db, user_name="Admin", user_email="admin@bayer.com",
        action=f"Generated {period_label} ticket report",
        action_type="Export", entity="Ticket Report", entity_type="Report",
        details=f"Period: {period_label}, Office: {office_label}, Tickets: {total}",
    )

    filename = f"Bayer_Ticket_Report_{period_label}_{_ist_now().strftime('%Y%m%d')}.pdf"
    return StreamingResponse(buf, media_type="application/pdf",
                            headers={"Content-Disposition": f"attachment; filename={filename}"})


def _ticket_insights(total, p1, p2, res_rate, categories, days):
    out = []
    if total == 0:
        return out
    if p1 > 0:
        out.append({
            "sev": "critical", "sev_label": "Critical",
            "title": f"{p1} P1 incident{'s' if p1 != 1 else ''} logged this period",
            "body": "P1 tickets carry a 2-hour response SLA. Sustained P1 volume points to systemic asset failure rather than one-off faults.",
            "rec": "Stand up a daily P1 stand-up and trace each incident to an asset ID; recurring assets should enter the capital-replacement pipeline.",
        })
    if res_rate < 80:
        out.append({
            "sev": "warning", "sev_label": "Action",
            "title": "Resolution rate below the 80% operational floor",
            "body": f"At <b>{res_rate}%</b>, closure is lagging intake and a backlog is accumulating.",
            "rec": "Reallocate technician capacity to the oldest-open cohort and introduce a 48-hour ageing alert to prevent silent backlog growth.",
        })
    elif res_rate >= 90:
        out.append({
            "sev": "positive", "sev_label": "Strength",
            "title": "Resolution performance exceeds benchmark",
            "body": f"A <b>{res_rate}%</b> resolution rate indicates disciplined execution and healthy throughput.",
            "rec": "Codify current dispatch practices into an SOP and use this team as the reference model for underperforming sites.",
        })
    if categories:
        top = categories.most_common(1)[0]
        out.append({
            "sev": "info", "sev_label": "Focus",
            "title": f"Demand concentrates in {escape(top[0])}",
            "body": f"This category represents <b>{round(top[1]/total*100)}%</b> of all tickets — the largest single demand driver.",
            "rec": "Commission a root-cause analysis and a scheduled preventive-maintenance plan targeting this category to convert reactive volume into planned work.",
        })
    if len(days) >= 7:
        avg = round(total / len(days), 1)
        out.append({
            "sev": "info", "sev_label": "Planning",
            "title": "Predictive staffing opportunity",
            "body": f"Average daily intake is <b>{avg}</b> tickets, with load typically front-loaded early in the week.",
            "rec": "Shift ~15% of technician coverage toward peak days to hold SLA without adding headcount.",
        })
    out.append({
        "sev": "positive" if res_rate >= 85 else "warning",
        "sev_label": "Operational",
        "title": "SLA & capacity posture",
        "body": f"With <b>{p1 + p2}</b> high-priority (P1/P2) tickets against a <b>{res_rate}%</b> resolution rate, the operation is "
                f"{'well within capacity' if res_rate >= 85 else 'straining current capacity'}.",
        "rec": "Run a skills-matrix review to ensure cross-training depth on the highest-impact categories.",
    })
    return out


# ═══════════════════════════════════════════════════════════════
#  FEEDBACK REPORT
# ═══════════════════════════════════════════════════════════════
@router.get("/feedback")
def generate_feedback_report(
    period: str = Query("weekly", pattern="^(weekly|monthly|yearly)$"),
    office: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    start_date, period_label, _ = _date_range(period)

    fb_q = db.query(Feedback).join(Feedback.ticket).options(
        joinedload(Feedback.ticket).joinedload(Ticket.office)
    ).filter(Feedback.created_at >= start_date)
    if office and office != "all":
        fb_q = fb_q.filter(Ticket.office.has(Office.name == office))
    feedbacks = fb_q.order_by(Feedback.created_at.desc()).all()

    tk_q = db.query(Ticket).filter(Ticket.created_at >= start_date)
    if office and office != "all":
        tk_q = tk_q.join(Ticket.office).filter(Office.name == office)
    total_tickets = tk_q.count()

    office_label = office if (office and office != "all") else "All Offices"

    # ── Metrics ──
    total_fb = len(feedbacks)
    fb_rate = round(total_fb / total_tickets * 100, 1) if total_tickets else 0

    def _avg(attr):
        vals = [getattr(f, attr) or 0 for f in feedbacks]
        return round(sum(vals) / total_fb, 1) if total_fb else 0

    avg_overall = _avg("overall_rating")
    avg_quality = _avg("resolution_quality")
    avg_response = _avg("response_time")
    avg_comm = _avg("communication")
    avg_prof = _avg("professionalism")

    rating_dist = Counter(f.overall_rating for f in feedbacks if f.overall_rating)
    promoters_n = sum(v for k, v in rating_dist.items() if k >= 4)
    passives_n = sum(v for k, v in rating_dist.items() if k == 3)
    detractors_n = sum(v for k, v in rating_dist.items() if k <= 2)
    promoters = round(promoters_n / total_fb * 100) if total_fb else 0
    detractors = round(detractors_n / total_fb * 100) if total_fb else 0

    cat_ratings = defaultdict(list)
    for f in feedbacks:
        cat = (f.ticket.category_name if f.ticket else "Unknown") or "Unknown"
        cat_ratings[cat].append(f.overall_rating or 0)
    cat_avg = {k: round(sum(v) / len(v), 1) for k, v in cat_ratings.items()}

    # ── Charts ──
    rating_rows = [(f"{i}★", rating_dist.get(i, 0)) for i in range(1, 6)]
    rating_colors = [charts.RED, charts.RED, charts.AMBER, charts.GREEN, charts.GREEN]
    rating_vbar = charts.vbar_chart(rating_rows, colors=rating_colors, width=215, height=190)

    sentiment_segments = []
    for lbl, val, col in [("Promoters (4–5★)", promoters_n, charts.GREEN), ("Passive (3★)", passives_n, charts.AMBER), ("Detractors (1–2★)", detractors_n, charts.RED)]:
        if val:
            sentiment_segments.append({"label": lbl, "value": val, "color": col})
    sentiment_donut = charts.donut_chart(sentiment_segments, center_label=avg_overall, center_sub="avg / 5")
    sentiment_legend = [
        {"label": s["label"], "value": s["value"], "color": s["color"], "pct": round(s["value"] / total_fb * 100)}
        for s in sentiment_segments
    ] if total_fb else []

    dimensions = [
        {"label": "Overall Rating", "value": avg_overall, "svg": charts.score_bar_svg(avg_overall, color=charts.NAVY)},
        {"label": "Resolution Quality", "value": avg_quality, "svg": charts.score_bar_svg(avg_quality, color=charts.CYAN)},
        {"label": "Response Time", "value": avg_response, "svg": charts.score_bar_svg(avg_response, color=charts.GREEN)},
        {"label": "Communication", "value": avg_comm, "svg": charts.score_bar_svg(avg_comm, color=charts.NAVY_SOFT)},
        {"label": "Professionalism", "value": avg_prof, "svg": charts.score_bar_svg(avg_prof, color=charts.GREEN)},
    ]

    def _level(avg):
        if avg >= 4:
            return "Excellent", "good"
        if avg >= 3:
            return "Good", "mid"
        return "Needs Work", "bad"

    category_rows = []
    for cat, avg in sorted(cat_avg.items(), key=lambda x: -x[1]):
        level, cls = _level(avg)
        category_rows.append({"name": cat, "count": len(cat_ratings[cat]), "avg": avg, "level": level, "cls": cls})

    recent = []
    for f in feedbacks[:15]:
        comment = (f.comments or "No comment").strip()
        if len(comment) > 60:
            comment = comment[:60] + "…"
        recent.append({
            "tid": str(f.ticket_id)[:8].upper() if f.ticket_id else "N/A",
            "rating": f.overall_rating or 0, "quality": f.resolution_quality or 0,
            "response": f.response_time or 0, "comment": comment,
        })

    # ── Narrative ──
    summary_html = (
        f"The {period_label.lower()} window drew <b>{total_fb}</b> feedback responses against "
        f"<b>{total_tickets}</b> tickets — a <b>{fb_rate}%</b> response rate — with a mean overall "
        f"satisfaction of <b>{avg_overall}/5</b>. "
    )
    if avg_overall >= 4:
        summary_html += "Satisfaction sits above target, evidencing effective service delivery. "
    elif avg_overall >= 3:
        summary_html += "Satisfaction is moderate; targeted improvements would lift the experience. "
    else:
        summary_html += "<b style='color:#DC2626'>Satisfaction is below the acceptable threshold and warrants immediate review.</b> "
    summary_html += f"Promoters (4–5★) account for <b>{promoters}%</b> of responses versus <b>{detractors}%</b> detractors."

    takeaways = [
        f"Mean satisfaction is <b>{avg_overall}/5</b> with a <b>{promoters}%</b> promoter share.",
        f"Response rate stands at <b>{fb_rate}%</b> — {'healthy engagement' if fb_rate >= 60 else 'an engagement gap to close'}.",
    ]
    if cat_avg:
        worst = min(cat_avg.items(), key=lambda x: x[1])
        best = max(cat_avg.items(), key=lambda x: x[1])
        takeaways.append(f"<b>{escape(best[0])}</b> leads on satisfaction ({best[1]}/5); <b>{escape(worst[0])}</b> trails ({worst[1]}/5).")
    weakest_dim = min(dimensions, key=lambda d: d["value"])
    takeaways.append(f"The weakest service dimension is <b>{weakest_dim['label']}</b> at {weakest_dim['value']}/5.")

    insights = _feedback_insights(total_fb, fb_rate, avg_overall, avg_response, avg_comm, cat_avg)

    ctx = {
        "report_title": "Service Experience Report",
        "period_label": period_label,
        "office_label": office_label,
        "date_range": f"{start_date.strftime('%d %b %Y')} – {_ist_now().strftime('%d %b %Y')}",
        "generated_at": _ist_now().strftime("%d %b %Y, %H:%M IST"),
        "total_fb": total_fb, "fb_rate": fb_rate, "avg_overall": avg_overall,
        "promoters": promoters, "detractors": detractors,
        "summary_html": summary_html, "takeaways": takeaways,
        "rating_vbar": rating_vbar,
        "sentiment_donut": sentiment_donut, "sentiment_legend": sentiment_legend,
        "dimensions": dimensions, "category_rows": category_rows,
        "insights": insights, "recent": recent,
    }

    buf = _render_pdf("feedback_report.html", ctx)

    log_audit(
        db=db, user_name="Admin", user_email="admin@bayer.com",
        action=f"Generated {period_label} feedback report",
        action_type="Export", entity="Feedback Report", entity_type="Report",
        details=f"Period: {period_label}, Office: {office_label}, Feedbacks: {total_fb}",
    )

    filename = f"Bayer_Feedback_Report_{period_label}_{_ist_now().strftime('%Y%m%d')}.pdf"
    return StreamingResponse(buf, media_type="application/pdf",
                            headers={"Content-Disposition": f"attachment; filename={filename}"})


def _feedback_insights(total_fb, fb_rate, avg_overall, avg_response, avg_comm, cat_avg):
    out = []
    if total_fb == 0:
        return out
    if fb_rate < 50:
        out.append({
            "sev": "warning", "sev_label": "Action",
            "title": "Response rate below 50%",
            "body": f"Only <b>{fb_rate}%</b> of tickets received feedback, which biases the sample toward the most vocal.",
            "rec": "Trigger an automated feedback prompt 24 hours after resolution and keep the form to a single-tap rating to lift completion.",
        })
    elif fb_rate >= 70:
        out.append({
            "sev": "positive", "sev_label": "Strength",
            "title": "Strong feedback engagement",
            "body": f"A <b>{fb_rate}%</b> response rate gives a statistically reliable read on employee sentiment.",
            "rec": "Maintain the current prompt cadence and begin trending satisfaction against operational changes.",
        })
    if avg_overall >= 4:
        out.append({
            "sev": "positive", "sev_label": "Strength",
            "title": "Satisfaction above target",
            "body": f"A mean of <b>{avg_overall}/5</b> reflects consistently strong service quality.",
            "rec": "Protect the drivers of this result; document them before scaling the team.",
        })
    elif avg_overall < 3:
        out.append({
            "sev": "critical", "sev_label": "Critical",
            "title": "Satisfaction below acceptable threshold",
            "body": f"A mean of <b>{avg_overall}/5</b> sits under the 3.0 floor and represents experience risk.",
            "rec": "Commission a rapid root-cause review of the lowest-rated tickets and close the loop directly with affected employees.",
        })
    if cat_avg:
        worst = min(cat_avg.items(), key=lambda x: x[1])
        if worst[1] < 3.5:
            out.append({
                "sev": "warning", "sev_label": "Focus",
                "title": f"Service gap in {escape(worst[0])}",
                "body": f"<b>{escape(worst[0])}</b> holds the lowest satisfaction at <b>{worst[1]}/5</b>.",
                "rec": "Run a targeted QA review for this category and mandate a brief post-resolution follow-up call.",
            })
        best = max(cat_avg.items(), key=lambda x: x[1])
        out.append({
            "sev": "positive", "sev_label": "Best practice",
            "title": f"Excellence in {escape(best[0])}",
            "body": f"<b>{escape(best[0])}</b> leads at <b>{best[1]}/5</b>, demonstrating best-in-class execution.",
            "rec": "Extract the SOPs behind this result and transfer them to lower-performing categories.",
        })
    if avg_response < 3.5:
        out.append({
            "sev": "critical", "sev_label": "Critical",
            "title": "Response-time perception is weak",
            "body": f"Response-time scores average <b>{avg_response}/5</b>, the sharpest driver of dissatisfaction.",
            "rec": "Review dispatch protocols and automate first-response acknowledgements to cut perceived wait times.",
        })
    if avg_comm < 4.0:
        out.append({
            "sev": "info", "sev_label": "Enhance",
            "title": "Communication has headroom",
            "body": f"Communication scores <b>{avg_comm}/5</b>; employees want more visibility through the ticket lifecycle.",
            "rec": "Standardise status-change notifications and technician update templates.",
        })
    return out
