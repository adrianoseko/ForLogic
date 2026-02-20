import { browser, by, element, ElementFinder } from 'protractor';

export class AppPage {
  private readonly contentElement: ElementFinder;

  constructor() {
    this.contentElement = element(by.css('app-root .content span'));
  }

  async navigateTo(): Promise<void> {
    await browser.get(browser.baseUrl);
  }

  async getTitleText(): Promise<string> {
    return await this.contentElement.getText();
  }
}
