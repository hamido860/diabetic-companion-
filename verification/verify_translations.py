
import time
from playwright.sync_api import sync_playwright

def verify_meal_scanner_spanish_translations():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # 1. Navigate to the app
        print("Navigating to app...")
        page.goto("http://localhost:3000")

        # Allow time for initial load
        page.wait_for_timeout(2000)

        # 2. Change language to Spanish
        # Finding the Settings button first. Usually in bottom nav or top bar.
        # Assuming there is a way to change settings.
        # If I can't find the UI, I might need to execute script to change context state, but UI is better.

        # Let's try to find a settings button or language toggle.
        # Based on previous knowledge, there is a Settings page.
        print("Looking for Settings...")

        # Try to find a link or button with text "Settings" or icon
        settings_button = page.get_by_role("button", name="Settings")
        if not settings_button.is_visible():
             # maybe it is an icon?
             pass

        # Just in case, let's dump the page content if we fail to find it.
        # But wait, I can access the context directly if needed, or better,
        # I can just look for the text "Settings" or similar.

        # However, looking at the code, I see 'components/Settings.tsx' exists.
        # Usually settings is accessible via bottom nav or side menu.
        # Let's assume there is a settings icon or button.

        # Wait, I recall the BottomNav has "Home", "Logs", "Recipes", "Profile".
        # Settings might be in Profile.

        print("Navigating to Profile...")
        page.get_by_text("Profile").click()
        page.wait_for_timeout(1000)

        # In Profile, there should be Settings or Language option.
        print("Looking for Language settings...")

        # I will take a screenshot of Profile to see where the language switcher is
        page.screenshot(path="verification/profile_page.png")

        # If I can't find it easily, I will try to use the 'Settings' button if present
        # Or look for "Language" / "Idioma"

        # Let's try to click on "Settings" if it exists in Profile page
        if page.get_by_text("Settings").is_visible():
            page.get_by_text("Settings").click()
            page.wait_for_timeout(1000)

        # Now look for language buttons: English, Español, العربية
        print("Switching to Spanish...")
        page.get_by_text("Español").click()
        page.wait_for_timeout(1000)

        # 3. Navigate to Meal Scanner
        # It is likely a FAB or a bottom nav item.
        # "Meal Scanner" or "Escáner de Comidas" (since we switched to Spanish)
        print("Navigating to Meal Scanner...")

        # The FAB usually has an icon. Or maybe text "Scan Meal".
        # In Spanish it should be "Escanear Comida"

        # Let's try to find the button.
        # If it's a FAB, it might have an aria-label.

        # I'll try finding by text "Escanear Comida" which corresponds to 'scanMeal' key
        scan_button = page.get_by_text("Escanear Comida")
        if scan_button.is_visible():
            scan_button.click()
        else:
             # Maybe it's still "Scan Meal" if translation failed?
             # Or maybe it is an icon.
             # Let's try finding by role button with some specific class or parent.
             # Or just navigate to /meal-scanner if routing allows (but it's likely SPA).
             pass

        page.wait_for_timeout(2000)

        # 4. Take Screenshot of Meal Scanner in Spanish
        print("Taking verification screenshot...")
        page.screenshot(path="verification/meal_scanner_spanish.png")

        browser.close()

if __name__ == "__main__":
    verify_meal_scanner_spanish_translations()
