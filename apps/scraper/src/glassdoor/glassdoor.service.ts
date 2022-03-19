import { Inject, Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer/lib/cjs/puppeteer/node-puppeteer-core';
import { ClientProxy } from '@nestjs/microservices';
import { UtilsService } from '@app/utils';
import { Browser } from 'puppeteer/lib/cjs/puppeteer/common/Browser';
import { Page } from 'puppeteer/lib/cjs/puppeteer/common/Page';
import { Db } from 'mongodb';

@Injectable()
export class GlassdoorService {
  private readonly url = 'https://www.glassdoor.com/index.htm';

  constructor(
    @Inject('MESSAGE_BROKER_CLIENT') private client: ClientProxy,
    @Inject('DATABASE_CLIENT')
    private db: Db,
    private utilsService: UtilsService,
  ) {
    this.work();
  }

  private async work(): Promise<void> {
    // await this.client.emit(
    //   { cmd: 'scrape' },
    //   'Progressive Coder' + Math.random(),
    // );
    const browser: Browser = await this.getHeadlessBrowser();
    const page: Page = await this.login(browser);
    await this.scrapeUserProfile(page);
    await this.downloadUserResumePdf(page);
    await browser.close();
  }

  private async getHeadlessBrowser(): Promise<Browser> {
    return puppeteer.launch({ headless: true });
  }

  async scrapeUserProfile(page: Page): Promise<void> {
    await page.goto('https://www.glassdoor.com/member/profile/index.htm');
    await page.waitForSelector('#UserProfile', { timeout: 1000 });
    // #UserProfile must be populated with SPA data to successfully scrape the user profile
    const html = await page.content();
    const [userProfileWhole] = this.utilsService.getElementsFromDom(
      '#UserProfile',
      html,
    );

    const profileInfo = this.utilsService.getTextFromDom(
      '#ProfileInfo',
      userProfileWhole,
    );
    const aboutMe = this.utilsService.getTextFromDom(
      '#AboutMe',
      userProfileWhole,
    );
    const experience = this.utilsService.getTextFromDom(
      '#Experience',
      userProfileWhole,
    );
    const skills = this.utilsService.getTextFromDom(
      '#Skills',
      userProfileWhole,
    );
    const certification = this.utilsService.getTextFromDom(
      '#Certification',
      userProfileWhole,
    );

    // TODO - handle failure
    await this.db
      .collection('employee')
      .insertMany([
        { profileInfo, aboutMe, experience, skills, certification },
      ]);

    return;
  }

  async downloadUserResumePdf(page: Page): Promise<void> {
    const downloadPath = __dirname;
    // await page._client.send('Page.setDownloadBehavior', {
    //   behavior: 'allow',
    //   downloadPath,
    // });
    // const content = await page.content();
    // const x = 3;
    // await page.goto('https://www.glassdoor.com/member/profile/resumePdf.htm');
    // console.log(1);
    // const x = await this.utilsService.fetchPdf(
    //   'https://www.glassdoor.com/member/profile/resumePdf.htm',
    // );
    // await page.click(
    //   '#ProfileInfo .profileInfoStyle__actions___3-CvK > div:nth-child(2) > button',
    // );
    // await page.waitFor(5000);
    return;
  }

  private async login(browser: Browser): Promise<Page> {
    const page = await browser.newPage();
    await page.goto(this.url);
    await page.click(`button.LockedHomeHeaderStyles__signInButton`);
    await page.type('form input#modalUserPassword', 'ravi.van.test@gmail.com');
    await page.type('form input#modalUserEmail', 'ravi.van.test@gmail.com');
    await page.keyboard.press('Enter');
    // TODO - handle invalid login case
    await page.waitForNavigation();
    return page;
  }
}
