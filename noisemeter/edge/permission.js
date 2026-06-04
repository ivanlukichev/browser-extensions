(function () {
  "use strict";

  const COPY = {
    en: {
      permTitle: "Allow microphone access",
      permBody: "HowLoud needs one-time permission to read your microphone so it can estimate the sound level. No audio is ever recorded or stored — everything runs locally.",
      permGrant: "Allow microphone",
      permAfter: "After allowing, close this tab and open the HowLoud meter again from the toolbar.",
      working: "Requesting access…",
      ok: "✓ Microphone access granted. You can close this tab.",
      denied: "Access was blocked. Click the camera/mic icon in the address bar to allow it, then try again.",
      error: "The microphone could not be started on this device."
    },
    de: {
      permTitle: "Mikrofonzugriff erlauben",
      permBody: "HowLoud braucht einmalig die Erlaubnis, dein Mikrofon zu lesen, um den Schallpegel zu schätzen. Es wird kein Ton aufgenommen oder gespeichert — alles läuft lokal.",
      permGrant: "Mikrofon erlauben",
      permAfter: "Schließe danach diesen Tab und öffne den HowLoud-Messer erneut über die Symbolleiste.",
      working: "Zugriff wird angefragt…",
      ok: "✓ Mikrofonzugriff erteilt. Du kannst diesen Tab schließen.",
      denied: "Zugriff wurde blockiert. Klicke auf das Kamera/Mikrofon-Symbol in der Adressleiste, erlaube es und versuche es erneut.",
      error: "Das Mikrofon konnte auf diesem Gerät nicht gestartet werden."
    },
    ru: {
      permTitle: "Разрешите доступ к микрофону",
      permBody: "HowLoud нужен разовый доступ к микрофону, чтобы оценивать уровень шума. Звук не записывается и не сохраняется — всё считается локально.",
      permGrant: "Разрешить микрофон",
      permAfter: "После разрешения закройте эту вкладку и снова откройте шумомер HowLoud из панели браузера.",
      working: "Запрашиваем доступ…",
      ok: "✓ Доступ к микрофону разрешён. Можете закрыть вкладку.",
      denied: "Доступ заблокирован. Нажмите значок камеры/микрофона в адресной строке, разрешите доступ и попробуйте снова.",
      error: "На этом устройстве не удалось запустить микрофон."
    }
  };

  const lang = (navigator.language || "en").slice(0, 2).toLowerCase();
  const copy = COPY[lang] ? COPY[lang] : COPY.en;

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-copy]").forEach((node) => {
      const key = node.getAttribute("data-copy");
      if (copy[key]) node.textContent = copy[key];
    });

    const grantButton = document.getElementById("grantButton");
    const stateNode = document.getElementById("permState");

    function setState(message, tone) {
      stateNode.textContent = message;
      stateNode.dataset.tone = tone || "";
    }

    grantButton.addEventListener("click", async () => {
      if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== "function") {
        setState(copy.error, "bad");
        return;
      }
      setState(copy.working, "");
      grantButton.disabled = true;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Immediately release — we only needed the permission grant to persist.
        stream.getTracks().forEach((track) => track.stop());
        setState(copy.ok, "ok");
      } catch (error) {
        const denied = error && (error.name === "NotAllowedError" || error.name === "SecurityError");
        setState(denied ? copy.denied : copy.error, "bad");
        grantButton.disabled = false;
      }
    });
  });
})();
