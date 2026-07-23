// ========================== EINSTELLUNGEN ==========================

// Zielzeit: heute um 16:00 Uhr
const TARGET_HOUR = 16;
const TARGET_MINUTE = 0;

// Sätze, die über dem Countdown rotieren
const PHRASES = [
  "Gleich ist es so weit …",
  "Nur noch ein kleines bisschen Geduld.",
  "Die Spannung steigt!",
  "Um 16 Uhr geht's los.",
  "Halte durch, es lohnt sich!",
];

// Wie lange jeder Satz angezeigt wird (in Millisekunden)
const PHRASE_INTERVAL = 5000;

// Was um 16:00 Uhr passiert
const FINALE_MESSAGE = "🎉 Es ist 16 Uhr! 🎉";

// ====================================================================

const els = {
  content: document.getElementById("content"),
  phrase: document.getElementById("phrase"),
  hours: document.getElementById("hours"),
  minutes: document.getElementById("minutes"),
  seconds: document.getElementById("seconds"),
  finale: document.getElementById("finale"),
  finaleMessage: document.getElementById("finale-message"),
  confetti: document.getElementById("confetti"),
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

// ---------- Start: Countdown läuft sofort los ----------

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

// ---------- Sound an/aus ----------

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

// ---------- Rotierende Sätze ----------

function startPhrases() {
  let index = 0;
  els.phrase.textContent = PHRASES[index];

  setInterval(() => {
    els.phrase.classList.add("fade-out");
    setTimeout(() => {
      index = (index + 1) % PHRASES.length;
      els.phrase.textContent = PHRASES[index];
      els.phrase.classList.remove("fade-out");
    }, 800); // muss zur CSS-Transition passen
  }, PHRASE_INTERVAL);
}

// ---------- Countdown ----------

let finaleStarted = false;

function tick() {
  const diff = getTargetTime() - new Date();

  if (diff <= 0) {
    if (!finaleStarted) startFinale();
    return;
  }

  const totalSeconds = Math.floor(diff / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  els.hours.textContent = String(h).padStart(2, "0");
  els.minutes.textContent = String(m).padStart(2, "0");
  els.seconds.textContent = String(s).padStart(2, "0");
}

// ---------- Finale um 16:00 Uhr ----------

function startFinale() {
  finaleStarted = true;
  els.content.classList.add("hidden");
  els.finaleMessage.textContent = FINALE_MESSAGE;
  els.finale.classList.remove("hidden");
  startConfetti();
}

// ---------- Konfetti ----------

function startConfetti() {
  const canvas = els.confetti;
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });

  const colors = ["#9fd8ff", "#4da3ff", "#ffd700", "#00e5ff", "#ffffff", "#1d5fa8"];
  const particles = Array.from({ length: 180 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height - canvas.height,
    size: Math.random() * 8 + 4,
    color: colors[Math.floor(Math.random() * colors.length)],
    speedY: Math.random() * 3 + 2,
    speedX: Math.random() * 2 - 1,
    rotation: Math.random() * 360,
    rotationSpeed: Math.random() * 10 - 5,
  }));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of particles) {
      p.y += p.speedY;
      p.x += p.speedX;
      p.rotation += p.rotationSpeed;
      if (p.y > canvas.height + 20) {
        p.y = -20;
        p.x = Math.random() * canvas.width;
      }
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    }
    requestAnimationFrame(draw);
  }

  draw();
}
