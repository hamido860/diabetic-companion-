
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

        print("Switching to Spanish...")
        try:
            # Use exact=True to avoid ambiguity
            page.get_by_role("button", name="EN", exact=True).click()
            page.wait_for_timeout(500)

            page.get_by_text("Español").click()
            page.wait_for_timeout(1000)
            print("Language switched.")
        except Exception as e:
            print(f"Failed to switch language: {e}")
            page.screenshot(path="verification/failed_switch.png")
            return

        print("Navigating to Meal Scanner...")
        try:
            # "Escanear Comida"
            page.get_by_text("Escanear Comida").click()
            page.wait_for_timeout(1000)
        except Exception as e:
            print(f"Failed to find Scan Meal button: {e}")
            page.screenshot(path="verification/failed_nav.png")
            return

        print("Checking Meal Scanner content...")

        # Check for "Subir de la galería"
        if page.get_by_text("Subir de la galería").is_visible():
            print("Found 'Subir de la galería' button - Translation Correct!")
        else:
            print("Could not find 'Subir de la galería' button.")

        # Also check title "Escanear Comida" or "Meal Scanner"
        # The key is `mealScanner` -> 'Escáner de Comidas'
        if page.get_by_text("Escáner de Comidas").is_visible():
             print("Found 'Escáner de Comidas' title.")

        # Take final screenshot
        page.screenshot(path="verification/spanish_meal_scanner.png")
        print("Screenshot saved to verification/spanish_meal_scanner.png")

        browser.close()

if __name__ == "__main__":
    verify_spanish_meal_scanner()
