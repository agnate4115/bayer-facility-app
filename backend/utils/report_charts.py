"""
Hand-built SVG chart helpers for the McKinsey-style PDF reports.

Every function returns a self-contained <svg> string that WeasyPrint renders
as crisp vector graphics inside the HTML report. No external chart lib.
"""
import math
from html import escape

# ── Report palette (Bayer, tuned for print) ──
NAVY = "#00314E"
NAVY_SOFT = "#33607A"
CYAN = "#01BEFF"
GREEN = "#56D500"
AMBER = "#F59E0B"
RED = "#DC2626"
GRID = "#E6EBF0"
AXIS = "#9AA7B2"
INK = "#1A2733"
INK_SOFT = "#5B6B7A"

# Sequential palette for categorical charts (muted, professional)
SERIES = [NAVY, CYAN, GREEN, "#6C8EA8", AMBER, "#8B5CF6", "#0E7C86", "#B45309"]


def _fmt(n):
    """Compact number formatting."""
    if isinstance(n, float):
        return f"{n:.1f}".rstrip("0").rstrip(".")
    return str(n)


# ══════════════════════════════════════════════════════════════════
#  DONUT CHART  (priority mix, rating distribution)
# ══════════════════════════════════════════════════════════════════
def donut_chart(segments, center_label="", center_sub="", size=140, thickness=22):
    """
    segments: list of dicts {label, value, color}
    Returns an SVG donut with a legend rendered separately by the template.
    """
    total = sum(s["value"] for s in segments) or 1
    cx = cy = size / 2
    r = (size - thickness) / 2 - 2

    def polar(angle):
        a = math.radians(angle - 90)
        return cx + r * math.cos(a), cy + r * math.sin(a)

    parts = []
    # Count non-zero segments — a lone segment must render as a full ring,
    # because an SVG arc whose start and end points coincide collapses to nothing.
    nonzero = [s for s in segments if s["value"] > 0]
    if len(nonzero) == 1:
        parts.append(
            f'<circle cx="{cx}" cy="{cy}" r="{r:.2f}" fill="none" '
            f'stroke="{nonzero[0]["color"]}" stroke-width="{thickness}" />'
        )
    else:
        start = 0.0
        for s in segments:
            if s["value"] <= 0:
                continue
            frac = s["value"] / total
            end = start + frac * 360
            gap = 1.5
            a0, a1 = start + gap / 2, end - gap / 2
            if a1 <= a0:
                a1 = a0 + 0.01
            x1, y1 = polar(a0)
            x2, y2 = polar(a1)
            large = 1 if (a1 - a0) > 180 else 0
            path = f"M {x1:.2f} {y1:.2f} A {r:.2f} {r:.2f} 0 {large} 1 {x2:.2f} {y2:.2f}"
            parts.append(
                f'<path d="{path}" fill="none" stroke="{s["color"]}" '
                f'stroke-width="{thickness}" stroke-linecap="butt" />'
            )
            start = end

    center = ""
    if center_label:
        center = (
            f'<text x="{cx}" y="{cy - 1}" text-anchor="middle" '
            f'font-size="22" font-weight="700" fill="{INK}">{escape(str(center_label))}</text>'
        )
        if center_sub:
            center += (
                f'<text x="{cx}" y="{cy + 13}" text-anchor="middle" '
                f'font-size="7.5" letter-spacing="1" fill="{INK_SOFT}">{escape(str(center_sub)).upper()}</text>'
            )

    # Fixed compact size — WeasyPrint does not reliably resolve % widths against
    # a flex column, so a hard px size guarantees the donut fits the exhibit.
    return (
        f'<svg viewBox="0 0 {size} {size}" width="{size}" height="{size}" '
        f'style="display:block" '
        f'xmlns="http://www.w3.org/2000/svg">{"".join(parts)}{center}</svg>'
    )


# ══════════════════════════════════════════════════════════════════
#  HORIZONTAL BAR CHART  (tickets by office, by category)
# ══════════════════════════════════════════════════════════════════
def hbar_chart(rows, color=CYAN, width=520, bar_h=22, gap=14, label_w=140, value_suffix=""):
    """
    rows: list of (label, value). Sorted by caller.
    """
    rows = list(rows)
    if not rows:
        return _empty(width, 120)
    maxv = max(v for _, v in rows) or 1
    plot_w = width - label_w - 46
    h = len(rows) * (bar_h + gap) + gap
    parts = [f'<svg viewBox="0 0 {width} {h}" width="100%" height="auto" preserveAspectRatio="xMidYMid meet" style="display:block;width:100%;height:auto" xmlns="http://www.w3.org/2000/svg">']

    y = gap
    for label, value in rows:
        bw = max(2, (value / maxv) * plot_w)
        # label
        parts.append(
            f'<text x="{label_w - 10}" y="{y + bar_h/2 + 4}" text-anchor="end" '
            f'font-size="10" fill="{INK_SOFT}">{escape(str(label)[:22])}</text>'
        )
        # track
        parts.append(
            f'<rect x="{label_w}" y="{y}" width="{plot_w}" height="{bar_h}" rx="3" fill="{GRID}" />'
        )
        # bar
        parts.append(
            f'<rect x="{label_w}" y="{y}" width="{bw:.1f}" height="{bar_h}" rx="3" fill="{color}" />'
        )
        # value
        parts.append(
            f'<text x="{label_w + bw + 8:.1f}" y="{y + bar_h/2 + 4}" '
            f'font-size="10" font-weight="700" fill="{INK}">{_fmt(value)}{value_suffix}</text>'
        )
        y += bar_h + gap

    parts.append("</svg>")
    return "".join(parts)


# ══════════════════════════════════════════════════════════════════
#  VERTICAL BAR CHART  (rating distribution, daily volume)
# ══════════════════════════════════════════════════════════════════
def vbar_chart(rows, colors=None, width=520, height=220, value_suffix=""):
    """
    rows: list of (label, value)
    colors: optional list matching rows, else NAVY
    """
    rows = list(rows)
    if not rows:
        return _empty(width, height)
    maxv = max(v for _, v in rows) or 1
    pad_l, pad_r, pad_t, pad_b = 34, 12, 18, 34
    plot_w = width - pad_l - pad_r
    plot_h = height - pad_t - pad_b
    n = len(rows)
    slot = plot_w / n
    bar_w = min(48, slot * 0.6)

    parts = [f'<svg viewBox="0 0 {width} {height}" width="100%" height="auto" preserveAspectRatio="xMidYMid meet" style="display:block;width:100%;height:auto" xmlns="http://www.w3.org/2000/svg">']

    # gridlines (4 steps)
    for i in range(5):
        gy = pad_t + plot_h - (plot_h * i / 4)
        val = maxv * i / 4
        parts.append(f'<line x1="{pad_l}" y1="{gy:.1f}" x2="{width-pad_r}" y2="{gy:.1f}" stroke="{GRID}" stroke-width="1" />')
        parts.append(f'<text x="{pad_l-6}" y="{gy+3:.1f}" text-anchor="end" font-size="8" fill="{AXIS}">{_fmt(round(val,1))}</text>')

    for i, (label, value) in enumerate(rows):
        bh = (value / maxv) * plot_h
        bx = pad_l + slot * i + (slot - bar_w) / 2
        by = pad_t + plot_h - bh
        color = (colors[i] if colors and i < len(colors) else NAVY)
        parts.append(f'<rect x="{bx:.1f}" y="{by:.1f}" width="{bar_w:.1f}" height="{bh:.1f}" rx="3" fill="{color}" />')
        parts.append(f'<text x="{bx + bar_w/2:.1f}" y="{by-5:.1f}" text-anchor="middle" font-size="9" font-weight="700" fill="{INK}">{_fmt(value)}{value_suffix}</text>')
        parts.append(f'<text x="{bx + bar_w/2:.1f}" y="{height-pad_b+16:.1f}" text-anchor="middle" font-size="9" fill="{INK_SOFT}">{escape(str(label)[:10])}</text>')

    parts.append("</svg>")
    return "".join(parts)


# ══════════════════════════════════════════════════════════════════
#  LINE / AREA CHART  (daily trend, dual series)
# ══════════════════════════════════════════════════════════════════
def line_chart(labels, series, width=520, height=230):
    """
    labels: list of x labels
    series: list of dicts {name, color, values}
    """
    if not labels:
        return _empty(width, height)
    pad_l, pad_r, pad_t, pad_b = 34, 14, 18, 30
    plot_w = width - pad_l - pad_r
    plot_h = height - pad_t - pad_b
    n = len(labels)
    maxv = max([max(s["values"]) for s in series if s["values"]] + [1])
    step = plot_w / max(1, n - 1)

    def pt(i, v):
        x = pad_l + step * i
        y = pad_t + plot_h - (v / maxv) * plot_h
        return x, y

    parts = [f'<svg viewBox="0 0 {width} {height}" width="100%" height="auto" preserveAspectRatio="xMidYMid meet" style="display:block;width:100%;height:auto" xmlns="http://www.w3.org/2000/svg">']
    # gridlines
    for i in range(5):
        gy = pad_t + plot_h - (plot_h * i / 4)
        parts.append(f'<line x1="{pad_l}" y1="{gy:.1f}" x2="{width-pad_r}" y2="{gy:.1f}" stroke="{GRID}" stroke-width="1" />')
        parts.append(f'<text x="{pad_l-6}" y="{gy+3:.1f}" text-anchor="end" font-size="8" fill="{AXIS}">{int(round(maxv*i/4))}</text>')

    # x labels (thin out if many)
    label_every = max(1, n // 8)
    for i, lab in enumerate(labels):
        if i % label_every == 0 or i == n - 1:
            x = pad_l + step * i
            parts.append(f'<text x="{x:.1f}" y="{height-pad_b+16:.1f}" text-anchor="middle" font-size="8" fill="{INK_SOFT}">{escape(str(lab))}</text>')

    for s in series:
        vals = s["values"]
        pts = [pt(i, v) for i, v in enumerate(vals)]
        # area fill
        area = f'M {pts[0][0]:.1f} {pad_t+plot_h:.1f} ' + " ".join(f'L {x:.1f} {y:.1f}' for x, y in pts) + f' L {pts[-1][0]:.1f} {pad_t+plot_h:.1f} Z'
        parts.append(f'<path d="{area}" fill="{s["color"]}" fill-opacity="0.10" />')
        # line
        line = "M " + " L ".join(f'{x:.1f} {y:.1f}' for x, y in pts)
        parts.append(f'<path d="{line}" fill="none" stroke="{s["color"]}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round" />')
        # dots
        for x, y in pts:
            parts.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="2.6" fill="#fff" stroke="{s["color"]}" stroke-width="1.6" />')

    parts.append("</svg>")
    return "".join(parts)


# ══════════════════════════════════════════════════════════════════
#  DIMENSION BARS  (feedback 0–5 scores) — returns list for template
# ══════════════════════════════════════════════════════════════════
def score_bar_svg(value, out_of=5, width=260, color=NAVY):
    """A single horizontal 0–5 score bar."""
    h = 10
    frac = max(0, min(1, value / out_of))
    return (
        f'<svg viewBox="0 0 {width} {h}" width="100%" height="auto" preserveAspectRatio="none" style="display:block;width:100%;height:{h}px" xmlns="http://www.w3.org/2000/svg">'
        f'<rect x="0" y="0" width="{width}" height="{h}" rx="5" fill="{GRID}" />'
        f'<rect x="0" y="0" width="{width*frac:.1f}" height="{h}" rx="5" fill="{color}" />'
        f'</svg>'
    )


def _empty(width, height):
    return (
        f'<svg viewBox="0 0 {width} {height}" width="{width}" height="{height}" xmlns="http://www.w3.org/2000/svg">'
        f'<text x="{width/2}" y="{height/2}" text-anchor="middle" font-size="11" fill="{AXIS}">No data available</text></svg>'
    )
