
// 1. Daten laden
let alarms = JSON.parse(localStorage.getItem('myAlarms')) || [];
const dayNames = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
const alarmSound = new Audio('alarm.mp3');
alarmSound.loop = true;

// 2. Verbesserter URL-Check (Liest 'setup' UND 's' aus)
const urlParams = new URLSearchParams(window.location.search);
const sharedData = urlParams.get('setup') || urlParams.get('s');

if (sharedData) {
    try {
        // Versuche die Daten zu dekodieren
        const decodedData = JSON.parse(decodeURIComponent(sharedData));
        if (Array.isArray(decodedData)) {
            alarms = decodedData;
            localStorage.setItem('myAlarms', JSON.stringify(alarms));
            // URL bereinigen
            window.history.replaceState({}, document.title, window.location.pathname);
            alert("✅ Wecker-Setup erfolgreich geladen!");
        }
    } catch (e) {
        console.error("Fehler beim Laden der Daten:", e);
    }
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
    const dataString = encodeURIComponent(JSON.stringify(alarms));
    const baseUrl = window.location.origin + window.location.pathname;
    const fullLink = baseUrl + "?setup=" + dataString;

    navigator.clipboard.writeText(fullLink).then(() => {
        alert("🔗 Link kopiert! Schicke ihn deiner Kollegin.");
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