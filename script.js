
// 1. Daten laden
let alarms = JSON.parse(localStorage.getItem('myAlarms')) || [];
const dayNames = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
const alarmSound = new Audio('alarm.mp3');
alarmSound.loop = true;

// 2. DIAGNOSE-URL-Check
console.log("Prüfe URL auf Daten...");
const urlParams = new URLSearchParams(window.location.search);
const sharedData = urlParams.get('setup');

if (sharedData) {
    console.log("Daten im Link gefunden!");
    try {
        const decodedData = JSON.parse(decodeURIComponent(sharedData));
        if (Array.isArray(decodedData)) {
            alarms = decodedData;
            localStorage.setItem('myAlarms', JSON.stringify(alarms));
            alert("✅ Wecker-Setup wurde erkannt und gespeichert!");
            // URL säubern, damit die Meldung nicht bei jedem Reload kommt
            window.history.replaceState({}, document.title, window.location.pathname);
        } else {
            alert("❌ Fehler: Die Daten im Link haben das falsche Format.");
        }
    } catch (e) {
        console.error("Dekodierungsfehler:", e);
        alert("❌ Fehler: Der Link ist unvollständig oder beschädigt.");
    }
} else {
    console.log("Keine Setup-Daten im Link vorhanden.");
}

// 3. Uhr-Funktion
function updateClock() {
    const clockElement = document.getElementById('digitalClock');
    if (clockElement) {
        clockElement.textContent = new Date().toLocaleTimeString('de-DE');
    }
}

// 4. Wecker hinzufügen
function addAlarm() {
    const titleInput = document.getElementById('alarmTitle');
    const timeInput = document.getElementById('alarmTime');
    const checkboxes = document.querySelectorAll('.days-selector input:checked');
    
    let selectedDays = [];
    checkboxes.forEach(cb => selectedDays.push(parseInt(cb.value)));

    if (!timeInput.value || selectedDays.length === 0) {
        alert("Bitte Zeit und mindestens einen Tag wählen!");
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
    
    titleInput.value = "";
    timeInput.value = "";
    document.querySelectorAll('.days-selector input').forEach(cb => cb.checked = false);
}

// 5. Wecker prüfen
function checkAlarms() {
    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ":" + 
                        now.getMinutes().toString().padStart(2, '0');
    const currentDay = now.getDay(); 

    alarms.forEach(alarm => {
        if (alarm.active && alarm.time === currentTime && alarm.days.includes(currentDay)) {
            if (alarm.lastFired !== currentTime) {
                alarm.lastFired = currentTime;
                alarmSound.play().catch(() => console.log("Ton-Wiedergabe blockiert. Klicke auf die Seite!"));
                
                setTimeout(() => {
                    alert("⏰ " + alarm.title.toUpperCase() + "\nEs ist " + alarm.time + " Uhr.");
                    alarmSound.pause();
                    alarmSound.currentTime = 0;
                }, 100);
            }
        }
    });
}

// 6. Link erstellen
function generateShareLink() {
    if (alarms.length === 0) {
        alert("Erstelle erst Wecker, bevor du einen Link teilst!");
        return;
    }

    // 1. Die Wecker-Daten in einen Text-String umwandeln
    const jsonString = JSON.stringify(alarms);
    
    // 2. Den String sicher für URLs codieren (verhindert Fehler bei Sonderzeichen)
    const encodedData = encodeURIComponent(jsonString);
    
    // 3. Den Link zusammenbauen (Basis-URL + der Parameter)
    const baseUrl = window.location.origin + window.location.pathname;
    const fullLink = baseUrl + "?setup=" + encodedData;

    // 4. In die Zwischenablage kopieren
    navigator.clipboard.writeText(fullLink).then(() => {
        alert("✅ Link mit " + alarms.length + " Weckern kopiert!\nDu kannst ihn jetzt im Inkognito-Tab testen.");
    }).catch(err => {
        console.error("Fehler beim Kopieren:", err);
        alert("Fehler beim Kopieren. Du findest den Link in der Konsole (F12).");
        console.log("Dein Link:", fullLink);
    });
}
// 7. Hilfsfunktionen
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
        li.style = "background:#333; margin:10px 0; padding:15px; border-radius:8px; display:flex; justify-content:space-between; align-items:center; color:white; list-style:none;";
        
        li.innerHTML = `<div><strong>${a.time} Uhr</strong> - ${a.title}<br><small>${dayStrings.join(", ")}</small></div>
                        <button onclick="deleteAlarm(${a.id})" style="background:none; border:none; color:#ff4444; cursor:pointer; font-size:22px; font-weight:bold;">✕</button>`;
        list.appendChild(li);
    });
}

function deleteAlarm(id) {
    const alarmToDelete = alarms.find(a => a.id === id);
    const alarmName = alarmToDelete ? alarmToDelete.title : "diesen Wecker";
    if (confirm("Möchtest du den Wecker '" + alarmName + "' wirklich löschen?")) {
        alarms = alarms.filter(a => a.id !== id);
        saveData();
        renderAlarms();
    }
}

// 8. Start
setInterval(updateClock, 1000);
setInterval(checkAlarms, 1000);
updateClock();
renderAlarms();