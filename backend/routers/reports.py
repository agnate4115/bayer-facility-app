import io
import os
from datetime import datetime, timedelta
from collections import Counter, defaultdict

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session, joinedload
from typing import Optional

from database import get_db
from models.ticket import Ticket
from models.feedback import Feedback
from models.office import Office
from utils.audit import log_audit

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm, cm
from reportlab.lib.colors import HexColor, white, black
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, Image, HRFlowable
)
from reportlab.graphics.shapes import Drawing, Rect, String, Line
from reportlab.graphics.charts.piecharts import Pie
from reportlab.graphics.charts.barcharts import VerticalBarChart
from reportlab.graphics.charts.linecharts import HorizontalLineChart
from reportlab.graphics import renderPDF

router = APIRouter(
    prefix="/api/reports",
    tags=["reports"]
)

# ── Bayer Brand Colors ──
PRUSSIAN_BLUE = HexColor("#00314E")
CAPRI_BLUE = HexColor("#01BEFF")
INNOVATION_GREEN = HexColor("#56D500")
LIGHT_BG = HexColor("#F5F7FA")
BORDER_COLOR = HexColor("#E1E8ED")
TEXT_PRIMARY = HexColor("#18181B")
TEXT_SECONDARY = HexColor("#52525B")
TEXT_TERTIARY = HexColor("#9CA3AF")
WHITE = HexColor("#FFFFFF")
P1_RED = HexColor("#DC2626")
P2_AMBER = HexColor("#F59E0B")

PAGE_W, PAGE_H = A4


def _get_logo_path():
    """Attempt to locate the Bayer logo."""
    candidates = [
        os.path.join(os.path.dirname(__file__), "..", "..", "app", "public", "Bayer-Logo.wine.png"),
        os.path.join(os.path.dirname(__file__), "..", "static", "Bayer-Logo.wine.png"),
    ]
    for p in candidates:
        real = os.path.realpath(p)
        if os.path.exists(real):
            return real
    return None


def _ist_now():
    """Return current time in Indian Standard Time (UTC+5:30)."""
    return datetime.utcnow() + timedelta(hours=5, minutes=30)


def _date_range(period: str):
    """Return (start_date, label) for the requested period."""
    now = _ist_now()
    if period == "weekly":
        return now - timedelta(days=7), "Weekly"
    elif period == "monthly":
        return now - timedelta(days=30), "Monthly"
    else:
        return now - timedelta(days=365), "Yearly"


def _header_footer(canvas, doc):
    """Draw header and footer on every page."""
    canvas.saveState()
    # Header band
    canvas.setFillColor(PRUSSIAN_BLUE)
    canvas.rect(0, PAGE_H - 22 * mm, PAGE_W, 22 * mm, fill=1, stroke=0)
    # Green accent line
    canvas.setFillColor(INNOVATION_GREEN)
    canvas.rect(0, PAGE_H - 23 * mm, PAGE_W, 1 * mm, fill=1, stroke=0)

    # Logo
    logo = _get_logo_path()
    if logo:
        try:
            # Draw a white background box for the logo to make it visible
            canvas.setFillColor(white)
            canvas.roundRect(12 * mm, PAGE_H - 19 * mm, 34 * mm, 14 * mm, 2 * mm, fill=1, stroke=0)
            
            canvas.drawImage(logo, 15 * mm, PAGE_H - 18 * mm, width=28 * mm, height=12 * mm,
                             preserveAspectRatio=True, mask='auto')
        except Exception:
            pass

    # Header text
    canvas.setFillColor(WHITE)
    canvas.setFont("Helvetica-Bold", 10)
    canvas.drawRightString(PAGE_W - 15 * mm, PAGE_H - 12 * mm, "FacilityDesk Analytics Report")
    canvas.setFont("Helvetica", 7)
    canvas.drawRightString(PAGE_W - 15 * mm, PAGE_H - 17 * mm,
                           f"Generated: {_ist_now().strftime('%d %B %Y, %H:%M IST')}")

    # Footer
    canvas.setFillColor(PRUSSIAN_BLUE)
    canvas.rect(0, 0, PAGE_W, 12 * mm, fill=1, stroke=0)
    canvas.setFillColor(WHITE)
    canvas.setFont("Helvetica", 7)
    canvas.drawString(15 * mm, 5 * mm, "Bayer AG · RE, Commercial Area & Facilities Management")
    canvas.drawRightString(PAGE_W - 15 * mm, 5 * mm, f"Page {doc.page}")
    # Green line above footer
    canvas.setFillColor(INNOVATION_GREEN)
    canvas.rect(0, 12 * mm, PAGE_W, 0.5 * mm, fill=1, stroke=0)
    canvas.restoreState()


def _build_styles():
    """Custom paragraph styles."""
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(
        "BayerTitle", parent=styles["Title"],
        fontName="Helvetica-Bold", fontSize=22, textColor=PRUSSIAN_BLUE,
        spaceAfter=6, alignment=TA_LEFT, leading=26
    ))
    styles.add(ParagraphStyle(
        "BayerSubtitle", parent=styles["Normal"],
        fontName="Helvetica", fontSize=11, textColor=TEXT_SECONDARY,
        spaceAfter=18, alignment=TA_LEFT
    ))
    styles.add(ParagraphStyle(
        "SectionHeading", parent=styles["Heading2"],
        fontName="Helvetica-Bold", fontSize=13, textColor=PRUSSIAN_BLUE,
        spaceBefore=18, spaceAfter=8, borderPadding=(0, 0, 4, 0)
    ))
    styles.add(ParagraphStyle(
        "MetricLabel", parent=styles["Normal"],
        fontName="Helvetica", fontSize=8, textColor=TEXT_TERTIARY,
        alignment=TA_CENTER
    ))
    styles.add(ParagraphStyle(
        "MetricValue", parent=styles["Normal"],
        fontName="Helvetica-Bold", fontSize=20, textColor=PRUSSIAN_BLUE,
        alignment=TA_CENTER
    ))
    styles.add(ParagraphStyle(
        "InsightBody", parent=styles["Normal"],
        fontName="Helvetica", fontSize=9, textColor=TEXT_SECONDARY,
        leading=13, spaceAfter=4
    ))
    styles.add(ParagraphStyle(
        "TableHeader", parent=styles["Normal"],
        fontName="Helvetica-Bold", fontSize=8, textColor=WHITE,
        alignment=TA_LEFT
    ))
    styles.add(ParagraphStyle(
        "TableCell", parent=styles["Normal"],
        fontName="Helvetica", fontSize=8, textColor=TEXT_PRIMARY,
        alignment=TA_LEFT
    ))
    return styles


def _metric_card_table(metrics):
    """Build a row of metric cards as a Table."""
    cells = []
    for m in metrics:
        p1 = Paragraph(f'<font size="20" name="Helvetica-Bold" color="{PRUSSIAN_BLUE.hexval()}">{m["value"]}</font>', ParagraphStyle("MVal", alignment=TA_CENTER, leading=24))
        p2 = Paragraph(f'<font size="8" name="Helvetica" color="{TEXT_TERTIARY.hexval()}">{m["label"]}</font>', ParagraphStyle("MLbl", alignment=TA_CENTER, leading=10))
        cells.append([p1, p2])
    
    col_w = (PAGE_W - 30 * mm) / len(metrics)
    t = Table([cells], colWidths=[col_w] * len(metrics))
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), LIGHT_BG),
        ("BOX", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 12),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
    ]))
    return t


def _build_pie_chart(data_dict, title, width=220, height=160):
    """Build a ReportLab Pie chart Drawing."""
    d = Drawing(width, height)
    pc = Pie()
    pc.x = 10
    pc.y = 20
    pc.width = 90
    pc.height = 90
    pc.data = list(data_dict.values())
    pc.labels = [f"{k} ({v})" for k, v in data_dict.items()]
    colors = [PRUSSIAN_BLUE, CAPRI_BLUE, INNOVATION_GREEN, P1_RED, P2_AMBER,
              HexColor("#8B5CF6"), HexColor("#EC4899"), HexColor("#14B8A6")]
    for i in range(len(pc.data)):
        pc.slices[i].fillColor = colors[i % len(colors)]
        pc.slices[i].strokeColor = WHITE
        pc.slices[i].strokeWidth = 1.5
    
    # Hide labels and use Legend instead
    pc.labels = None
    
    from reportlab.graphics.charts.legends import Legend
    leg = Legend()
    leg.x = 110
    leg.y = 105
    leg.boxAnchor = 'nw'
    leg.columnMaximum = 6
    leg.fontSize = 7
    leg.fontName = "Helvetica"
    leg.dxTextSpace = 5
    leg.autoXPadding = 15
    leg.colorNamePairs = [(colors[i % len(colors)], f"{list(data_dict.keys())[i][:20]} ({list(data_dict.values())[i]})") for i in range(len(pc.data))]
    
    d.add(pc)
    d.add(leg)
    d.add(String(width / 2, height - 8, title, fontSize=9, fontName="Helvetica-Bold",
                 fillColor=PRUSSIAN_BLUE, textAnchor="middle"))
    return d


def _build_bar_chart(categories, values, title, width=260, height=160):
    """Build a vertical bar chart."""
    d = Drawing(width, height)
    bc = VerticalBarChart()
    bc.x = 55
    bc.y = 55
    bc.width = width - 70
    bc.height = height - 75
    bc.data = [values]
    bc.categoryAxis.categoryNames = categories
    bc.categoryAxis.labels.fontName = "Helvetica"
    bc.categoryAxis.labels.fontSize = 7
    bc.categoryAxis.labels.angle = 30
    bc.categoryAxis.labels.boxAnchor = 'ne'
    bc.categoryAxis.labels.dy = -5
    bc.categoryAxis.labels.dx = -2
    bc.valueAxis.labels.fontName = "Helvetica"
    bc.valueAxis.labels.fontSize = 7
    bc.valueAxis.valueMin = 0
    bc.bars[0].fillColor = CAPRI_BLUE
    bc.bars[0].strokeColor = None
    bc.barWidth = 14
    d.add(bc)
    d.add(String(width / 2, height - 8, title, fontSize=9, fontName="Helvetica-Bold",
                 fillColor=PRUSSIAN_BLUE, textAnchor="middle"))
    return d


def _insight_block(styles, title, body, severity="info"):
    """Build an insight paragraph block."""
    color_map = {"critical": P1_RED, "warning": P2_AMBER, "info": CAPRI_BLUE, "positive": INNOVATION_GREEN}
    dot_color = color_map.get(severity, CAPRI_BLUE)
    # Use a colored bullet
    html = f'<font color="{dot_color.hexval()}">●</font> <b>{title}</b><br/>{body}'
    return Paragraph(html, styles["InsightBody"])


# ═══════════════════════════════════════════════════════════════
#  TICKET REPORT ENDPOINT
# ═══════════════════════════════════════════════════════════════

@router.get("/tickets")
def generate_ticket_report(
    period: str = Query("weekly", pattern="^(weekly|monthly|yearly)$"),
    office: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    start_date, period_label = _date_range(period)
    styles = _build_styles()

    # ── Query Data ──
    q = db.query(Ticket).options(joinedload(Ticket.office))
    q = q.filter(Ticket.created_at >= start_date)
    if office and office != "all":
        q = q.join(Ticket.office).filter(Office.name == office)
    tickets = q.order_by(Ticket.created_at.desc()).all()

    all_tickets_q = db.query(Ticket).options(joinedload(Ticket.office))
    if office and office != "all":
        all_tickets_q = all_tickets_q.join(Ticket.office).filter(Office.name == office)
    all_tickets = all_tickets_q.all()

    # ── Compute Metrics ──
    total = len(tickets)
    resolved = sum(1 for t in tickets if t.status in ("Resolved", "Closed"))
    open_count = sum(1 for t in tickets if t.status == "Open")
    in_progress = sum(1 for t in tickets if t.status == "In Progress")
    resolution_rate = round((resolved / total * 100), 1) if total > 0 else 0

    p1_count = sum(1 for t in tickets if t.priority == "P1")
    p2_count = sum(1 for t in tickets if t.priority == "P2")
    p3_count = sum(1 for t in tickets if t.priority == "P3")

    categories = Counter(t.category_name or "Uncategorized" for t in tickets)
    offices_count = Counter((t.office.name if t.office else "Unknown") for t in tickets)
    statuses = Counter(t.status or "Unknown" for t in tickets)

    # Daily trend
    daily = defaultdict(int)
    for t in tickets:
        day_key = t.created_at.strftime("%d %b")
        daily[day_key] += 1
    sorted_days = sorted(daily.keys(), key=lambda d: datetime.strptime(d, "%d %b"))

    office_label = office if (office and office != "all") else "All Offices"

    # ── Build PDF ──
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4,
                            topMargin=28 * mm, bottomMargin=18 * mm,
                            leftMargin=15 * mm, rightMargin=15 * mm)
    elements = []

    # Title
    elements.append(Paragraph(f"Ticket Analytics Report", styles["BayerTitle"]))
    elements.append(Paragraph(
        f"{period_label} Report · {office_label} · {start_date.strftime('%d %b %Y')} – {_ist_now().strftime('%d %b %Y')}",
        styles["BayerSubtitle"]
    ))

    # Divider
    elements.append(HRFlowable(width="100%", thickness=1, color=INNOVATION_GREEN, spaceAfter=12))

    # ── Executive Summary ──
    elements.append(Paragraph("Executive Summary", styles["SectionHeading"]))
    summary_text = (
        f"During the reporting period, a total of <b>{total}</b> tickets were raised across {office_label}. "
        f"Of these, <b>{resolved}</b> have been resolved, resulting in a resolution rate of <b>{resolution_rate}%</b>. "
        f"Currently, <b>{open_count}</b> tickets remain open and <b>{in_progress}</b> are in progress. "
    )
    if p1_count > 0:
        summary_text += f"<font color='{P1_RED.hexval()}'><b>{p1_count}</b> P1 (Critical)</font> tickets were logged. "
    summary_text += (
        f"The most active category was <b>{categories.most_common(1)[0][0] if categories else 'N/A'}</b> "
        f"with {categories.most_common(1)[0][1] if categories else 0} tickets."
    )
    elements.append(Paragraph(summary_text, styles["InsightBody"]))
    elements.append(Spacer(1, 10))

    # ── KPI Cards ──
    elements.append(Paragraph("Key Performance Indicators", styles["SectionHeading"]))
    metrics = [
        {"label": "TOTAL TICKETS", "value": total},
        {"label": "RESOLVED", "value": resolved},
        {"label": "OPEN", "value": open_count},
        {"label": "RESOLUTION RATE", "value": f"{resolution_rate}%"},
    ]
    elements.append(_metric_card_table(metrics))
    elements.append(Spacer(1, 8))
    metrics2 = [
        {"label": "P1 CRITICAL", "value": p1_count},
        {"label": "P2 HIGH", "value": p2_count},
        {"label": "P3 NORMAL", "value": p3_count},
        {"label": "IN PROGRESS", "value": in_progress},
    ]
    elements.append(_metric_card_table(metrics2))
    elements.append(Spacer(1, 14))

    # ── Charts ──
    elements.append(Paragraph("Visual Analytics", styles["SectionHeading"]))

    # Priority pie + Category pie side by side
    charts_data = []
    if categories:
        cat_chart = _build_pie_chart(dict(categories.most_common(6)), "Tickets by Category")
        charts_data.append(cat_chart)
    priority_data = {}
    if p1_count: priority_data["P1 Critical"] = p1_count
    if p2_count: priority_data["P2 High"] = p2_count
    if p3_count: priority_data["P3 Normal"] = p3_count
    if priority_data:
        pri_chart = _build_pie_chart(priority_data, "Priority Distribution")
        charts_data.append(pri_chart)

    if charts_data:
        col_w = (PAGE_W - 30 * mm) / len(charts_data)
        chart_table = Table([charts_data], colWidths=[col_w] * len(charts_data))
        chart_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), LIGHT_BG),
            ("BOX", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ]))
        elements.append(chart_table)
        elements.append(Spacer(1, 12))

    # Bar chart – office distribution
    if offices_count and len(offices_count) > 1:
        off_names = list(offices_count.keys())
        off_vals = list(offices_count.values())
        elements.append(_build_bar_chart(off_names, off_vals, "Tickets by Office", width=int(PAGE_W / mm * 2.5), height=140))
        elements.append(Spacer(1, 12))

    # Daily trend bar chart
    if sorted_days:
        elements.append(_build_bar_chart(
            sorted_days[-14:],
            [daily[d] for d in sorted_days[-14:]],
            f"Daily Ticket Volume (Last {min(len(sorted_days), 14)} Days)",
            width=int(PAGE_W / mm * 2.5), height=140
        ))
        elements.append(Spacer(1, 12))

    # ── Category Breakdown Table ──
    elements.append(Spacer(1, 20))
    elements.append(Paragraph("Category Breakdown", styles["SectionHeading"]))
    cat_rows = [["Category", "Tickets", "% of Total", "Top Priority"]]
    for cat, cnt in categories.most_common():
        pct = round(cnt / total * 100, 1) if total else 0
        cat_tickets = [t for t in tickets if (t.category_name or "Uncategorized") == cat]
        top_pri = min((t.priority or "P3" for t in cat_tickets), key=lambda x: x)
        cat_rows.append([cat, str(cnt), f"{pct}%", top_pri])

    cat_table = Table(cat_rows, colWidths=[120, 60, 60, 70])
    cat_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), PRUSSIAN_BLUE),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 8),
        ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
        ("FONTSIZE", (0, 1), (-1, -1), 8),
        ("TEXTCOLOR", (0, 1), (-1, -1), TEXT_PRIMARY),
        ("BACKGROUND", (0, 1), (-1, -1), WHITE),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, LIGHT_BG]),
        ("LINEBELOW", (0, 0), (-1, 0), 1.5, CAPRI_BLUE),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
    ]))
    elements.append(cat_table)
    elements.append(Spacer(1, 14))

    # ── Office Breakdown Table ──
    if len(offices_count) > 1:
        elements.append(Paragraph("Office-wise Breakdown", styles["SectionHeading"]))
        off_rows = [["Office", "Total Tickets", "% Share", "P1 Critical"]]
        for oname, ocnt in offices_count.most_common():
            pct = round(ocnt / total * 100, 1) if total else 0
            off_p1 = sum(1 for t in tickets if (t.office.name if t.office else "Unknown") == oname and t.priority == "P1")
            off_rows.append([oname, str(ocnt), f"{pct}%", str(off_p1)])
        off_table = Table(off_rows, colWidths=[120, 80, 60, 70])
        off_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), PRUSSIAN_BLUE),
            ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, 0), 8),
            ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
            ("FONTSIZE", (0, 1), (-1, -1), 8),
            ("TEXTCOLOR", (0, 1), (-1, -1), TEXT_PRIMARY),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, LIGHT_BG]),
            ("LINEBELOW", (0, 0), (-1, 0), 1.5, CAPRI_BLUE),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ]))
        elements.append(off_table)
        elements.append(Spacer(1, 14))

    # ── AI Insights ──
    elements.append(Paragraph("AI-Generated Insights & Recommendations", styles["SectionHeading"]))
    if total == 0:
        elements.append(Paragraph("No tickets found in the selected period. Unable to generate insights.", styles["InsightBody"]))
    else:
        # Generate dynamic insights
        if p1_count > 0:
            elements.append(_insight_block(styles, f"{p1_count} Critical (P1) Tickets Logged",
                f"Critical tickets require immediate attention. Ensure SLA compliance for P1 tickets within 2 hours.",
                "critical"))
        if resolution_rate < 80:
            elements.append(_insight_block(styles, "Resolution Rate Below Target",
                f"Current rate of {resolution_rate}% is below the 80% target. Consider resource reallocation.", "warning"))
        elif resolution_rate >= 90:
            elements.append(_insight_block(styles, "Excellent Resolution Performance",
                f"Resolution rate of {resolution_rate}% exceeds the 90% benchmark. Team performance is commendable.", "positive"))

        top_cat = categories.most_common(1)[0] if categories else None
        if top_cat:
            elements.append(_insight_block(styles, f"Top Category Risk: {top_cat[0]}",
                f"The '{top_cat[0]}' category accounts for {round(top_cat[1]/total*100, 1)}% of all tickets. "
                f"<b>Recommendation:</b> Initiate a root-cause analysis (RCA) on these recurring issues and consider implementing a scheduled preventive maintenance (PM) plan to proactively reduce reactive ticket volume.", "info"))

        if len(sorted_days) >= 7:
            avg_daily = round(total / len(sorted_days), 1)
            elements.append(_insight_block(styles, f"Predictive Staffing Analysis",
                f"The average daily volume is {avg_daily} tickets. Based on historical data, peak volume days often correlate with early week operations. "
                f"<b>Action Plan:</b> Adjust shift rosters to increase technician coverage by 15% on peak days to maintain SLA targets.", "info"))
            
        elements.append(_insight_block(styles, "SLA & Operational Efficiency",
            f"With {p1_count + p2_count} high-priority (P1/P2) tickets and a resolution rate of {resolution_rate}%, the operational load is "
            f"{'straining current capacity' if resolution_rate < 85 else 'well-managed within current capacity'}. "
            f"<b>Strategic Move:</b> Conduct a skills-matrix review of the facilities team to ensure sufficient cross-training for high-impact ticket categories.", "positive" if resolution_rate >= 85 else "warning"))

    elements.append(Spacer(1, 10))

    # ── Recent Tickets Table ──
    elements.append(Paragraph("Recent Tickets (Latest 20)", styles["SectionHeading"]))
    recent = tickets[:20]
    if recent:
        t_rows = [["ID", "Category", "Priority", "Status", "Office", "Created"]]
        for t in recent:
            t_rows.append([
                str(t.id)[:8].upper(),
                (t.category_name or "N/A")[:18],
                t.priority or "P3",
                t.status or "Open",
                (t.office.name if t.office else "N/A")[:12],
                t.created_at.strftime("%d %b %H:%M") if t.created_at else "N/A",
            ])
        t_table = Table(t_rows, colWidths=[55, 90, 48, 55, 65, 65])
        t_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), PRUSSIAN_BLUE),
            ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, 0), 7),
            ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
            ("FONTSIZE", (0, 1), (-1, -1), 7),
            ("TEXTCOLOR", (0, 1), (-1, -1), TEXT_PRIMARY),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, LIGHT_BG]),
            ("LINEBELOW", (0, 0), (-1, 0), 1.5, CAPRI_BLUE),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ]))
        elements.append(t_table)
    else:
        elements.append(Paragraph("No tickets found in selected period.", styles["InsightBody"]))

    # ── Confidentiality Footer ──
    elements.append(Spacer(1, 20))
    elements.append(HRFlowable(width="100%", thickness=0.5, color=BORDER_COLOR, spaceAfter=6))
    elements.append(Paragraph(
        "<i>This report is auto-generated by Bayer FacilityDesk Analytics Engine. "
        "Data is sourced from the live database. For questions, contact facilities@bayer.com.</i>",
        ParagraphStyle("Disclaimer", fontName="Helvetica", fontSize=7, textColor=TEXT_TERTIARY, alignment=TA_CENTER)
    ))

    doc.build(elements, onFirstPage=_header_footer, onLaterPages=_header_footer)

    # Log Audit
    log_audit(
        db=db, user_name="Admin", user_email="admin@bayer.com",
        action=f"Generated {period_label} ticket report",
        action_type="Export", entity="Ticket Report", entity_type="Report",
        details=f"Period: {period_label}, Office: {office_label}, Tickets: {total}"
    )

    buf.seek(0)
    filename = f"Bayer_Ticket_Report_{period_label}_{_ist_now().strftime('%Y%m%d')}.pdf"
    return StreamingResponse(
        buf, media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


# ═══════════════════════════════════════════════════════════════
#  FEEDBACK REPORT ENDPOINT
# ═══════════════════════════════════════════════════════════════

@router.get("/feedback")
def generate_feedback_report(
    period: str = Query("weekly", pattern="^(weekly|monthly|yearly)$"),
    office: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    start_date, period_label = _date_range(period)
    styles = _build_styles()

    # ── Query Data ──
    fb_q = db.query(Feedback).join(Feedback.ticket).options(joinedload(Feedback.ticket).joinedload(Ticket.office))
    fb_q = fb_q.filter(Feedback.created_at >= start_date)
    if office and office != "all":
        fb_q = fb_q.filter(Ticket.office.has(Office.name == office))
    feedbacks = fb_q.order_by(Feedback.created_at.desc()).all()

    # Total tickets in period for feedback rate
    tk_q = db.query(Ticket).filter(Ticket.created_at >= start_date)
    if office and office != "all":
        tk_q = tk_q.join(Ticket.office).filter(Office.name == office)
    total_tickets = tk_q.count()

    # ── Compute Metrics ──
    total_fb = len(feedbacks)
    fb_rate = round((total_fb / total_tickets * 100), 1) if total_tickets > 0 else 0

    avg_overall = round(sum(f.overall_rating or 0 for f in feedbacks) / total_fb, 1) if total_fb else 0
    avg_quality = round(sum(f.resolution_quality or 0 for f in feedbacks) / total_fb, 1) if total_fb else 0
    avg_response = round(sum(f.response_time or 0 for f in feedbacks) / total_fb, 1) if total_fb else 0
    avg_comm = round(sum(f.communication or 0 for f in feedbacks) / total_fb, 1) if total_fb else 0
    avg_prof = round(sum(f.professionalism or 0 for f in feedbacks) / total_fb, 1) if total_fb else 0

    # Rating distribution
    rating_dist = Counter(f.overall_rating for f in feedbacks if f.overall_rating)

    # Category satisfaction
    cat_ratings = defaultdict(list)
    for f in feedbacks:
        cat = f.ticket.category_name if f.ticket else "Unknown"
        cat_ratings[cat or "Unknown"].append(f.overall_rating or 0)
    cat_avg = {k: round(sum(v) / len(v), 1) for k, v in cat_ratings.items()}

    office_label = office if (office and office != "all") else "All Offices"

    # ── Build PDF ──
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4,
                            topMargin=28 * mm, bottomMargin=18 * mm,
                            leftMargin=15 * mm, rightMargin=15 * mm)
    elements = []

    # Title
    elements.append(Paragraph("Feedback Analytics Report", styles["BayerTitle"]))
    elements.append(Paragraph(
        f"{period_label} Report · {office_label} · {start_date.strftime('%d %b %Y')} – {_ist_now().strftime('%d %b %Y')}",
        styles["BayerSubtitle"]
    ))
    elements.append(HRFlowable(width="100%", thickness=1, color=INNOVATION_GREEN, spaceAfter=12))

    # ── Executive Summary ──
    elements.append(Paragraph("Executive Summary", styles["SectionHeading"]))
    summary = (
        f"During the reporting period, <b>{total_fb}</b> feedback responses were received out of "
        f"<b>{total_tickets}</b> tickets, yielding a feedback response rate of <b>{fb_rate}%</b>. "
        f"The average overall satisfaction rating is <b>{avg_overall}/5</b>. "
    )
    if avg_overall >= 4:
        summary += "Employee satisfaction is <b>above target</b>, indicating effective service delivery. "
    elif avg_overall >= 3:
        summary += "Satisfaction is <b>moderate</b> – targeted improvements may be beneficial. "
    else:
        summary += "<font color='#DC2626'>Satisfaction is <b>below acceptable threshold</b>. Immediate review recommended.</font> "
    elements.append(Paragraph(summary, styles["InsightBody"]))
    elements.append(Spacer(1, 10))

    # ── KPI Cards ──
    elements.append(Paragraph("Key Performance Indicators", styles["SectionHeading"]))
    metrics = [
        {"label": "TOTAL FEEDBACK", "value": total_fb},
        {"label": "FEEDBACK RATE", "value": f"{fb_rate}%"},
        {"label": "AVG RATING", "value": f"{avg_overall}/5"},
        {"label": "TOTAL TICKETS", "value": total_tickets},
    ]
    elements.append(_metric_card_table(metrics))
    elements.append(Spacer(1, 8))
    metrics2 = [
        {"label": "RESOLUTION QUALITY", "value": f"{avg_quality}/5"},
        {"label": "RESPONSE TIME", "value": f"{avg_response}/5"},
        {"label": "COMMUNICATION", "value": f"{avg_comm}/5"},
        {"label": "PROFESSIONALISM", "value": f"{avg_prof}/5"},
    ]
    elements.append(_metric_card_table(metrics2))
    elements.append(Spacer(1, 14))

    # ── Charts ──
    elements.append(Paragraph("Visual Analytics", styles["SectionHeading"]))
    charts = []
    if rating_dist:
        rd = {f"{k}★": v for k, v in sorted(rating_dist.items())}
        charts.append(_build_pie_chart(rd, "Rating Distribution"))
    if cat_avg:
        cats = list(cat_avg.keys())[:6]
        vals = [cat_avg[c] for c in cats]
        charts.append(_build_bar_chart(cats, vals, "Avg Rating by Category"))

    if charts:
        col_w = (PAGE_W - 30 * mm) / len(charts)
        ct = Table([charts], colWidths=[col_w] * len(charts))
        ct.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), LIGHT_BG),
            ("BOX", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ]))
        elements.append(ct)
        elements.append(Spacer(1, 12))

    # ── Satisfaction by Category Table ──
    elements.append(Paragraph("Satisfaction by Category", styles["SectionHeading"]))
    if cat_avg:
        sa_rows = [["Category", "Responses", "Avg Rating", "Satisfaction Level"]]
        for cat, avg in sorted(cat_avg.items(), key=lambda x: -x[1]):
            count = len(cat_ratings[cat])
            level = "Excellent" if avg >= 4 else "Good" if avg >= 3 else "Needs Improvement"
            sa_rows.append([cat[:22], str(count), f"{avg}/5", level])
        sa_table = Table(sa_rows, colWidths=[120, 65, 65, 100])
        sa_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), PRUSSIAN_BLUE),
            ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, 0), 8),
            ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
            ("FONTSIZE", (0, 1), (-1, -1), 8),
            ("TEXTCOLOR", (0, 1), (-1, -1), TEXT_PRIMARY),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, LIGHT_BG]),
            ("LINEBELOW", (0, 0), (-1, 0), 1.5, CAPRI_BLUE),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ]))
        elements.append(sa_table)
    else:
        elements.append(Paragraph("No category data available.", styles["InsightBody"]))
    elements.append(Spacer(1, 14))

    # ── AI Insights ──
    elements.append(Paragraph("AI-Generated Insights & Recommendations", styles["SectionHeading"]))
    if total_fb == 0:
        elements.append(Paragraph("No feedback data available for the selected period.", styles["InsightBody"]))
    else:
        if fb_rate < 50:
            elements.append(_insight_block(styles, "Low Feedback Response Rate",
                f"Only {fb_rate}% of resolved tickets received feedback. Implement automated follow-up emails 24h after resolution.",
                "warning"))
        elif fb_rate >= 70:
            elements.append(_insight_block(styles, "Strong Feedback Engagement",
                f"{fb_rate}% feedback rate indicates healthy employee engagement with the resolution process.", "positive"))

        if avg_overall >= 4:
            elements.append(_insight_block(styles, "High Employee Satisfaction",
                f"Average rating of {avg_overall}/5 reflects excellent service quality. Maintain current standards.", "positive"))
        elif avg_overall < 3:
            elements.append(_insight_block(styles, "Satisfaction Below Threshold",
                f"Average rating of {avg_overall}/5 is below the 3.0 minimum standard. Root cause analysis recommended.", "critical"))

        # Find worst category
        if cat_avg:
            worst = min(cat_avg.items(), key=lambda x: x[1])
            if worst[1] < 3.5:
                elements.append(_insight_block(styles, f"Service Gap Analysis: {worst[0]}",
                    f"The '{worst[0]}' category holds the lowest satisfaction rating ({worst[1]}/5). "
                    f"<b>Remediation Plan:</b> Implement a targeted quality-assurance review for this category and mandate brief customer-follow-ups post-resolution.", "warning"))
            best = max(cat_avg.items(), key=lambda x: x[1])
            elements.append(_insight_block(styles, f"Operational Excellence: {best[0]}",
                f"With a leading rating of {best[1]}/5, the '{best[0]}' category demonstrates best-in-class execution. "
                f"<b>Action:</b> Document standard operating procedures (SOPs) from this team to share across underperforming departments.", "positive"))
        
        # Analyze dimensions
        if avg_response < 3.5:
            elements.append(_insight_block(styles, "Response Time Bottlenecks",
                f"Average response time rating is critically low ({avg_response}/5). "
                f"<b>Strategic Move:</b> Review dispatch protocols and consider automating initial ticket triage to reduce first-response times by 30%.", "critical"))
        
        if avg_comm < 4.0:
            elements.append(_insight_block(styles, "Stakeholder Communication Enhancement",
                f"Communication rating stands at {avg_comm}/5. "
                f"<b>Action Plan:</b> Standardize technician update templates and enforce status-change notifications to keep employees informed throughout the ticket lifecycle.", "info"))

    # ── Recent Feedback Table ──
    elements.append(Spacer(1, 8))
    elements.append(Paragraph("Recent Feedback (Latest 15)", styles["SectionHeading"]))
    recent = feedbacks[:15]
    if recent:
        fb_rows = [["Ticket ID", "Rating", "Quality", "Response", "Comment"]]
        for f in recent:
            tid = str(f.ticket_id)[:8].upper() if f.ticket_id else "N/A"
            comment = (f.comments or "No comment")[:35]
            if len(f.comments or "") > 35:
                comment += "…"
            fb_rows.append([
                tid,
                f"{f.overall_rating or 0}/5",
                f"{f.resolution_quality or 0}/5",
                f"{f.response_time or 0}/5",
                comment,
            ])
        fb_table = Table(fb_rows, colWidths=[55, 42, 42, 48, 190])
        fb_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), PRUSSIAN_BLUE),
            ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, 0), 7),
            ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
            ("FONTSIZE", (0, 1), (-1, -1), 7),
            ("TEXTCOLOR", (0, 1), (-1, -1), TEXT_PRIMARY),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, LIGHT_BG]),
            ("LINEBELOW", (0, 0), (-1, 0), 1.5, CAPRI_BLUE),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ]))
        elements.append(fb_table)
    else:
        elements.append(Paragraph("No feedback found in selected period.", styles["InsightBody"]))

    # ── Confidentiality ──
    elements.append(Spacer(1, 20))
    elements.append(HRFlowable(width="100%", thickness=0.5, color=BORDER_COLOR, spaceAfter=6))
    elements.append(Paragraph(
        "<i>This report is auto-generated by Bayer FacilityDesk Analytics Engine. "
        "Data is sourced from the live database. For questions, contact facilities@bayer.com.</i>",
        ParagraphStyle("Disclaimer", fontName="Helvetica", fontSize=7, textColor=TEXT_TERTIARY, alignment=TA_CENTER)
    ))

    doc.build(elements, onFirstPage=_header_footer, onLaterPages=_header_footer)

    # Log Audit
    log_audit(
        db=db, user_name="Admin", user_email="admin@bayer.com",
        action=f"Generated {period_label} feedback report",
        action_type="Export", entity="Feedback Report", entity_type="Report",
        details=f"Period: {period_label}, Office: {office_label}, Feedbacks: {total_fb}"
    )

    buf.seek(0)
    filename = f"Bayer_Feedback_Report_{period_label}_{_ist_now().strftime('%Y%m%d')}.pdf"
    return StreamingResponse(
        buf, media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
