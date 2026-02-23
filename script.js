
// 1. Grund-Daten laden
let alarms = JSON.parse(localStorage.getItem('myAlarms')) || [];
const dayNames = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
const alarmSound = new Audio('alarm.mp3');
alarmSound.loop = true;

// 2. NEU: URL-Check (Lösung A) - Prüfen, ob Wecker über einen Link kommen
const urlParams = new URLSearchParams(window.location.search);
const sharedData = urlParams.get('setup');

if (sharedData) {
try {
const decodedData = JSON.parse(decodeURIComponent(sharedData));
if (Array.isArray(decodedData)) {
alarms = decodedData;
localStorage.setItem('myAlarms', JSON.stringify(alarms));
// URL säubern
window.history.replaceState({}, document.title, window.location.pathname);
alert("Wecker-Setup erfolgreich über Link geladen!");
}
} catch (e) {
console.error("Link-Fehler", e);
}
}

// 3. Funktion: Digitaluhr aktualisieren
function updateClock() {
const now = new Date();
const timeString = now.toLocaleTimeString('de-DE');
const clockElement = document.getElementById('digitalClock');
if (clockElement) clockElement.textContent = timeString;
}

// 4. Funktion: Wecker hinzufügen
function addAlarm() {
const titleInput = document.getElementById('alarmTitle');
const timeInput = document.getElementById('alarmTime');
const checkboxes = document.querySelectorAll('.days-selector input:checked');

let selectedDays = [];
checkboxes.forEach(cb => selectedDays.push(parseInt(cb.value)));

if (!timeInput.value || selectedDays.length === 0) {
    alert("Bitte Zeit und Tag wählen!");
    return;
}

const newAlarm = { 
    id: Date.now(), 
    title: titleInput.value || "Wecker", 
    time: timeInput.value, 
    days: selectedDays, 
    active: true,
    lastFired: null 
};

alarms.push(newAlarm);
saveData();
renderAlarms();

// Felder leeren
titleInput.value = "";
timeInput.value = "";
document.querySelectorAll('.days-selector input').forEach(cb => cb.checked = false);
}

// 5. Funktion: Wecker prüfen
function checkAlarms() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const currentTime = h + ":" + m;
    const currentDay = now.getDay(); 

    alarms.forEach(alarm => {
        if (alarm.active && alarm.time === currentTime && alarm.days.includes(currentDay)) {
            if (alarm.lastFired !== currentTime) {
                alarm.lastFired = currentTime;
                
                // Ton starten
                alarmSound.play().catch(() => console.log("Klicke auf die Seite für Ton!"));
                
                // Das Fenster zeigt jetzt den TITEL des Weckers an
                // Wir nutzen einen kleinen Timeout, damit der Browser den Ton sicher startet
                setTimeout(() => {
                    alert("⏰ " + alarm.title.toUpperCase() + "\nEs ist " + alarm.time + " Uhr.");
                    
                    // Ton stoppen, wenn OK geklickt wurde
                    alarmSound.pause();
                    alarmSound.currentTime = 0;
                }, 100);
            }
        }
    });
}

// 6. Funktion: Link für Kollegin erstellen
function generateShareLink() {
if (alarms.length === 0) {
alert("Stelle erst Wecker ein!");
return;
}
const dataString = encodeURIComponent(JSON.stringify(alarms));
const baseUrl = window.location.href.split('?')[0];
const fullLink = baseUrl + "?setup=" + dataString;

navigator.clipboard.writeText(fullLink).then(() => {
    alert("Link kopiert! Schicke ihn deiner Kollegin.");
});
}

// 7. Hilfsfunktionen (Speichern, Rendern, Löschen)
function saveData() {
localStorage.setItem('myAlarms', JSON.stringify(alarms));
}

function renderAlarms() {
const list = document.getElementById('alarmList');
if (!list) return;
list.innerHTML = "";

alarms.forEach(a => {
    const dayStrings = a.days.map(d => dayNames[d]);
    const li = document.createElement('li');
    li.className = "alarm-card"; // Nutzt dein CSS
    li.style.background = "#333";
    li.style.margin = "10px 0";
    li.style.padding = "10px";
    li.style.borderRadius = "8px";
    li.style.display = "flex";
    li.style.justifyContent = "space-between";
    li.style.alignItems = "center";
    
    li.innerHTML = `<div><strong>${a.time}</strong> - ${a.title}<br><small>${dayStrings.join(", ")}</small></div>
                    <button onclick="deleteAlarm(${a.id})" style="background:none; border:none; color:red; cursor:pointer; font-size:20px;">✕</button>`;
    list.appendChild(li);
});
}

function deleteAlarm(id) {
alarms = alarms.filter(a => a.id !== id);
saveData();
renderAlarms();
}

// 8. Start
setInterval(updateClock, 1000);
setInterval(checkAlarms, 1000);
updateClock();
renderAlarms();