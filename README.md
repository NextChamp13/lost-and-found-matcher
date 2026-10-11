# 🔎 Lost & Found Matcher

Eine einfache Webanwendung, mit der verlorene und gefundene Gegenstände
gemeldet und passende Einträge leichter wiedergefunden werden können.

Das Projekt wurde im Rahmen eines FH-Projekts entwickelt. Das Frontend
wird im Browser ausgeführt, während ein Node.js-Backend die Anfragen
verarbeitet. Die Meldungen werden lokal in einer CSV-Datei gespeichert.

------------------------------------------------------------------------

## ✨ Funktionen

-   📝 Verlorene oder gefundene Gegenstände melden
-   📋 Vorhandene Meldungen laden und anzeigen
-   🔎 Angaben zu Gegenständen wie Kategorie, Farbe, Ort, Datum und
    Beschreibung verwenden
-   💾 Meldungsdaten in einer CSV-Datei speichern
-   🧩 Frontend und Backend getrennt starten und testen

> Hinweis: Welche Funktionen verfügbar sind, hängt vom aktuellen Stand
> des Projekts ab.

------------------------------------------------------------------------

## 🛠️ Verwendete Technologien

-   **HTML, CSS und JavaScript** -- Benutzeroberfläche
-   **Node.js** -- Backend
-   **CSV-Datei** -- lokale Datenspeicherung
-   **Visual Studio Code** -- Entwicklungsumgebung
-   **Live Server** -- lokaler Start des Frontends

------------------------------------------------------------------------

## 📦 Voraussetzungen

Installiere vor dem Start:

1.  [Node.js (LTS)](https://nodejs.org/)
2.  [Visual Studio Code](https://code.visualstudio.com/)
3.  Die VS-Code-Erweiterung **Live Server**

Wenn du das Repository mit Git klonen möchtest, benötigst du außerdem
[Git](https://git-scm.com/downloads).

------------------------------------------------------------------------

## 🚀 Installation und Start

### 1. Repository herunterladen

Klone das Repository:

``` bash
git clone https://github.com/NextChamp13/lost-and-found-matcher.git
```

Wechsle anschließend in den Projektordner:

``` bash
cd lost-and-found-matcher
```

Alternativ kannst du das Repository auf GitHub über **Code → Download
ZIP** herunterladen und die ZIP-Datei entpacken.

### 2. Projekt in VS Code öffnen

Öffne den Ordner `lost-and-found-matcher` in Visual Studio Code.

### 3. Abhängigkeiten installieren

Öffne in VS Code ein Terminal (**Terminal → Neues Terminal**) und führe
im Projektordner aus:

``` bash
npm install
```

Das installiert die in `package.json` definierten Abhängigkeiten. Dieser
Schritt ist normalerweise nur bei der ersten Einrichtung nötig.

### 4. Backend starten

Starte den Node.js-Server:

``` bash
node app.js
```

Wenn der Start erfolgreich ist, sollte im Terminal eine Meldung ähnlich
dieser erscheinen:

``` text
Lost & Found Matcher läuft auf http://localhost:3000
```

Lass dieses Terminal geöffnet, solange du die Anwendung verwendest. Mit
`Ctrl + C` kannst du den Server beenden.

### 5. Frontend starten

1.  Öffne `index.html` in VS Code.
2.  Klicke mit der rechten Maustaste in die Datei.
3.  Wähle **Open with Live Server**.
4.  Die Webseite öffnet sich im Browser.

**Wichtig:** Das Backend und das Frontend müssen beide laufen. Live
Server startet nur die Webseite, nicht den Node.js-Server.

------------------------------------------------------------------------

## 📁 Projektdateien

  -----------------------------------------------------------------------
  Datei                               Zweck
  ----------------------------------- -----------------------------------
  `index.html`                        Benutzeroberfläche der Anwendung

  `app.js`                            Node.js-Backend zur Verarbeitung
                                      von Anfragen

  `lost_and_found_dataset.csv`        Lokale Datei zur Speicherung der
                                      Meldungsdaten

  `package.json`                      Projektinformationen und benötigte
                                      Node.js-Abhängigkeiten
  -----------------------------------------------------------------------

Je nach aktuellem Repository-Stand können weitere Dateien und Ordner
vorhanden sein.

------------------------------------------------------------------------

## 💾 Hinweise zur CSV-Datei

Die Datei `lost_and_found_dataset.csv` dient als einfache, lokale
Datenspeicherung.

-   Achte darauf, dass die CSV-Datei am erwarteten Speicherort vorhanden
    ist.
-   Das Backend muss Schreibrechte haben, damit neue Meldungen
    gespeichert werden können.
-   Wenn mehrere Personen das Projekt separat herunterladen, hat jede
    Person grundsätzlich ihre eigene lokale CSV-Datei.
-   Änderungen an einer lokalen CSV-Datei werden nicht automatisch mit
    anderen Personen synchronisiert.

Diese Lösung eignet sich für lokale Entwicklung und Tests. Für eine
gemeinsam genutzte Anwendung wäre eine zentral erreichbare Datenbank
beziehungsweise ein gehostetes Backend erforderlich.

------------------------------------------------------------------------

## 🧯 Fehlerbehebung

### Die Meldungen werden nicht geladen oder können nicht gespeichert werden

1.  Prüfe, ob das Backend mit `node app.js` läuft.
2.  Kontrolliere, ob im Terminal Fehlermeldungen erscheinen.
3.  Prüfe die Browser-Konsole über **Entwicklertools → Console**.
4.  Kontrolliere, ob `lost_and_found_dataset.csv` vorhanden und für das
    Backend erreichbar ist.
5.  Vergewissere dich, dass Frontend und Backend die richtige
    API-Adresse verwenden.

### `Cannot find module ...`

Führe im Projektordner Folgendes aus:

``` bash
npm install
```

### Port 3000 ist bereits belegt

Prüfe, ob bereits eine andere Instanz des Backends läuft. Beende diese
gegebenenfalls mit `Ctrl + C`, bevor du den Server erneut startest.

------------------------------------------------------------------------

## 👥 Mitarbeit und Weiterentwicklung

Du kannst das Repository klonen, lokal Änderungen vornehmen und diese
über Git committen und pushen, sofern du die erforderlichen
Berechtigungen hast.

------------------------------------------------------------------------

## 📄 Projekt

**Repository:**
[NextChamp13/lost-and-found-matcher](https://github.com/NextChamp13/lost-and-found-matcher)

Entwickelt als FH-Projekt.
