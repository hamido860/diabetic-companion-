
import time
from playwright.sync_api import sync_playwright

def verify_spanish_meal_scanner():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use a mobile viewport to match user's context (though isNative is determined by Capacitor)
        context = browser.new_context(viewport={"width": 375, "height": 812})
        page = context.new_page()

        print("Navigating to app...")
        page.goto("http://localhost:3000")
        page.wait_for_timeout(2000)

        # 1. Switch Language
        # Found "EN" button in the header in the previous screenshot
        print("Switching to Spanish...")
        try:
            # Click the EN button
            page.get_by_role("button", name="EN").click()
            page.wait_for_timeout(500)

            # Select Español from the dropdown/menu
            page.get_by_text("Español").click()
            page.wait_for_timeout(1000)
            print("Language switched.")
        except Exception as e:
            print(f"Failed to switch language: {e}")
            page.screenshot(path="verification/failed_switch.png")
            return

        # 2. Verify some home page text to confirm Spanish
        try:
            # "Good evening" -> "¡Hola!" or similar
            # "Today's Steps" -> "Pasos de hoy"
            if page.get_by_text("Pasos de hoy").is_visible():
                print("Spanish verified on Home.")
            else:
                print("Could not verify Spanish text on Home.")
        except:
            pass

        # 3. Navigate to Meal Scanner
        # In Dashboard.tsx: { label: t('scanMeal'), Icon: CameraIcon, action: () => onQuickAction(ActiveView.MealScanner) }
        # The text should be "Escanear Comida"
        print("Navigating to Meal Scanner...")
        try:
            page.get_by_text("Escanear Comida").click()
            page.wait_for_timeout(1000)
        except Exception as e:
            print(f"Failed to find Scan Meal button: {e}")
            page.screenshot(path="verification/failed_nav.png")
            return

        # 4. Verify Meal Scanner UI
        # Since this is Web, we expect "Subir de la galería" (Upload from Gallery)
        # The "Split Button" is only for Native.
        # But we are verifying the *translations* here to ensure no Arabic is present.

        print("Checking Meal Scanner content...")

        # Check for "Subir de la galería"
        upload_btn = page.get_by_text("Subir de la galería")
        if upload_btn.is_visible():
            print("Found 'Subir de la galería' button - Translation Correct!")
        else:
            print("Could not find 'Subir de la galería' button.")
            # Check if we see Arabic or English instead
            if page.get_by_text("Upload from gallery").is_visible():
                print("Found English text instead.")
            # Check for Arabic text from regression
            # "تحميل صورة وجبة" (uploadMealPhoto)
            # "تحميل من المعرض" (uploadFromGallery)
            # I can't easily type Arabic here but I can check if English is NOT there and Spanish IS there.

        # Take final screenshot
        page.screenshot(path="verification/spanish_meal_scanner.png")
        print("Screenshot saved to verification/spanish_meal_scanner.png")

        browser.close()

if __name__ == "__main__":
    verify_spanish_meal_scanner()
