// ========================== EINSTELLUNGEN ==========================

// Zielzeit: heute um 16:00 Uhr
const TARGET_HOUR = 16;
const TARGET_MINUTE = 0;

// Sätze, die über dem Countdown rotieren
const PHRASES = [
  "Hörst du ihr Wispern...",
  "Bald ist es soweit...",
  "Der Zeitpunkt naht...",
  "Der Wandel kommt...",
  "Finde den Weg...",
];

// Wie lange jeder Satz angezeigt wird (in Millisekunden)
const PHRASE_INTERVAL = 5000;

// Sätze unter dem Ring ab 17 Uhr (ohne Punkt-Animation)
const PHRASES_DANACH = [
  "Die Zeit mag vergehen...",
  "...doch wir werden fortbestehen...",
];

// Wandel-Phase: ab 16 Uhr ersetzt dieser Text den Countdown,
// darunter erscheint die drehende Sanduhr — bis zur zweiten Zielzeit
const WANDEL_HOUR = 17;
const WANDEL_MINUTE = 0;
// \n erzwingt den Umbruch an genau dieser Stelle
const TEXT_WANDEL_NAHT = "Die Zeit des\nWandels naht...";
const TEXT_WANDEL_DA = "Der Wandel ist da";

// ====================================================================

const els = {
  content: document.getElementById("content"),
  phrase: document.getElementById("phrase"),
  hours: document.getElementById("hours"),
  minutes: document.getElementById("minutes"),
  seconds: document.getElementById("seconds"),
  countdown: document.getElementById("countdown"),
  wandel: document.getElementById("wandel"),
  wandelText: document.getElementById("wandel-text"),
  music: document.getElementById("music"),
  soundButton: document.getElementById("sound-button"),
  bgVideo: document.getElementById("bg-video"),
  background: document.getElementById("background"),
};

function getTargetTime() {
  const target = new Date();
  target.setHours(TARGET_HOUR, TARGET_MINUTE, 0, 0);
  return target;
}

function getWandelTime() {
  const target = new Date();
  target.setHours(WANDEL_HOUR, WANDEL_MINUTE, 0, 0);
  return target;
}

// ---------- Hintergrund-Video aktivieren, falls assets/background.mp4 existiert ----------

(function setupVideoBackground() {
  const video = els.bgVideo;
  const source = document.createElement("source");
  source.src = "assets/background.mp4";
  source.type = "video/mp4";
  video.appendChild(source);
  video.addEventListener("loadeddata", () => {
    video.style.display = "block";
    els.background.style.display = "none";
  });
  video.addEventListener("error", () => {
    // kein Video vorhanden — Bild/Gradient bleibt sichtbar
  });
  video.load();
})();

// ---------- Sound an/aus ----------

// zwei Wind-Tracks laufen abwechselnd in Endlosschleife
const TRACKS = ["assets/wind-1.mp3", "assets/wind-2.mp3"];
let trackIndex = 0;

els.music.addEventListener("ended", () => {
  trackIndex = (trackIndex + 1) % TRACKS.length;
  els.music.src = TRACKS[trackIndex];
  els.music.play().catch(() => setSoundIcon(false));
});

function setSoundIcon(on) {
  els.soundButton.textContent = on ? "🔊" : "🔇";
}

els.soundButton.addEventListener("click", () => {
  if (els.music.paused) {
    els.music
      .play()
      .then(() => setSoundIcon(true))
      .catch(() => {
        // keine Musikdatei vorhanden — Button bleibt stumm
        setSoundIcon(false);
      });
  } else {
    els.music.pause();
    setSoundIcon(false);
  }
});

// ---------- Text mit animierten Punkten ----------

// endet der Text auf "...", werden die Punkte nacheinander
// ein- und wieder ausgeblendet (. .. ... .. .) — außer animate ist false
function setTextWithDots(el, text, animate = true) {
  el.textContent = "";
  if (!animate || !text.endsWith("...")) {
    el.textContent = text;
    return;
  }
  el.append(text.slice(0, -3));
  const dots = document.createElement("span");
  dots.className = "dots";
  for (let i = 0; i < 3; i++) {
    const dot = document.createElement("span");
    dot.textContent = ".";
    dots.appendChild(dot);
  }
  el.appendChild(dots);
}

// ---------- Rotierende Sätze ----------

let phraseIndex = 0;
let activePhrases = PHRASES;
let phraseDotsAnimated = true;

// wechselt die Satzliste (z. B. ab 17 Uhr) und zeigt sofort den ersten Satz
function switchPhraseList(list, animateDots) {
  if (activePhrases === list) return;
  activePhrases = list;
  phraseDotsAnimated = animateDots;
  phraseIndex = 0;
  setTextWithDots(els.phrase, list[0], phraseDotsAnimated);
}

function startPhrases() {
  setTextWithDots(els.phrase, activePhrases[phraseIndex], phraseDotsAnimated);

  setInterval(() => {
    if (els.phrase.classList.contains("hidden")) return;
    els.phrase.classList.add("fade-out");
    setTimeout(() => {
      phraseIndex = (phraseIndex + 1) % activePhrases.length;
      setTextWithDots(els.phrase, activePhrases[phraseIndex], phraseDotsAnimated);
      els.phrase.classList.remove("fade-out");
    }, 800); // muss zur CSS-Transition passen
  }, PHRASE_INTERVAL);
}

// ---------- Countdown & Phasen ----------

// 0 = Countdown läuft, 1 = Wandel naht (16–17 Uhr), 2 = Wandel ist da (ab 17 Uhr)
let currentPhase = -1;

// Vorschau: ?zeige=wandel zeigt die Ansicht ab 17 Uhr, unabhängig von der Uhrzeit
const FORCE_PHASE = new URLSearchParams(location.search).get("zeige") === "wandel" ? 2 : null;

function tick() {
  if (FORCE_PHASE !== null) {
    setPhase(FORCE_PHASE);
    return;
  }

  const now = new Date();

  if (now < getTargetTime()) {
    setPhase(0);
    const totalSeconds = Math.floor((getTargetTime() - now) / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    els.hours.textContent = String(h).padStart(2, "0");
    els.minutes.textContent = String(m).padStart(2, "0");
    els.seconds.textContent = String(s).padStart(2, "0");
  } else if (now < getWandelTime()) {
    setPhase(1);
  } else {
    setPhase(2);
  }
}

function setPhase(phase) {
  if (phase === currentPhase) return;
  currentPhase = phase;

  if (phase === 0) {
    els.countdown.classList.remove("hidden");
    els.wandel.classList.add("hidden");
    els.phrase.classList.remove("hidden");
    switchPhraseList(PHRASES, true);
    return;
  }

  // ab 16 Uhr: Countdown weicht dem Wandel-Text mit Sanduhr
  els.countdown.classList.add("hidden");
  els.wandel.classList.remove("hidden");
  // die Sanduhr bleibt in beiden Phasen stehen, nur der Text wechselt
  setTextWithDots(els.wandelText, phase === 1 ? TEXT_WANDEL_NAHT : TEXT_WANDEL_DA);

  if (phase === 1) {
    // 16–17 Uhr: keine Sätze unter dem Ring
    els.phrase.classList.add("hidden");
  } else {
    // ab 17 Uhr: die Danach-Sätze rotieren unter dem Ring, Punkte statisch
    els.phrase.classList.remove("hidden");
    switchPhraseList(PHRASES_DANACH, false);
  }
}

// ---------- Start: Countdown läuft sofort los ----------
// (ganz am Ende, damit alle Variablen initialisiert sind)

startPhrases();
tick();
setInterval(tick, 1000);

// Musik direkt versuchen — Browser blockieren Autoplay meist,
// dann bleibt der Sound-Button auf "aus" und ein Klick startet sie.
els.music.volume = 0.5;
els.music
  .play()
  .then(() => setSoundIcon(true))
  .catch(() => setSoundIcon(false));
