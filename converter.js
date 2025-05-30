const newLine = "\n";
const markdownCellSeparator = " | ";
var inputText, outputBox, copyBtn, convertBtn, messageBox, checkBoxes, converterMode, converterModeDropdown, escPipeObs, buffer, optionsArray, tableWidthOption, widthOptionsDropdown, widthInputBox, widthInputDiv, tableDelimiter, thresholdSlider, thresholdValue, isTrimBlChecked, customWidth, smartWidth;

function setup() {
    converterModeDropdown = document.getElementById("converter-mode-options");
    outputBox = document.getElementById("markdown-output");
    copyBtn = document.getElementById("btn-copy");
    convertBtn = document.getElementById("btn-convert");
    messageBox = document.getElementById("message-box");
    buffer = document.getElementById("buffer");
    checkBoxes = document.querySelectorAll('input[type="checkbox"]');
    widthOptionsDropdown = document.getElementById("width-options");
    widthInputBox = document.getElementById("width-input-box");
    widthInputDiv = document.getElementById("width-input-div");
    thresholdSlider = document.getElementById("threshold-slider");
    clearOutput();

    document.getElementById("slider-percentage").innerHTML = document.getElementById("threshold-slider").value

    addEventListenersFunc();

    converterModeDropdown.dispatchEvent(new Event("change", { bubbles: true }));
    widthOptionsDropdown.dispatchEvent(new Event("change", { bubbles: true }));
}

function addEventListenersFunc() {
    converterModeDropdown.addEventListener("change", function () {
        converterMode = converterModeDropdown.value;

        if (converterMode == "spaceSmart" || converterMode == "advanced") {
            document.getElementById("advanced-options").style.display = ("none");
            widthOptionsDropdown.value = "custom";
            widthOptionsDropdown.disabled = true;
            widthInputDiv.style.display = "inline-block";
            widthInputBox.focus();
            document.getElementById("html-options").style.display = "none";
            document.getElementById("other-options").style.display = "inline-block";
            if (converterMode == "advanced") {
                document.getElementById("advanced-options").style.display = ("inline-block");
            }
        }
        else if (converterMode == "html") {
            document.getElementById("html-options").style.display = "inline-block";
            document.getElementById("other-options").style.display = "none";
            document.getElementById("advanced-options").style.display = ("none");
            document.getElementById("checkbox-trim-ws").checked = true;
            widthOptionsDropdown.disabled = false;
        }
        else {
            document.getElementById("html-options").style.display = "none";
            document.getElementById("advanced-options").style.display = ("none");
            document.getElementById("other-options").style.display = "inline-block";
            widthOptionsDropdown.disabled = false;

            tableDelimiter = new RegExp(converterModeDropdown.options[converterModeDropdown.selectedIndex].getAttribute('data-delimiter'));
        }
    });

    widthOptionsDropdown.addEventListener("change", function () {
        tableWidthOption = widthOptionsDropdown.value;

        if (tableWidthOption == "custom") {
            widthInputDiv.style.display = "inline-block";
            widthInputBox.focus();
        }
        else {
            widthInputDiv.style.display = "none";
        }
    });

    thresholdSlider.addEventListener('input', function () {
        clearOutput();
        getOptionsValues();
        document.getElementById("slider-percentage").innerHTML = thresholdValue;

        if (/^\s*$/.test(inputText)) {
            displayMessage(1, "Enter something to start converting")
        }
        else {
            convertTables();
        }
    });

    convertBtn.addEventListener("click", function () {
        clearOutput();
        getOptionsValues();
        if (/^\s*$/.test(inputText) && converterMode != "advanced") {
            displayMessage(1, "Enter something to start converting")
        }
        else {
            convertTables();
        }
    });

    document.getElementById("width-help").addEventListener("click", function () {
        alert("For standard mode, enter something like: 2 or 3,6 or 1-4\nFor smart mode, enter the table width, then the columns to be shown separated by a comma(skip to show all rows).\nE.g. Table has 5 columns, but show columns 2-5, enter: 5,2-5")
    });
}

function getOptionsValues() {
    inputText = document.getElementById("text-input").value;
    converterMode = converterModeDropdown.value;
    tableWidthOption = widthOptionsDropdown.value;
    thresholdValue = thresholdSlider.value;
    escPipeObs = document.getElementById("pipe-options").value;
    isTrimBlChecked = document.getElementById("checkbox-trim-bl").checked;
    if (widthOptionsDropdown.value == "custom") {
        customWidth = parseWidthInput(widthInputBox.value);
    }
    optionsArray = [];
    checkBoxes.forEach(function (checkbox) {
        optionsArray.push({
            value: checkbox.value, optionType: checkbox.checked
        });
    });
    optionsArray.push({
        value: "headerOptions", optionType: document.getElementById("header-options").value
    },
        {
            value: "columnOptions", optionType: document.getElementById("column-options").value
        }
    );
}

function parseWidthInput(input) {
    var parts;
    const MAX_LIMIT = 999;
    if (!input || /[^0-9,-]|,-|--/.test(input) || input < 1) {
        displayMessage(1, "Invalid width format");
        widthInputBox.focus();
        return;
    }

    let result = [];

    if (converterMode == "spaceSmart" || converterMode == "advanced") {
        const firstNum = parseInt(input.split(',')[0]);
        if (firstNum < MAX_LIMIT) {
            smartWidth = Array.from({ length: firstNum }, (_, i) => i + 1);
            parts = input.split(',').slice(1).filter(Boolean);
        } else {
            displayMessage(1, "ಠ_ಠ");
            widthInputBox.focus();
            return;
        }
    }
    else {
        parts = input.split(',').filter(Boolean);
    }

    for (let part of parts) {
        if (part.includes('-')) {
            const [start, end] = part.split('-').map(Number);
            if (end - start > MAX_LIMIT) {
                displayMessage(1, "ಠ_ಠ");
                widthInputBox.focus();
                return;
            }
            result = result.concat(Array.from({ length: end - start + 1 }, (_, i) => i + start));
        } else {
            const num = Number(part);
            if (num > MAX_LIMIT) {
                displayMessage(1, "ಠ_ಠ");
                widthInputBox.focus();
                return;
            }
            if (parts.length === 1) {
                result = Array.from({ length: num }, (_, i) => i + 1);
            } else {
                result.push(num);
            }
        }
    }
    result = [...new Set(result)].sort((a, b) => a - b);
    
    if (smartWidth) {
        displayMessage(1, `Converting columns: ${smartWidth}\n`);
    }
    else {
        displayMessage(1, `Converting columns: ${result}\n`);
    }
    return result;
}

function convertNessusToMarkdown(input) {
    // Split by each "Port xxx/tcp was found to be open"
    const portBlocks = input.split(/Port \d+\/tcp was found to be open/).slice(1);
    let hostPorts = {};

    portBlocks.forEach(block => {
        // Find the port line
        const portLineMatch = block.match(/Hosts\s+([\d]+) \/ tcp/);
        if (!portLineMatch) return;
        const portNum = portLineMatch[1].trim();

        // Find all IPs under this port
        const ips = [];
        const lines = block.split('\n');
        let foundPortLine = false;
        for (let line of lines) {
            line = line.trim();
            if (foundPortLine && /^\d{1,3}(\.\d{1,3}){3}$/.test(line)) {
                ips.push(line);
            }
            if (line.startsWith(portNum + " / tcp")) {
                foundPortLine = true;
            }
        }
        // If no IPs found, try to find IPs after the port line
        if (ips.length === 0) {
            const portIdx = lines.findIndex(l => l.trim().startsWith(portNum + " / tcp"));
            if (portIdx !== -1 && lines[portIdx + 1]) {
                const ipLine = lines[portIdx + 1].trim();
                if (/^\d{1,3}(\.\d{1,3}){3}$/.test(ipLine)) {
                    ips.push(ipLine);
                }
            }
        }
        ips.forEach(ip => {
            if (!hostPorts[ip]) hostPorts[ip] = [];
            hostPorts[ip].push(portNum);
        });
    });

    // Build Markdown table
    let md = `| Host | Port(s) |\n|------|---------|\n`;
    Object.entries(hostPorts).forEach(([host, ports]) => {
        const portStr = `\`${ports.join(',')}\``;
        md += `| ${host} | ${portStr} |\n`;
    });
    return md.trim();
}

function convertTables() {
    if (widthOptionsDropdown.value == "custom" && !customWidth && converterMode !== "nessus") {
        return;
    }
    else {
        if (converterMode == "html") {
            convertHTMLTables();
        }
        else if (converterMode == "spaceSmart" || converterMode == "advanced") {
            smartConverter();
        }
        else if (converterMode == "nessus") {
            // Use the new function for Nessus SYN output
            const md = convertNessusToMarkdown(inputText);
            if (!md || md === "| Port | Host |\n|------|------|") {
                displayMessage(1, "No valid Nessus SYN output found");
            } else {
                displayOutput(1, md);
            }
        }
        else {
            convertWithDelimiter();
        }
    }
}

function convertHTMLTables() {
    var convertedOutput = "";
    var parser = new DOMParser();
    var tables = parser.parseFromString(inputText.replace(/\s+/g, ' '), "text/html")
    tables = tables.getElementsByTagName("table");

    if (tables.length > 0) {
        for (var i = 0; i < tables.length; i++) {
            convertedOutput += convertHTMLTableElements(tables[i], i) + newLine + newLine;
        }
        displayOutput(tables.length, convertedOutput.trim());
    }
    else {
        displayMessage(1, "No tables found");
    }
}

function convertHTMLTableElements(table, tableIndex) {
    var convertedRows = [];
    var rows = table.getElementsByTagName("tr");
    var tableWidth = getHTMLTableWidth(rows);

    if (tableWidth.length < 1) {
        displayMessage(0, "Unable to generate table" + (tableIndex + 1) + ", 1 or more rows have no cells\n")
    }
    else {
        for (var i = 0; i < rows.length; i++) {
            if (/\S/.test(rows[i].innerText) || !isTrimBlChecked) {
                var convertedRow = convertHTMLRowElements(i, rows[i], tableWidth);
                convertedRows.push(convertedRow)
            }
        }
        return convertedRows.join(newLine);
    }
}

function getHTMLTableWidth(rows) {
    if (tableWidthOption == "header") {
        return Array.from({ length: rows[0].children.length }, (_, i) => i + 1);
    }
    else if (tableWidthOption == "custom") {
        return customWidth;
    }
    else {
        var maxLength = Number.NEGATIVE_INFINITY
        var minLength = Number.POSITIVE_INFINITY
        for (var i = 0; i < rows.length; i++) {
            var rowLength = rows[i].children.length;
            maxLength = Math.max(maxLength, rowLength);
            minLength = Math.min(minLength, rowLength);
        }
        if (tableWidthOption == "fill") {
            return Array.from({ length: maxLength }, (_, i) => i + 1);
        }
        else {
            return Array.from({ length: minLength }, (_, i) => i + 1);
        }
    }
}

function convertHTMLRowElements(rowIndex, rowContent, tableWidth) {
    var convertedRow = [""];
    var rowElements = rowContent.children;
    for (var i = 0; i < tableWidth.length; i++) {

        var convertedElement = processOptions(rowElements[tableWidth[i] - 1], rowIndex, i);

        convertedRow.push(convertedElement);
    }
    convertedRow.push("");

    if (rowIndex == 0) {
        return createDividerRow(tableWidth.length, convertedRow);
    }
    return convertedRow.join(markdownCellSeparator).trim();
}

function convertWithDelimiter() {
    var convertedOutput = "";
    var inputData = inputText.trim();
    if (isTrimBlChecked) {
        inputData = inputData.replace(/^\s*[\r\n]/gm, '');
    }
    var tableRows = inputData.split(/\r?\n/);
    var tableWidth = getTableWidth(tableRows);

    if (tableWidth.length < 1) {
        displayMessage(1, "Unable to generate table, 1 or more rows have no cells");
    }
    else {
        var convertedRows = [];
        for (var rowIndex = 0; rowIndex < tableRows.length; rowIndex++) {
            var convertedRow = [""];
            var rowElements = tableRows[rowIndex].split(tableDelimiter);

            for (var columnIndex = 0; columnIndex < tableWidth.length; columnIndex++) {
                var createdElement = document.createElement("td");
                if (rowElements[tableWidth[columnIndex] - 1]) {
                    createdElement.innerHTML = rowElements[tableWidth[columnIndex] - 1];
                }
                var convertedElement = processOptions(createdElement, rowIndex, columnIndex);

                convertedRow.push(convertedElement);
            }
            convertedRow.push("");

            if (rowIndex == 0) {
                convertedRows.push(createDividerRow(tableWidth.length, convertedRow));
            }
            else {
                convertedRows.push(convertedRow.join(markdownCellSeparator).trim());
            }
        }
        var convertedOutput = convertedRows.join(newLine).trim();
        displayOutput("", convertedOutput);
    }
}

function getTableWidth(rows) {
    if (tableWidthOption == "header") {
        return Array.from({ length: rows[0].split(tableDelimiter).length }, (_, i) => i + 1);
    }
    else if (tableWidthOption == "custom") {
        return customWidth;
    }
    else {
        var maxLength = Number.NEGATIVE_INFINITY
        var minLength = Number.POSITIVE_INFINITY
        for (var i = 0; i < rows.length; i++) {
            var rowLength = rows[i].split(tableDelimiter).length;
            maxLength = Math.max(maxLength, rowLength);
            minLength = Math.min(minLength, rowLength);
        }
        if (tableWidthOption == "fill") {
            return Array.from({ length: maxLength }, (_, i) => i + 1);
        }
        else {
            return Array.from({ length: minLength }, (_, i) => i + 1);
        }
    }
}

function smartConverter() {
    var inputData = inputText;

    if (isTrimBlChecked) {
        inputData = inputData.trim();
        inputData = inputData.replace(/^\s*[\r\n]/gm, '');
    }

    var [customRegex, cellStartChars] = buildRegexFromInput();
    var tableRows = inputData.split(/\r?\n/);

    var cellIndexPerRow = extractCellIndices(tableRows, customRegex, cellStartChars);

    var cellIndex = getCellIndex(cellIndexPerRow, tableRows.length);
    var convertedRows = [];

    for (var rowIndex = 0; rowIndex < tableRows.length; rowIndex++) {
        var convertedRow = [""];
        var previousBoundaryIndex = 0;
        var reachedLastChar = false;
        var boundaries = computeBoundaries(tableRows[rowIndex], customRegex, cellStartChars);

        for (var columnIndex = 0; columnIndex < cellIndex.length; columnIndex++) {
            var cellContent = "";

            var boundaryIndex = getClosestFromBoundaries(cellIndex[columnIndex], boundaries);

            cellContent = tableRows[rowIndex].substring(previousBoundaryIndex, boundaryIndex);
            previousBoundaryIndex = boundaryIndex;

            var createdElement = document.createElement("td");
            createdElement.textContent = cellContent;
            var convertedElement = processOptions(createdElement, rowIndex, columnIndex);
            convertedRow.push(convertedElement);

            if (columnIndex == cellIndex.length - 1 && !reachedLastChar) {
                if (columnIndex == 0) {
                    columnIndex++
                }
                reachedLastChar = true;
                cellContent = tableRows[rowIndex].substring(previousBoundaryIndex);
                createdElement.textContent = cellContent;
                var convertedElement = processOptions(createdElement, rowIndex, columnIndex);

                convertedRow.push(convertedElement);
            }
        }
        var rowLength = convertedRow.length;
        var tableWidth = smartWidth.length;
        if (rowLength - 1 < tableWidth) {
            for (i = -1; i < tableWidth - rowLength; i++) {
                convertedRow.push("");
            }
        }

        if (customWidth.length > 0) {
            convertedRow = convertedRow.filter((_, index) => index === 0 || customWidth.includes(index));
        }
        convertedRow.push("");

        if (rowIndex == 0) {
            convertedRows.push(createDividerRow(convertedRow.length - 2, convertedRow));
        }
        else {
            convertedRows.push(convertedRow.join(markdownCellSeparator).trim());
        }
    }
    var convertedOutput = convertedRows.join(newLine).trim();
    displayOutput("", convertedOutput);
}

function buildRegexFromInput() {
    var cellStartChars = /[a-zA-Z0-9]+/g;
    var customDelimiter = document.getElementById("delimiter-input").value;
    var customCellChar = document.getElementById("cell-character-input").value;

    if (customCellChar != "") {
        var charArray = customCellChar.split("");
        for (i = 0; i < customCellChar.length; i++) {
            charArray[i] = charArray[i].replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');
        }
        customCellChar = charArray.join("|");
        cellStartChars = new RegExp(`${customCellChar}|${cellStartChars.source}`, 'g')
    }

    if (/^\s+$/g.test(customDelimiter) || converterMode == "spaceSmart" || customDelimiter == "") {
        customDelimiter = "/\\s+/g";
        if (converterMode == "spaceSmart") {
            thresholdValue = 50;
        }
    }
    customDelimiter = customDelimiter.trim();

    if (isValidRegex(customDelimiter)) {
        displayMessage(0, "Matching with regex: ");
        customDelimiter = customDelimiter.match(new RegExp('^/(.*?)/([gimy]*)$'));
        var customExpression = new RegExp(customDelimiter[1], 'g');
        displayMessage(0, `${customExpression} and ${cellStartChars} \n`);
        return [customExpression, cellStartChars];
    }
    else {
        displayMessage(0, "Regex pattern not found, performing literal match with: ");
        var customExpression = new RegExp(escapeRegex(customDelimiter) + "+", "g");
        displayMessage(0, `${customExpression} and ${cellStartChars} \n`);
        return [customExpression, cellStartChars];
    }
}

//https://stackoverflow.com/a/66769811
function isValidRegex(inputString) {
    try {
        const m = inputString.match(/^([/~@;%#'])(.*?)\1([gimsuy]*)$/);
        return m ? !!new RegExp(m[2], m[3])
            : false;
    } catch (e) {
        return false
    }
}

function escapeRegex(inputString) {
    return inputString.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');
}

function escapeBackslashes(inputString) {
    return inputString.replace(/\\/g, '\\\\');
}

function getCellIndex(cellIndexPerRow, rowCount) {
    const occurrences = cellIndexPerRow.reduce((acc, num) => {
        acc[num] = (acc[num] || 0) + 1;
        return acc;
    }, {});

    const groupedByCount = {};
    Object.entries(occurrences)
        .filter(([num, count]) => (count / rowCount) * 100 >= thresholdValue)
        .forEach(([num, count]) => {
            if (!groupedByCount[count]) groupedByCount[count] = [];
            groupedByCount[count].push(parseInt(num));
        });

    const refined = [];
    for (const group of Object.values(groupedByCount)) {
        group.sort((a, b) => a - b);

        for (let i = 0; i < group.length; i++) {
            if (i === group.length - 1 || group[i + 1] - group[i] > 1) {
                refined.push(group[i]);
            } else if (Math.random() > 0.5) {
                refined.push(group[i]);
                i++;
            }
        }
    }
    return shuffleArray(refined).slice(0, smartWidth.length - 1).sort((a, b) => a - b);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}


function extractCellIndices(tableRows, customRegex, cellStartChars) {
    var cellIndexPerRow = [];

    for (let rowIndex = 0; rowIndex < tableRows.length; rowIndex++) {
        let match;
        while ((match = customRegex.exec(tableRows[rowIndex])) !== null) {
            cellStartChars.lastIndex = match.index;
            let matchedCharacter = cellStartChars.exec(tableRows[rowIndex]);
            if (matchedCharacter) {
                cellIndexPerRow.push(matchedCharacter.index);
            }
        }
    }
    return cellIndexPerRow;
}

function computeBoundaries(str, customRegex, cellStartChars) {
    const boundaries = [];
    let match;

    while ((match = customRegex.exec(str)) !== null) {
        boundaries.push(match.index, match.index + match[0].length);
    }

    while ((match = cellStartChars.exec(str)) !== null) {
        boundaries.push(match.index, match.index + match[0].length);
    }
    boundaries.sort((a, b) => a - b);

    return boundaries;
}

function getClosestFromBoundaries(idx, boundaries) {
    let closest = boundaries[0];
    for (let i = 1; i < boundaries.length; i++) {
        if (Math.abs(boundaries[i] - idx) < Math.abs(closest - idx)) {
            closest = boundaries[i];
        }
    }
    return closest;
}

function createDividerRow(cellCount, convertedRow) {
    var headerRow = [""];
    var dividerRow = [newLine];
    for (i = 0; i < cellCount; i++) {
        headerRow.push("");
        dividerRow.push("---")
    }
    headerRow.push("");
    dividerRow.push("");
    if (document.getElementById("header-first-row").checked) {
        return convertedRow.join(markdownCellSeparator).trim() + newLine + dividerRow.join(markdownCellSeparator).trim();
    }
    else {
        return headerRow.join(markdownCellSeparator).trim() + newLine + dividerRow.join(markdownCellSeparator).trim() + newLine + convertedRow.join(markdownCellSeparator).trim()
    }
}

function processOptions(elementData, rowIndex, columnIndex) {
    if (elementData != null) {
        elementData.innerHTML = elementData.innerHTML.replace(/\|/g, '\\|')
    }
    else {
        //good thing js does not have index out of bounds errors in this instance
        elementData = document.createElement("td");
    }

    optionsArray.forEach((option) => {
        if (option.optionType && optionsFunctions.hasOwnProperty(option.value)) {
            elementData = optionsFunctions[option.value](elementData, rowIndex, columnIndex, option.optionType);
        }
    });
    if (escPipeObs == "obsidian") {
        elementData.innerHTML = elementData.innerHTML.replace(/(?<=`[^`]*)\\\|(?=[^`]*`)/g, '``&amp;#124``');
    }
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
    convertLnBrk: (elementData) => {
        elementData.innerHTML = elementData.innerHTML.replace(/<br>/g, "&lt;br&gt;");
        return elementData;
    },
    trimWhiteSpace: (elementData) => {
        elementData.innerHTML = elementData.innerHTML.trim();
        return elementData;
    },
    headerOptions: (elementData, rowIndex, columnIndex, optionType) => {
        if (rowIndex == 0) {
            elementData.innerHTML = optionType + elementData.innerHTML + optionType;
        }
        return elementData;
    },
    columnOptions: (elementData, rowIndex, columnIndex, optionType) => {
        if (rowIndex > 0 && columnIndex == 0) {
            elementData.innerHTML = elementData.innerHTML.replace(/`+/g, '`');
            if (elementData.textContent.startsWith("`")) {
                elementData.textContent = " " + elementData.textContent
            }
            if (elementData.textContent.endsWith("`")) {
                elementData.textContent = elementData.textContent + " "
            }
            elementData.innerHTML = optionType + elementData.innerHTML + optionType;
            return elementData;
        }

        return elementData;
    }
}


function displayOutput(tableCount, outputData) {
    if (outputData == "undefined") {
        copyBtn.disabled = true;
    }
    else {
        if (!/[a-zA-Z0-9]/.test(outputData)) {
            displayMessage(0, "Try lowering the threshold in advanced mode");
        } else {
            displayMessage(0, tableCount + " Table(s) converted");
        }
        outputBox.value = outputData;
        copyBtn.disabled = false;

        copyBtn.addEventListener("click", function () {
            messageBox.innerHTML = ""
            writeToClipboard(outputData);
        });
    }
}

async function writeToClipboard(data) {
    try {
        await navigator.clipboard.writeText(data);
        displayMessage(1, "Copied to clipboard")
    } catch (err) {
        displayMessage(1, "Failed to copy to clipboard," + err)
    }
}

function clearOutput() {
    outputBox.value = "";
    messageBox.innerHTML = "";
    copyBtn.disabled = true;
}

function displayMessage(mode, message) {
    switch (mode) {
        case 0:
            messageBox.innerHTML += message;
            break;
        case 1:
            messageBox.innerHTML = message;
    }
}

setup();