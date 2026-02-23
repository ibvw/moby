let alarms = JSON.parse(localStorage.getItem('myAlarms')) || [];
const dayNames = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

// NEU: Das Audio-Objekt erstellen
const alarmSound = new Audio('alarm.mp3');
alarmSound.loop = true; // Der Ton wiederholt sich, bis wir ihn stoppen

function addAlarm() {
const titleInput = document.getElementById('alarmTitle');
const timeInput = document.getElementById('alarmTime');
const checkboxes = document.querySelectorAll('.days-selector input:checked');

let selectedDays = [];
checkboxes.forEach(function(cb) {
    selectedDays.push(parseInt(cb.value));
});

if (!timeInput.value || selectedDays.length === 0) {
    alert("Bitte eine Uhrzeit und mindestens einen Wochentag wählen!");
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

function checkAlarms() {
const now = new Date();
const h = String(now.getHours()).padStart(2, '0');
const m = String(now.getMinutes()).padStart(2, '0');
const currentTime = h + ":" + m;
const currentDay = now.getDay();

alarms.forEach(function(alarm) {
    if (alarm.active && alarm.time === currentTime && alarm.days.includes(currentDay)) {
        if (alarm.lastFired !== currentTime) {
            alarm.lastFired = currentTime;
            
            // TON ABSPIELEN
            alarmSound.play().catch(function(error) {
                console.log("Browser blockiert Ton noch. Klicke einmal auf die Seite!");
            });

            // Das Fenster zeigt den Titel an. Wenn du OK drückst, stoppt der Ton.
            setTimeout(function() {
                alert("⏰ ALARM: " + alarm.title);
                alarmSound.pause();
                alarmSound.currentTime = 0; // Ton zurückspulen
            }, 100);
        }
    }
});
}

function renderAlarms() {
const list = document.getElementById('alarmList');
list.innerHTML = "";

alarms.forEach(function(a) {
    const dayStrings = a.days.map(d => dayNames[d]);
    const li = document.createElement('li');
    
    li.style.background = "#333";
    li.style.color = "#fff";
    li.style.margin = "10px 0";
    li.style.padding = "15px";
    li.style.borderRadius = "8px";
    li.style.display = "flex";
    li.style.justifyContent = "space-between";
    li.style.alignItems = "center";
    li.style.listStyle = "none";
    li.style.fontFamily = "sans-serif";

    li.innerHTML = "<div>" +
                   "<strong style='font-size: 1.2rem;'>" + a.time + "</strong> - " + a.title + "<br>" +
                   "<small style='color: #bb86fc;'>" + dayStrings.join(", ") + "</small>" +
                   "</div>" +
                   "<button onclick='deleteAlarm(" + a.id + ")' style='background:none; border:none; color:#cf6679; font-size:22px; cursor:pointer; font-weight:bold;'>✕</button>";
    
    list.appendChild(li);
});
}

function deleteAlarm(id) {
alarms = alarms.filter(alarm => alarm.id !== id);
saveData();
renderAlarms();
}

function saveData() {
localStorage.setItem('myAlarms', JSON.stringify(alarms));
}

setInterval(checkAlarms, 1000);
renderAlarms();

function testSound() {
    // Falls der Ton schon spielt, stoppen wir ihn erst (für den Fall, dass man doppelt klickt)
    alarmSound.pause();
    alarmSound.currentTime = 0;
    
    // Ton kurz abspielen
    alarmSound.play().then(function() {
        alert("Der Sound funktioniert! Drücke OK zum Stoppen.");
        alarmSound.pause();
        alarmSound.currentTime = 0;
    }).catch(function(error) {
        alert("Fehler: Der Browser blockiert den Ton. Klicke erst auf die Seite!");
    });
}
function updateClock() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    
    const timeString = h + ":" + m + ":" + s;
    document.getElementById('digitalClock').textContent = timeString;
}

// Die Uhr jede Sekunde neu starten
setInterval(updateClock, 1000);
updateClock(); // Sofort beim Laden einmal anzeigen