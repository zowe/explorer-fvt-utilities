/**
 * This program and the accompanying materials are made available under the terms of the
 * Eclipse Public License v2.0 which accompanies this distribution, and is available at
 * https://www.eclipse.org/legal/epl-v20.html
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Copyright IBM Corporation 2020
 */
import { By, WebDriver, until } from 'selenium-webdriver';
import { expect } from 'chai';

/**
 * Given a html id attribute find the component and expect it to be present count times
 * 
 * @param {WebDriver} driver selenium-webdriver
 * @param {string} id html id
 * @param {int} count expected occurrences
 */
export async function testElementAppearsXTimesById(driver :WebDriver, id :string, count :number) {
    if (count === 0) return testElementIsNotVisibleById(driver, id);
    try {
        await driver.wait(until.elementLocated(By.id(id)), 10000);
        const elements = await driver.findElements(By.id(id));
        expect(elements).to.be.an('array').that.has.lengthOf(count);
        for (const element of elements) {
            await element.click();
        }
    } catch (e) {
        return false;
    }
    return true;
}

/**
 * Given a html css path find the component and expect it to be present count times
 * 
 * @param {WebDriver} driver selenium-webdriver
 * @param {string} css html css path
 * @param {int} count expected occurrences
 */
export async function testElementAppearsXTimesByCSS(driver :WebDriver, css :string, count :number) {
    try {
        await driver.wait(until.elementLocated(By.css(css)), 10000);
        const elements = await driver.findElements(By.css(css));
        expect(elements).to.be.an('array').that.has.lengthOf(count);
    } catch (e) {
        return false;
    }
    return true;
}

/**
 * Given a html id find the element and check it is not visible
 * visibility check is can the element be clicked which will invoke the webdriver element locator function
 * if element can't be clicked it will throw an exception
 * 
 * @param {WebDriver} driver selenium-webdriver
 * @param {string} id html id
 */
export async function testElementIsNotVisibleById(driver :WebDriver, id :string) {
    try {
        const element = await driver.findElement(By.id(id));
        await element.click();
        return false;
    } catch (e) {
        return e.message.includes('could not be scrolled into view');
    }
}
/**
 * Manipulate the window size between 300 & 1000 whilst expecting the height of 
 * a html component changes size accordingly
 * 
 * @param {WebDriver} driver selenium-webdriver
 * @param {String} componentId html id attribute of component under test
 * @param {int} offset offset of browser and other components
 */
export async function testWindowHeightChangeForcesComponentHeightChange(driver :WebDriver, componentId :string, offset :number) {
    let allResized = true;
    for (let i = 300; i <= 1000 && allResized; i += 100) {
        await driver.manage().window().setRect({ width: 1600, height: i });
        await driver.sleep(500); // let the dom update after resize
        const contentViewer = await driver.findElement(By.id(componentId));
        const height = await contentViewer.getCssValue('height');
        const heightInt = parseInt(height.substr(0, height.length - 2), 10);
        if (heightInt + offset !== i) {
            allResized = false;
        }
    }
    return allResized;
}

/**
 * Given a html id attribute find the input field, clear it and send new text
 * 
 * @param {WebDriver} driver selenium-webdriver
 * @param {string} id html id
 * @param {string} replaceText optional replace text, defaults to "TEST"
 */
export async function testTextInputFieldCanBeModified(driver :WebDriver, id :string, replaceText :string = 'TEST') {
    try {
        const element = await driver.findElement(By.id(id));
        await element.clear();
        await element.sendKeys(replaceText);
    } catch (e) {
        return false;
    }
    return true;
}