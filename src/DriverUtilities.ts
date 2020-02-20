/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2020
 */
import { assert } from 'chai';
import { Capabilities, Builder, By, until, WebDriver } from 'selenium-webdriver';
const firefox = require('selenium-webdriver/firefox');

/**
 * Return a built driver object using firefox
 * Configured to be headless, allow insecure certs always accept alerts
 */
export async function getDriver() {
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
    return driver.build();
}

/**
 * Given a WebDriver and URL load the page and print the title
 * 
 * @param {WebDriver} driver selenium-webdriver
 * @param {string} page URL of a page to load
 */
export async function loadPage(driver :WebDriver, page :string) {
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
 * @param {string} BASE_URL url of home page
 * @param {string} USERNAME TSO user id
 * @param {string} PASSWORD TSO user password
 * @param {string} SERVER_HOST_NAME hostname or IP of system under test
 * @param {number} SERVER_HTTPS_PORT https port of system under test
 * @param {string} usernameEndpoint endpoint of username api that can be used to cache login credentials e.g /api/v1/jobs/username
 */
export async function checkDriver(driver :WebDriver, BASE_URL :string, 
    USERNAME :string, PASSWORD :string, SERVER_HOST_NAME :string, SERVER_HTTPS_PORT :number, 
    usernameEndpoint :string) {
    assert.isNotEmpty(USERNAME, 'USERNAME is not defined');
    assert.isNotEmpty(PASSWORD, 'PASSWORD is not defined');
    assert.isNotEmpty(SERVER_HOST_NAME, 'SERVER_HOST_NAME is not defined');
    assert.isNotEmpty(SERVER_HTTPS_PORT, 'SERVER_HTTPS_PORT is not defined');
    try {
        await driver.get(`https://${USERNAME}:${PASSWORD}@${SERVER_HOST_NAME}:${SERVER_HTTPS_PORT}${usernameEndpoint}`);
        await loadPage(driver, BASE_URL);
        await driver.wait(until.titleContains('Explorer'), 20000);
    } catch (e) {
        assert.fail(`Failed to initialise: ${e}`);
    }
}