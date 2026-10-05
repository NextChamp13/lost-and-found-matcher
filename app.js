const fs = require("fs");
const path = require("path");
const express = require("express");

const app = express();
const PORT = 3000;

// Erlaubt JSON-Daten vom Frontend zu empfangen
app.use(express.json());

// Stellt die Dateien aus dem public-Ordner bereit
app.use(express.static(path.join(__dirname, "public")));


// ==========================================================
// 1. CSV EINLESEN
// ==========================================================

// Liest die CSV-Datei ein und wandelt jede Zeile
// in ein JavaScript-Objekt um.
function readDataset(filename) {

    const data = fs.readFileSync(filename, "utf8").trim();

    const lines = data.split(/\r?\n/);
    const headers = lines[0].split(",");

    const records = lines.slice(1).map(line => {

        const values = [];

        let currentValue = "";
        let insideQuotes = false;

        // CSV-Zeile Zeichen für Zeichen durchgehen
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

        // Spaltennamen mit den jeweiligen Werten verbinden
        headers.forEach((header, index) => {
            record[header] = values[index];
        });

        record.id = Number(record.id);

        return record;
    });

    return records;
}


// Bereitet Werte so vor, dass sie sicher
// in die CSV-Datei geschrieben werden können.
function escapeCsv(value) {

    const text = String(value ?? "");

    if (
        text.includes(",") ||
        text.includes('"') ||
        text.includes("\n")
    ) {
        return `"${text.replace(/"/g, '""')}"`;
    }

    return text;
}


// ==========================================================
// 2. BESCHREIBUNGEN VERGLEICHEN
// ==========================================================

// Vergleicht Wörter aus zwei Beschreibungen.
// Je mehr gleiche Wörter vorkommen,
// desto mehr Punkte gibt es.
function vergleicheBeschreibung(beschreibung1, beschreibung2) {

    const text1 = beschreibung1
        .toLowerCase()
        .replace(/[^\p{L}\p{N}]+/gu, " ");

    const text2 = beschreibung2
        .toLowerCase()
        .replace(/[^\p{L}\p{N}]+/gu, " ");

    const woerter1 = text1
        .split(/\s+/)
        .filter(wort => wort !== "");

    const woerter2 = text2
        .split(/\s+/)
        .filter(wort => wort !== "");

    let gleicheWoerter = 0;

    for (const wort of woerter1) {

        if (woerter2.includes(wort)) {
            gleicheWoerter++;
        }
    }

    const aehnlichkeit =
        gleicheWoerter /
        Math.max(woerter1.length, woerter2.length);

    // Beschreibung kann maximal 10 Punkte geben
    return Math.round(aehnlichkeit * 10);
}


// ==========================================================
// 3. MATCHING-ALGORITHMUS
// ==========================================================

// Vergleicht einen verlorenen Gegenstand
// mit einem gefundenen Gegenstand.
// Maximal können 100 Punkte erreicht werden.
function berechneMatch(verloren, gefunden) {

    let matchPunkte = 0;

    const verlorenDatum = new Date(verloren.date);
    const gefundenDatum = new Date(gefunden.date);

    // Ein Gegenstand kann nicht gefunden worden sein,
    // bevor er verloren wurde.
    if (gefundenDatum < verlorenDatum) {
        return 0;
    }


    // Kategorie: 30 Punkte
    if (
        verloren.category.toLowerCase() ===
        gefunden.category.toLowerCase()
    ) {
        matchPunkte += 30;
    }


    // Farbe: 20 Punkte
    if (
        verloren.color.toLowerCase() ===
        gefunden.color.toLowerCase()
    ) {
        matchPunkte += 20;
    }


    // Ort: 25 Punkte
    if (
        verloren.location.toLowerCase() ===
        gefunden.location.toLowerCase()
    ) {
        matchPunkte += 25;
    }


    // Datum: maximal 15 Punkte
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


    // Beschreibung: maximal 10 Punkte
    matchPunkte += vergleicheBeschreibung(
        verloren.description,
        gefunden.description
    );

    return matchPunkte;
}


// ==========================================================
// 4. API
// ==========================================================


// Alle gespeicherten Gegenstände an das Frontend schicken
app.get("/api/items", (req, res) => {

    const records =
        readDataset("lost_and_found_dataset.csv");

    res.json(records);
});


// Neuen verlorenen oder gefundenen Gegenstand speichern
app.post("/api/items", (req, res) => {

    const records =
        readDataset("lost_and_found_dataset.csv");

    const newItem = req.body;


    // Prüfen, ob alle Pflichtfelder vorhanden sind
    if (
        !newItem.type ||
        !newItem.category ||
        !newItem.color ||
        !newItem.location ||
        !newItem.date ||
        !newItem.description ||
        !newItem.status
    ) {
        return res.status(400).json({
            message:
                "Nicht alle Pflichtfelder wurden ausgefüllt."
        });
    }


    // Neue ID berechnen
    const highestId =
        records.length > 0
            ? Math.max(...records.map(item => item.id))
            : 0;

    newItem.id = highestId + 1;


    // Foto ist optional
    if (!newItem.photo) {
        newItem.photo = "";
    }


    // Neue CSV-Zeile erstellen
    const csvLine = [
        newItem.id,
        escapeCsv(newItem.type),
        escapeCsv(newItem.category),
        escapeCsv(newItem.color),
        escapeCsv(newItem.photo),
        escapeCsv(newItem.location),
        escapeCsv(newItem.date),
        escapeCsv(newItem.description),
        escapeCsv(newItem.status)
    ].join(",");


    // Neue Meldung an die CSV-Datei anhängen
    fs.appendFileSync(
        "lost_and_found_dataset.csv",
        "\n" + csvLine,
        "utf8"
    );


    res.status(201).json(newItem);
});


// Matches für eine bestimmte Verlustmeldung berechnen
app.get("/api/matches/:id", (req, res) => {

    const records =
        readDataset("lost_and_found_dataset.csv");


    // Gesuchten LOST-Eintrag anhand der ID finden
    const lostItem = records.find(
        item =>
            item.id === Number(req.params.id) &&
            item.type === "LOST"
    );


    if (!lostItem) {

        return res.status(404).json({
            message:
                "Verlorener Gegenstand nicht gefunden."
        });
    }


    // Nur gefundene Gegenstände auswählen
    const foundItems = records.filter(
        item => item.type === "FOUND"
    );


    // Jeden FOUND-Eintrag mit dem LOST-Eintrag vergleichen
    const matches = foundItems.map(foundItem => ({
        item: foundItem,
        match: berechneMatch(lostItem, foundItem)
    }));


    // Höchsten Match-Wert zuerst anzeigen
    matches.sort((a, b) => b.match - a.match);


    res.json(matches);
});


// ==========================================================
// 5. SERVER STARTEN
// ==========================================================

app.listen(PORT, () => {

    console.log(
        `Lost & Found Matcher läuft auf http://localhost:${PORT}`
    );
});