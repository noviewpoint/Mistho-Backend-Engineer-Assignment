import { Inject, Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer/lib/cjs/puppeteer/node-puppeteer-core';
import { ClientProxy } from '@nestjs/microservices';
import { UtilsService } from '@app/utils';
import { Browser } from 'puppeteer/lib/cjs/puppeteer/common/Browser';
import { Page } from 'puppeteer/lib/cjs/puppeteer/common/Page';
import { Db } from 'mongodb';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GlassdoorService {
  private readonly url = 'https://www.glassdoor.com/index.htm';

  constructor(
    @Inject('MESSAGE_BROKER_CLIENT') private client: ClientProxy,
    @Inject('DATABASE_CLIENT')
    private db: Db,
    private utilsService: UtilsService,
    private configService: ConfigService,
  ) {}

  public async work(): Promise<void> {
    console.log('work started');
    const browser: Browser = await this.getHeadlessBrowser();
    const page: Page = await browser.newPage();
    await this.login(page);
    await this.scrapeUserProfile(page);
    await this.downloadUserResumePdf(page);
    await this.logout(page);
    await browser.close();
    console.log('work finished');
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
    const education = this.utilsService.getTextFromDom(
      '#Education',
      userProfileWhole,
    );
    const certification = this.utilsService.getTextFromDom(
      '#Certification',
      userProfileWhole,
    );

    // TODO - handle failure when saving to db
    await this.db
      .collection('employee')
      .insertMany([
        { profileInfo, aboutMe, experience, skills, education, certification },
      ]);

    console.log('scrapeUserProfile finished');
  }

  async downloadUserResumePdf(page: Page): Promise<void> {
    // TODO - workaround so typescript lets access to _client
    await page['_client'].send('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: process.cwd(),
    });
    try {
      await page.goto('https://www.glassdoor.com/member/profile/resumePdf.htm');
    } catch (ex) {
      console.error(ex);
    }

    try {
      await page.waitForNavigation({
        timeout: 1000,
      });
    } catch (ex) {
      // if correct credentials provided, puppeteer exception Navigation timeout of 1000 ms exceeded happens
      // if wrong credentials provided, puppeteer exception Navigation timeout of 1000 ms exceeded happens
      if (ex.name !== 'TimeoutError') {
        throw ex;
      }
    }

    console.log('downloadUserResumePdf finished');
  }

  private async login(page: Page): Promise<void> {
    await page.goto(this.url);
    await page.click(`button.LockedHomeHeaderStyles__signInButton`);
    await page.type(
      'form[name=emailSignInForm] input#modalUserPassword',
      this.configService.get<string>('GLASSDOOR_USERNAME'),
    );
    await page.type(
      'form[name=emailSignInForm] input#modalUserEmail',
      this.configService.get<string>('GLASSDOOR_PASSWORD'),
    );
    await page.keyboard.press('Enter');

    // hacky way of handling wrong credentials

    try {
      await page.waitForNavigation({
        timeout: 1000,
      });
    } catch (ex) {
      // if correct credentials provided, puppeteer exception Navigation timeout of 1000 ms exceeded happens
      // if wrong credentials provided, puppeteer exception Navigation timeout of 1000 ms exceeded happens
      if (ex.name !== 'TimeoutError') {
        throw ex;
      }
    }

    let wrongLoginInfo;
    try {
      wrongLoginInfo = await page.$eval(
        'form[name=emailSignInForm] #descriptionColor',
        (heading) => heading['innerText'],
      );
    } catch (ex) {
      // if correct credentials provided, navigation happened, and you are evaluating an element that does not exist
      if (
        ex.message !==
        'Execution context was destroyed, most likely because of a navigation.'
      ) {
        throw ex;
      }
    }

    if (wrongLoginInfo) {
      // if wrong credentials provided, throw an error with site generated message about unsuccessful login
      throw new Error(wrongLoginInfo);
    }

    // TODO - implement retry

    console.log('login finished');
  }

  private async logout(page: Page): Promise<void> {
    console.log('logout finished');
    // await page.click(`button.LockedHomeHeaderStyles__signInButton`);
    // await page.type('form input#modalUserPassword', 'ravi.van.test@gmail.com');
    // await page.type('form input#modalUserEmail', 'ravi.van.test@gmail.com');
    // await page.keyboard.press('Enter');
    // // TODO - handle invalid login case
    // await page.waitForNavigation();
    // return page;
    // #SiteNav > nav.d-flex.align-items-center.HeaderStyles__navigationBackground.HeaderStyles__relativePosition > div > div > div > div:nth-child(7) > div > div.PopupStyles__popupContainer > div > div > div > div > div > ul:nth-child(4) > li:nth-child(2) > a > div > span > span
  }
}
