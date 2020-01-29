const { 
    getDriver, 
    loadPage, 
    checkDriver 
} = require('./DriverUtilities');

const { 
    testElementAppearsXTimesById,
    testElementAppearsXTimesByCSS,
    testWindowHeightChangeForcesComponentHeightChange,
    testTextInputFieldCanBeModified
} = require('./ElementTestUtilities');

module.exports = {
    getDriver,
    loadPage,
    checkDriver,

    testElementAppearsXTimesById,
    testElementAppearsXTimesByCSS,
    testWindowHeightChangeForcesComponentHeightChange,
    testTextInputFieldCanBeModified,
};