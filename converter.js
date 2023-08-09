var input, output, copyBtn, convertBtn, messageBox, checkBoxes, processor, optionsArray = [];

function setup() {
    input = document.getElementById("html-input");
    output = document.getElementById("markdown-output");
    copyBtn = document.getElementById("btn-copy");
    convertBtn = document.getElementById("btn-convert");
    messageBox = document.getElementById("message-box");
    processor = document.getElementById("processor");
    checkBoxes = document.querySelectorAll('input[type="checkbox"]');
    copyBtn.disabled = true;
    output.value = "";

    convertBtn.addEventListener("click", function () {
        getCheckboxValues();
        convertTable();
    });
}

function getCheckboxValues() {
    checkBoxes.forEach(function (checkbox) {
        optionsArray.push({
            value: checkbox.value, checked: checkbox.checked
        });
    });
}

function convertTable() {
    processor.innerHTML = input.value.replace(/\s+/g, ' ');
    var tables = processor.getElementsByTagName("table");

    if (tables) {
        displayMessage("Tables found")
    }
    else {
        displayMessage("No tables found")
    }
}

function getChecked(valueName) {
    const option = optionsArray.find(option => option.value === valueName);
    return option.checked;
}

function displayOutput(outputData) {
    output.value = outputData;
    copyBtn.disabled = false;
    copyBtn.addEventListener("click", function () {
        writeToClipboard(outputData);
    });
}

function displayCheckboxValues() {
    let message = "";
    optionsArray.forEach(function (option) {
        message += option.value + ": " + option.checked + ", ";
    });
    message = message.slice(0, -2);
    displayMessage(message);
}

async function writeToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        displayMessage("Markdown table copied to clipboard")
    } catch (err) {
        displayMessage("Failed to copy markdown table to clipboard")
    }
}

function displayMessage(message) {
    messageBox.innerHTML = message;
}

setup();