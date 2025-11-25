
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

        # Switch to Spanish
        print("Switching to Spanish...")
        try:
            if page.get_by_text("Glucosa", exact=True).is_visible():
                print("Already in Spanish.")
            else:
                if page.get_by_role("button", name="EN", exact=True).is_visible():
                    page.get_by_role("button", name="EN", exact=True).click()
                    page.wait_for_timeout(500)
                    page.get_by_text("Español").click()
                    page.wait_for_timeout(1000)
        except Exception as e:
            print(f"Error switching language: {e}")

        # Navigate to Meal Scanner with force=True
        print("Clicking Escanear Comida...")
        try:
            page.get_by_text("Escanear Comida").click(force=True)
        except:
             # Try English if Spanish click failed (though we expect Spanish)
             page.get_by_text("Scan Meal").click(force=True)

        page.wait_for_timeout(2000)

        # Verify Meal Scanner content
        print("Verifying Meal Scanner content...")

        # Check for "Subir de la galería"
        if page.get_by_text("Subir de la galería").is_visible():
            print("SUCCESS: Found 'Subir de la galería'. Translation is correct.")
        else:
            print("FAILURE/WARNING: 'Subir de la galería' not found.")

        page.screenshot(path="verification/meal_scanner_final_force.png")
        print("Screenshot saved to verification/meal_scanner_final_force.png")

        browser.close()

if __name__ == "__main__":
    verify_spanish_meal_scanner()
