(() => {
  'use strict';

  /* ==========================================================
     НАСТРОЙКИ МЕРОПРИЯТИЯ — меняйте здесь
     ========================================================== */
  const EVENT = {
    start: '2026-09-25T10:00:00+06:00', // дата и время начала (часовой пояс Кыргызстана +06:00)
    time: '10:00',                      // как время показывается на сайте
    durationHours: 3,
  };

  /* 3D-визуализации: файл в assets/render и номер листа эскиза */
  const RENDERS = [
    ['01-aerial', 'AP-6'],
    ['02-admin', 'AP-7'],
    ['03-overview', 'AP-8'],
    ['04-plan', 'AP-9'],
    ['05-facade', 'AP-11'],
    ['06-market', 'AP-12'],
    ['07-panorama', 'AP-13'],
    ['08-parking', 'AP-14'],
  ];

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const body = document.body;
  const pad = (n) => String(n).padStart(2, '0');

  /* ==========================================================
     ЯЗЫКИ · ТИЛДЕР · LANGUAGES
     ========================================================== */
  const I18N = window.I18N || { ru: {}, ky: {}, en: {} };
  const LANGS = ['ru', 'ky', 'en'];
  const LOCALES = { ru: 'ru-RU', ky: 'ky-KG', en: 'en-US' };
  const metaDesc = $('meta[name="description"]');
  let lang = 'ru';

  // Русский текст берём прямо из разметки
  const textNodes = $$('[data-i18n]');
  textNodes.forEach((el) => {
    const k = el.dataset.i18n;
    if (I18N.ru[k] == null) I18N.ru[k] = el.innerHTML.trim();
  });
  const attrNodes = $$('[data-i18n-attr]').map((el) => ({
    el,
    pairs: el.dataset.i18nAttr.split(';').map((p) => p.split(':').map((s) => s.trim())),
  }));
  attrNodes.forEach(({ el, pairs }) => pairs.forEach(([attr, k]) => {
    if (I18N.ru[k] == null) I18N.ru[k] = el.getAttribute(attr) || '';
  }));
  I18N.ru['meta.title'] = document.title;
  I18N.ru['meta.desc'] = metaDesc.getAttribute('content');

  const t = (k) => {
    const dict = I18N[lang];
    if (dict && dict[k] != null) return dict[k];
    return I18N.ru[k] != null ? I18N.ru[k] : k;
  };
  const fmt = () => new Intl.NumberFormat(LOCALES[lang]);
  const langListeners = [];

  function fillTime() {
    $$('[data-time]').forEach((el) => { el.textContent = EVENT.time; });
  }

  function applyLang(next) {
    lang = LANGS.includes(next) ? next : 'ru';
    document.documentElement.lang = lang;
    textNodes.forEach((el) => {
      const v = t(el.dataset.i18n);
      if (el.innerHTML !== v) el.innerHTML = v;
    });
    attrNodes.forEach(({ el, pairs }) => pairs.forEach(([attr, k]) => el.setAttribute(attr, t(k))));
    document.title = t('meta.title');
    metaDesc.setAttribute('content', t('meta.desc'));
    fillTime();
    $$('[data-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    langListeners.forEach((fn) => fn());
  }

  function setLang(next) {
    if (next === lang) return;
    try { localStorage.setItem('lang', next); } catch (_) { /* хранилище недоступно */ }
    try {
      const u = new URL(location.href);
      u.searchParams.set('lang', next);
      history.replaceState(null, '', u);
    } catch (_) { /* file:// и т.п. */ }

    if (reduceMotion) { applyLang(next); return; }
    const root = document.documentElement;
    root.classList.add('lang-fade');
    setTimeout(() => {
      applyLang(next);
      root.classList.remove('lang-fade');
    }, 220);
  }

  function detectLang() {
    const fromUrl = new URLSearchParams(location.search).get('lang');
    if (LANGS.includes(fromUrl)) return fromUrl;
    try {
      const stored = localStorage.getItem('lang');
      if (LANGS.includes(stored)) return stored;
    } catch (_) { /* хранилище недоступно */ }
    const nav = ((navigator.languages && navigator.languages[0]) || navigator.language || 'ru').toLowerCase();
    if (nav.startsWith('ky')) return 'ky';
    if (nav.startsWith('en')) return 'en';
    return 'ru';
  }

  $$('[data-lang]').forEach((b) => b.addEventListener('click', (e) => {
    e.stopPropagation();
    setLang(b.dataset.lang);
  }));

  /* ---------- Звёзды ---------- */
  $$('[data-stars]').forEach((box) => {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < +box.dataset.stars; i++) {
      const s = document.createElement('i');
      const size = (Math.random() * 1.8 + 0.6).toFixed(2);
      s.style.cssText =
        `left:${Math.random() * 100}%;top:${Math.random() * 72}%;width:${size}px;height:${size}px;` +
        `animation-delay:${(Math.random() * 5).toFixed(2)}s;animation-duration:${(3 + Math.random() * 4).toFixed(2)}s`;
      frag.appendChild(s);
    }
    box.appendChild(frag);
  });

  /* ==========================================================
     КОНВЕРТ
     ========================================================== */
  const intro = $('#intro');
  const seal = $('#seal');
  let opened = false;
  let timers = [];

  const later = (fn, ms) => timers.push(setTimeout(fn, reduceMotion ? 0 : ms));

  function openEnvelope() {
    if (opened) return;
    opened = true;
    intro.classList.add('is-seal');
    later(() => intro.classList.add('is-flap'), 550);
    later(() => intro.classList.add('is-flap-behind'), 960);
    later(() => intro.classList.add('is-letter'), 1150);
    later(finishIntro, 2750);
  }

  function finishIntro() {
    opened = true;
    timers.forEach(clearTimeout);
    timers = [];
    intro.classList.add('is-seal', 'is-flap', 'is-flap-behind', 'is-letter', 'is-done');
    body.classList.remove('is-locked');
    body.classList.add('is-open');
    setTimeout(() => { intro.hidden = true; }, reduceMotion ? 0 : 950);
  }

  seal.addEventListener('click', openEnvelope);
  $('#envelope').addEventListener('click', openEnvelope);
  $('#introSkip').addEventListener('click', finishIntro);
  document.addEventListener('keydown', (e) => {
    if (intro.hidden) return;
    if (e.key === 'Escape') finishIntro();
    else if ((e.key === 'Enter' || e.key === ' ') && document.activeElement === body) openEnvelope();
  });

  $('#replay').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    body.classList.add('is-locked');
    body.classList.remove('is-open');
    intro.className = 'intro is-done';
    intro.hidden = false;
    void intro.offsetWidth; // перезапуск анимации
    intro.className = 'intro';
    opened = false;
    seal.focus({ preventScroll: true });
  });

  /* ---------- Обратный отсчёт ---------- */
  const target = new Date(EVENT.start).getTime();
  const cdBox = $('#countdown');
  const cd = { d: $('[data-cd="d"]'), h: $('[data-cd="h"]'), m: $('[data-cd="m"]'), s: $('[data-cd="s"]') };
  let eventPassed = false;

  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) {
      eventPassed = true;
      cdBox.innerHTML = `<p class="countdown__done">${t('js.done')}</p>`;
      return false;
    }
    cd.d.textContent = pad(Math.floor(diff / 864e5));
    cd.h.textContent = pad(Math.floor(diff / 36e5) % 24);
    cd.m.textContent = pad(Math.floor(diff / 6e4) % 60);
    cd.s.textContent = pad(Math.floor(diff / 1e3) % 60);
    return true;
  }
  langListeners.push(() => {
    if (eventPassed) cdBox.innerHTML = `<p class="countdown__done">${t('js.done')}</p>`;
  });

  /* ---------- Появление и счётчики ---------- */
  function countUp(el) {
    const end = +el.dataset.count;
    el.dataset.done = '1';
    if (reduceMotion) { el.textContent = fmt().format(end); return; }
    const dur = 1800;
    const t0 = performance.now();
    const step = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      el.textContent = fmt().format(Math.round(end * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  langListeners.push(() => {
    $$('[data-count][data-done]').forEach((el) => { el.textContent = fmt().format(+el.dataset.count); });
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add('is-visible');
      $$('[data-count]', en.target).forEach(countUp);
      io.unobserve(en.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  $$('.reveal').forEach((el) => {
    const siblings = [...el.parentElement.children].filter((x) => x.classList.contains('reveal'));
    el.style.setProperty('--rd', `${Math.min(siblings.indexOf(el), 8) * 0.08}s`);
    io.observe(el);
  });

  /* ---------- Уведомление ---------- */
  const toastEl = $('#toast');
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('is-shown');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-shown'), 2600);
  }

  /* ---------- Добавить в календарь (.ics) ---------- */
  const icsEscape = (s) => s.replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;');
  const icsDate = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

  function downloadIcs() {
    const start = new Date(EVENT.start);
    const end = new Date(start.getTime() + EVENT.durationHours * 36e5);
    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Altyn-Aska//Invitation//RU', 'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      'UID:altyn-aska-20260925@kyzyl-kiya',
      `DTSTAMP:${icsDate(new Date())}`,
      `DTSTART:${icsDate(start)}`,
      `DTEND:${icsDate(end)}`,
      `SUMMARY:${icsEscape(t('js.icsTitle'))}`,
      `LOCATION:${icsEscape(t('js.icsLoc'))}`,
      `DESCRIPTION:${icsEscape(t('js.icsDesc'))}`,
      'BEGIN:VALARM', 'TRIGGER:-P1D', 'ACTION:DISPLAY', `DESCRIPTION:${icsEscape(t('js.icsAlarm'))}`, 'END:VALARM',
      'END:VEVENT', 'END:VCALENDAR',
    ].join('\r\n');

    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'altyn-aska-25-09-2026.ics';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    toast(t('js.icsToast'));
  }
  $$('[data-ics]').forEach((b) => b.addEventListener('click', downloadIcs));

  /* ---------- Поделиться ---------- */
  $('#shareBtn').addEventListener('click', async () => {
    const data = { title: t('js.shareTitle'), text: t('js.shareText'), url: location.href.split('#')[0] };
    if (navigator.share) {
      try { await navigator.share(data); } catch (_) { /* пользователь закрыл окно */ }
      return;
    }
    try {
      await navigator.clipboard.writeText(data.url);
      toast(t('js.copied'));
    } catch (_) {
      toast(data.url);
    }
  });

  /* ---------- Карта на языке страницы ---------- */
  const map = $('#map');
  langListeners.push(() => {
    const src = `https://www.google.com/maps?q=${encodeURIComponent('Кызыл-Кия')}&z=13&hl=${lang}&output=embed`;
    if (map.dataset.hl !== lang) {
      map.dataset.hl = lang;
      map.src = src;
    }
  });

  /* ==========================================================
     3D-ГАЛЕРЕЯ (coverflow + наклон + просмотр)
     ========================================================== */
  const cf = $('#cf');
  const n = RENDERS.length;
  const srcOf = (i) => `assets/render/${RENDERS[i][0]}.jpg`;
  let active = 0;
  let lastInteract = 0;

  const items = RENDERS.map(([file, code], i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'cf__item';
    b.dataset.index = i;
    b.innerHTML =
      `<span class="cf__card">` +
      `<img src="${srcOf(i)}" alt="" loading="lazy" decoding="async" draggable="false" width="1400" height="860">` +
      `<span class="cf__badge">${code}</span>` +
      `<span class="cf__zoom" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg></span>` +
      `<span class="cf__glare"></span>` +
      `</span>`;
    cf.appendChild(b);
    return b;
  });

  const dotsBox = $('#cfDots');
  const dots = RENDERS.map((_, i) => {
    const d = document.createElement('button');
    d.type = 'button';
    d.setAttribute('aria-label', String(i + 1));
    d.addEventListener('click', () => go(i));
    dotsBox.appendChild(d);
    return d;
  });

  const cap = $('#cfCap');
  let capTimer;
  function fillCaption() {
    $('#cfCount').textContent = `${pad(active + 1)} / ${pad(n)}`;
    $('#cfCode').textContent = RENDERS[active][1];
    $('#cfTitle').textContent = t(`gal.${active + 1}.t`);
    $('#cfDesc').textContent = t(`gal.${active + 1}.d`);
  }
  function updateCaption(animate) {
    if (!animate || reduceMotion) { fillCaption(); return; }
    cap.classList.add('is-changing');
    clearTimeout(capTimer);
    capTimer = setTimeout(() => { fillCaption(); cap.classList.remove('is-changing'); }, 230);
  }

  function resetTilt() {
    items.forEach((b) => {
      const c = b.firstElementChild;
      c.style.removeProperty('--tx');
      c.style.removeProperty('--ty');
    });
  }

  function layout() {
    const narrow = window.innerWidth < 640;
    items.forEach((el, i) => {
      let d = i - active;
      if (d > n / 2) d -= n;
      if (d < -n / 2) d += n;
      const a = Math.abs(d);
      const s = Math.sign(d);
      const x = d === 0 ? 0 : s * ((narrow ? 56 : 50) + (a - 1) * (narrow ? 18 : 22));
      el.style.setProperty('--x', `${x}%`);
      el.style.setProperty('--z', `${-a * (narrow ? 170 : 260)}px`);
      el.style.setProperty('--ry', `${d === 0 ? 0 : -s * (narrow ? 44 : 38)}deg`);
      el.style.setProperty('--o', a > 2 ? 0 : a === 2 ? 0.5 : 1);
      el.style.setProperty('--b', a === 0 ? 1 : a === 1 ? 0.62 : 0.4);
      el.classList.toggle('is-active', d === 0);
      el.classList.toggle('is-far', a > 2);
      el.tabIndex = d === 0 ? 0 : -1;
    });
    dots.forEach((d, i) => d.setAttribute('aria-current', String(i === active)));
  }

  function go(i, byUser = true) {
    const next = ((i % n) + n) % n;
    if (byUser) lastInteract = Date.now();
    if (next === active) return;
    active = next;
    resetTilt();
    layout();
    updateCaption(true);
  }

  $('#cfPrev').addEventListener('click', () => go(active - 1));
  $('#cfNext').addEventListener('click', () => go(active + 1));

  // Перетаскивание / свайп
  let downX = null;
  let dragged = false;
  cf.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    downX = e.clientX;
    dragged = false;
  });
  window.addEventListener('pointermove', (e) => {
    if (downX != null && Math.abs(e.clientX - downX) > 10) dragged = true;
  }, { passive: true });
  window.addEventListener('pointerup', (e) => {
    if (downX == null) return;
    const dx = e.clientX - downX;
    downX = null;
    if (dragged && Math.abs(dx) > 45) go(active + (dx < 0 ? 1 : -1));
  });
  window.addEventListener('pointercancel', () => { downX = null; });

  cf.addEventListener('click', (e) => {
    const b = e.target.closest('.cf__item');
    if (!b) return;
    if (dragged) { dragged = false; return; }
    const i = +b.dataset.index;
    if (i === active) openLightbox(i);
    else go(i);
  });

  // Наклон карточки за курсором
  let hovering = false;
  cf.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') hovering = true; });
  cf.addEventListener('pointerleave', () => { hovering = false; resetTilt(); });
  cf.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse' || reduceMotion || downX != null) return;
    const b = e.target.closest('.cf__item.is-active');
    if (!b) { resetTilt(); return; }
    const card = b.firstElementChild;
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    card.style.setProperty('--tx', `${(-py * 10).toFixed(2)}deg`);
    card.style.setProperty('--ty', `${(px * 14).toFixed(2)}deg`);
    card.style.setProperty('--gx', `${((px + 0.5) * 100).toFixed(1)}%`);
    card.style.setProperty('--gy', `${((py + 0.5) * 100).toFixed(1)}%`);
  });

  // Стрелки клавиатуры, когда фокус в галерее
  $('#gallery').addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(active - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); go(active + 1); }
  });

  // Автопрокрутка, пока галерея на экране
  let inView = false;
  new IntersectionObserver(([en]) => { inView = en.isIntersecting; }, { threshold: 0.35 }).observe(cf);

  // Подписи и alt на текущем языке
  function localizeGallery() {
    items.forEach((b, i) => {
      b.querySelector('img').alt = t(`gal.${i + 1}.t`);
      b.setAttribute('aria-label', `${t('gallery.open')}: ${t(`gal.${i + 1}.t`)}`);
    });
    fillCaption();
    if (!lb.hidden) showInLightbox(lbIndex);
  }
  langListeners.push(() => localizeGallery());

  // Въезд сцены в 3D при прокрутке
  function galleryEnter() {
    if (reduceMotion) return;
    const r = cf.getBoundingClientRect();
    const vh = window.innerHeight;
    const p = Math.min(Math.max((vh - r.top) / (vh * 0.8), 0), 1);
    const rest = 1 - p;
    cf.style.setProperty('--erx', `${(rest * 34).toFixed(2)}deg`);
    cf.style.setProperty('--ey', `${(rest * 90).toFixed(1)}px`);
    cf.style.setProperty('--es', (0.86 + 0.14 * p).toFixed(3));
  }

  /* ---------- Просмотр изображения ---------- */
  const lb = $('#lb');
  const lbImg = $('#lbImg');
  const lbCap = $('#lbCap');
  let lbIndex = 0;
  let lbReturnFocus = null;

  function showInLightbox(i) {
    lbIndex = ((i % n) + n) % n;
    lbImg.classList.add('is-loading');
    lbImg.onload = () => lbImg.classList.remove('is-loading');
    lbImg.src = srcOf(lbIndex);
    if (lbImg.complete) lbImg.classList.remove('is-loading');
    lbImg.alt = t(`gal.${lbIndex + 1}.t`);
    lbCap.innerHTML =
      `<b>${RENDERS[lbIndex][1]}</b> · ${t(`gal.${lbIndex + 1}.t`)}<span>${pad(lbIndex + 1)} / ${pad(n)}</span>`;
  }

  function openLightbox(i) {
    lbReturnFocus = document.activeElement;
    showInLightbox(i);
    lb.hidden = false;
    body.classList.add('is-locked');
    requestAnimationFrame(() => requestAnimationFrame(() => lb.classList.add('is-open')));
    $('#lbClose').focus({ preventScroll: true });
  }

  function closeLightbox() {
    lb.classList.remove('is-open');
    body.classList.remove('is-locked');
    setTimeout(() => { lb.hidden = true; }, reduceMotion ? 0 : 380);
    go(lbIndex);
    if (lbReturnFocus && lbReturnFocus.focus) lbReturnFocus.focus({ preventScroll: true });
  }

  $('#lbClose').addEventListener('click', closeLightbox);
  $('#lbPrev').addEventListener('click', () => showInLightbox(lbIndex - 1));
  $('#lbNext').addEventListener('click', () => showInLightbox(lbIndex + 1));
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLightbox(); });
  document.addEventListener('keydown', (e) => {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showInLightbox(lbIndex - 1);
    if (e.key === 'ArrowRight') showInLightbox(lbIndex + 1);
  });
  let lbDownX = null;
  lb.addEventListener('pointerdown', (e) => { lbDownX = e.clientX; });
  lb.addEventListener('pointerup', (e) => {
    if (lbDownX == null) return;
    const dx = e.clientX - lbDownX;
    lbDownX = null;
    if (Math.abs(dx) > 50) showInLightbox(lbIndex + (dx < 0 ? 1 : -1));
  });

  if (!reduceMotion) {
    setInterval(() => {
      if (inView && !hovering && lb.hidden && !document.hidden &&
          body.classList.contains('is-open') && Date.now() - lastInteract > 7000) {
        go(active + 1, false);
      }
    }, 4200);
  }

  /* ---------- Навигация, параллакс, 3D-въезд ---------- */
  const nav = $('#nav');
  const layers = $$('[data-parallax]');
  let ticking = false;

  function onScroll() {
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 40);
    if (!reduceMotion && y < window.innerHeight * 1.3) {
      layers.forEach((l) => { l.style.transform = `translate3d(0, ${(y * l.dataset.parallax).toFixed(1)}px, 0)`; });
    }
    galleryEnter();
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  window.addEventListener('resize', () => { layout(); onScroll(); });

  /* ---------- Старт ---------- */
  layout();
  applyLang(detectLang());
  if (tick()) {
    const iv = setInterval(() => { if (!tick()) clearInterval(iv); }, 1000);
  }
  onScroll();
})();
