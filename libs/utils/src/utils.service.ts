import { Injectable } from '@nestjs/common';
import CheerioModule, * as cheerio from 'cheerio';
import { fetch } from 'undici';

@Injectable()
export class UtilsService {
  sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  getTextFromDom(selector: string, html: cheerio.Element): string {
    return CheerioModule(selector, html).text().trim();
  }

  async fetch(url: string): Promise<string> {
    try {
      const res = await fetch(url);
      return await res.text();
    } catch (ex) {
      return '';
    }
  }

  getAttributeValueFromDom(
    selector: string,
    html: cheerio.Element,
    attribute: string,
  ): string {
    return CheerioModule(selector, html).attr(attribute);
  }

  getElementsFromDom(selector: string, html: string): cheerio.Element[] {
    return CheerioModule(selector, html).toArray();
  }
}
