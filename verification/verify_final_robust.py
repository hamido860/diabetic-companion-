
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
        if page.get_by_text("Glucosa").is_visible():
            print("Already in Spanish.")
        else:
            print("Switching to Spanish...")
            try:
                # Click the language button (likely EN)
                # It seems to be a toggle or dropdown.
                # Based on previous failure where it became ES, let's assume clicking it might just toggle or show menu.
                # If it shows menu, we click Espanol.

                # Try clicking EN
                if page.get_by_role("button", name="EN", exact=True).is_visible():
                    page.get_by_role("button", name="EN", exact=True).click()
                    page.wait_for_timeout(500)
                    if page.get_by_text("Español").is_visible():
                        page.get_by_text("Español").click()
                        page.wait_for_timeout(1000)
            except Exception as e:
                print(f"Error switching language: {e}")

        # Check again
        if page.get_by_text("Glucosa").is_visible():
            print("Language verified: Spanish.")
        else:
            print("Language switch failed or not verified. Continuing anyway to check Meal Scanner text if possible.")

        # Navigate to Meal Scanner via Quick Actions if visible, or Bottom Nav
        # Quick actions: "Riesgo de pico: Medio" card is there.
        # Below that, usually Quick Actions.
        # Let's scroll down a bit.
        page.mouse.wheel(0, 500)
        page.wait_for_timeout(500)

        # Look for "Escanear Comida" (Quick Action button)
        scan_btn = page.get_by_text("Escanear Comida")
        if scan_btn.is_visible():
            print("Found 'Escanear Comida' quick action.")
            scan_btn.click()
        else:
            print("Quick action not found. Trying bottom nav (Search icon).")
            # Assuming search icon is for meal scanner/nutrition
            # It's usually the 3rd item.
            # We can try to find it by icon svg or just index.
            # Let's try to click the button with aria-label "Scan" or just 3rd button.

            # Use CSS selector for the nav
            # nav > div > button:nth-child(3)
            # Or just locator("button").nth(x) but that's risky.

            # Let's try to find the Nutrition/Scan page by URL if we could, but let's try clicking the center/search button.
            # In the screenshot, there are 5 icons.
            # 1. Home (Green)
            # 2. Document
            # 3. Magnifying Glass
            # 4. Book
            # 5. Sun

            # Let's click the magnifying glass.
            # We can find it by finding the button that contains an SVG path... that's hard.
            # Let's try to find it by order in the bottom bar.
            # The bottom bar is usually a <nav> or <div class="fixed bottom-0...">

            # Let's try to get all buttons in the bottom area.
            # We can assume the bottom nav is at the bottom of the page.

            # Let's try to click "Escanear" text if it appears in the nav? No, no text.

            # Let's try clicking the button with "Search" or "Lookup" or "Nutrition" in aria-label if exists.
            # Or just click the button that corresponds to the magnifying glass.

            # If we fail, we fail.
            pass

        page.wait_for_timeout(2000)

        # Now verify the Meal Scanner page content
        print("Verifying Meal Scanner page content...")

        # We expect "Subir de la galería"
        if page.get_by_text("Subir de la galería").is_visible():
            print("SUCCESS: Found 'Subir de la galería'. Translation is correct.")
        elif page.get_by_text("Upload from gallery").is_visible():
             print("FAILURE: Found 'Upload from gallery'. Language is English.")
        else:
             print("WARNING: Could not find 'Subir de la galería'. Checking for Arabic...")
             # Arabic for Upload from Gallery: "تحميل من المعرض"
             # We can't easily check arabic text string here without unicode, but we can verify absence of Spanish.

             # Let's check for "Escáner de Comidas" title
             if page.get_by_text("Escáner de Comidas").is_visible():
                 print("Found Title: Escáner de Comidas.")
                 # Check if button has text...
                 button = page.locator("input[type='file']").locator("..").locator("div").last
                 # The button text is usually inside a label or div.
                 print(f"Button text content: {button.text_content()}")

        page.screenshot(path="verification/meal_scanner_final_check.png")
        print("Screenshot saved.")

        browser.close()

if __name__ == "__main__":
    verify_spanish_meal_scanner()
