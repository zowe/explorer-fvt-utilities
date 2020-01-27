const { assert } = require('chai');
const firefox = require('selenium-webdriver/firefox');
const { Capabilities, Builder, By, until } = require('selenium-webdriver');

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

async function loadPage(driver, page) {
    await driver.manage().window().setRect({ width: 1600, height: 800 });
    console.log(`Loading page: ${page}`);
    await driver.get(page);
    const pageTitle = await driver.getTitle();
    console.log(`Page title: ${pageTitle}`);
    await driver.wait(until.titleIs('JES Explorer'), 20000);
}

async function checkDriver(driver, BASE_URL, USERNAME, PASSWORD, SERVER_HOST_NAME, SERVER_HTTPS_PORT) {
    assert.isNotEmpty(USERNAME, 'USERNAME is not defined');
    assert.isNotEmpty(PASSWORD, 'PASSWORD is not defined');
    assert.isNotEmpty(SERVER_HOST_NAME, 'SERVER_HOST_NAME is not defined');
    assert.isNotEmpty(SERVER_HTTPS_PORT, 'SERVER_HTTPS_PORT is not defined');
    try {
        await driver.get(`https://${USERNAME}:${PASSWORD}@${SERVER_HOST_NAME}:${SERVER_HTTPS_PORT}/api/v1/jobs/username`);
        await loadPage(driver, BASE_URL, USERNAME, PASSWORD);
        // Ensure tree and editor have loaded
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