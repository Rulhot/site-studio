(function (Site) {
    'use strict';

    const { nf, esc, t } = Site;
    const TTL = 10 * 60 * 1000, TIMEOUT = 8000, SPARK_WINDOW = 168 * 3600 * 1000, SPARK_POINTS = 120;

    async function fetchChart(pluginId, chart) {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), TIMEOUT);
        try {
            const r = await fetch('https://bstats.org/api/v1/plugins/' + pluginId + '/charts/' + chart + '/data', { signal: ctrl.signal });
            if (!r.ok) throw new Error('bStats ' + chart + ': ' + r.status);
            return await r.json();
        } finally {
            clearTimeout(timer);
        }
    }

    function summarize(points, recordKey) {
        if (!Array.isArray(points) || !points.length) throw new Error('пустые данные');
        const last = points[points.length - 1];
        const record = Math.max(points.reduce((m, p) => Math.max(m, p[1]), 0), parseInt(Site.store(recordKey) || '0', 10) || 0);
        Site.store(recordKey, String(record));
        let week = points.filter(p => p[0] >= last[0] - SPARK_WINDOW);
        if (week.length < 2) week = points.slice(-50);
        const step = Math.ceil(week.length / SPARK_POINTS);
        const spark = week.filter((p, i) => i % step === 0 || i === week.length - 1);
        return { current: last[1], record, spark };
    }

    function readCache(id) {
        try { return JSON.parse(Site.store('bs:' + id)); } catch (e) { return null; }
    }

    async function load(id, key) {
        const cached = readCache(id);
        if (cached && Date.now() - cached.at < TTL) return cached;
        try {
            const [s, p] = await Promise.all([fetchChart(id, 'servers'), fetchChart(id, 'players')]);
            const data = { at: Date.now(), servers: summarize(s, 'rec-servers-' + key), players: summarize(p, 'rec-players-' + key) };
            Site.store('bs:' + id, JSON.stringify(data));
            return data;
        } catch (err) {
            if (cached) return cached;
            throw err;
        }
    }

    function countUp(el, value) {
        if (Site.reduceMotion) { el.textContent = nf.format(value); return; }
        const start = performance.now();
        (function frame(now) {
            const k = Math.min((now - start) / 1100, 1);
            el.textContent = nf.format(Math.round(value * (1 - Math.pow(1 - k, 3))));
            if (k < 1) requestAnimationFrame(frame);
        })(start);
    }

    function drawSpark(svg, points) {
        if (!svg || points.length < 2) return;
        const W = 300, H = 56, PAD = 4;
        const t0 = points[0][0], t1 = points[points.length - 1][0];
        const values = points.map(p => p[1]);
        const min = Math.min.apply(null, values);
        const range = Math.max.apply(null, values) - min || 1;
        const coords = points.map(p =>
            ((p[0] - t0) / (t1 - t0 || 1) * W).toFixed(1) + ',' + (H - PAD - (p[1] - min) / range * (H - PAD * 2)).toFixed(1));
        svg.querySelector('.spark__line').setAttribute('d', 'M' + coords.join(' L'));
        svg.querySelector('.spark__area').setAttribute('d', 'M0,' + H + ' L' + coords.join(' L') + ' L' + W + ',' + H + ' Z');
    }

    function card(bstatsId, key, title, accent, inline) {
        return '<article class="stat spot reveal' + (inline ? ' stat--inline' : '') + '" style="--accent:' + accent + '" data-bstats="' + bstatsId + '" data-key="' + esc(key) + '">' +
            '<header class="stat__head"><h3>' + esc(title) + '</h3></header>' +
            '<div class="stat__nums">' +
            '<div><span class="stat__value" data-field="servers"><span class="skeleton"></span></span><span class="stat__label">' + t('серверов') + '</span></div>' +
            '<div><span class="stat__value" data-field="players"><span class="skeleton"></span></span><span class="stat__label">' + t('игроков онлайн') + '</span></div>' +
            '</div>' +
            '<svg class="spark" viewBox="0 0 300 56" preserveAspectRatio="none" aria-hidden="true"><path class="spark__area" d=""/><path class="spark__line" d=""/></svg>' +
            '<footer class="stat__foot"><span>' + t('Рекорд серверов:') + ' <b data-field="servers-rec">...</b></span><span>' + t('Пик онлайна:') + ' <b data-field="players-rec">...</b></span></footer>' +
            '</article>';
    }

    async function fill(el) {
        const id = el.dataset.bstats, key = el.dataset.key || id;
        const field = name => el.querySelector('[data-field="' + name + '"]');
        try {
            const data = await load(id, key);
            countUp(field('servers'), data.servers.current);
            countUp(field('players'), data.players.current);
            field('servers-rec').textContent = nf.format(data.servers.record);
            field('players-rec').textContent = nf.format(data.players.record);
            drawSpark(el.querySelector('.spark'), data.servers.spark);
        } catch (err) {
            console.error('Ошибка bStats (' + id + '):', err);
            ['servers', 'players'].forEach(n => { field(n).textContent = '-'; field(n).classList.add('is-error'); });
            ['servers-rec', 'players-rec'].forEach(n => { field(n).textContent = t('нет данных'); });
        }
    }

    const list = document.querySelector('[data-stats-list]');
    if (list) {
        list.innerHTML = Site.visiblePlugins.filter(p => p.bstats)
            .map(p => card(p.bstats, p.id, p.name, Site.accentOf(p))).join('');
    }
    document.querySelectorAll('[data-stat-for]').forEach(el => {
        const p = Site.pluginByName(el.dataset.statFor);
        if (p && p.bstats) el.outerHTML = card(p.bstats, p.id, p.name, Site.accentOf(p), true);
        else el.closest('section').remove();
    });
    document.querySelectorAll('[data-bstats]').forEach(el => Site.whenVisible(el, fill));
})(Site);
