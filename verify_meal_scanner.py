import time
from playwright.sync_api import sync_playwright

def verify_meal_scanner():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Wait for server to start
        time.sleep(5)

        try:
            # Go to home page
            page.goto("http://localhost:5173")

            # Wait for page load
            page.wait_for_load_state("networkidle")

            # Click on FAB to open menu
            # Looking for the button with aria-label "Quick Actions"
            fab = page.get_by_label("Quick Actions")
            fab.click()

            # Wait for animation
            time.sleep(1)

            # Click on "Scan Meal" button in the menu
            # It has aria-label="Scan Meal"
            scan_meal_btn = page.get_by_label("Scan Meal")
            scan_meal_btn.click()

            # Wait for Meal Scanner page
            # Check for the header "Meal Scanner"
            page.wait_for_selector("text=Meal Scanner")

            # Take screenshot
            page.screenshot(path="verification.png")
            print("Screenshot taken: verification.png")

        except Exception as e:
            print(f"Error: {e}")
            # Take screenshot of error state if possible
            page.screenshot(path="error_verification.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_meal_scanner()
