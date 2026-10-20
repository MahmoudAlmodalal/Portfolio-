# Mahmoud Hisham Almodalal — Engineering Portfolio

Live site: https://mahmoud-almoudalal.me/

A responsive portfolio presenting backend architecture, SaaS platforms, AI integrations, engineering leadership, training operations, and teaching experience.

## Files

- `index.html` — portfolio website, project showcase, experience, education, references and contact links.
- `css/style.css` — responsive design and project visual styles.
- `js/` — portfolio interactions, animations and project filtering.
- `images/mahmoud-headshot.jpg` — professional portrait, responsively positioned in desktop and mobile hero layouts.
- `images/live/*.webp` — genuine captures of 12 deployed projects (not invented screenshots).
- `images/illustrations/*.svg` — five original vector illustrations for projects without public visual previews. These are concept illustrations, not screenshots.
- `scripts/capture_live_previews.py` and `.github/workflows/capture-project-previews.yml` — reproducible Playwright screen capture workflow.
- `.github/workflows/portfolio-visual-qa.yml` — desktop/mobile automated visual preview artifacts.
- `resume.html` — up-to-date ATS-oriented resume; open in a browser and print to PDF when needed.

## Recent portfolio updates

- Added **Phone Sales** (https://phone-sales-dusky.vercel.app/) with verified stack information from the repository.
- Added **OK FBI** (https://okfbi.com/) and **Andalusia CMS** (https://cms-drab-eight.vercel.app/).
- Replaced 12 placeholder project images with genuine screenshots captured in a browser from the live deployments; clickable previews use lightweight browser frames.
- Updated professional experience with Technical Manager at Washer, Training Operations Manager at MET Academy, and Teaching Assistant at Islamic University of Gaza.
- Added the MET training-recognition certificate and official university transcript; set GPA to **90.83%**.
- Updated the CV link to the latest HTML resume.

## Run locally

Open `index.html` in a browser or run `python3 -m http.server 8000` in the repository root.

The site is static HTML, CSS and JavaScript, and can be hosted with GitHub Pages.

## Image performance

Run the `Optimize portfolio images` GitHub Actions workflow to resize and compress the older project visuals in-place without changing their URLs. Live-site screenshots are already small optimized WebP assets; the five concept images are lightweight scalable SVGs.
