const newLine = "\n";
const markdownCellSeparator = " | "
var inputBox, outputBox, copyBtn, convertBtn, messageBox, checkBoxes, buffer, tableColumnCount, optionsArray, errorArray;

function setup() {
    inputBox = document.getElementById("html-input");
    outputBox = document.getElementById("markdown-output");
    copyBtn = document.getElementById("btn-copy");
    convertBtn = document.getElementById("btn-convert");
    messageBox = document.getElementById("message-box");
    buffer = document.getElementById("buffer");
    checkBoxes = document.querySelectorAll('input[type="checkbox"]');
    copyBtn.disabled = true;
    outputBox.value = "";

    convertBtn.addEventListener("click", function () {
        getCheckboxValues();
        convertTables();
    });
}

function getCheckboxValues() {
    optionsArray = [];
    checkBoxes.forEach(function (checkbox) {
        optionsArray.push({
            value: checkbox.value, checked: checkbox.checked
        });
    });
}

function convertTables() {
    errorArray = [];
    var convertedOutput = "";
    buffer.innerHTML = inputBox.value.replace(/\s+/g, ' ');
    var tables = buffer.getElementsByTagName("table");

    if (tables.length > 0) {
        for (var i = 0; i < tables.length; i++) {
            convertedOutput += convertTableElements(i, tables[i]) + newLine + newLine;
            displayOutput(tables.length, convertedOutput.trim())
        }
    }
    else {
        copyBtn.disabled = true;
        outputBox.value = "";
        displayMessage("No tables found")
    }
}

function getChecked(valueName) {
    const option = optionsArray.find(option => option.value == valueName);
    return option.checked;
}

function convertTableElements(tableNumber, table) {
    var convertedRows = [];
    var rows = table.getElementsByTagName("tr");

    for (var i = 0; i < rows.length; i++) {
        var convertedRow = convertRowElements(i, rows[i]);

        if (convertedRow == "") {
            errorArray[errorArray.length - 1].table = tableNumber + 1;
            return "";
        }
        convertedRows.push(convertedRow)
    }
    return convertedRows.join(newLine)
}

function convertRowElements(rowNumber, rowContent) {
    var convertedRow = [""];
    var rowElements = rowContent.children;

    for (var i = 0; i < rowElements.length; i++) {
        var convertedElement = processOptions(rowElements[i], rowNumber, i);

        convertedRow.push(convertedElement);
    }
    convertedRow.push("");

    if (rowNumber == 0) {
        tableColumnCount = rowElements.length;
        var [headerRow, dividerRow] = createDividerRow(rowElements.length);
        if (document.getElementById("header-first-row").checked) {
            return convertedRow.join(markdownCellSeparator).trim() + newLine + dividerRow;
        }
        else {
            return headerRow + newLine + dividerRow + newLine + convertedRow.join(markdownCellSeparator).trim()
        }
    }
    else if (tableColumnCount != rowElements.length) {
        errorArray.push({ table: 0, row: rowNumber + 1 });
        return "";
    }

    return convertedRow.join(markdownCellSeparator).trim();
}

function processOptions(elementData, rowNumber, columnIndex) {
    optionsArray.forEach((option) => {
        if (option.checked && optionsFunctions.hasOwnProperty(option.value)) {
            elementData = optionsFunctions[option.value](elementData, rowNumber, columnIndex);
        }
    });

    return elementData.textContent;
}

var optionsFunctions = {
    convertLink: (elementData) => {
        elementData.innerHTML = elementData.innerHTML.replace(/<a href="(.*?)".*?>(.*?)<\/a>/g, '[$2]($1)');
        return elementData;
    },
    convertCode: (elementData) => {
        elementData.innerHTML = elementData.innerHTML.replace(/<code>(.*?)<\/code>/g, '``$1``')
        return elementData;
    },
    escPipe: (elementData) => {
        elementData.innerHTML = elementData.innerHTML.replace(/\|/g, '\\|')
        return elementData;
    },
    boldHeader: (elementData) => {
        elementData.innerHTML = elementData.outerHTML.replace(/<th>(.*?)<\/th>/g, '**$1**');
        return elementData;
    },
    boldCol: (elementData, rowNumber, columnIndex) => {
        if (rowNumber > 0 && columnIndex == 0) {
            elementData.innerHTML = "**" + elementData.innerHTML + "**";
            return elementData;
        }
        return elementData;
    },
    codeCol: (elementData, rowNumber, columnIndex) => {
        if (rowNumber > 0 && columnIndex == 0) {
            elementData.innerHTML = elementData.innerHTML.replace(/`+/g, '`');
            if (elementData.textContent.startsWith("`")) {
                elementData.textContent = " " + elementData.textContent
            }
            if (elementData.textContent.endsWith("`")) {
                elementData.textContent = elementData.textContent + " "
            }
            elementData.innerHTML = "``" + elementData.innerHTML + "``";
            return elementData;
        }
        return elementData;
    }
}

function createDividerRow(cellCount) {
    var headerRow = [""];
    var dividerRow = [newLine];
    for (i = 0; i < cellCount; i++) {
        headerRow.push("");
        dividerRow.push("---")
    }
    headerRow.push("");
    dividerRow.push("");
    return [headerRow.join(markdownCellSeparator).trim(), dividerRow.join(markdownCellSeparator).trim()];
}

function displayOutput(tableCount, outputData) {
    if (errorArray.length == 0) {
        displayMessage(tableCount + " table(s) converted")
    }
    else {
        var message = "";

        errorArray.forEach(obj => {
            Object.entries(obj).forEach(([key, value]) => {
                message += " " + key + " " + value
            });
        });

        displayMessage(tableCount - errorArray.length + " table(s) converted, error(s) in" + message)
    }

    if (outputData == "") {
        copyBtn.disabled = true;
        outputBox.value = "";
    }
    else {
        outputBox.value = outputData;
        copyBtn.disabled = false;

        copyBtn.addEventListener("click", function () {
            writeToClipboard(outputData);
        });
    }
}

function displayCheckboxValues() {
    let message = "";
    optionsArray.forEach(function (option) {
        message += option.value + ": " + option.checked + ", ";
    });
    message = message.slice(0, -2);
    displayMessage(message);
}

async function writeToClipboard(data) {
    try {
        await navigator.clipboard.writeText(data);
        displayMessage("Copied to clipboard")
    } catch (err) {
        displayMessage("Failed to copy to clipboard")
    }
}

function displayMessage(message) {
    messageBox.innerHTML = message;
}

setup();