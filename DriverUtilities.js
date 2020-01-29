const { assert } = require('chai');
const firefox = require('selenium-webdriver/firefox');
const { Capabilities, Builder, By, until } = require('selenium-webdriver');

/**
 * Return a built driver object using firefox
 * Configured to be headless, allow insecure certs always accept alerts
 */
async function getDriver() {
    // configure Options
    const options = new firefox.Options();
    options.setPreference('dom.disable_beforeunload', true);
    // use headless mode
    options.headless();

    const capabilities = Capabilities.firefox();
    capabilities.setAcceptInsecureCerts(true);
    capabilities.setAlertBehavior('accept');

    // configure ServiceBuilder
    const service = new firefox.ServiceBuilder();

    // build driver using options and service
    let driver = await new Builder()
        .forBrowser('firefox')
        .withCapabilities(capabilities);
    driver = driver.setFirefoxOptions(options).setFirefoxService(service);
    driver = driver.build();

    return driver;
}

/**
 * Given a WebDriver and URL load the page and print the title
 * 
 * @param {WebDriver} driver selenium-webdriver
 * @param {String} page URL of a page to load
 */
async function loadPage(driver, page) {
    await driver.manage().window().setRect({ width: 1600, height: 800 });
    console.log(`Loading page: ${page}`);
    await driver.get(page);
    const pageTitle = await driver.getTitle();
    console.log(`Page title: ${pageTitle}`);
}

//TODO:: Refactor to remove jes explorer specific checks
/**
 * Given a WebDriver and system information load the page with credentials
 * Check page title matches expected and expected elements are present
 * 
 * @param {WebDriver} driver selenium-webdriver
 * @param {String} BASE_URL url of home page
 * @param {String} USERNAME TSO user id
 * @param {String} PASSWORD TSO user password
 * @param {String} SERVER_HOST_NAME hostname or IP of system under test
 * @param {int} SERVER_HTTPS_PORT https port of system under test
 */
async function checkDriver(driver, BASE_URL, USERNAME, PASSWORD, SERVER_HOST_NAME, SERVER_HTTPS_PORT) {
    assert.isNotEmpty(USERNAME, 'USERNAME is not defined');
    assert.isNotEmpty(PASSWORD, 'PASSWORD is not defined');
    assert.isNotEmpty(SERVER_HOST_NAME, 'SERVER_HOST_NAME is not defined');
    assert.isNotEmpty(SERVER_HTTPS_PORT, 'SERVER_HTTPS_PORT is not defined');
    try {
        await driver.get(`https://${USERNAME}:${PASSWORD}@${SERVER_HOST_NAME}:${SERVER_HTTPS_PORT}/api/v1/jobs/username`);
        await loadPage(driver, BASE_URL);
        await driver.wait(until.titleIs('JES Explorer'), 20000);
        // Ensure expected components have loaded
        await driver.wait(until.elementLocated(By.id('job-list')), 30000);
        await driver.wait(until.elementLocated(By.id('embeddedEditor')), 30000);
        await driver.sleep(5000);
    } catch (e) {
        assert.fail(`Failed to initialise: ${e}`);
    }
}

module.exports = {
    getDriver,
    loadPage,
    checkDriver,
}