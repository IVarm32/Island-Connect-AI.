
import { test, expect } from '@playwright/test';

test('Sliders should change index automatically', async ({ page }) => {
    // Navigate to the local server (assuming it's running on 8080)
    await page.goto('http://localhost:8080');

    // --- Test Portfolio Slider ---
    // On desktop (default), it might not slide if all 3 items fit.
    // Let's set viewport to mobile to force sliding.
    await page.setViewportSize({ width: 375, height: 667 });

    const portfolioDots = page.locator('.project-dots .dot');
    const firstPortfolioDot = portfolioDots.nth(0);
    const secondPortfolioDot = portfolioDots.nth(1);

    // Initial state
    await expect(firstPortfolioDot).toHaveClass(/active/);

    // Wait for the interval (6s in config) + buffer
    console.log('Waiting for Portfolio slider to auto-slide...');
    await expect(secondPortfolioDot).toHaveClass(/active/, { timeout: 15000 });
    console.log('Portfolio slider auto-slid successfully.');

    // --- Test Testimony Slider ---
    const testimonyDots = page.locator('.slider-dots .dot');
    const firstTestimonyDot = testimonyDots.nth(0);
    const secondTestimonyDot = testimonyDots.nth(1);

    // Initial state (or current state if it already slid)
    // Testimony has 5s interval.
    console.log('Waiting for Testimony slider to auto-slide...');
    const isActive = await secondTestimonyDot.evaluate(el => el.classList.contains('active'));
    if (!isActive) {
        await expect(secondTestimonyDot).toHaveClass(/active/, { timeout: 15000 });
    }
    console.log('Testimony slider auto-slid successfully.');
});
