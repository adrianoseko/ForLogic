import { AppPage } from './app.po';
import { browser, logging } from 'protractor';

describe('Workspace Project Application', () => {
  let appPage: AppPage;

  beforeEach(() => {
    appPage = new AppPage();
  });

  it('should display the welcome message', async () => {
    await appPage.navigateTo();
    const titleText = await appPage.getTitleText();
    expect(titleText).toEqual('angularproj app is running!');
  });

  afterEach(async () => {
    await verifyNoBrowserErrors();
  });

  async function verifyNoBrowserErrors(): Promise<void> {
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    const severeErrors = logs.filter(log => log.level === logging.Level.SEVERE);
    expect(severeErrors.length).toBe(0);
  }
});