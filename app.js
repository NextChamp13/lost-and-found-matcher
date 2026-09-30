const fs = require("fs");

//CSV-Datei einlesen
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

// Vergleicht die Beschreibungen von zwei Gegenständen (max 10 Punkte)
function vergleicheBeschreibung(beschreibung1, beschreibung2) {

    // Texte vereinheitlichen (klein schreiben und Sonderzeichen entfernen)
    const text1 = beschreibung1
        .toLowerCase()
        .replace(/[^\p{L}\p{N}]+/gu, " ");

    const text2 = beschreibung2
        .toLowerCase()
        .replace(/[^\p{L}\p{N}]+/gu, " ");

    // Beschreibungen in einzelne Wörter zerlegen
    const woerter1 = text1.split(/\s+/).filter(wort => wort !== "");
    const woerter2 = text2.split(/\s+/).filter(wort => wort !== "");

    let gleicheWoerter = 0;

    // Prüfen, welche Wörter in beiden Beschreibungen vorkommen
    for (const wort of woerter1) {
        if (woerter2.includes(wort)) {
            gleicheWoerter++;
        }
    }

    // Ähnlichkeit berechnen
    const aehnlichkeit =
        gleicheWoerter / Math.max(woerter1.length, woerter2.length);

    // Auf maximal 10 Punkte umrechnen
    return Math.round(aehnlichkeit * 10);
}

// Vergleicht einen verlorenen mit einem gefundenen Gegenstand (max 100 Punkte = 100 % erreicht)
function berechneMatch(verloren, gefunden) {

    let matchPunkte = 0;

    const verlorenDatum = new Date(verloren.date);
    const gefundenDatum = new Date(gefunden.date);


    // Fund kann nicht vor dem Verlust liegen
    if (gefundenDatum < verlorenDatum) {
        return 0;
    }


    // 1. Kategorie vergleichen (max 30 Punkte)
    if (
        verloren.category.toLowerCase() ===
        gefunden.category.toLowerCase()
    ) {
        matchPunkte += 30;
    }


    // 2. Farbe vergleichen (max 20 Punkte)
    if (
        verloren.color.toLowerCase() ===
        gefunden.color.toLowerCase()
    ) {
        matchPunkte += 20;
    }


    // 3. Ort vergleichen (max 25 Punkte)
    if (
        verloren.location.toLowerCase() ===
        gefunden.location.toLowerCase()
    ) {
        matchPunkte += 25;
    }


    // 4. Datum vergleichen (max 15 Punkte)
    const unterschiedInTagen =
        (gefundenDatum - verlorenDatum) /
        (1000 * 60 * 60 * 24);

    const gleicherTag =
        verloren.date.substring(0, 10) ===
        gefunden.date.substring(0, 10);

    if (gleicherTag) {
        matchPunkte += 15;
    }
    else if (unterschiedInTagen <= 3) {
        matchPunkte += 10;
    }
    else if (unterschiedInTagen <= 7) {
        matchPunkte += 5;
    }


    // 5. Beschreibung vergleichen (max 10 Punkte)
    matchPunkte += vergleicheBeschreibung(
        verloren.description,
        gefunden.description
    );


    return matchPunkte;
}

// Daten einlesen
const records = readDataset("lost_and_found_dataset.csv");

// LOST und FOUND trennen
const lostItems = records.filter(record => record.type === "LOST");
const foundItems = records.filter(record => record.type === "FOUND");

console.log("\n--- Mögliche Matches ---");

// Jeden verlorenen Gegenstand vergleichen
lostItems.forEach(verloren => {
    const matches = foundItems.map(gefunden => {
        return {
            lostId: verloren.id,
            foundId: gefunden.id,
            match: berechneMatch(verloren, gefunden)
        };
    });

    // Beste Matches zuerst
    matches.sort((a, b) => b.match - a.match);

    console.log(
        `\nLOST ID ${verloren.id}: ${verloren.description}`
    );

    matches.forEach(match => {
        console.log(
            `FOUND ID ${match.foundId}: ${match.match}% Match`
        );
    });
});