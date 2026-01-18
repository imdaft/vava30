// Настройки события — заполни эти поля, и весь лендинг обновится автоматически.
// Важно: date должен быть в формате YYYY-MM-DD, time — HH:MM (24 часа).
const EVENT = {
  title: "VAVA — День рождения",
  date: "2026-01-23", // 23 января
  time: "18:00",
  durationMinutes: 240,
  address: "Ленинский проспект, дом 148",
  mapsUrl: "",
  rsvpUrl: "",
  pinterestUrl:
    "https://ru.pinterest.com/madam_vava/vavas-bday26/?invite_code=423defbe13c24d86b2ab9e484ef0f341&sender=650418508592579381",
  musicSrc: "./assets/audio/music.mp3",
};

// Moodboard берём из папки "Mood картинки" в корне проекта.
// Если ты добавишь/удалишь файлы в этой папке и хочешь, чтобы список обновился — скажи мне, я сгенерю новый список.
const MOODBOARD_DIR = "./Mood картинки/";
const MOODBOARD_FILES = [
  "0ca983687fc17873e52fd4c79a87edcf.jpg",
  "1fb1dd9b0c830146c79cfe102f199e4a.jpg",
  "1fe3c151e918d8b8f5d959a524940d97.jpg",
  "34b903ca6a35fbc1da129c2bec25724d.jpg",
  "3571a6a950105ddc58e7421c8485b607.jpg",
  "3a1166bdc288cfd05e5afe6a066a30ca.jpg",
  "5214891cdd39e8e704274aed11744f3b.jpg", // Оставляю одну версию
  "618654ba7a7f0df9790b71809c06d6f3.jpg",
  "62724f6412d770c83a11dd6221795c82.jpg",
  "6ed4e8654e39c2f3f642cc1dfde85ff1.jpg",
  "79f9e3029c7325e53de86fb39c2e9cee.jpg",
  "87c5e66eb473ff6e410ff4bb78d27615.jpg",
  "b0577d05b5bcef8a69a949a9eb22bbf6.jpg", // Оставляю одну версию
  "cb74161b6a4cb8cc9dff303e07b6dd74.jpg",
  "cdbc19dba5f0e1f88333098eb59f74a7.jpg",
  "d3f9717e411b1648653ae5a0dada6a57.jpg",
  "d6d26f51b65a5df4771e72e659ef3c39.jpg",
  "db5eced77f5a24aa073ab1473399d308.jpg",
  "dd70f7a45b31f79903d1d64b17be26f6.jpg",
  "f02e4824bcd53a1d3db239ad5a3b9140.jpg",
  "f3b3e3d122ba9eacd36f76323cd40451.jpg",
  "f56b3268dbd04bd2980f824ca820ff48.jpg",
  "fcd38adf73a908e6b53d5f8e508106c9.jpg",
  "mood-5.png",
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function $(id) {
  return document.getElementById(id);
}

function setTextIfPresent(id, value) {
  const el = $(id);
  if (!el) return;
  el.textContent = value;
}

function isEmpty(value) {
  return !value || String(value).trim().length === 0;
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function formatDateLabel(date) {
  if (isEmpty(date)) return "дата уточняется";
  const parts = String(date).split("-");
  if (parts.length !== 3) return "дата уточняется";
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  if (!y || !m || !d) return "дата уточняется";

  const months = [
    "января",
    "февраля",
    "марта",
    "апреля",
    "мая",
    "июня",
    "июля",
    "августа",
    "сентября",
    "октября",
    "ноября",
    "декабря",
  ];
  return `${d} ${months[m - 1]} ${y}`;
}

function formatTimeLabel(time) {
  if (isEmpty(time)) return "время уточняется";
  const parts = String(time).split(":");
  if (parts.length < 2) return "время уточняется";
  const hh = Number(parts[0]);
  const mm = Number(parts[1]);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return "время уточняется";
  return `${pad2(hh)}:${pad2(mm)}`;
}

function parseLocalDateTime(date, time) {
  if (isEmpty(date) || isEmpty(time)) return null;

  const d = String(date).split("-").map((v) => Number(v));
  const t = String(time).split(":").map((v) => Number(v));
  if (d.length !== 3 || t.length < 2) return null;

  const y = d[0];
  const m = d[1];
  const day = d[2];
  const hh = t[0];
  const mm = t[1];

  if (!y || !m || !day) return null;
  if (Number.isNaN(hh) || Number.isNaN(mm)) return null;

  return new Date(y, m - 1, day, hh, mm, 0);
}

function toIcsLocal(dt) {
  return `${dt.getFullYear()}${pad2(dt.getMonth() + 1)}${pad2(dt.getDate())}T${pad2(dt.getHours())}${pad2(
    dt.getMinutes(),
  )}00`;
}

function toIcsUtcStamp(dt) {
  return `${dt.getUTCFullYear()}${pad2(dt.getUTCMonth() + 1)}${pad2(dt.getUTCDate())}T${pad2(dt.getUTCHours())}${pad2(
    dt.getUTCMinutes(),
  )}${pad2(dt.getUTCSeconds())}Z`;
}

function escapeIcs(text) {
  return String(text || "")
    .replaceAll("\\", "\\\\")
    .replaceAll("\n", "\\n")
    .replaceAll(",", "\\,")
    .replaceAll(";", "\\;");
}

let toastTimer = null;
function toast(message) {
  const el = $("toast");
  if (!el) return;

  el.textContent = message;
  el.hidden = false;
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    el.hidden = true;
  }, 2400);
}

function applyEventToUI() {
  const dateLabel = formatDateLabel(EVENT.date);
  const timeLabel = formatTimeLabel(EVENT.time);
  const addressLabel = isEmpty(EVENT.address) ? "адрес уточняется" : EVENT.address;

  // Hero теперь без текста/карточек — поэтому обновляем только те элементы, которые реально есть на странице.
  setTextIfPresent("dateLongText", dateLabel);
  setTextIfPresent("timeLongText", timeLabel);
  setTextIfPresent("addressLongText", addressLabel);

  const mapsLink = $("mapsLink");
  const mapsBtnBottom = $("mapsBtnBottom");
  const rsvpBtn = $("rsvpBtn");
  const rsvpBtnBottom = $("rsvpBtnBottom");
  const pinterestBtn = $("pinterestBtn");

  setMaybeLink(mapsLink, EVENT.mapsUrl, "Ссылка на карту ещё не задана");
  setMaybeLink(mapsBtnBottom, EVENT.mapsUrl, "Ссылка на карту ещё не задана");

  setMaybeLink(rsvpBtn, EVENT.rsvpUrl, "RSVP ссылка ещё не задана");
  setMaybeLink(rsvpBtnBottom, EVENT.rsvpUrl, "RSVP ссылка ещё не задана");

  if (pinterestBtn && EVENT.pinterestUrl) {
    pinterestBtn.href = EVENT.pinterestUrl;
  }
}

function setMaybeLink(anchor, url, emptyMessage) {
  if (!anchor) return;

  const safeUrl = isEmpty(url) ? "" : String(url).trim();
  if (safeUrl.length > 0) {
    anchor.href = safeUrl;
    return;
  }

  anchor.href = "#";
  anchor.addEventListener("click", (e) => {
    e.preventDefault();
    toast(emptyMessage);
  });
}

function setupReveal() {
  const items = Array.from(document.querySelectorAll("[data-reveal]"));
  if (items.length === 0) return;

  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );

  items.forEach((el) => observer.observe(el));
}

function setupMoodboardGallery() {
  const gallery = $("gallery");
  if (!gallery) return;

  // На случай перезапуска (например, hot reload)
  gallery.innerHTML = "";

  const fragment = document.createDocumentFragment();
  MOODBOARD_FILES.forEach((fileName, index) => {
    const figure = document.createElement("figure");
    figure.className = "shot";
    figure.setAttribute("data-reveal", "");

    // Немного ритма: иногда делаем кадр чуть шире (без “кнопок” и текста).
    if ((index + 1) % 9 === 0) {
      figure.classList.add("shot-fill");
    }

    const img = document.createElement("img");
    img.loading = "lazy";
    img.decoding = "async";
    img.alt = `Moodboard ${index + 1}`;
    img.src = `${MOODBOARD_DIR}${fileName}`;

    figure.appendChild(img);
    fragment.appendChild(figure);
  });

  gallery.appendChild(fragment);
}

function setupHeroProgress() {
  const hero = document.querySelector(".hero-scene");
  if (!hero) return;

  let ticking = false;
  function update() {
    ticking = false;

    const rect = hero.getBoundingClientRect();
    const scrollable = hero.offsetHeight - window.innerHeight;
    const raw = scrollable <= 0 ? 0 : -rect.top / scrollable;
    const progress = clamp(raw, 0, 1);
    document.documentElement.style.setProperty("--p", String(progress));
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();
}

function setupGalleryShuffle() {
  const btn = $("shuffleBtn");
  const gallery = $("gallery");
  if (!btn || !gallery) return;

  btn.addEventListener("click", () => {
    const items = Array.from(gallery.children);
    for (let i = items.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = items[i];
      items[i] = items[j];
      items[j] = tmp;
    }
    items.forEach((node) => gallery.appendChild(node));
    toast("Перемешано");
  });
}

async function copyText(text) {
  const value = String(text || "");
  if (value.trim().length === 0) return false;

  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    // fallback
  }

  try {
    const area = document.createElement("textarea");
    area.value = value;
    area.setAttribute("readonly", "true");
    area.style.position = "fixed";
    area.style.left = "-9999px";
    area.style.top = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}

function setupCopyAddress() {
  const btn = $("copyAddressBtn");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    const address = String(EVENT.address || "");
    if (address.toLowerCase().includes("уточняется") || address.trim().length === 0) {
      toast("Сначала укажи адрес");
      return;
    }
    const ok = await copyText(address);
    toast(ok ? "Адрес скопирован" : "Не получилось скопировать");
  });
}

function downloadFile(name, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function buildIcs() {
  const start = parseLocalDateTime(EVENT.date, EVENT.time);
  if (!start) return null;

  const end = new Date(start.getTime() + Number(EVENT.durationMinutes || 0) * 60_000);
  const uid = `${Date.now()}@vava-bday`;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//VAVA BDAY//RU",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${toIcsUtcStamp(new Date())}`,
    `DTSTART:${toIcsLocal(start)}`,
    `DTEND:${toIcsLocal(end)}`,
    `SUMMARY:${escapeIcs(EVENT.title)}`,
    `LOCATION:${escapeIcs(EVENT.address)}`,
    `DESCRIPTION:${escapeIcs(
      `RSVP: ${EVENT.rsvpUrl || "—"}\\nКарта: ${EVENT.mapsUrl || "—"}\\nМудборд: ${EVENT.pinterestUrl || "—"}`,
    )}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return `${lines.join("\r\n")}\r\n`;
}

function setupCalendar() {
  const btn = $("addToCalendarBtn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const ics = buildIcs();
    if (!ics) {
      toast("Сначала укажи дату и время (EVENT.date / EVENT.time)");
      return;
    }
    downloadFile("vava-bday.ics", ics, "text/calendar;charset=utf-8");
    toast("Календарь скачан");
  });
}

let tone = {
  ctx: null,
  gain: null,
  a: null,
  b: null,
};

function startFallbackTone() {
  if (tone.ctx) return;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return;

  const ctx = new Ctx();
  const gain = ctx.createGain();
  gain.gain.value = 0.018;
  gain.connect(ctx.destination);

  const a = ctx.createOscillator();
  a.type = "sine";
  a.frequency.value = 220;
  a.connect(gain);

  const b = ctx.createOscillator();
  b.type = "sine";
  b.frequency.value = 330;
  b.connect(gain);

  a.start();
  b.start();

  tone = { ctx, gain, a, b };
}

function stopFallbackTone() {
  if (!tone.ctx) return;
  try {
    tone.a.stop();
    tone.b.stop();
  } catch {
    // ignore
  }
  try {
    tone.a.disconnect();
    tone.b.disconnect();
    tone.gain.disconnect();
  } catch {
    // ignore
  }
  tone.ctx.close();
  tone = { ctx: null, gain: null, a: null, b: null };
}

function setupMusic() {
  const btn = $("musicBtn");
  const audio = $("bgMusic");
  const note = $("musicNote");
  if (!btn || !audio) return;

  let isOn = false;

  function setState(next) {
    isOn = next;
    btn.setAttribute("aria-pressed", next ? "true" : "false");
    const label = btn.querySelector(".icon-btn-label");
    if (label) label.textContent = next ? "Музыка: вкл" : "Музыка";
  }

  async function tryPlayFile() {
    audio.pause();
    audio.currentTime = 0;
    audio.volume = 0.32;

    try {
      const playPromise = audio.play();
      if (playPromise) await playPromise;
      return true;
    } catch {
      return false;
    }
  }

  btn.addEventListener("click", async () => {
    if (isOn) {
      audio.pause();
      stopFallbackTone();
      setState(false);
      toast("Музыка выключена");
      return;
    }

    const ok = await tryPlayFile();
    if (ok) {
      stopFallbackTone();
      if (note) note.hidden = true;
      setState(true);
      toast("Музыка включена");
      return;
    }

    // Файл не проигрался — включаем мягкий плейсхолдер, чтобы сайт “жил”.
    startFallbackTone();
    if (note) note.hidden = false;
    setState(true);
    toast("Нет music.mp3 — включён плейсхолдер");
  });

  // Подстраховка: если аудио “упало”, гасим его.
  audio.addEventListener("error", () => {
    if (!isOn) return;
    audio.pause();
  });
}

function setupLightbox() {
  const gallery = $("gallery");
  const lightbox = $("lightbox");
  const lightboxImg = $("lightboxImg");
  if (!gallery || !lightbox || !lightboxImg) return;

  const images = Array.from(gallery.querySelectorAll("img"));
  if (images.length === 0) return;

  let isOpen = false;
  let currentIndex = 0;
  let startX = null;

  function setOpen(next) {
    isOpen = next;
    if (next) {
      lightbox.hidden = false;
      document.body.style.overflow = "hidden";
      // анимация
      window.requestAnimationFrame(() => {
        lightbox.classList.add("is-open");
      });
      window.addEventListener("keydown", onKeyDown);
      return;
    }

    lightbox.classList.remove("is-open");
    document.body.style.overflow = "";
    window.removeEventListener("keydown", onKeyDown);
    window.setTimeout(() => {
      if (!isOpen) lightbox.hidden = true;
    }, 240);
  }

  function showByIndex(index) {
    const nextIndex = (index + images.length) % images.length;
    currentIndex = nextIndex;
    lightboxImg.src = images[nextIndex].currentSrc || images[nextIndex].src;
    lightboxImg.alt = images[nextIndex].alt || "Фото";
  }

  function openAt(index) {
    showByIndex(index);
    setOpen(true);
  }

  function close() {
    setOpen(false);
  }

  function next() {
    showByIndex(currentIndex + 1);
  }

  function prev() {
    showByIndex(currentIndex - 1);
  }

  function onKeyDown(e) {
    if (!isOpen) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowRight") next();
    if (e.key === "ArrowLeft") prev();
  }

  gallery.addEventListener("click", (e) => {
    const target = e.target;
    if (!(target instanceof HTMLImageElement)) return;
    const index = images.indexOf(target);
    if (index < 0) return;
    openAt(index);
  });

  // Клик по фону — закрыть
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) close();
  });

  // Кнопки управления
  const lbClose = $("lbClose");
  const lbPrev = $("lbPrev");
  const lbNext = $("lbNext");

  if (lbClose) lbClose.addEventListener("click", close);
  if (lbPrev) {
    lbPrev.addEventListener("click", (e) => {
      e.stopPropagation();
      prev();
    });
  }
  if (lbNext) {
    lbNext.addEventListener("click", (e) => {
      e.stopPropagation();
      next();
    });
  }

  // Свайп по картинке — листать
  lightboxImg.addEventListener("pointerdown", (e) => {
    startX = e.clientX;
  });
  lightboxImg.addEventListener("pointerup", (e) => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    startX = null;
    if (Math.abs(dx) < 50) return;
    if (dx < 0) next();
    else prev();
  });
}

function setup() {
  applyEventToUI();
  setupHeroProgress();
  setupMoodboardGallery();
  setupReveal();
  setupGalleryShuffle();
  setupLightbox();
  setupCopyAddress();
  setupCalendar();
  setupMusic();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setup);
} else {
  setup();
}

