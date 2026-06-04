#!/usr/bin/env python3
"""Generate Chrome Web Store promo assets for HowLoud — Sound Meter.

Outputs three SVGs (rendered to alpha-free JPEG via rsvg-convert + sips):
  store-assets/screenshot-1280x800.jpg   (store screenshot)
  store-assets/promo-small-440x280.jpg   (small promo tile)
  store-assets/promo-marquee-1400x560.jpg (marquee promo)

Brand palette mirrors popup.css.
"""

from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "store-assets"
OUT.mkdir(exist_ok=True)

BG = "#0f1518"
SURFACE = "#161f23"
SURFACE2 = "#1d282d"
LINE = "#2a373d"
TEXT = "#eef5f4"
MUTED = "#9fb2b3"
ACCENT = "#7ce0d0"
ACCENT2 = "#f8d28a"
WARN = "#f8d28a"
FONT = "-apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif"

DEFS = f"""
  <defs>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="{ACCENT}"/>
      <stop offset="100%" stop-color="{ACCENT2}"/>
    </linearGradient>
    <linearGradient id="bar" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0%" stop-color="{ACCENT}"/>
      <stop offset="100%" stop-color="{ACCENT2}"/>
    </linearGradient>
    <linearGradient id="primary" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="{ACCENT}"/>
      <stop offset="100%" stop-color="#aaf3e8"/>
    </linearGradient>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#101a1d"/>
      <stop offset="55%" stop-color="{BG}"/>
      <stop offset="100%" stop-color="#0b1113"/>
    </linearGradient>
  </defs>
"""


def eq_mark(x, y, size):
    """Equalizer brand mark inside a rounded square."""
    pad = size * 0.22
    inner = size - pad * 2
    bw = inner / 7
    gap = bw
    heights = [0.45, 0.72, 1.0, 0.6]
    base_y = y + size - pad
    bars = []
    bx = x + pad + bw * 0.5
    for h in heights:
        bh = inner * h
        bars.append(
            f'<rect x="{bx:.1f}" y="{base_y - bh:.1f}" width="{bw:.1f}" '
            f'height="{bh:.1f}" rx="{bw/2:.1f}" fill="url(#bar)"/>'
        )
        bx += bw + gap
    return (
        f'<rect x="{x}" y="{y}" width="{size}" height="{size}" rx="{size*0.28:.0f}" '
        f'fill="{SURFACE2}"/>' + "".join(bars)
    )


def popup_mock(tx, ty, scale):
    """A faithful mockup of the popup in a 'measuring' state. 340x556 @ scale 1."""
    W = 340
    s = []
    s.append(f'<g transform="translate({tx},{ty}) scale({scale})">')
    # device body
    s.append(f'<rect x="0" y="0" width="{W}" height="556" rx="22" fill="{BG}" stroke="{LINE}" stroke-width="1"/>')
    # header
    s.append(eq_mark(18, 18, 34))
    s.append(f'<text x="62" y="30" font-family="{FONT}" font-size="10" letter-spacing="1.4" fill="{MUTED}">SOUND METER</text>')
    s.append(f'<text x="62" y="47" font-family="{FONT}" font-size="17" font-weight="800" fill="{TEXT}">HowLoud</text>')
    s.append(f'<rect x="232" y="22" width="90" height="24" rx="12" fill="{WARN}" fill-opacity="0.16"/>')
    s.append(f'<text x="277" y="38" font-family="{FONT}" font-size="11" font-weight="700" fill="{WARN}" text-anchor="middle">Measuring</text>')
    # reading card
    s.append(f'<rect x="18" y="64" width="304" height="106" rx="16" fill="{SURFACE}" stroke="{LINE}" stroke-width="1"/>')
    s.append(f'<text x="170" y="128" font-family="{FONT}" font-size="52" font-weight="800" fill="{TEXT}" text-anchor="middle">62.4<tspan font-size="20" fill="{MUTED}" dx="6">dB</tspan></text>')
    s.append(f'<text x="170" y="152" font-family="{FONT}" font-size="12" fill="{MUTED}" text-anchor="middle">Current estimate</text>')
    # gauge
    s.append(f'<rect x="18" y="188" width="304" height="8" rx="4" fill="{SURFACE2}"/>')
    s.append(f'<rect x="18" y="188" width="146" height="8" rx="4" fill="url(#accent)"/>')
    labels = ["Very Quiet", "Quiet", "Moderate", "Loud", "Very Loud"]
    xs = [22, 96, 170, 250, 318]
    anchors = ["start", "middle", "middle", "middle", "end"]
    for lab, lx, anc in zip(labels, xs, anchors):
        s.append(f'<text x="{lx}" y="210" font-family="{FONT}" font-size="8.5" fill="{MUTED}" text-anchor="{anc}">{lab}</text>')
    # zone
    s.append(f'<rect x="18" y="226" width="304" height="44" rx="12" fill="{SURFACE}" stroke="{LINE}" stroke-width="1"/>')
    s.append(f'<text x="34" y="252" font-family="{FONT}" font-size="10" letter-spacing="1.2" fill="{MUTED}">NOISE ZONE</text>')
    s.append(f'<text x="306" y="254" font-family="{FONT}" font-size="15" font-weight="800" fill="{ACCENT2}" text-anchor="end">Moderate</text>')
    # stats
    stats = [("MIN", "41.2 dB"), ("AVG", "55.8 dB"), ("MAX", "73.1 dB")]
    sx = 18
    cw = (304 - 16) / 3
    for lab, val in stats:
        s.append(f'<rect x="{sx:.1f}" y="286" width="{cw:.1f}" height="50" rx="12" fill="{SURFACE}" stroke="{LINE}" stroke-width="1"/>')
        cx = sx + cw / 2
        s.append(f'<text x="{cx:.1f}" y="306" font-family="{FONT}" font-size="9" letter-spacing="1" fill="{MUTED}" text-anchor="middle">{lab}</text>')
        s.append(f'<text x="{cx:.1f}" y="324" font-family="{FONT}" font-size="13" font-weight="700" fill="{TEXT}" text-anchor="middle">{val}</text>')
        sx += cw + 8
    # message
    s.append(f'<text x="170" y="362" font-family="{FONT}" font-size="11.5" fill="{MUTED}" text-anchor="middle">The microphone is active — the level updates live.</text>')
    # buttons
    s.append(f'<rect x="18" y="378" width="304" height="40" rx="10" fill="url(#primary)"/>')
    s.append(f'<text x="170" y="403" font-family="{FONT}" font-size="14" font-weight="700" fill="#081012" text-anchor="middle">Stop</text>')
    s.append(f'<rect x="18" y="426" width="148" height="38" rx="10" fill="none" stroke="{LINE}"/>')
    s.append(f'<text x="92" y="450" font-family="{FONT}" font-size="13" font-weight="700" fill="{MUTED}" text-anchor="middle">Reset</text>')
    s.append(f'<rect x="174" y="426" width="148" height="38" rx="10" fill="{SURFACE2}" stroke="{LINE}"/>')
    s.append(f'<text x="248" y="450" font-family="{FONT}" font-size="13" font-weight="700" fill="{TEXT}" text-anchor="middle">Open on web</text>')
    # footer
    s.append(f'<line x1="18" y1="486" x2="322" y2="486" stroke="{LINE}"/>')
    # privacy note with leading padlock, centered as a unit
    s.append(f'<g transform="translate(70,502)"><rect x="0" y="5" width="11" height="8" rx="2" fill="{ACCENT}"/><path d="M2 5 V3 a3.5 3.5 0 0 1 7 0 V5" fill="none" stroke="{ACCENT}" stroke-width="1.6"/></g>')
    s.append(f'<text x="89" y="510" font-family="{FONT}" font-size="10.5" fill="{MUTED}">No audio recorded or stored — runs locally</text>')
    s.append('</g>')
    return "".join(s)


def check_dot(x, y):
    return (f'<circle cx="{x}" cy="{y}" r="9" fill="{ACCENT}" fill-opacity="0.16"/>'
            f'<path d="M{x-4} {y} l3 3 l5 -6" fill="none" stroke="{ACCENT}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>')


def screenshot():
    W, H = 1280, 800
    s = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">', DEFS]
    s.append(f'<rect width="{W}" height="{H}" fill="url(#bgGrad)"/>')
    s.append(f'<circle cx="930" cy="300" r="420" fill="{ACCENT}" fill-opacity="0.05"/>')
    # left copy
    s.append(f'<text x="96" y="250" font-family="{FONT}" font-size="15" letter-spacing="3" fill="{ACCENT}">BROWSER EXTENSION</text>')
    s.append(f'<text x="94" y="320" font-family="{FONT}" font-size="58" font-weight="800" fill="{TEXT}">How loud is it,</text>')
    s.append(f'<text x="94" y="386" font-family="{FONT}" font-size="58" font-weight="800" fill="{TEXT}">really?</text>')
    s.append(f'<text x="96" y="436" font-family="{FONT}" font-size="20" fill="{MUTED}">Measure ambient noise in your browser — one click,</text>')
    s.append(f'<text x="96" y="464" font-family="{FONT}" font-size="20" fill="{MUTED}">a live decibel estimate from your microphone.</text>')
    bullets = ["Live dB with min / avg / max", "Clear noise zones, color-coded", "Nothing is recorded or stored"]
    by = 530
    for b in bullets:
        s.append(check_dot(112, by - 5))
        s.append(f'<text x="136" y="{by}" font-family="{FONT}" font-size="19" fill="{TEXT}">{b}</text>')
        by += 50
    s.append(f'<text x="96" y="720" font-family="{FONT}" font-size="15" letter-spacing="1" fill="{MUTED}">Free  ·  No sign-up  ·  Privacy-first</text>')
    # popup on the right
    s.append(popup_mock(812, 96, 1.12))
    s.append('</svg>')
    return "".join(s)


def marquee():
    W, H = 1400, 560
    s = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">', DEFS]
    s.append(f'<rect width="{W}" height="{H}" fill="url(#bgGrad)"/>')
    s.append(f'<circle cx="1050" cy="280" r="380" fill="{ACCENT}" fill-opacity="0.05"/>')
    s.append(eq_mark(96, 150, 84))
    s.append(f'<text x="200" y="184" font-family="{FONT}" font-size="16" letter-spacing="2.5" fill="{ACCENT}">BROWSER EXTENSION</text>')
    s.append(f'<text x="198" y="246" font-family="{FONT}" font-size="62" font-weight="800" fill="{TEXT}">HowLoud</text>')
    s.append(f'<text x="200" y="292" font-family="{FONT}" font-size="26" font-weight="600" fill="{MUTED}">Sound Meter</text>')
    s.append(f'<text x="98" y="372" font-family="{FONT}" font-size="23" fill="{TEXT}">Measure ambient noise in your browser. A quick decibel</text>')
    s.append(f'<text x="98" y="406" font-family="{FONT}" font-size="23" fill="{TEXT}">estimate from your microphone — nothing recorded or stored.</text>')
    s.append(f'<text x="98" y="470" font-family="{FONT}" font-size="16" letter-spacing="1" fill="{MUTED}">Free  ·  No sign-up  ·  Works in EN / DE / RU</text>')
    s.append(popup_mock(992, -8, 1.02))
    s.append('</svg>')
    return "".join(s)


def promo_small():
    W, H = 440, 280
    s = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">', DEFS]
    s.append(f'<rect width="{W}" height="{H}" fill="url(#bgGrad)"/>')
    s.append(eq_mark(40, 48, 64))
    s.append(f'<text x="40" y="160" font-family="{FONT}" font-size="34" font-weight="800" fill="{TEXT}">HowLoud</text>')
    s.append(f'<text x="42" y="190" font-family="{FONT}" font-size="17" font-weight="600" fill="{ACCENT}">Sound Meter</text>')
    s.append(f'<text x="40" y="230" font-family="{FONT}" font-size="14.5" fill="{MUTED}">Ambient noise, measured</text>')
    s.append(f'<text x="40" y="252" font-family="{FONT}" font-size="14.5" fill="{MUTED}">right in your browser.</text>')
    s.append('</svg>')
    return "".join(s)


def main():
    jobs = [
        ("screenshot-1280x800", 1280, 800, screenshot()),
        ("promo-marquee-1400x560", 1400, 560, marquee()),
        ("promo-small-440x280", 440, 280, promo_small()),
    ]
    for name, w, h, svg in jobs:
        svg_path = OUT / f"{name}.svg"
        svg_path.write_text(svg, encoding="utf-8")
        print(f"wrote {svg_path.relative_to(ROOT)}  ({w}x{h})")
    print("\nNow render with: bash scripts/render_store_assets.sh")


if __name__ == "__main__":
    main()
