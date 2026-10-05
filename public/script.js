// ==========================================================
// LOST & FOUND MATCHER - FRONTEND
// ==========================================================

const appState = {
    currentView: "view-dashboard",
    lostStep: 1,
    totalLostSteps: 5,
    items: [],
    selectedLostColor: null,
    activeFilter: "all"
};


// ==========================================================
// 1. NAVIGATION
// ==========================================================

function navigateTo(viewId) {
    document.querySelectorAll(".app-view").forEach(view => {
        view.classList.remove("active");
    });

    const target = document.getElementById(viewId);

    if (!target) return;

    target.classList.add("active");
    appState.currentView = viewId;

    document.querySelectorAll(".nav-link").forEach(link => {
        link.classList.toggle(
            "active",
            link.dataset.target === viewId
        );
    });

    if (viewId === "view-dashboard") {
        renderDashboard();
    }

    if (viewId === "view-my-reports") {
        renderReports();
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ==========================================================
// 2. DATEN VOM BACKEND LADEN
// ==========================================================

// Holt alle LOST- und FOUND-Einträge aus der CSV über die API.
async function loadItems() {
    try {
        const response = await fetch("/api/items");

        if (!response.ok) {
            throw new Error("Daten konnten nicht geladen werden.");
        }

        appState.items = await response.json();

        renderDashboard();
        renderReports();
    }
    catch (error) {
        console.error(error);
        showToast("Die Meldungen konnten nicht geladen werden.");
    }
}


// ==========================================================
// 3. HILFSFUNKTIONEN
// ==========================================================

function getCategoryIcon(category) {
    const value = String(category || "").toLowerCase();

    if (value.includes("elektronik")) return "fa-laptop";
    if (value.includes("schlüssel")) return "fa-key";
    if (value.includes("bekleidung")) return "fa-shirt";

    if (
        value.includes("rucksack") ||
        value.includes("tasche")
    ) {
        return "fa-bag-shopping";
    }

    if (value.includes("trinkflasche")) {
        return "fa-bottle-water";
    }

    return "fa-box";
}


function formatDate(dateString) {
    if (!dateString) return "-";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return dateString;
    }

    return date.toLocaleString("de-AT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}


// Verhindert, dass eingegebener Text als HTML interpretiert wird.
function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = value ?? "";
    return div.innerHTML;
}


// ==========================================================
// 4. DASHBOARD
// ==========================================================

function renderDashboard() {
    const container = document.getElementById("dashboard-items");

    if (!container) return;

    container.innerHTML = "";

    const items = [...appState.items]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 6);

    if (items.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-regular fa-folder-open"></i>
                <strong>Noch keine Meldungen vorhanden</strong>
                <span>
                    Melde einen verlorenen oder gefundenen Gegenstand.
                </span>
            </div>
        `;
        return;
    }

    items.forEach(item => {
        const isLost = item.type === "LOST";

        const card = document.createElement("article");
        card.className = "card item-card";

        card.innerHTML = `
            <div class="item-card-top">
                <div class="item-icon ${isLost ? "" : "found"}">
                    <i class="fa-solid ${getCategoryIcon(item.category)}"></i>
                </div>

                <span class="status-badge ${isLost ? "badge-orange" : "badge-teal"}">
                    ${isLost ? "VERLOREN" : "GEFUNDEN"}
                </span>
            </div>

            <h3 class="item-title">
                ${escapeHtml(item.category)}
            </h3>

            <p class="item-description">
                ${escapeHtml(item.description)}
            </p>

            <div class="item-details">
                <span>
                    <i class="fa-solid fa-palette"></i>
                    ${escapeHtml(item.color)}
                </span>

                <span>
                    <i class="fa-solid fa-location-dot"></i>
                    ${escapeHtml(item.location)}
                </span>

                <span>
                    <i class="fa-regular fa-calendar"></i>
                    ${formatDate(item.date)}
                </span>
            </div>
        `;

        container.appendChild(card);
    });
}


// ==========================================================
// 5. MEINE MELDUNGEN + FILTER
// ==========================================================

function renderReports() {
    const container = document.getElementById("reports-container");

    if (!container) return;

    container.innerHTML = "";

    const searchValue =
        document.getElementById("reports-search")
            ?.value.toLowerCase().trim() || "";

    const filteredItems = appState.items.filter(item => {
        const searchText = `
            ${item.category}
            ${item.color}
            ${item.location}
            ${item.description}
            ${item.status}
        `.toLowerCase();

        const matchesSearch = searchText.includes(searchValue);

        let matchesFilter = true;

        if (appState.activeFilter === "lost") {
            matchesFilter = item.type === "LOST";
        }

        if (appState.activeFilter === "found") {
            matchesFilter = item.type === "FOUND";
        }

        if (appState.activeFilter === "open") {
            matchesFilter = item.status === "OFFEN";
        }

        return matchesSearch && matchesFilter;
    });

    if (filteredItems.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-magnifying-glass"></i>
                <strong>Keine Meldungen gefunden</strong>
                <span>Ändere deine Suche oder deinen Filter.</span>
            </div>
        `;
        return;
    }

    filteredItems.forEach(item => {
        const isLost = item.type === "LOST";

        const card = document.createElement("article");
        card.className = "card report-card";

        card.innerHTML = `
            <div class="report-icon ${isLost ? "" : "found"}">
                <i class="fa-solid ${getCategoryIcon(item.category)}"></i>
            </div>

            <div class="report-main">

                <div class="report-meta-line">
                    <span class="status-badge ${
                        item.status === "OFFEN"
                            ? "badge-orange"
                            : "badge-teal"
                    }">
                        ${escapeHtml(item.status)}
                    </span>

                    <span class="report-category">
                        ${isLost ? "Verloren" : "Gefunden"}
                        · ${escapeHtml(item.category)}
                        · ${escapeHtml(item.color)}
                    </span>

                    <span class="report-id">
                        ID: ${item.id}
                    </span>
                </div>

                <h3 class="report-title">
                    ${escapeHtml(item.category)}
                </h3>

                <p class="report-summary">
                    ${escapeHtml(item.description)}
                </p>

                <div class="report-location-date">
                    <span>
                        <i class="fa-solid fa-location-dot"></i>
                        ${escapeHtml(item.location)}
                    </span>

                    <span>
                        <i class="fa-regular fa-calendar"></i>
                        ${formatDate(item.date)}
                    </span>
                </div>

            </div>

            <div class="report-actions">
                ${
                    isLost
                        ? `
                            <button
                                class="btn btn-primary"
                                onclick="loadMatches(${item.id})">
                                <i class="fa-solid fa-wand-magic-sparkles"></i>
                                Matches finden
                            </button>
                        `
                        : ""
                }
            </div>
        `;

        container.appendChild(card);
    });
}


function filterReports() {
    renderReports();
}


function setFilter(element, filter) {
    appState.activeFilter = filter;

    document.querySelectorAll(".filter-pill").forEach(button => {
        button.classList.remove("active");
    });

    element.classList.add("active");

    renderReports();
}


// ==========================================================
// 6. MATCHES LADEN UND ANZEIGEN
// ==========================================================

// Holt die Match-Ergebnisse für eine bestimmte LOST-ID vom Backend.
async function loadMatches(id) {
    showToast("Mögliche Matches werden berechnet...");

    try {
        const response = await fetch(`/api/matches/${id}`);

        if (!response.ok) {
            throw new Error("Matches konnten nicht geladen werden.");
        }

        const matches = await response.json();

        renderMatches(matches);
        navigateTo("view-matches");
    }
    catch (error) {
        console.error(error);
        showToast("Beim Matching ist ein Fehler aufgetreten.");
    }
}


function getMatchLevel(score) {
    if (score >= 80) {
        return {
            text: "Sehr hohe Übereinstimmung",
            className: "badge-teal"
        };
    }

    if (score >= 60) {
        return {
            text: "Gute Übereinstimmung",
            className: "badge-blue"
        };
    }

    if (score >= 40) {
        return {
            text: "Mögliche Übereinstimmung",
            className: "badge-orange"
        };
    }

    return {
        text: "Geringe Übereinstimmung",
        className: ""
    };
}


function renderMatches(matches) {
    const container = document.getElementById("match-results");

    if (!container) return;

    container.innerHTML = "";

    if (!Array.isArray(matches) || matches.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-magnifying-glass"></i>
                <strong>Noch kein Match gefunden</strong>
                <span>
                    Zurzeit gibt es keine passenden Fundmeldungen.
                </span>
            </div>
        `;
        return;
    }

    matches.forEach((match, index) => {
        const item = match.item;
        const score = Number(match.match) || 0;
        const level = getMatchLevel(score);

        const card = document.createElement("article");

        card.className =
            `card match-card ${index === 0 ? "best-match" : ""}`;

        card.innerHTML = `
            <div class="match-card-header">

                <div>
                    <span class="status-badge ${level.className}">
                        ${level.text}
                    </span>

                    <h3 class="match-card-title">
                        ${index === 0 ? "Bestes Match" : `Match #${index + 1}`}
                        · ${escapeHtml(item.category)}
                    </h3>
                </div>

                <div class="match-score">
                    ${score}<small>%</small>
                </div>

            </div>

            <div class="match-progress">
                <div
                    class="match-progress-fill"
                    style="width: ${Math.min(score, 100)}%">
                </div>
            </div>

            <p class="match-description">
                ${escapeHtml(item.description)}
            </p>

            <div class="match-info-grid">

                <div class="match-info">
                    <span>Kategorie</span>
                    <strong>${escapeHtml(item.category)}</strong>
                </div>

                <div class="match-info">
                    <span>Farbe</span>
                    <strong>${escapeHtml(item.color)}</strong>
                </div>

                <div class="match-info">
                    <span>Fundort</span>
                    <strong>${escapeHtml(item.location)}</strong>
                </div>

                <div class="match-info">
                    <span>Gefunden am</span>
                    <strong>${formatDate(item.date)}</strong>
                </div>

            </div>
        `;

        container.appendChild(card);
    });
}


// ==========================================================
// 7. 5-SCHRITTE-FORMULAR
// ==========================================================

const lostStepTitles = {
    1: "Schritt 1 von 5: Was hast du verloren?",
    2: "Schritt 2 von 5: Wo hast du es verloren?",
    3: "Schritt 3 von 5: Wann hast du es verloren?",
    4: "Schritt 4 von 5: Beschreibe den Gegenstand",
    5: "Schritt 5 von 5: Foto hinzufügen"
};


function handleStepNext(type) {
    if (type !== "lost") return;

    if (!validateLostStep()) return;

    if (appState.lostStep < appState.totalLostSteps) {
        appState.lostStep++;
        updateLostStepper();
    }
    else {
        submitLostReport();
    }
}


function handleStepPrev(type) {
    if (
        type === "lost" &&
        appState.lostStep > 1
    ) {
        appState.lostStep--;
        updateLostStepper();
    }
}


// Prüft die Pflichtfelder des aktuellen Schritts.
function validateLostStep() {
    if (appState.lostStep === 1) {
        const category =
            document.getElementById("lost-category").value;

        if (!category) {
            showToast("Bitte wähle eine Kategorie aus.");
            return false;
        }

        if (!appState.selectedLostColor) {
            showToast("Bitte wähle eine Farbe aus.");
            return false;
        }
    }

    if (appState.lostStep === 2) {
        const location =
            document.getElementById("lost-location").value.trim();

        if (!location) {
            showToast("Bitte gib den Verlustort ein.");
            return false;
        }
    }

    if (appState.lostStep === 3) {
        const date =
            document.getElementById("lost-date").value;

        const time =
            document.getElementById("lost-time").value;

        if (!date || !time) {
            showToast("Bitte gib Datum und Uhrzeit ein.");
            return false;
        }
    }

    if (appState.lostStep === 4) {
        const description =
            document.getElementById("lost-desc").value.trim();

        if (!description) {
            showToast("Bitte beschreibe den Gegenstand.");
            return false;
        }
    }

    return true;
}


function updateLostStepper() {
    const current = appState.lostStep;

    document.getElementById("lost-step-label").textContent =
        lostStepTitles[current];

    document.getElementById("lost-progress-bar").style.width =
        `${(current / appState.totalLostSteps) * 100}%`;

    document.querySelectorAll("#lost-step-nodes .step-node")
        .forEach(node => {
            const step = Number(node.dataset.step);

            node.classList.remove("active", "completed");

            if (step === current) {
                node.classList.add("active");
            }

            if (step < current) {
                node.classList.add("completed");
            }
        });

    for (let i = 1; i <= appState.totalLostSteps; i++) {
        const pane = document.getElementById(`lost-pane-${i}`);

        pane.classList.toggle("active", i === current);
    }

    const previousButton =
        document.getElementById("lost-btn-prev");

    const nextButton =
        document.getElementById("lost-btn-next");

    previousButton.style.visibility =
        current === 1 ? "hidden" : "visible";

    if (current === appState.totalLostSteps) {
        nextButton.innerHTML = `
            <i class="fa-solid fa-check"></i>
            Meldung speichern
        `;

        nextButton.className = "btn btn-teal";
    }
    else {
        nextButton.innerHTML = `
            Weiter
            <i class="fa-solid fa-arrow-right"></i>
        `;

        nextButton.className = "btn btn-primary";
    }
}


// ==========================================================
// 8. MELDUNGEN SPEICHERN
// ==========================================================

async function submitLostReport() {
    const item = {
        type: "LOST",

        category:
            document.getElementById("lost-category").value,

        color:
            appState.selectedLostColor,

        location:
            document.getElementById("lost-location").value.trim(),

        date:
            `${document.getElementById("lost-date").value}` +
            `T${document.getElementById("lost-time").value}`,

        description:
            document.getElementById("lost-desc").value.trim(),

        photo:
            document.getElementById("lost-photo").files[0]?.name || "",

        status: "OFFEN"
    };

    await sendNewItem(item);
}


async function submitFoundReport() {
    const category =
        document.getElementById("found-category").value;

    const color =
        document.getElementById("found-color").value.trim();

    const location =
        document.getElementById("found-location").value.trim();

    const date =
        document.getElementById("found-date").value;

    const time =
        document.getElementById("found-time").value;

    const description =
        document.getElementById("found-desc").value.trim();

    if (
        !category ||
        !color ||
        !location ||
        !date ||
        !time ||
        !description
    ) {
        showToast("Bitte fülle alle Pflichtfelder aus.");
        return;
    }

    const item = {
        type: "FOUND",
        category,
        color,
        photo: "",
        location,
        date: `${date}T${time}`,
        description,
        status: "GEFUNDEN"
    };

    await sendNewItem(item);
}


// Sendet eine neue Meldung an POST /api/items.
async function sendNewItem(item) {
    try {
        const response = await fetch("/api/items", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(item)
        });

        if (!response.ok) {
            throw new Error("Speichern fehlgeschlagen.");
        }

        const newItem = await response.json();

        appState.items.push(newItem);

        showToast("Meldung wurde erfolgreich gespeichert.");

        resetForms();
        navigateTo("view-my-reports");
    }
    catch (error) {
        console.error(error);
        showToast("Die Meldung konnte nicht gespeichert werden.");
    }
}


// ==========================================================
// 9. FORMULARE ZURÜCKSETZEN
// ==========================================================

function resetForms() {
    document.getElementById("form-lost")?.reset();
    document.getElementById("form-found")?.reset();

    appState.selectedLostColor = null;
    appState.lostStep = 1;

    document.querySelectorAll(".pill-choice").forEach(button => {
        button.classList.remove("active");
    });

    updateLostStepper();
}


// ==========================================================
// 10. FARBAUSWAHL
// ==========================================================

function initialiseColorButtons() {
    document
        .querySelectorAll("#lost-color-pills .pill-choice")
        .forEach(button => {

            button.addEventListener("click", () => {

                document
                    .querySelectorAll("#lost-color-pills .pill-choice")
                    .forEach(other => {
                        other.classList.remove("active");
                    });

                button.classList.add("active");

                appState.selectedLostColor =
                    button.dataset.color;
            });
        });
}


// ==========================================================
// 11. KLEINE BENACHRICHTIGUNGEN
// ==========================================================

let toastTimeout;

function showToast(message) {
    const toast = document.getElementById("toast");

    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimeout);

    toastTimeout = setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}


// ==========================================================
// 12. APP STARTEN
// ==========================================================

document.addEventListener("DOMContentLoaded", async () => {
    initialiseColorButtons();
    updateLostStepper();
    await loadItems();
});