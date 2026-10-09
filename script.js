"use strict";

(() => {
  const $ = (id) => document.getElementById(id);
  const STORAGE_KEY = "glowdown-state-v1";
  const THEMES = new Set(["aurora", "sunset", "ocean", "citrus", "flip"]);
  const MAX_SECONDS = 9999 * 86400 + 9999 * 3600 + 9999 * 60 + 9999;
  const presetButtons = [...document.querySelectorAll(".preset")];
  const themeButtons = [...document.querySelectorAll(".theme-option")];
  const parts = [$("daysValue"), $("hoursValue"), $("minutesValue"), $("secondsValue")];
  const startButton = $("startButton");
  const startText = $("startButtonText");
  const startIcon = $("startIcon");
  const soundToggle = $("soundToggle");
  const notificationToggle = $("notificationToggle");
  const wakeToggle = $("wakeToggle");
  const defaultState = {
    duration: 1800,
    remainingMs: 1800 * 1000,
    targetTime: null,
    status: "ready",
    label: "30 minute focus",
    selectedPreset: "1800:30 min",
    theme: "aurora",
    sound: true,
    notification: false,
    wake: false
  };
  let state = { ...defaultState };
  let ticker = null;
  let wakeLock = null;
  let audioContext = null;
  let completionHandled = false;

  function restore() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!saved || typeof saved !== "object") return;
      const duration = Number(saved.duration);
      if (!Number.isSafeInteger(duration) || duration < 1 || duration > MAX_SECONDS) return;
      state = {
        ...state,
        duration,
        remainingMs: Number.isFinite(saved.remainingMs) ? Math.min(duration * 1000, Math.max(0, saved.remainingMs)) : duration * 1000,
        targetTime: Number.isFinite(saved.targetTime) ? saved.targetTime : null,
        status: ["ready", "running", "paused", "complete"].includes(saved.status) ? saved.status : "ready",
        label: typeof saved.label === "string" ? saved.label.slice(0, 45) : defaultState.label,
        selectedPreset: typeof saved.selectedPreset === "string" ? saved.selectedPreset : "",
        theme: THEMES.has(saved.theme) ? saved.theme : "aurora",
        sound: saved.sound !== false,
        notification: saved.notification === true,
        wake: saved.wake === true
      };
      if (state.status === "running") {
        if (state.targetTime === null) {
          state.status = "paused";
        } else {
          state.remainingMs = Math.max(0, state.targetTime - Date.now());
          if (state.remainingMs === 0) {
            state.status = "complete";
            completionHandled = true; // No unexpected sound on page reload.
          }
        }
      }
    } catch (_) {
      // Blocked storage/corrupted data should never prevent the timer working.
    }
  }

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) { /* private mode */ }
  }

  function formatClock(milliseconds) {
    // CEIL means "1" displays until its full last second has elapsed.
    const secondsLeft = Math.ceil(Math.max(0, milliseconds) / 1000);
    const days = Math.floor(secondsLeft / 86400);
    const hours = Math.floor((secondsLeft % 86400) / 3600);
    const minutes = Math.floor((secondsLeft % 3600) / 60);
    const seconds = secondsLeft % 60;
    return [days, hours, minutes, seconds].map(value => String(value).padStart(2, "0"));
  }

  // The fifth theme draws genuine, individually split number cards. Short
  // durations only show the necessary groups, like the two-card reference image.
  let flipSignature = "";
  function updateFlipClock(values) {
    const flip = $("flipDisplay");
    const groupCount = state.duration < 60 ? 1 : state.duration < 3600 ? 2 : state.duration < 86400 ? 3 : 4;
    const selected = values.slice(-groupCount);
    const labels = ["DAYS", "HOURS", "MINUTES", "SECONDS"].slice(-groupCount);
    const signature = `${groupCount}:${selected.map(value => value.length).join("-")}`;
    if (signature !== flipSignature) {
      flipSignature = signature;
      const fragment = document.createDocumentFragment();
      selected.forEach((number, index) => {
        if (index > 0) {
          const separator = document.createElement("span");
          separator.className = "flip-separator";
          separator.textContent = ":";
          separator.setAttribute("aria-hidden", "true");
          fragment.appendChild(separator);
        }
        const group = document.createElement("div");
        group.className = "flip-group";
        const cards = document.createElement("div");
        cards.className = "flip-cards";
        for (const digit of number) {
          const card = document.createElement("span");
          card.className = "flip-card";
          card.setAttribute("aria-hidden", "true");
          const glyph = document.createElement("span");
          glyph.className = "flip-digit";
          glyph.textContent = digit;
          card.appendChild(glyph);
          cards.appendChild(card);
        }
        const label = document.createElement("span");
        label.className = "flip-group-label";
        label.textContent = labels[index];
        group.append(cards, label);
        fragment.appendChild(group);
      });
      flip.replaceChildren(fragment);
      flip.dataset.groups = String(groupCount);
      flip.dataset.digits = String(selected.join("").length);
    } else {
      const glyphs = flip.querySelectorAll(".flip-digit");
      let i = 0;
      for (const digit of selected.join("")) {
        const node = glyphs[i++];
        if (node && node.textContent !== digit) {
          node.textContent = digit;
          const card = node.parentElement;
          card.classList.remove("flip-change");
          // Re-trigger the modest mechanical snap only on changed digits.
          void card.offsetWidth;
          card.classList.add("flip-change");
        }
      }
    }
    const accessible = selected.map((value, index) => `${Number(value)} ${labels[index].toLowerCase()}`).join(", ");
    flip.setAttribute("aria-label", accessible + " remaining");
  }

  function endTimeLabel() {
    if (state.status === "ready") return "Set your pace";
    if (state.status === "complete") return "You did it!";
    if (state.status === "paused") return "Your timer is on hold";
    const end = new Date(state.targetTime);
    const time = end.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
    const today = new Date();
    const sameDay = end.toDateString() === today.toDateString();
    return `Ends ${sameDay ? "today" : "on " + end.toLocaleDateString(undefined, { month: "short", day: "numeric" })} at ${time}`;
  }

  function updateUI() {
    const values = formatClock(state.remainingMs);
    document.body.classList.toggle("many-days", values[0].length >= 3);
    document.body.classList.toggle("very-many-days", values[0].length >= 4);
    for (let i = 0; i < parts.length; i++) parts[i].textContent = values[i];
    updateFlipClock(values);
    $("sessionTitle").textContent = state.label || "Your custom countdown";
    $("statePill").dataset.status = state.status;
    const labels = { ready: "READY TO GO", running: "COUNTING DOWN", paused: "PAUSED", complete: "TIME IS UP!" };
    $("stateText").textContent = labels[state.status];
    const subtitles = {
      ready: "A fresh start is one click away.",
      running: "Keep going, you've got this ✦",
      paused: "No rush. Pick up whenever you're ready.",
      complete: "Time's up! Take a moment and celebrate 🎉"
    };
    $("timerSubtitle").textContent = subtitles[state.status];
    $("endTimeText").textContent = endTimeLabel();
    const progress = state.duration ? Math.min(100, Math.max(0, (1 - state.remainingMs / (state.duration * 1000)) * 100)) : 0;
    $("progressFill").style.width = `${progress}%`;
    $("progressText").textContent = `${Math.floor(progress)}%`;
    $("progressTrack").setAttribute("aria-valuenow", String(Math.round(progress)));
    if (state.status === "running") {
      startText.textContent = "Pause timer";
      startIcon.innerHTML = '<path d="M7 5h3v14H7zM14 5h3v14h-3z"/>';
    } else {
      startText.textContent = state.status === "paused" ? "Resume timer" : state.status === "complete" ? "Start again" : "Start timer";
      startIcon.innerHTML = '<path d="M8 5.2a1 1 0 0 1 1.5-.87l10 6.8a1.05 1.05 0 0 1 0 1.74l-10 6.8A1 1 0 0 1 8 18.8z"/>';
    }
    for (const button of presetButtons) {
      const selected = state.selectedPreset === `${button.dataset.seconds}:${button.textContent.trim()}`;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-pressed", String(selected));
    }
    document.title = state.status === "running" ? `${values.join(":")} · Glowdown` : "Glowdown — Your beautiful countdown timer";
  }

  function announce(message) { $("announcer").textContent = message; }

  function stopTick() { if (ticker !== null) { clearInterval(ticker); ticker = null; } }

  async function releaseWakeLock() {
    if (!wakeLock) return;
    try { await wakeLock.release(); } catch (_) { /* already released */ }
    wakeLock = null;
  }

  async function acquireWakeLock() {
    if (!state.wake || state.status !== "running" || document.visibilityState !== "visible" || !("wakeLock" in navigator)) return;
    if (wakeLock) return;
    try {
      wakeLock = await navigator.wakeLock.request("screen");
      wakeLock.addEventListener("release", () => { wakeLock = null; });
    } catch (_) { /* browser/device may refuse wake lock */ }
  }

  function prepareAudio() {
    if (!state.sound) return;
    try {
      const Constructor = window.AudioContext || window.webkitAudioContext;
      if (Constructor && !audioContext) audioContext = new Constructor();
      if (audioContext && audioContext.state === "suspended") audioContext.resume().catch(() => {});
    } catch (_) { /* not supported */ }
  }

  function playFinishSound() {
    if (!state.sound || !audioContext) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      const now = audioContext.currentTime;
      notes.forEach((frequency, index) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.type = "sine";
        osc.frequency.value = frequency;
        gain.gain.setValueAtTime(.0001, now + index * .16);
        gain.gain.exponentialRampToValueAtTime(.13, now + index * .16 + .025);
        gain.gain.exponentialRampToValueAtTime(.0001, now + index * .16 + .48);
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.start(now + index * .16);
        osc.stop(now + index * .16 + .5);
      });
    } catch (_) { /* browser may block audio */ }
  }

  function sendNotification() {
    if (!state.notification || !("Notification" in window) || Notification.permission !== "granted") return;
    try { new Notification("Glowdown — Time is up! 🎉", { body: `${state.label} is complete.`, icon: "favicon.svg", tag: "glowdown-done" }); }
    catch (_) { /* some platforms require a service worker */ }
  }

  function confetti() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const burst = $("completionBurst");
    burst.replaceChildren();
    const colors = ["#ad87ff", "#66e6dd", "#ff8bc8", "#ffe39e", "#ffffff"];
    for (let i = 0; i < 34; i++) {
      const piece = document.createElement("span");
      piece.className = "confetti";
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.background = colors[i % colors.length];
      piece.style.animationDelay = `${Math.random() * .55}s`;
      piece.style.setProperty("--drift", `${Math.random() * 320 - 160}px`);
      piece.style.setProperty("--spin", `${Math.random() * 1100 - 550}deg`);
      burst.appendChild(piece);
    }
    setTimeout(() => burst.replaceChildren(), 4500);
  }

  function finish() {
    if (state.status === "complete") return;
    stopTick();
    state.remainingMs = 0;
    state.status = "complete";
    state.targetTime = null;
    save();
    updateUI();
    releaseWakeLock();
    if (!completionHandled) {
      completionHandled = true;
      playFinishSound();
      sendNotification();
      confetti();
      announce(`${state.label}: time is up!`);
    }
  }

  function tick() {
    if (state.status !== "running") return;
    state.remainingMs = Math.max(0, state.targetTime - Date.now());
    if (state.remainingMs <= 0) { finish(); return; }
    updateUI();
    // Only save periodically: end timestamp persists already and stays correct through tab suspension.
  }

  function start() {
    if (state.status === "running") return;
    if (state.status === "complete") state.remainingMs = state.duration * 1000;
    if (state.remainingMs <= 0) state.remainingMs = state.duration * 1000;
    completionHandled = false;
    state.status = "running";
    state.targetTime = Date.now() + state.remainingMs;
    save();
    prepareAudio();
    stopTick();
    ticker = setInterval(tick, 100);
    acquireWakeLock();
    updateUI();
    announce("Countdown started");
  }

  function pause() {
    if (state.status !== "running") return;
    state.remainingMs = Math.max(0, state.targetTime - Date.now());
    if (state.remainingMs === 0) { finish(); return; }
    state.status = "paused";
    state.targetTime = null;
    stopTick();
    releaseWakeLock();
    save();
    updateUI();
    announce("Countdown paused");
  }

  function startOrPause() { state.status === "running" ? pause() : start(); }

  function restart() {
    stopTick();
    releaseWakeLock();
    completionHandled = false;
    state.status = "ready";
    state.remainingMs = state.duration * 1000;
    state.targetTime = null;
    $("completionBurst").replaceChildren();
    save();
    updateUI();
    announce("Timer reset to the selected duration");
  }

  function setDuration(seconds, label, presetKey = "") {
    if (!Number.isSafeInteger(seconds) || seconds < 1 || seconds > MAX_SECONDS) return;
    state.duration = seconds;
    state.label = label;
    state.selectedPreset = presetKey;
    restart();
    announce(`${label} selected. Press Start timer to begin.`);
  }

  function useTheme(theme) {
    if (!THEMES.has(theme)) return;
    state.theme = theme;
    document.body.dataset.theme = theme;
    $("flipDisplay").hidden = theme !== "flip";
    document.querySelector('.time-display').setAttribute('aria-hidden', String(theme === "flip"));
    themeButtons.forEach(button => {
      const selected = button.dataset.themeChoice === theme;
      button.classList.toggle("selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    save();
  }

  async function toggleFocus(force) {
    const enable = force === undefined ? !document.body.classList.contains("focus-mode") : force;
    document.body.classList.toggle("focus-mode", enable);
    $("focusButtonText").textContent = enable ? "Exit focus" : "Focus mode";
    $("focusButton").setAttribute("aria-label", enable ? "Exit fullscreen focus mode" : "Enter fullscreen focus mode");
    try {
      if (enable && !document.fullscreenElement && document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
      if (!enable && document.fullscreenElement && document.exitFullscreen) await document.exitFullscreen();
    } catch (_) {
      // Focus CSS is still usable if fullscreen permission/API is unavailable.
    }
    announce(enable ? "Focus mode on. Press F or Escape to exit." : "Focus mode off");
  }

  restore();
  useTheme(state.theme);
  soundToggle.checked = state.sound;
  notificationToggle.checked = state.notification;
  wakeToggle.checked = state.wake;
  if (!("wakeLock" in navigator)) {
    wakeToggle.disabled = true;
    wakeToggle.checked = false;
    wakeToggle.closest(".toggle-row").querySelector("small").textContent = "Not supported on this browser";
  }
  updateUI();
  if (state.status === "running") {
    ticker = setInterval(tick, 100);
    acquireWakeLock();
  }

  startButton.addEventListener("click", startOrPause);
  $("restartButton").addEventListener("click", restart);
  $("focusButton").addEventListener("click", () => toggleFocus());
  presetButtons.forEach(button => button.addEventListener("click", () => {
    setDuration(Number(button.dataset.seconds), button.dataset.label, `${button.dataset.seconds}:${button.textContent.trim()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }));
  $("customForm").addEventListener("submit", event => {
    event.preventDefault();
    const error = $("formError");
    const values = [$("customDays"), $("customHours"), $("customMinutes"), $("customSeconds")].map(el => Number(el.value));
    const valid = values.every(n => Number.isSafeInteger(n) && n >= 0 && n <= 9999);
    const seconds = values[0] * 86400 + values[1] * 3600 + values[2] * 60 + values[3];
    if (!valid || !Number.isSafeInteger(seconds) || seconds < 1 || seconds > MAX_SECONDS) {
      error.textContent = "Enter a valid duration of at least 1 second. Each field must be between 0 and 9,999.";
      error.hidden = false;
      return;
    }
    error.hidden = true;
    const name = $("customName").value.trim();
    setDuration(seconds, name || "My custom countdown");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  themeButtons.forEach(button => button.addEventListener("click", () => useTheme(button.dataset.themeChoice)));
  soundToggle.addEventListener("change", () => { state.sound = soundToggle.checked; save(); if (state.sound) prepareAudio(); });
  notificationToggle.addEventListener("change", async () => {
    if (notificationToggle.checked) {
      if (!("Notification" in window)) {
        notificationToggle.checked = false;
        announce("This browser does not support notifications.");
      } else if (Notification.permission !== "granted") {
        try {
          const permission = await Notification.requestPermission();
          notificationToggle.checked = permission === "granted";
        } catch (_) { notificationToggle.checked = false; }
      }
    }
    state.notification = notificationToggle.checked;
    save();
  });
  wakeToggle.addEventListener("change", () => {
    state.wake = wakeToggle.checked;
    save();
    state.wake ? acquireWakeLock() : releaseWakeLock();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") { tick(); acquireWakeLock(); }
    else releaseWakeLock();
  });
  document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement && document.body.classList.contains("focus-mode")) {
      document.body.classList.remove("focus-mode");
      $("focusButtonText").textContent = "Focus mode";
      $("focusButton").setAttribute("aria-label", "Enter fullscreen focus mode");
    }
  });
  document.addEventListener("keydown", event => {
    const tag = document.activeElement?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.code === "Space" && tag !== "BUTTON") { event.preventDefault(); startOrPause(); }
    else if (event.code === "KeyR") { event.preventDefault(); restart(); }
    else if (event.code === "KeyF") { event.preventDefault(); toggleFocus(); }
    else if (event.code === "Escape" && document.body.classList.contains("focus-mode")) toggleFocus(false);
  });

  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    window.addEventListener("load", () => navigator.serviceWorker.register("./service-worker.js").catch(() => {}));
  }
})();
