
const express = require('express');
const { chromium } = require('playwright');
const NodeCache = require('node-cache'); // caching library

const PORT = process.env.PORT || 5002;
const app = express();

// 5 day caching
const cache = new NodeCache({ stdTTL: 5 * 24 * 60 * 60, checkperiod: 600 });

let browser;
async function initBrowser() {
  if (!browser) {
    browser = await chromium.launch({ headless: true });
    console.log('Playwright browser launched');
  }
}

/**
 * Search IGA shop for a given query and page number.
 * @param {string} query
 * @param {number} page
 * @returns {Promise<Array<Object>>}
 */
async function searchIGA(query, page = 1) {
  const context = await browser.newContext();
  const pageTab = await context.newPage();

  const searchUrl = `https://www.myiga.com/online/albanyky/search?f=false&q=${encodeURIComponent(query)}`;
  await pageTab.goto(searchUrl, { waitUntil: 'domcontentloaded' });

  // Block images/fonts/styles to save CPU
  await pageTab.route('**/*', route => {
    const type = route.request().resourceType();
    if (['image', 'stylesheet', 'font'].includes(type)) route.abort();
    else route.continue();
  });

  await pageTab.waitForSelector('.product-list-item');

  const results = await pageTab.$$eval('.product-list-item', items =>
    items.map(item => {
      const titleEl = item.querySelector('.product-list-item__name');
      const priceEl = item.querySelector('.product-list-item__price .price-display');
      const imgEl = item.querySelector('.product-list-item__img-container img');

      const product_name = titleEl ? titleEl.textContent.trim() : null;
      const current_price = priceEl ? priceEl.textContent.trim() : null;
      const product_image = imgEl ? imgEl.src : null;

      let product_size = null;
      if (product_name) {
        const match = product_name.match(/\(([^)]+)\)/);
        if (match) product_size = match[1];
      }

      return { product_name, current_price, product_size, product_image };
    })
  );

  await pageTab.close();
  await context.close();
  return results;
}


app.get('/search', async (req, res) => {
  const { query, page } = req.query;
  if (!query) {
    return res.status(400).json({ error: 'Missing `query` parameter' });
  }
  const pageNum = parseInt(page, 10) || 1;
  const cacheKey = `${query}:${pageNum}`;

  // Check cache
  const cached = cache.get(cacheKey);
  if (cached) {
    console.log(`Cache hit for ${cacheKey}`);
    return res.json({
      source: 'cache',
      scrapedAt: cached.scrapedAt,
      data: cached.data
    });
  }

  try {
    const data = await searchIGA(query, pageNum);
    const scrapedAt = new Date().toISOString();
    // Store both data and timestamp in cache
    cache.set(cacheKey, { data, scrapedAt });
    console.log(`Cache set for ${cacheKey}`);
    return res.json({ source: 'live', scrapedAt, data });
  } catch (err) {
    console.error('Search error', err);
    return res.status(500).json({ error: 'Scraping failed' });
  }
});

// Start server after browser init
initBrowser()
  .then(() => app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`)))
  .catch(err => {
    console.error('Failed to launch browser', err);
    process.exit(1);
  });
