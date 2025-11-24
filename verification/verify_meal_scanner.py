from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # Mock Capacitor to force native platform behavior
    page.add_init_script("""
        window.Capacitor = {
            isNativePlatform: () => true,
            platform: 'android',
            getPlatform: () => 'android',
            isPluginAvailable: () => true
        };
    """)

    try:
        page.goto("http://localhost:5173")

        # Wait for hydration
        page.wait_for_timeout(2000)

        # Open FAB (Quick Actions)
        # Using aria-label from translations
        page.get_by_label("Quick Actions").click()
        page.wait_for_timeout(500)

        # Click "Scan Meal"
        # The FAB items are in a list.
        # Action label is "Scan Meal"
        page.get_by_label("Scan Meal").click()

        # Wait for view transition
        page.wait_for_timeout(1000)

        # Take a screenshot
        page.screenshot(path="verification/meal_scanner_native.png")

        # Verify if "Take Photo" button is visible
        # Using the text content from translation
        take_photo_btn = page.get_by_text("Take Photo")
        if take_photo_btn.is_visible():
            print("Take Photo button found!")
        else:
            print("Take Photo button NOT found.")

        # Verify "Upload from gallery"
        gallery_btn = page.get_by_text("Upload from gallery")
        if gallery_btn.is_visible():
             print("Gallery button found!")

    except Exception as e:
        print(f"Error: {e}")
        page.screenshot(path="verification/error_script.png")
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
