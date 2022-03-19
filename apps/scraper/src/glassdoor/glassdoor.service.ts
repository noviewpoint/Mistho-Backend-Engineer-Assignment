import { Inject, Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer/lib/cjs/puppeteer/node-puppeteer-core';
import { Scraper } from '../scraper';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class GlassdoorService implements Scraper {
  url = 'https://www.glassdoor.com/index.htm';
  browser = null;

  constructor(@Inject('MESSAGE_BROKER_CLIENT') private client: ClientProxy) {}

  async work(): Promise<void> {
    await this.client.emit(
      { cmd: 'scrape' },
      'Progressive Coder' + Math.random(),
    );
  }

  async login(): Promise<void> {
    this.browser = await puppeteer.launch();
    const page = await this.browser.newPage();
    await page.goto(this.url);
    await page.screenshot({ path: 'example1.png' });
    await page.click(`button.LockedHomeHeaderStyles__signInButton`);
    await page.type('form input#modalUserPassword', 'ravi.van.test@gmail.com');
    await page.type('form input#modalUserEmail', 'ravi.van.test@gmail.com');
    await page.keyboard.press('Enter');
    await page.waitForNavigation();
    await page.screenshot({ path: 'example3.png' });
    await page.goto('https://www.glassdoor.com/member/profile/index.htm');
    await page.screenshot({ path: 'example4.png' });
    await this.browser.close();
  }

  async logout(): Promise<void> {
    return;
  }
}
