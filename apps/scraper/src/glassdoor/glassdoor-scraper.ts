import { Scraper } from '../scraper';
import puppeteer from 'puppeteer/lib/cjs/puppeteer/node-puppeteer-core';

export class GlassdoorScraper extends Scraper {
  url = 'https://www.glassdoor.com/index.htm';

  async login(): Promise<void> {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://example.com');
    await page.screenshot({ path: 'example.png' });

    await browser.close();
  }

  async logout(): Promise<void> {
    return;
  }
}
