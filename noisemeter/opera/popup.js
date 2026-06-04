(function () {
  "use strict";

  const browserApi = typeof browser !== "undefined" ? browser : (typeof chrome !== "undefined" ? chrome : null);

  const LINKS = {
    web: "https://pickheadphones.com/tools/sound-meter/",
    privacy: "https://pickheadphones.com/privacy-policy/",
    terms: "https://pickheadphones.com/terms/",
    ios: "https://apps.apple.com/app/id6767616413"
  };

  // dB estimation constants — mirror of the pickheadphones.com sound-meter.
  const MIN_DB = 30;
  const MAX_DB = 100;
  const CALIBRATION_OFFSET = 95;
  const SMOOTHING_FACTOR = 0.18;

  const COPY = {
    en: {
      eyebrow: "Sound meter",
      title: "HowLoud",
      unsupported: "Your browser does not support real-time microphone measurement.",
      currentLabel: "Current estimate",
      noiseZone: "Noise zone",
      zVeryQuiet: "Very Quiet",
      zQuiet: "Quiet",
      zModerate: "Moderate",
      zLoud: "Loud",
      zVeryLoud: "Very Loud",
      min: "Min",
      avg: "Avg",
      max: "Max",
      start: "Start",
      stop: "Stop",
      reset: "Reset",
      grantAccess: "Open microphone permission page",
      disclaimer: "Approximate estimate from your device microphone — not a certified acoustic measurement.",
      noStore: "🔒 No audio is recorded or stored. Everything runs locally on your device.",
      openOnWeb: "Open on the web",
      privacy: "Privacy",
      terms: "Terms",
      getOn: "Get it on",
      soon: "soon",
      statuses: {
        idle: "Idle",
        measuring: "Measuring",
        stopped: "Stopped",
        denied: "Permission denied",
        unsupported: "Unsupported",
        error: "Unavailable"
      },
      messages: {
        idle: "Press Start and allow microphone access to estimate the sound level around you.",
        measuring: "The microphone is active and the estimated level is updating in real time.",
        stopped: "Measurement stopped. You can start again or reset the session stats.",
        denied: "Microphone access was blocked. Open the permission page to allow it once, then reopen the meter.",
        unsupported: "Your browser does not support real-time microphone measurement.",
        error: "The microphone could not be started on this device."
      }
    },
    de: {
      eyebrow: "Schallpegel",
      title: "HowLoud",
      unsupported: "Dein Browser unterstützt keine Echtzeit-Messung über das Mikrofon.",
      currentLabel: "Aktuelle Schätzung",
      noiseZone: "Lärmzone",
      zVeryQuiet: "Sehr leise",
      zQuiet: "Leise",
      zModerate: "Moderat",
      zLoud: "Laut",
      zVeryLoud: "Sehr laut",
      min: "Min",
      avg: "Mittel",
      max: "Max",
      start: "Start",
      stop: "Stopp",
      reset: "Zurücksetzen",
      grantAccess: "Seite für Mikrofon-Erlaubnis öffnen",
      disclaimer: "Ungefähre Schätzung über das Gerätemikrofon — keine zertifizierte Messung.",
      noStore: "🔒 Es wird kein Ton aufgenommen oder gespeichert. Alles läuft lokal auf deinem Gerät.",
      openOnWeb: "Im Browser öffnen",
      privacy: "Datenschutz",
      terms: "AGB",
      getOn: "Laden im",
      soon: "bald",
      statuses: {
        idle: "Bereit",
        measuring: "Misst",
        stopped: "Gestoppt",
        denied: "Mikrofon blockiert",
        unsupported: "Nicht unterstützt",
        error: "Nicht verfügbar"
      },
      messages: {
        idle: "Drücke auf Start und erlaube den Mikrofonzugriff, um den Umgebungspegel zu schätzen.",
        measuring: "Das Mikrofon ist aktiv und der geschätzte Pegel wird in Echtzeit aktualisiert.",
        stopped: "Messung gestoppt. Du kannst erneut starten oder die Sitzungswerte zurücksetzen.",
        denied: "Der Mikrofonzugriff wurde blockiert. Öffne die Erlaubnis-Seite, erlaube es einmal und öffne den Messer erneut.",
        unsupported: "Dein Browser unterstützt keine Echtzeit-Messung über das Mikrofon.",
        error: "Das Mikrofon konnte auf diesem Gerät nicht gestartet werden."
      }
    },
    ru: {
      eyebrow: "Шумомер",
      title: "HowLoud",
      unsupported: "Ваш браузер не поддерживает измерение через микрофон в реальном времени.",
      currentLabel: "Текущая оценка",
      noiseZone: "Зона шума",
      zVeryQuiet: "Очень тихо",
      zQuiet: "Тихо",
      zModerate: "Умеренно",
      zLoud: "Шумно",
      zVeryLoud: "Очень шумно",
      min: "Мин",
      avg: "Сред",
      max: "Макс",
      start: "Старт",
      stop: "Стоп",
      reset: "Сброс",
      grantAccess: "Открыть страницу доступа к микрофону",
      disclaimer: "Приблизительная оценка по микрофону устройства — не измерительный прибор.",
      noStore: "🔒 Звук не записывается и не сохраняется. Всё считается локально на вашем устройстве.",
      openOnWeb: "Открыть на сайте",
      privacy: "Конфиденциальность",
      terms: "Условия",
      getOn: "Доступно в",
      soon: "скоро",
      statuses: {
        idle: "Готово",
        measuring: "Идёт измерение",
        stopped: "Остановлено",
        denied: "Доступ запрещён",
        unsupported: "Не поддерживается",
        error: "Недоступно"
      },
      messages: {
        idle: "Нажмите «Старт» и разрешите доступ к микрофону, чтобы оценить уровень шума вокруг.",
        measuring: "Микрофон активен, примерный уровень обновляется в реальном времени.",
        stopped: "Измерение остановлено. Можно начать заново или сбросить статистику сессии.",
        denied: "Доступ к микрофону заблокирован. Откройте страницу доступа, разрешите один раз и откройте шумомер снова.",
        unsupported: "Ваш браузер не поддерживает измерение через микрофон в реальном времени.",
        error: "На этом устройстве не удалось запустить микрофон."
      }
    }
  };

  function pickLocale() {
    const lang = (navigator.language || "en").slice(0, 2).toLowerCase();
    return COPY[lang] ? lang : "en";
  }

  const copy = COPY[pickLocale()];
  const NOT_AVAILABLE = "--";

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function zoneFor(db) {
    if (db < 35) return "very-quiet";
    if (db <= 50) return "quiet";
    if (db <= 65) return "moderate";
    if (db <= 80) return "loud";
    return "very-loud";
  }

  function formatDb(value) {
    if (typeof value !== "number" || Number.isNaN(value)) return NOT_AVAILABLE;
    return `${value.toFixed(1)} dB`;
  }

  function formatDbNumber(value) {
    if (typeof value !== "number" || Number.isNaN(value)) return NOT_AVAILABLE;
    return value.toFixed(1);
  }

  function openUrl(url) {
    if (browserApi && browserApi.tabs && browserApi.tabs.create) {
      browserApi.tabs.create({ url });
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function applyStaticCopy(root) {
    const zoneNames = {
      "very-quiet": copy.zVeryQuiet,
      quiet: copy.zQuiet,
      moderate: copy.zModerate,
      loud: copy.zLoud,
      "very-loud": copy.zVeryLoud
    };
    root.querySelectorAll("[data-copy]").forEach((node) => {
      const key = node.getAttribute("data-copy");
      if (copy[key]) node.textContent = copy[key];
    });
    return zoneNames;
  }

  document.addEventListener("DOMContentLoaded", () => {
    const root = document.querySelector("[data-sound-meter]");
    if (!root) return;

    const zoneNames = applyStaticCopy(root);

    const currentValue = root.querySelector("[data-meter-current]");
    const currentLabelNode = root.querySelector("[data-meter-current-label]");
    const statusNode = root.querySelector("[data-meter-status]");
    const messageNode = root.querySelector("[data-meter-message]");
    const zoneNode = root.querySelector("[data-meter-zone]");
    const zoneValueNode = root.querySelector("[data-meter-zone-value]");
    const gaugeFill = root.querySelector("[data-meter-fill]");
    const minNode = root.querySelector("[data-meter-min]");
    const avgNode = root.querySelector("[data-meter-avg]");
    const maxNode = root.querySelector("[data-meter-max]");
    const startButton = root.querySelector("[data-meter-start]");
    const stopButton = root.querySelector("[data-meter-stop]");
    const resetButton = root.querySelector("[data-meter-reset]");
    const unsupportedNode = root.querySelector("[data-meter-unsupported]");
    const permissionCta = root.querySelector("[data-meter-permission-cta]");

    // Wire footer links.
    root.querySelectorAll("[data-link]").forEach((node) => {
      const target = LINKS[node.getAttribute("data-link")];
      if (!target) return;
      node.setAttribute("href", target);
      node.addEventListener("click", (event) => {
        event.preventDefault();
        openUrl(target);
      });
    });

    if (currentLabelNode) currentLabelNode.textContent = copy.currentLabel;

    const state = {
      status: "idle",
      current: null,
      min: null,
      max: null,
      avg: null,
      total: 0,
      count: 0,
      smoothedDb: null,
      rafId: 0,
      stream: null,
      source: null,
      analyser: null,
      audioContext: null,
      buffer: null
    };

    function isSupported() {
      return Boolean(
        (window.AudioContext || window.webkitAudioContext) &&
        navigator.mediaDevices &&
        typeof navigator.mediaDevices.getUserMedia === "function"
      );
    }

    function updateButtons() {
      const measuring = state.status === "measuring";
      startButton.disabled = measuring || state.status === "unsupported";
      stopButton.disabled = !measuring;
      permissionCta.hidden = state.status !== "denied";
    }

    function updateZone(db) {
      if (typeof db !== "number") {
        zoneNode.dataset.zone = "quiet";
        zoneValueNode.textContent = NOT_AVAILABLE;
        return;
      }
      const zone = zoneFor(db);
      zoneNode.dataset.zone = zone;
      zoneValueNode.textContent = zoneNames[zone];
    }

    function render() {
      currentValue.textContent = formatDbNumber(state.current);
      minNode.textContent = formatDb(state.min);
      avgNode.textContent = formatDb(state.avg);
      maxNode.textContent = formatDb(state.max);
      statusNode.textContent = copy.statuses[state.status];
      statusNode.dataset.tone = state.status === "measuring"
        ? "warn"
        : (state.status === "denied" || state.status === "unsupported" || state.status === "error" ? "alert" : "idle");
      messageNode.textContent = copy.messages[state.status];
      updateZone(state.current);

      const percent = typeof state.current === "number"
        ? ((clamp(state.current, MIN_DB, MAX_DB) - MIN_DB) / (MAX_DB - MIN_DB)) * 100
        : 0;
      gaugeFill.style.width = `${percent}%`;
      updateButtons();
    }

    function resetStats() {
      state.current = null;
      state.min = null;
      state.max = null;
      state.avg = null;
      state.total = 0;
      state.count = 0;
      state.smoothedDb = null;
    }

    async function teardownAudio() {
      if (state.rafId) {
        cancelAnimationFrame(state.rafId);
        state.rafId = 0;
      }
      if (state.source) {
        try { state.source.disconnect(); } catch (error) { /* ignore */ }
        state.source = null;
      }
      if (state.stream) {
        state.stream.getTracks().forEach((track) => track.stop());
        state.stream = null;
      }
      if (state.audioContext) {
        try { await state.audioContext.close(); } catch (error) { /* ignore */ }
        state.audioContext = null;
      }
      state.analyser = null;
      state.buffer = null;
    }

    function updateStats(db) {
      state.current = db;
      state.min = state.min === null ? db : Math.min(state.min, db);
      state.max = state.max === null ? db : Math.max(state.max, db);
      state.total += db;
      state.count += 1;
      state.avg = state.total / state.count;
    }

    function sampleRms() {
      if (state.analyser.getFloatTimeDomainData) {
        state.analyser.getFloatTimeDomainData(state.buffer);
        let sum = 0;
        for (let index = 0; index < state.buffer.length; index += 1) {
          const value = state.buffer[index];
          sum += value * value;
        }
        return Math.sqrt(sum / state.buffer.length);
      }
      const byteBuffer = state.buffer;
      state.analyser.getByteTimeDomainData(byteBuffer);
      let sum = 0;
      for (let index = 0; index < byteBuffer.length; index += 1) {
        const value = (byteBuffer[index] - 128) / 128;
        sum += value * value;
      }
      return Math.sqrt(sum / byteBuffer.length);
    }

    function estimateDb(rms) {
      if (!rms || Number.isNaN(rms)) return MIN_DB;
      const dbfs = 20 * Math.log10(Math.max(rms, 1e-7));
      const estimated = clamp(dbfs + CALIBRATION_OFFSET, MIN_DB, MAX_DB);
      state.smoothedDb = state.smoothedDb === null
        ? estimated
        : state.smoothedDb * (1 - SMOOTHING_FACTOR) + estimated * SMOOTHING_FACTOR;
      return state.smoothedDb;
    }

    function tick() {
      if (state.status !== "measuring" || !state.analyser) return;
      const rms = sampleRms();
      const db = estimateDb(rms);
      updateStats(db);
      render();
      state.rafId = requestAnimationFrame(tick);
    }

    async function startMeasurement() {
      if (!isSupported()) {
        state.status = "unsupported";
        unsupportedNode.hidden = false;
        render();
        return;
      }
      unsupportedNode.hidden = true;

      try {
        await teardownAudio();
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        state.audioContext = new AudioContextClass();
        if (state.audioContext.state === "suspended") {
          await state.audioContext.resume();
        }

        state.stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false
          }
        });

        state.source = state.audioContext.createMediaStreamSource(state.stream);
        state.analyser = state.audioContext.createAnalyser();
        state.analyser.fftSize = 2048;
        state.analyser.smoothingTimeConstant = 0.85;
        state.source.connect(state.analyser);
        state.buffer = state.analyser.getFloatTimeDomainData
          ? new Float32Array(state.analyser.fftSize)
          : new Uint8Array(state.analyser.fftSize);

        state.status = "measuring";
        render();
        tick();
      } catch (error) {
        await teardownAudio();
        const denied = error && (error.name === "NotAllowedError" || error.name === "SecurityError");
        state.status = denied ? "denied" : "error";
        render();
      }
    }

    async function stopMeasurement() {
      await teardownAudio();
      if (state.current !== null || state.min !== null || state.max !== null) {
        state.status = "stopped";
      } else {
        state.status = "idle";
      }
      render();
    }

    async function resetMeasurement() {
      await teardownAudio();
      resetStats();
      state.status = isSupported() ? "idle" : "unsupported";
      unsupportedNode.hidden = isSupported();
      render();
    }

    startButton.addEventListener("click", () => { startMeasurement(); });
    stopButton.addEventListener("click", () => { stopMeasurement(); });
    resetButton.addEventListener("click", () => { resetMeasurement(); });

    // Variant A fallback: the first mic grant inside a popup is unreliable
    // (the popup loses focus when the prompt appears). Open a dedicated tab
    // that requests the permission once; afterwards the popup works silently.
    permissionCta.addEventListener("click", () => {
      const permissionUrl = browserApi && browserApi.runtime && browserApi.runtime.getURL
        ? browserApi.runtime.getURL("permission.html")
        : "permission.html";
      openUrl(permissionUrl);
    });

    window.addEventListener("pagehide", () => { teardownAudio(); });

    if (!isSupported()) {
      state.status = "unsupported";
      unsupportedNode.hidden = false;
    }

    render();
  });
})();
