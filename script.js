let alarms = JSON.parse(localStorage.getItem('myAlarms')) || [];
const dayNames = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
const alarmSound = new Audio('alarm.mp3');
alarmSound.loop = true;

const urlParams = new URLSearchParams(window.location.search);
const sharedData = urlParams.get('setup');

if (sharedData) {
try {
const decodedData = JSON.parse(decodeURIComponent(sharedData));
if (Array.isArray(decodedData)) {
alarms = decodedData;
localStorage.setItem('myAlarms', JSON.stringify(alarms));
window.history.replaceState({}, document.title, window.location.pathname);
alert("Setup geladen!");
}
} catch (e) { console.error(e); }
}

function updateClock() {
const el = document.getElementById('digitalClock');
if (el) el.textContent = new Date().toLocaleTimeString('de-DE');
}

function renderAlarms() {
const list = document.getElementById('alarmList');
if (!list) return;
list.innerHTML = "";
alarms.forEach(a => {
const li = document.createElement('li');
li.style = "background:#333;color:white;margin:10px;padding:10px;display:flex;justify-content:space-between;list-style:none";
li.innerHTML = a.time + " - " + a.title + " <button onclick='deleteAlarm(" + a.id + ")'>X</button>";
list.appendChild(li);
});
}
function addAlarm() {
const t = document.getElementById('alarmTime').value;
const n = document.getElementById('alarmTitle').value || "Wecker";
if(!t) return;
alarms.push({id: Date.now(), time: t, title: n, days: [1,2,3,4,5], active: true});
localStorage.setItem('myAlarms', JSON.stringify(alarms));
renderAlarms();
}

function deleteAlarm(id) {
alarms = alarms.filter(a => a.id !== id);
localStorage.setItem('myAlarms', JSON.stringify(alarms));
renderAlarms();
}

function generateShareLink() {
const d = encodeURIComponent(JSON.stringify(alarms));
const l = window.location.href.split('?')[0] + "?setup=" + d;
navigator.clipboard.writeText(l).then(() => alert("Link kopiert!"));
}

setInterval(updateClock, 1000);
updateClock();
renderAlarms();