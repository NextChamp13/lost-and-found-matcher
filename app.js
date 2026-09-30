const fs = require("fs");

function readDataset(filename) {
    const data = fs.readFileSync(filename, "utf8").trim();

    const lines = data.split(/\r?\n/); // Datei in einzelne Zeilen aufteilen
    const headers = lines[0].split(",");

    const records = lines.slice(1).map(line => {
        const values = [];
        let currentValue = "";
        let insideQuotes = false;

        for (const character of line) {

            if (character === '"') {
                insideQuotes = !insideQuotes;
            } 
            else if (character === "," && !insideQuotes) {
                values.push(currentValue);
                currentValue = "";
            } 
            else {
                currentValue += character;
            }
        }

        values.push(currentValue);

        const record = {};

        headers.forEach((header, index) => {
        record[header] = values[index];
    });

    record.id = Number(record.id);

    return record;
    });

    return records;
}


// Dataset einlesen
const records = readDataset("lost_and_found_dataset.csv");

const lostItems = records.filter(record => record.type === "LOST");
const foundItems = records.filter(record => record.type === "FOUND");


// Datensätze anzeigen
records.forEach((record, index) => {
    console.log(`--- Record ${index + 1} ---`);
    console.log(record);
});

