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
  ) {
    this.work();
  }

  public async work(): Promise<void> {
    console.log('work started');
    const browser = await this.getHeadlessBrowser();
    const page = await this.getConfiguredPage(browser);
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

  private async getConfiguredPage(browser: Browser): Promise<Page> {
    const page = await browser.newPage();
    // TODO - atm this is workaround so typescript compiler allows access to _client (private prop)
    await page['_client'].send('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: process.cwd(),
    });
    return page;
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
    await page.click('button[title="Open Navigation Menu"');
    const anchor = await page.waitForSelector(
      `#HamburgerButton a[href='/logout.htm']`,
      {
        timeout: 1000,
      },
    );
    // https://stackoverflow.com/questions/70892717/error-node-is-either-not-clickable-or-not-an-htmlelement-puppeteer-when-i-tri/70924121
    await page.evaluate((btn) => {
      // this executes in the page
      btn.click();
    }, anchor);
    console.log('logout finished');
  }

  async scrapeUserProfile(page: Page): Promise<void> {
    await page.goto('https://www.glassdoor.com/member/profile/index.htm');
    await page.waitForSelector('#UserProfile', { timeout: 1000 });
    // #UserProfile must be populated with SPA data to successfully scrape the user profile
    const html = await page.content();

    const [employee] = this.utilsService
      .getElementsFromDom('#ProfileInfo div:has(> h3)', html)
      .map((el) => {
        return this.utilsService.getTextFromDom('h3', el);
      });

    const [employeePosition, employeeEmail, employeeLocation] =
      this.utilsService
        .getElementsFromDom('#ProfileInfo > div > div > div > div > div', html)
        .map((el) => {
          return this.utilsService.getTextFromDom(
            'div:has(> span > svg) ~ div',
            el,
          );
        })
        .filter((text) => {
          return (
            text &&
            !(
              text.includes('View as:') ||
              text.includes('Add website') ||
              text.includes('Add phone number')
            )
          );
        });

    const [aboutMe] = this.utilsService
      .getElementsFromDom('#AboutMe', html)
      .map((el) => {
        return this.utilsService.getTextFromDom(
          'p[data-test="description"]',
          el,
        );
      });
    const experience = this.utilsService
      .getElementsFromDom('#UserProfile #Experience li', html)
      .map((el) => {
        return {
          title: this.utilsService.getTextFromDom('h3[data-test="title"]', el),
          employer: this.utilsService.getTextFromDom(
            'div[data-test="employer"]',
            el,
          ),
          location: this.utilsService.getTextFromDom(
            'label[data-test="location"]',
            el,
          ),
          timePeriod: this.utilsService.getTextFromDom(
            'div[data-test="employmentperiod"]',
            el,
          ),
          description: {
            main: this.utilsService
              .getTextFromDom('p[data-test="description"]', el)
              .split(/\r?\n/)[0],
            workResponsibilities: this.utilsService
              .getTextFromDom('p[data-test="description"]', el)
              .split(/\r?\n/)
              .slice(1)
              .filter((x) => x),
          },
        };
      });
    const skills = this.utilsService
      .getElementsFromDom(
        '#UserProfile #Skills div[data-test="skillList"] div',
        html,
      )
      .map((el) => {
        return { title: this.utilsService.getTextFromDom('span', el) };
      });
    const education = this.utilsService
      .getElementsFromDom('#UserProfile #Education li', html)
      .map((el) => {
        return {
          title: this.utilsService.getTextFromDom(
            'div[data-test="degree"]',
            el,
          ),
          employer: this.utilsService.getTextFromDom(
            'h3[data-test="university"]',
            el,
          ),
          location: this.utilsService.getTextFromDom(
            'label[data-test="location"]',
            el,
          ),
          timePeriod: this.utilsService.getTextFromDom(
            'div[data-test="graduationDate"]',
            el,
          ),
          description: {
            main: this.utilsService
              .getTextFromDom('p[data-test="description"]', el)
              .split(/\r?\n/)[0],
            workResponsibilities: this.utilsService
              .getTextFromDom('p[data-test="description"]', el)
              .split(/\r?\n/)
              .slice(1)
              .filter((x) => x),
          },
        };
      });
    const certifications = this.utilsService
      .getElementsFromDom('#UserProfile #Certification li', html)
      .map((el) => {
        return {
          title: this.utilsService.getTextFromDom('div[data-test="title"]', el),
          employer: this.utilsService.getTextFromDom(
            'div[data-test="employer"]',
            el,
          ),
          period: this.utilsService.getTextFromDom(
            'div[data-test="certificationperiod"]',
            el,
          ),
          description: {
            main: this.utilsService
              .getTextFromDom('p[data-test="description"]', el)
              .split(/\r?\n/)[0],
            workResponsibilities: this.utilsService
              .getTextFromDom('p[data-test="description"]', el)
              .split(/\r?\n/)
              .slice(1)
              .filter((x) => x),
          },
        };
      });

    // TODO - handle failure when saving to db
    await this.db.collection('employee').insertMany([
      {
        employee,
        employeePosition,
        employeeEmail,
        employeeLocation,
        aboutMe,
        experience,
        skills,
        education,
        certifications,
      },
    ]);

    console.log('scrapeUserProfile finished');
  }

  async downloadUserResumePdf(page: Page): Promise<void> {
    try {
      await page.goto('https://www.glassdoor.com/member/profile/resumePdf.htm');
    } catch (ex) {
      if (!ex.message.includes('net::ERR_ABORTED')) {
        throw ex;
      }
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
}
