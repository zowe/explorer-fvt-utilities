const { By, until } = require('selenium-webdriver');
const { expect } = require('chai');

/**
 * Given a html id attribute find the component and expect it to be present count times
 * 
 * @param {WebDriver} driver selenium-webdriver
 * @param {string} id html id
 * @param {int} count expected occurrences
 */
async function testElementAppearsXTimesById(driver, id, count) {
    try {
        const elements = await driver.findElements(By.id(id));
        expect(elements).to.be.an('array').that.has.lengthOf(count);
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
async function testElementAppearsXTimesByCSS(driver, css, count) {
    try {
        const elements = await driver.findElements(By.css(css));
        expect(elements).to.be.an('array').that.has.lengthOf(count);
    } catch (e) {
        return false;
    }
    return true;
}

/**
 * Manipulate the window size between 300 & 1000 whilst expecting the height of 
 * a html component changes size accordingly
 * 
 * @param {WebDriver} driver selenium-webdriver
 * @param {String} componentId html id attribute of component under test
 * @param {int} offset offset of browser and other components
 */
async function testWindowHeightChangeForcesComponentHeightChange(driver, componentId, offset) {
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
async function testTextInputFieldCanBeModified(driver, id, replaceText = 'TEST') {
    try {
        const element = await driver.findElement(By.id(id));
        await element.clear();
        await element.sendKeys(replaceText);
    } catch (e) {
        return false;
    }
    return true;
}

module.exports = {
    testElementAppearsXTimesById,
    testElementAppearsXTimesByCSS,
    testWindowHeightChangeForcesComponentHeightChange,
    testTextInputFieldCanBeModified,
}