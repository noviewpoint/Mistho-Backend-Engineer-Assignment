import { Inject, Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer/lib/cjs/puppeteer/node-puppeteer-core';
import { ClientProxy } from '@nestjs/microservices';
import { UtilsService } from '@app/utils';
import { Browser } from 'puppeteer/lib/cjs/puppeteer/common/Browser';
import { Page } from 'puppeteer/lib/cjs/puppeteer/common/Page';
import { Db } from 'mongodb';
import { ConfigService } from '@nestjs/config';
import { Employee, EmployeeDetail } from '../../../../libs/interfaces';

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
    const employee: Employee = await this.getUserProfile(page);
    await this.downloadUserResumePdf(page);
    employee.pdfUrl = `${employee.name.replace(/ /g, '_')}.pdf`;
    // TODO - handle failure when saving to db
    await this.db.collection('employee').insertMany([employee]);
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

  async getUserProfile(page: Page): Promise<Employee> {
    await page.goto('https://www.glassdoor.com/member/profile/index.htm');
    await page.waitForSelector('#UserProfile', { timeout: 1000 });
    // #UserProfile must be populated with SPA data to successfully scrape the user profile
    const html = await page.content();

    const [name] = this.utilsService
      .getElementsFromDom('#ProfileInfo div:has(> h3)', html)
      .map((el) => {
        return this.utilsService.getTextFromDom('h3', el);
      });

    const [title, email, location] = this.utilsService
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
    const jobs: EmployeeDetail[] = this.utilsService
      .getElementsFromDom('#UserProfile #Experience li', html)
      .map((el) => {
        const employeeDetail: EmployeeDetail = {
          title: this.utilsService.getTextFromDom('h3[data-test="title"]', el),
          institution: this.utilsService.getTextFromDom(
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
            responsibilities: this.utilsService
              .getTextFromDom('p[data-test="description"]', el)
              .split(/\r?\n/)
              .slice(1)
              .filter((x) => x),
          },
        };
        return employeeDetail;
      });
    const skills: EmployeeDetail[] = this.utilsService
      .getElementsFromDom(
        '#UserProfile #Skills div[data-test="skillList"] div',
        html,
      )
      .map((el) => {
        const employeeDetail: EmployeeDetail = {
          title: this.utilsService.getTextFromDom('span', el),
        };
        return employeeDetail;
      });
    const education: EmployeeDetail[] = this.utilsService
      .getElementsFromDom('#UserProfile #Education li', html)
      .map((el) => {
        const employeeDetail: EmployeeDetail = {
          title: this.utilsService.getTextFromDom(
            'div[data-test="degree"]',
            el,
          ),
          institution: this.utilsService.getTextFromDom(
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
            responsibilities: this.utilsService
              .getTextFromDom('p[data-test="description"]', el)
              .split(/\r?\n/)
              .slice(1)
              .filter((x) => x),
          },
        };
        return employeeDetail;
      });

    const certifications: EmployeeDetail[] = this.utilsService
      .getElementsFromDom('#UserProfile #Certification li', html)
      .map((el) => {
        const employeeDetail: EmployeeDetail = {
          title: this.utilsService.getTextFromDom('div[data-test="title"]', el),
          institution: this.utilsService.getTextFromDom(
            'div[data-test="employer"]',
            el,
          ),
          timePeriod: this.utilsService.getTextFromDom(
            'div[data-test="certificationperiod"]',
            el,
          ),
          description: {
            main: this.utilsService
              .getTextFromDom('p[data-test="description"]', el)
              .split(/\r?\n/)[0],
            responsibilities: this.utilsService
              .getTextFromDom('p[data-test="description"]', el)
              .split(/\r?\n/)
              .slice(1)
              .filter((x) => x),
          },
        };
        return employeeDetail;
      });

    console.log('getUserProfile finished');

    return {
      name,
      title,
      email,
      location,
      aboutMe,
      jobs,
      skills,
      education,
      certifications,
    };
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
