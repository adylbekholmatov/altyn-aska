(() => {
  'use strict';

  /* ==========================================================
     НАСТРОЙКИ МЕРОПРИЯТИЯ — меняйте здесь
     ========================================================== */
  const EVENT = {
    start: '2026-09-25T10:00:00+06:00', // дата и время начала (часовой пояс Кыргызстана +06:00)
    time: '10:00',                      // как время показывается на сайте
    durationHours: 3,
    title: 'Церемония закладки первого камня ТЛК «Кызыл-Кия»',
    location: 'г. Кызыл-Кия, Баткенская область, Кыргызстан',
  };

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const body = document.body;

  $$('[data-time]').forEach((el) => { el.textContent = EVENT.time; });

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

  /* ---------- Конверт ---------- */
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
  const cd = { d: $('[data-cd="d"]'), h: $('[data-cd="h"]'), m: $('[data-cd="m"]'), s: $('[data-cd="s"]') };
  const pad = (n) => String(n).padStart(2, '0');

  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) {
      $('#countdown').innerHTML = '<p class="countdown__done">Церемония состоялась · 25 сентября 2026</p>';
      return false;
    }
    cd.d.textContent = pad(Math.floor(diff / 864e5));
    cd.h.textContent = pad(Math.floor(diff / 36e5) % 24);
    cd.m.textContent = pad(Math.floor(diff / 6e4) % 60);
    cd.s.textContent = pad(Math.floor(diff / 1e3) % 60);
    return true;
  }
  if (tick()) {
    const iv = setInterval(() => { if (!tick()) clearInterval(iv); }, 1000);
  }

  /* ---------- Навигация и параллакс ---------- */
  const nav = $('#nav');
  const layers = $$('[data-parallax]');
  let ticking = false;

  function onScroll() {
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 40);
    if (!reduceMotion && y < window.innerHeight * 1.3) {
      layers.forEach((l) => { l.style.transform = `translate3d(0, ${(y * l.dataset.parallax).toFixed(1)}px, 0)`; });
    }
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  /* ---------- Появление и счётчики ---------- */
  const fmt = new Intl.NumberFormat('ru-RU');

  function countUp(el) {
    const end = +el.dataset.count;
    if (reduceMotion) { el.textContent = fmt.format(end); return; }
    const dur = 1800;
    const t0 = performance.now();
    const step = (t) => {
      const p = Math.min((t - t0) / dur, 1);
      el.textContent = fmt.format(Math.round(end * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

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
      `SUMMARY:${icsEscape(EVENT.title)}`,
      `LOCATION:${icsEscape(EVENT.location)}`,
      `DESCRIPTION:${icsEscape('Торжественная церемония закладки первого камня и капсулы времени. ОсОО «Алтын-Аска», Мэрия г. Кызыл-Кия.')}`,
      'BEGIN:VALARM', 'TRIGGER:-P1D', 'ACTION:DISPLAY', `DESCRIPTION:${icsEscape('Завтра церемония в Кызыл-Кие')}`, 'END:VALARM',
      'END:VEVENT', 'END:VCALENDAR',
    ].join('\r\n');

    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'priglashenie-kyzyl-kiya-25-09-2026.ics';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    toast('Событие сохранено — откройте файл, чтобы добавить в календарь');
  }
  $$('[data-ics]').forEach((b) => b.addEventListener('click', downloadIcs));

  /* ---------- Поделиться ---------- */
  $('#shareBtn').addEventListener('click', async () => {
    const data = {
      title: 'Приглашение · ТЛК «Кызыл-Кия»',
      text: 'Приглашаем на церемонию закладки первого камня ТЛК «Кызыл-Кия» — 25 сентября 2026',
      url: location.href.split('#')[0],
    };
    if (navigator.share) {
      try { await navigator.share(data); } catch (_) { /* пользователь закрыл окно */ }
      return;
    }
    try {
      await navigator.clipboard.writeText(data.url);
      toast('Ссылка на приглашение скопирована');
    } catch (_) {
      toast(data.url);
    }
  });
})();
