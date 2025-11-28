
import time
from playwright.sync_api import sync_playwright

def verify_meal_scanner_spanish_translations():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        print("Navigating to app...")
        page.goto("http://localhost:3000")
        page.wait_for_timeout(3000)

        # Debug: Take a screenshot of the home page to see what's wrong
        page.screenshot(path="verification/home_debug.png")

        # Try to find Profile icon/text by inspecting the page structure
        # Maybe it's an SVG or has a specific aria-label
        # Let's try to click on the element that looks like Profile (usually last item in nav)

        # If text "Profile" fails, it might be hidden or just an icon.
        # Let's try to access Settings directly if possible? No, URL routing might not be standard.

        # Let's look for a cog icon or "Settings" text anywhere.

        # Try to click on the last button in the bottom navigation if it exists.
        # Assuming typical bottom nav structure: nav > button

        print("Trying to find navigation...")
        # Just dumping the page content to stdout might be too much,
        # but let's try to find any button.
        buttons = page.locator("button").all()
        print(f"Found {len(buttons)} buttons")
        for i, btn in enumerate(buttons):
            try:
                text = btn.text_content()
                print(f"Button {i}: {text}")
                if "Profile" in text or "Settings" in text:
                    btn.click()
                    print("Clicked Profile/Settings button")
                    break
            except:
                pass

        page.wait_for_timeout(2000)
        page.screenshot(path="verification/after_click_debug.png")

        # Now try to find Spanish option
        try:
            page.get_by_text("Español").click()
            print("Clicked Español")
            page.wait_for_timeout(1000)
        except:
            print("Could not find Español option")

        # Go to Meal Scanner
        # Look for "Escanear" or "Scan"
        try:
            # If in English
            page.get_by_text("Scan Meal").click()
        except:
            try:
                # If in Spanish
                page.get_by_text("Escanear Comida").click()
            except:
                print("Could not find Scan Meal button")

        page.wait_for_timeout(2000)
        page.screenshot(path="verification/meal_scanner_final.png")

        browser.close()

if __name__ == "__main__":
    verify_meal_scanner_spanish_translations()
