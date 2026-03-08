import asyncio
from playwright.async_api import async_playwright
import sys

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # Go to the local dev server
        try:
            await page.goto('http://localhost:3008', timeout=5000)
        except Exception as e:
            print(f"Error: Could not connect to dev server. Is it running on port 3008? {e}")
            await browser.close()
            return

        print("Page loaded. Monitoring sliders for 15 seconds...")

        # Listen for console logs
        page.on("console", lambda msg: print(f"BROWSER CONSOLE: {msg.text}"))

        # Function to get transform of both sliders
        async def get_slider_states():
            return await page.evaluate('''() => {
                const projectTrack = document.querySelector('.project-track');
                const testimonyTrack = document.querySelector('.testimonial-track');
                return {
                    project: projectTrack ? projectTrack.style.transform : 'not found',
                    testimony: testimonyTrack ? testimonyTrack.style.transform : 'not found'
                };
            }''')

        # Initial state
        initial_states = await get_slider_states()
        print(f"Initial states: {initial_states}")

        # Check every 2 seconds for 15 seconds
        for i in range(7):
            await asyncio.sleep(2)
            current_states = await get_slider_states()
            print(f"T+{ (i+1)*2 }s states: {current_states}")

        # Capture a screenshot for visual confirmation
        await page.screenshot(path='debug_final.png', full_page=True)
        print("Screenshot saved to debug_final.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
