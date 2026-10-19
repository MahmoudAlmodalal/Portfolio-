"""Capture genuine screenshots from public live deployments for portfolio cards.

Usage: python scripts/capture_live_previews.py
Only images from successfully loaded sites are saved; unavailable sites are skipped.
"""
import asyncio
import io
from pathlib import Path

from PIL import Image, ImageStat
from playwright.async_api import async_playwright

SITES = {
    "edutracker": "https://edutracker.site/",
    "noor-al-huda": "https://nooralhodaa.vercel.app/login",
    "clientmore": "https://more-client-bay.vercel.app/",
    "okfbi": "https://okfbi.com/",
    "andalusia-cms": "https://cms-drab-eight.vercel.app/",
    "phone-sales": "https://phone-sales-dusky.vercel.app/",
    "myshell": "https://mahmoudalmodalal.github.io/myshell-c/",
    "docu-sort": "https://mahmoudalmodalal.github.io/docu-sort/",
    "summit": "https://mahmoudalmodalal.github.io/summit-creative-studio/",
    "bookflow": "https://mahmoudalmodalal.github.io/bookflow-lms/",
    "taskflow": "https://mahmoudalmodalal.github.io/taskflow-workspace/",
    "momentum": "https://mahmoudalmodalal.github.io/momentum-productivity-suite/",
}
OUTPUT_DIR = Path("images/live")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
BAD_MARKERS = ("DEPLOYMENT_NOT_FOUND", "404: NOT_FOUND", "This deployment is not available", "Application error: a server-side exception")


async def capture(browser, slug, url, semaphore):
    async with semaphore:
        page = await browser.new_page(viewport={"width": 1440, "height": 900}, device_scale_factor=1, locale="en-US")
        try:
            print(f"[capture] {slug}: {url}", flush=True)
            response = await page.goto(url, wait_until="domcontentloaded", timeout=45000)
            if not response or response.status >= 400:
                print(f"[skip] {slug} HTTP {response.status if response else 'none'}", flush=True)
                return
            await page.evaluate("document.fonts.ready")
            try:
                await page.wait_for_load_state("networkidle", timeout=8500)
            except Exception:
                pass
            await page.wait_for_timeout(1800)
            body = await page.locator("body").inner_text(timeout=9000)
            if any(marker.lower() in body.lower() for marker in BAD_MARKERS):
                print(f"[skip] {slug} returned an error page", flush=True)
                return
            if len(body.strip()) < 30:
                print(f"[skip] {slug} page appears empty", flush=True)
                return
            image_bytes = await page.screenshot(type="png", full_page=False, animations="disabled")
            img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            stat = ImageStat.Stat(img.resize((80, 50)))
            if max(stat.stddev) < 4:
                print(f"[skip] {slug} blank/near-uniform screenshot", flush=True)
                return
            path = OUTPUT_DIR / f"{slug}.webp"
            img.resize((1200, 750), Image.Resampling.LANCZOS).save(path, "WEBP", quality=84, method=5)
            print(f"[saved] {slug}: {path}, {path.stat().st_size} bytes, title={await page.title()}", flush=True)
        except Exception as error:
            print(f"[skip] {slug}: {type(error).__name__}: {error}", flush=True)
        finally:
            await page.close()


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, args=["--no-sandbox"])
        semaphore = asyncio.Semaphore(3)
        await asyncio.gather(*(capture(browser, slug, url, semaphore) for slug, url in SITES.items()))
        await browser.close()
    print("Completed captures:", sorted(str(path) for path in OUTPUT_DIR.glob("*.webp")), flush=True)


if __name__ == "__main__":
    asyncio.run(main())
