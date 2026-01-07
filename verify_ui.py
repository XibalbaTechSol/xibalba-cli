import asyncio
from playwright.async_api import async_playwright
import sys

async def verify_ui():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        print("Navigating to dashboard...")
        try:
            await page.goto("http://localhost:5173", timeout=10000)
        except Exception as e:
            print(f"Error: Could not connect to dashboard at http://localhost:5173. Ensure UI is running. {e}")
            await browser.close()
            sys.exit(1)

        # 1. Verify Split Screen (CLI on left, Browser on right)
        print("Verifying layout...")
        # Check for Agent CLI header
        cli_header = await page.wait_for_selector("text=Agent CLI", timeout=5000)
        if cli_header:
            print("✓ Agent CLI found on left.")
        else:
            print("✗ Agent CLI NOT found.")

        # Check for Browser Navigation Bar items
        nav_bar = await page.wait_for_selector("input[placeholder='Enter URL to navigate...']", timeout=5000)
        if nav_bar:
            print("✓ Chromium Frame (navigation bar) found on right.")
        else:
            print("✗ Chromium Frame NOT found.")

        # 2. Verify Bash Terminal below
        terminal_tabs = await page.wait_for_selector("text=bash", timeout=5000)
        if terminal_tabs:
            print("✓ Bash Terminal tabs found at bottom.")
        else:
            print("✗ Bash Terminal tabs NOT found.")

        # 3. Verify "+" button and spawning
        print("Testing terminal spawning...")
        plus_button = await page.wait_for_selector("button[title='Open New Terminal']", timeout=5000)
        if plus_button:
            print("✓ '+' button found.")
            await plus_button.click()
            # Wait for a new tab to appear (bash (7682))
            new_tab = await page.wait_for_selector("text=bash (7682)", timeout=5000)
            if new_tab:
                print("✓ Successfully spawned new terminal tab.")
            else:
                print("✗ Failed to spawn new terminal tab.")
        else:
            print("✗ '+' button NOT found.")

        await browser.close()
        print("Verification complete.")

if __name__ == "__main__":
    asyncio.run(verify_ui())
