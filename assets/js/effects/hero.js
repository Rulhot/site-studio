(function (Site) {
    'use strict';

    const { root, reduceMotion } = Site;

    const art = document.querySelector('.hero__art');
    if (art && Site.canHover && !reduceMotion) {
        const hero = art.closest('.hero');
        let raf = 0, px = 0, py = 0;
        hero.addEventListener('pointermove', e => {
            const r = hero.getBoundingClientRect();
            px = (e.clientX - r.left) / r.width - 0.5;
            py = (e.clientY - r.top) / r.height - 0.5;
            if (!raf) raf = requestAnimationFrame(() => {
                raf = 0;
                art.style.setProperty('--px', px.toFixed(3));
                art.style.setProperty('--py', py.toFixed(3));
            });
        }, { passive: true });
        hero.addEventListener('pointerleave', () => {
            art.style.setProperty('--px', 0);
            art.style.setProperty('--py', 0);
        });
    }

    const heroSection = document.querySelector('.hero');
    if (heroSection && 'IntersectionObserver' in window) {
        new IntersectionObserver(([e]) => heroSection.classList.toggle('is-paused', !e.isIntersecting)).observe(heroSection);
    }

    const canvas = document.querySelector('.hero__canvas');
    if (!canvas || !canvas.getContext || window.matchMedia('(max-width: 760px)').matches) {
        if (canvas) canvas.remove();
        return;
    }
    const ctx = canvas.getContext('2d');
    const readPalette = () => ['--exp', '--vb', '--green'].map(v => getComputedStyle(root).getPropertyValue(v).trim());
    let palette = readPalette(), w = 0, h = 0, dots = [], running = false, raf = 0;

    const spawn = anywhere => ({
        x: Math.random() * w,
        y: anywhere ? Math.random() * h : h + 10,
        s: 3 + (Math.random() * 6 | 0),
        v: 0.12 + Math.random() * 0.35,
        a: 0.12 + Math.random() * 0.3,
        c: Math.random() * palette.length | 0,
        t: Math.random() * 6.28
    });

    function draw() {
        raf = 0;
        ctx.clearRect(0, 0, w, h);
        for (const d of dots) {
            if (running) {
                d.y -= d.v;
                d.t += 0.02;
                if (d.y < -10) Object.assign(d, spawn(false));
            }
            ctx.globalAlpha = d.a * (0.6 + 0.4 * Math.sin(d.t));
            ctx.fillStyle = palette[d.c];
            ctx.fillRect(Math.round(d.x + Math.sin(d.t) * 6), Math.round(d.y), d.s, d.s);
        }
        ctx.globalAlpha = 1;
        if (running) raf = requestAnimationFrame(draw);
    }
    const start = () => { running = true; cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); };

    function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        w = canvas.clientWidth;
        h = canvas.clientHeight;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        dots = Array.from({ length: Math.round(Math.min(48, (w * h) / 22000)) }, () => spawn(true));
        if (!running) draw();
    }

    let resizeTimer;
    window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 150); });
    document.addEventListener('themechange', () => { palette = readPalette(); if (!running) draw(); });
    resize();

    if (!reduceMotion && 'IntersectionObserver' in window) {
        new IntersectionObserver(([e]) => {
            if (e.isIntersecting && !running) start();
            else if (!e.isIntersecting) running = false;
        }).observe(canvas);
    }
})(Site);
