/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2020
 */
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
 * @param {String} baseUrl url of home page
 * @param {String} username TSO user id
 * @param {String} password TSO user password
 * @param {String} serverHostName hostname or IP of system under test
 * @param {int} serverHttpsPort https port of system under test
 * @param {String} usernameEndpoint endpoint of username api that can be used to cache login credentials e.g /api/v1/jobs/username
 */
async function checkDriver(driver, baseURL, username, password, serverHostName, serverHttpsPort, usernameEndpoint) {
    assert.isNotEmpty(username, 'USERNAME is not defined');
    assert.isNotEmpty(password, 'PASSWORD is not defined');
    assert.isNotEmpty(serverHostName, 'SERVER_HOST_NAME is not defined');
    assert.isNotEmpty(serverHttpsPort, 'SERVER_HTTPS_PORT is not defined');
    try {
        await driver.get(`https://${username}:${password}@${serverHostName}:${serverHttpsPort}${usernameEndpoint}`);
        await loadPage(driver, baseURL);
        await driver.wait(until.titleContains('Explorer'), 20000);
    } catch (e) {
        assert.fail(`Failed to initialise: ${e}`);
    }
}

module.exports = {
    getDriver,
    loadPage,
    checkDriver,
}