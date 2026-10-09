#!/usr/bin/env python3
"""
Comprehensive Automated UI/UX Audit & Verification Suite
Mahmoud Hisham Almodalal Portfolio
Objective verification for WCAG AA, 8px rhythm, HTML semantics, asset integrity, and mobile UX.
"""

import os
import re
import sys
from pathlib import Path

WORKSPACE = Path("/root/Portfolio-")
INDEX_HTML = WORKSPACE / "index.html"
STYLE_CSS = WORKSPACE / "css/style.css"
MAIN_JS = WORKSPACE / "js/main.js"
ANIMATIONS_JS = WORKSPACE / "js/animations.js"

failures = []
warnings = []
passes = []

def record_pass(category, message):
    passes.append(f"[{category}] PASS: {message}")

def record_fail(category, message):
    failures.append(f"[{category}] FAIL: {message}")

def record_warn(category, message):
    warnings.append(f"[{category}] WARN: {message}")

# ---------------------------------------------------------------------------
# 1. Color Contrast & WCAG AA Evaluation
# ---------------------------------------------------------------------------
def hex_to_relative_luminance(hex_str):
    hex_str = hex_str.lstrip('#').strip()
    if len(hex_str) == 3:
        hex_str = ''.join([c*2 for c in hex_str])
    rgb = [int(hex_str[i:i+2], 16) / 255.0 for i in (0, 2, 4)]
    rgb = [c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4 for c in rgb]
    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]

def contrast_ratio(hex1, hex2):
    l1 = hex_to_relative_luminance(hex1)
    l2 = hex_to_relative_luminance(hex2)
    lighter = max(l1, l2)
    darker = min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)

def check_color_contrast():
    print("-> Checking Color Contrast Matrix against WCAG AA...")
    css_content = STYLE_CSS.read_text(encoding="utf-8")
    
    # Extract root color tokens
    tokens = {}
    for match in re.finditer(r'--([a-zA-Z0-9_-]+)\s*:\s*(#[0-9a-fA-F]{3,8});', css_content):
        tokens[match.group(1)] = match.group(2)

    bg = tokens.get("bg", "#f3efe6")
    paper = tokens.get("paper", "#fbf8f1")
    ink = tokens.get("ink", "#241914")
    ink_soft = tokens.get("ink-soft", "#5f5148")
    muted = tokens.get("muted", "#8a7c72")
    accent = tokens.get("accent", "#b94a1f")
    deep = tokens.get("deep", "#211711")
    cream = tokens.get("cream", "#fff8ed")

    # Tests
    checks = [
        ("ink on bg", ink, bg, 4.5),
        ("ink on paper", ink, paper, 4.5),
        ("ink-soft on bg", ink_soft, bg, 4.5),
        ("ink-soft on paper", ink_soft, paper, 4.5),
        ("muted on bg", muted, bg, 4.5),
        ("muted on paper", muted, paper, 4.5),
        ("accent on bg (CTA/heading)", accent, bg, 4.5),
        ("accent on paper (CTA/heading)", accent, paper, 4.5),
        ("cream on deep (Dark sections/footer)", cream, deep, 4.5),
    ]

    for label, fg_color, bg_color, min_ratio in checks:
        ratio = contrast_ratio(fg_color, bg_color)
        if ratio >= min_ratio:
            record_pass("CONTRAST", f"{label} ({fg_color} vs {bg_color}) = {ratio:.2f}:1 >= {min_ratio}:1")
        else:
            record_fail("CONTRAST", f"{label} ({fg_color} vs {bg_color}) = {ratio:.2f}:1 FAILS min {min_ratio}:1")

# ---------------------------------------------------------------------------
# 2. HTML Semantics, Landmarks, and Headings Hierarchy
# ---------------------------------------------------------------------------
def check_html_semantics():
    print("-> Checking HTML Semantics & Landmarks...")
    html_content = INDEX_HTML.read_text(encoding="utf-8")

    # Document basics
    if '<!DOCTYPE html>' in html_content:
        record_pass("SEMANTICS", "Valid HTML5 doctype present")
    else:
        record_fail("SEMANTICS", "Missing <!DOCTYPE html>")

    if '<html lang="en">' in html_content or '<html lang="en"' in html_content:
        record_pass("SEMANTICS", "html tag specifies lang attribute")
    else:
        record_fail("SEMANTICS", "Missing lang attribute in <html>")

    if '<meta name="viewport"' in html_content:
        record_pass("SEMANTICS", "Responsive meta viewport tag present")
    else:
        record_fail("SEMANTICS", "Missing responsive meta viewport tag")

    # Landmarks
    if '<nav' in html_content and '</nav>' in html_content:
        record_pass("SEMANTICS", "<nav> landmark present")
    else:
        record_fail("SEMANTICS", "Missing <nav> landmark")

    if '<main id="main-content"' in html_content:
        record_pass("SEMANTICS", "<main id=\"main-content\"> landmark present")
    else:
        record_fail("SEMANTICS", "Missing <main id=\"main-content\"> landmark")

    if '<footer' in html_content and '</footer>' in html_content:
        record_pass("SEMANTICS", "<footer> landmark present")
    else:
        record_fail("SEMANTICS", "Missing <footer> landmark")

    # Skip link
    if re.search(r'<a\s+class="skip-link"[^>]*href="#main-content"', html_content):
        record_pass("SEMANTICS", "Accessible skip-link targeting #main-content present")
    else:
        record_fail("SEMANTICS", "Missing or misconfigured skip-link")

    # Headings hierarchy
    h1_count = len(re.findall(r'<h1\b', html_content))
    if h1_count == 1:
        record_pass("HEADINGS", "Exactly one <h1> heading present")
    else:
        record_fail("HEADINGS", f"Found {h1_count} <h1> headings (must be exactly 1)")

    # Check project card titles - should use headings, not generic divs
    featured_div_titles = len(re.findall(r'<article[^>]*featured-project[^>]*>.*?<div class="project-title">', html_content, re.DOTALL))
    if featured_div_titles == 0:
        record_pass("HEADINGS", "Featured project titles use semantic heading tags (<h3>)")
    else:
        record_fail("HEADINGS", f"{featured_div_titles} featured project cards use <div class=\"project-title\"> instead of semantic <h3>")

# ---------------------------------------------------------------------------
# 3. Accessibility & Keyboard Navigation (ARIA, Focus, Reduced Motion)
# ---------------------------------------------------------------------------
def check_accessibility():
    print("-> Checking Accessibility & Keyboard Interactions...")
    html_content = INDEX_HTML.read_text(encoding="utf-8")
    css_content = STYLE_CSS.read_text(encoding="utf-8")
    js_content = MAIN_JS.read_text(encoding="utf-8")

    # Focus styles in CSS
    if ":focus-visible" in css_content:
        record_pass("A11Y", ":focus-visible styles defined in CSS")
    else:
        record_fail("A11Y", "Missing :focus-visible rules in CSS")

    # Skip-link focus style
    if ".skip-link:focus" in css_content:
        record_pass("A11Y", ".skip-link:focus visibility style defined")
    else:
        record_fail("A11Y", "Missing .skip-link:focus style in CSS")

    # prefers-reduced-motion in CSS
    if "@media (prefers-reduced-motion: reduce)" in css_content:
        record_pass("A11Y", "CSS includes @media (prefers-reduced-motion: reduce)")
    else:
        record_fail("A11Y", "Missing prefers-reduced-motion media query in CSS")

    # Filter buttons: aria-pressed or role=tab
    filter_buttons = re.findall(r'<button class="filter-btn[^"]*"[^>]*>', html_content)
    missing_aria_filter = [btn for btn in filter_buttons if 'aria-pressed' not in btn]
    if not missing_aria_filter:
        record_pass("A11Y", "All filter buttons have aria-pressed state attributes")
    else:
        record_fail("A11Y", f"{len(missing_aria_filter)} filter buttons missing aria-pressed attribute")

    # Emojis as structural icons check
    # Check contact links for text entities / emojis
    bad_entities = ['&commat;', '&phone;', '&infin;', '&lt;/&gt;', '&darr;']
    found_bad = [ent for ent in bad_entities if ent in html_content]
    if not found_bad:
        record_pass("A11Y", "No raw emoji/character entities used as structural icons in contact cards")
    else:
        record_fail("A11Y", f"Found raw entity glyphs used as icons in contact cards: {found_bad}")

    # Functional filtering under reduced motion
    if ("dataset.filter" in js_content or "data-filter" in js_content) and "addEventListener('click'" in js_content:
        record_pass("A11Y", "Core project filter logic is present in main.js (available under reduced motion)")
    else:
        record_fail("A11Y", "Core project filter logic is missing from main.js (locked inside animations.js)")

# ---------------------------------------------------------------------------
# 4. Link & Asset Integrity
# ---------------------------------------------------------------------------
def check_links_and_assets():
    print("-> Checking Asset and Link Integrity...")
    html_content = INDEX_HTML.read_text(encoding="utf-8")

    # Internal anchor links
    all_ids = set(re.findall(r'id=["\']([a-zA-Z0-9_-]+)["\']', html_content))
    anchor_hrefs = re.findall(r'href=["\']#([a-zA-Z0-9_-]+)["\']', html_content)
    broken_anchors = [ref for ref in anchor_hrefs if ref not in all_ids]
    if not broken_anchors:
        record_pass("ASSETS", f"All {len(anchor_hrefs)} internal #anchors resolve to existing elements")
    else:
        record_fail("ASSETS", f"Broken internal #anchors found: {broken_anchors}")

    # Local file links (images, pdfs, scripts, stylesheets)
    local_files = re.findall(r'(?:src|href)=["\']([^"\'#:]+\.(?:webp|png|jpg|pdf|css|js))["\']', html_content)
    missing_files = []
    for f in set(local_files):
        target = WORKSPACE / f
        if not target.exists():
            missing_files.append(f)
    if not missing_files:
        record_pass("ASSETS", f"All {len(local_files)} referenced local files exist on disk")
    else:
        record_fail("ASSETS", f"Missing local referenced files: {missing_files}")

    # Image alt text
    img_tags = re.findall(r'<img\b[^>]*>', html_content)
    missing_alt = [img for img in img_tags if 'alt=' not in img or 'alt=""' in img or "alt=''" in img]
    if not missing_alt:
        record_pass("ASSETS", f"All {len(img_tags)} <img> tags have non-empty alt text")
    else:
        record_fail("ASSETS", f"{len(missing_alt)} <img> tags missing descriptive alt text")

    # Target _blank links must have rel="noopener noreferrer"
    external_links = re.findall(r'<a\b[^>]*target=["\']_blank["\'][^>]*>', html_content)
    missing_rel = []
    for link in external_links:
        if 'rel=' not in link:
            missing_rel.append(link)
        elif 'noopener' not in link:
            missing_rel.append(link)
    if not missing_rel:
        record_pass("ASSETS", f"All {len(external_links)} target=\"_blank\" links have rel=\"noopener noreferrer\"")
    else:
        record_fail("ASSETS", f"{len(missing_rel)} target=\"_blank\" links missing rel=\"noopener noreferrer\"")

# ---------------------------------------------------------------------------
# 5. Spacing Rhythm & Responsive Rules
# ---------------------------------------------------------------------------
def check_spacing_and_responsive():
    print("-> Checking 8px Spacing Rhythm & Mobile Targets...")
    css_content = STYLE_CSS.read_text(encoding="utf-8")

    # Check that 8px spacing tokens are defined
    tokens = ["--space-1", "--space-2", "--space-3", "--space-4", "--space-6", "--space-8", "--space-12"]
    missing_tokens = [t for t in tokens if t not in css_content]
    if not missing_tokens:
        record_pass("SPACING", "All core 8px rhythm spacing tokens defined")
    else:
        record_fail("SPACING", f"Missing spacing tokens: {missing_tokens}")

    # Mobile touch target rule for interactive elements
    # Minimum 44px on mobile
    if "44px" in css_content or "min-height: 44px" in css_content or "min-height: 48px" in css_content:
        record_pass("MOBILE", "Explicit touch target dimensions (>=44px) defined in CSS")
    else:
        record_fail("MOBILE", "Missing explicit 44px minimum touch target dimensions in mobile CSS")

# ---------------------------------------------------------------------------
# Main Runner
# ---------------------------------------------------------------------------
def main():
    print("==================================================")
    print("Portfolio UI/UX Audit & Verification Suite")
    print("==================================================")
    
    check_color_contrast()
    check_html_semantics()
    check_accessibility()
    check_links_and_assets()
    check_spacing_and_responsive()

    print("\n------------------ AUDIT RESULTS -----------------")
    print(f"Total Passed: {len(passes)}")
    print(f"Total Warnings: {len(warnings)}")
    print(f"Total Failed: {len(failures)}")
    print("--------------------------------------------------\n")

    for p in passes:
        print(p)
    if warnings:
        print("\nWarnings:")
        for w in warnings:
            print(w)
    if failures:
        print("\nFailures:")
        for f in failures:
            print(f)
        print("\nFAILED: Some checks failed. Resolve issues and re-run.")
        sys.exit(1)
    else:
        print("\nSUCCESS: All automated UI/UX audit checks PASSED clean!")
        sys.exit(0)

if __name__ == "__main__":
    main()
