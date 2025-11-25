
import time
from playwright.sync_api import sync_playwright

def verify_spanish_meal_scanner():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 375, "height": 812})
        page = context.new_page()

        print("Navigating to app...")
        page.goto("http://localhost:3000")
        page.wait_for_timeout(2000)

        # Check if we need to switch language
        # Use exact match for Glucosa to avoid ambiguity
        if page.get_by_text("Glucosa", exact=True).is_visible():
            print("Already in Spanish.")
        else:
            print("Switching to Spanish...")
            try:
                if page.get_by_role("button", name="EN", exact=True).is_visible():
                    page.get_by_role("button", name="EN", exact=True).click()
                    page.wait_for_timeout(500)
                    if page.get_by_text("Español").is_visible():
                        page.get_by_text("Español").click()
                        page.wait_for_timeout(1000)
            except Exception as e:
                print(f"Error switching language: {e}")

        # Navigate to Meal Scanner (Quick Action)
        # "Escanear Comida"
        print("Looking for Quick Action: Escanear Comida")
        scan_btn = page.get_by_text("Escanear Comida")
        if scan_btn.is_visible():
            scan_btn.click()
            print("Clicked Quick Action.")
        else:
            print("Quick action not found. Trying 'Scan Meal' (if English)...")
            if page.get_by_text("Scan Meal").is_visible():
                page.get_by_text("Scan Meal").click()
                print("Clicked English Quick Action.")

        page.wait_for_timeout(2000)

        # Verify Meal Scanner content
        print("Verifying Meal Scanner content...")

        # Check for "Subir de la galería"
        if page.get_by_text("Subir de la galería").is_visible():
            print("SUCCESS: Found 'Subir de la galería'. Translation is correct.")
        else:
            print("FAILURE/WARNING: 'Subir de la galería' not found.")
            # Take screenshot to see what's there

        page.screenshot(path="verification/meal_scanner_final_robust.png")
        print("Screenshot saved to verification/meal_scanner_final_robust.png")

        browser.close()

if __name__ == "__main__":
    verify_spanish_meal_scanner()
