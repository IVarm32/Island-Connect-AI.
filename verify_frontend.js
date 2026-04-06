const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Set viewport for better screenshots
  await page.setViewportSize({ width: 1280, height: 800 });

  // Serve the dist directory
  const { exec } = require('child_process');
  const server = exec('npx serve dist -p 3000');

  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 3000));

  try {
    // 1. Verify Homepage Blog Section
    await page.goto('http://localhost:3000');
    const blogSection = await page.locator('#blog');
    await blogSection.scrollIntoViewIfNeeded();
    await page.screenshot({ path: 'home_blog_new.png' });
    console.log('Homepage blog screenshot saved.');

    // 2. Verify a Blog Detail Page
    const firstPostLink = await page.locator('#blog .blog-card a').first();
    const postHref = await firstPostLink.getAttribute('href');
    await firstPostLink.click();
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'blog_detail_new.png', fullPage: true });
    console.log('Blog detail screenshot saved.');

    // Check for critical elements
    const authorBox = await page.locator('.author-box');
    const authorVisible = await authorBox.isVisible();
    console.log('Author box visible:', authorVisible);

    const cta = await page.locator('.blog-cta');
    const ctaVisible = await cta.isVisible();
    console.log('CTA visible:', ctaVisible);

    const relatedGrid = await page.locator('.related-posts-grid');
    const relatedVisible = await relatedGrid.isVisible();
    console.log('Related posts grid visible:', relatedVisible);

  } catch (error) {
    console.error('Verification failed:', error);
  } finally {
    await browser.close();
    server.kill();
  }
})();
