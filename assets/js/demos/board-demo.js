(function (Site) {
    'use strict';

    const { nf, esc, reduceMotion, t } = Site;
    const board = document.getElementById('board');
    if (!board) return;

    const ROWS_VISIBLE = 8, ROWS_TOTAL = 20, BUTTONS_VISIBLE = 3;
    const ANIMS = ['cascade', 'slide-left', 'slide-right', 'zoom'];
    const PERIODS = [
        { id: 'alltime', name: 'Всё время', k: 1 },
        { id: 'monthly', name: 'Месяц', k: 0.16 },
        { id: 'weekly', name: 'Неделя', k: 0.045 },
        { id: 'daily', name: 'День', k: 0.009 }
    ];
    const TOPS = [
        { id: 'balance', label: 'Баланс', title: 'Топ по монетам', g: ['#f59e5b', '#f5c05b'], head: 'Баланс', place: '#f9ce5c', value: '#ebb857', icon: '⛃', iconColor: '#f5a05b', btn: 'rgba(64,39,9,.85)', max: 2500000 },
        { id: 'time', label: 'Время', title: 'Топ по времени', g: ['#2774f3', '#a9a3f5'], head: 'Время', place: '#4d8ffa', value: '#5b95f0', icon: '⌚', iconColor: '#4d8ffa', btn: 'rgba(7,26,50,.9)', max: 1800, fmt: v => nf.format(Math.max(1, Math.round(v))) + ' ' + t('ч') },
        { id: 'kills', label: 'Убийства', title: 'Топ по убийствам', g: ['#f3306a', '#f35a7e'], head: 'Убийства', place: '#f74141', value: '#ea5a5a', icon: '☠', iconColor: '#f84141', btn: 'rgba(54,12,12,.9)', max: 4200 },
        { id: 'walked', label: 'Пройдено', title: 'Топ по пройденным блокам', g: ['#3fd07a', '#9ef0a0'], head: 'Блоков', place: '#4ade80', value: '#6ee7a0', icon: '➜', iconColor: '#4ade80', btn: 'rgba(15,58,31,.9)', max: 1900000 },
        { id: 'deaths', label: 'Смерти', title: 'Топ по смертям', g: ['#9ca3af', '#e5e7eb'], head: 'Смерти', place: '#b8bec8', value: '#d1d5db', icon: '✝', iconColor: '#b8bec8', btn: 'rgba(38,38,38,.9)', max: 950 },
        { id: 'blocks', label: 'Блоки', title: 'Топ по сломанным блокам', g: ['#22c3e6', '#7ee8f9'], head: 'Блоков', place: '#22d3ee', value: '#5fdcf0', icon: '⛏', iconColor: '#22d3ee', btn: 'rgba(8,58,66,.9)', max: 820000 },
        { id: 'mobs', label: 'Мобы', title: 'Топ по убитым мобам', g: ['#a855f7', '#d8b4fe'], head: 'Мобов', place: '#b46ef8', value: '#c99bfb', icon: '⚔', iconColor: '#b46ef8', btn: 'rgba(46,16,71,.9)', max: 36000 },
        { id: 'fishing', label: 'Рыбалка', title: 'Топ по пойманной рыбе', g: ['#f472b6', '#fbb6d9'], head: 'Рыбы', place: '#f472b6', value: '#f79cc9', icon: '⚓', iconColor: '#f472b6', btn: 'rgba(72,16,48,.9)', max: 2600 },
        { id: 'jumps', label: 'Прыжки', title: 'Топ по прыжкам', g: ['#fb923c', '#fdc28a'], head: 'Прыжков', place: '#fb923c', value: '#fca960', icon: '⇧', iconColor: '#fb923c', btn: 'rgba(72,32,8,.9)', max: 240000 }
    ];
    const NAMES = [
        'Steve_Pro', 'Kotik228', 'AlexCraft', 'NightFox', 'Pixel_Queen', 'Creeper4ik', 'DiamondDan', 'SnowyOwl',
        'RedstoneGuy', 'EnderLily', 'Blaze_Kid', 'MrBober', 'Luna_MC', 'IronWolf', 'Frosty', 'Shadow_Rin',
        'CactusJoe', 'Vanya_PvP', 'Molly', 'Tuman', 'GoldenBee', 'Nyashka', 'Stalker01', 'Rex'
    ];

    const state = { top: 0, period: 0, offset: 0, window: 0, anim: 'cascade' };
    const cache = new Map();
    const $ = id => document.getElementById(id);
    const els = {
        title: $('board-title'),
        titleWrap: board.querySelector('.board__title'),
        tabs: $('board-tabs'),
        headValue: $('board-head-value'),
        rows: $('board-rows'),
        personal: $('board-personal'),
        btns: $('board-btns'),
        buttons: $('board-buttons'),
        anim: $('board-anim')
    };

    function hash(str) {
        let h = 2166136261;
        for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
        return h >>> 0;
    }
    function rng(seed) {
        return function () {
            seed |= 0;
            seed = seed + 0x6D2B79F5 | 0;
            let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
            t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
            return ((t ^ t >>> 14) >>> 0) / 4294967296;
        };
    }

    function dataFor(top, period) {
        const key = top.id + ':' + period.id;
        if (cache.has(key)) return cache.get(key);
        const rand = rng(hash(key));
        const names = NAMES.slice();
        for (let i = names.length - 1; i > 0; i--) {
            const j = Math.floor(rand() * (i + 1));
            [names[i], names[j]] = [names[j], names[i]];
        }
        let value = top.max * period.k * (0.85 + rand() * 0.15);
        const rows = [];
        for (let i = 0; i < ROWS_TOTAL; i++) {
            rows.push({ name: names[i], value });
            value *= 0.74 + rand() * 0.2;
        }
        const data = { rows, personal: { place: 57, value: value * 0.4 } };
        cache.set(key, data);
        return data;
    }

    const format = (top, v) => (top.fmt ? top.fmt(v) : nf.format(Math.max(1, Math.round(v))));
    const valueHtml = (top, v) =>
        '<span style="color:' + top.value + '">' + esc(format(top, v)) + '</span> <span style="color:' + top.iconColor + '">' + top.icon + '</span>';

    function renderTabs() {
        els.tabs.innerHTML = PERIODS.map((p, i) =>
            '<button type="button" class="board__tab' + (i === state.period ? ' is-selected' : '') + '" aria-pressed="' + (i === state.period) +
            '" data-period="' + i + '">' + t(p.name) + '</button>').join('');
    }

    function renderButtons() {
        const html = [];
        for (let i = 0; i < BUTTONS_VISIBLE; i++) {
            const idx = (state.window + i) % TOPS.length, top = TOPS[idx], selected = idx === state.top;
            html.push('<button type="button" class="board__btn' + (selected ? ' is-selected' : '') + '" data-top="' + idx + '" aria-pressed="' + selected +
                '" style="--btn-bg:' + top.btn + ';--btn-ring:' + top.place + '59">' + t(top.label) + '</button>');
        }
        els.btns.innerHTML = html.join('');
    }

    function renderRows() {
        const top = TOPS[state.top], data = dataFor(top, PERIODS[state.period]);
        const cols = { place: [], name: [], value: [] };
        data.rows.slice(state.offset, state.offset + ROWS_VISIBLE).forEach((row, i) => {
            const delay = ' style="animation-delay:' + i * 28 + 'ms"';
            cols.place.push('<span class="c c--place"' + delay + '><span style="color:' + top.place + '">' + (state.offset + i + 1) + '</span></span>');
            cols.name.push('<span class="c c--name"' + delay + '>' + esc(row.name) + '</span>');
            cols.value.push('<span class="c c--value"' + delay + '>' + valueHtml(top, row.value) + '</span>');
        });
        els.rows.innerHTML = ['place', 'name', 'value'].map(k => '<div class="board__col">' + cols[k].join('') + '</div>').join('');
        els.personal.innerHTML =
            '<span class="c c--place"><span style="color:' + top.place + '">' + data.personal.place + '</span></span>' +
            '<span class="c c--name">' + t('Вы') + '</span><span class="c c--value">' + valueHtml(top, data.personal.value) + '</span>';
    }

    function renderHead() {
        const top = TOPS[state.top];
        els.title.textContent = t(top.title);
        els.titleWrap.style.setProperty('--g1', top.g[0]);
        els.titleWrap.style.setProperty('--g2', top.g[1]);
        els.headValue.textContent = t(top.head);
    }

    function playAnim() {
        if (reduceMotion) return;
        const name = state.anim === 'random' ? ANIMS[Math.floor(Math.random() * ANIMS.length)] : state.anim;
        ANIMS.forEach(a => board.classList.remove('anim-' + a));
        void board.offsetWidth;
        board.classList.add('anim-' + name);
        if (els.anim) els.anim.textContent = name.toUpperCase().replace('-', '_');
    }

    function render(animate) {
        renderHead();
        renderTabs();
        renderButtons();
        renderRows();
        if (animate) playAnim();
    }

    els.btns.addEventListener('click', e => {
        const b = e.target.closest('[data-top]');
        if (!b || Number(b.dataset.top) === state.top) return;
        state.top = Number(b.dataset.top);
        state.offset = 0;
        render(true);
    });
    els.tabs.addEventListener('click', e => {
        const b = e.target.closest('[data-period]');
        if (!b || Number(b.dataset.period) === state.period) return;
        state.period = Number(b.dataset.period);
        state.offset = 0;
        render(true);
    });
    board.querySelectorAll('.board__arrow').forEach(arrow => {
        arrow.addEventListener('click', () => {
            const n = TOPS.length, dir = Number(arrow.dataset.dir);
            state.top = (state.top + dir + n) % n;
            if ((state.top - state.window + n) % n >= BUTTONS_VISIBLE) {
                state.window = dir > 0 ? (state.top - BUTTONS_VISIBLE + 1 + n) % n : state.top;
            }
            state.offset = 0;
            render(true);
        });
    });

    let lastWheel = 0;
    els.rows.addEventListener('wheel', e => {
        const dir = Math.sign(e.deltaY), next = state.offset + dir;
        if (!dir || next < 0 || next > ROWS_TOTAL - ROWS_VISIBLE) return;
        e.preventDefault();
        const now = performance.now();
        if (now - lastWheel < 70) return;
        lastWheel = now;
        state.offset = next;
        ANIMS.forEach(a => board.classList.remove('anim-' + a));
        renderRows();
    }, { passive: false });

    const opt = id => document.getElementById(id);
    opt('board-opt-buttons')?.addEventListener('change', e => { els.buttons.hidden = !e.target.checked; });
    opt('board-opt-personal')?.addEventListener('change', e => { els.personal.hidden = !e.target.checked; });
    opt('board-opt-periods')?.addEventListener('change', e => {
        els.tabs.hidden = !e.target.checked;
        if (!e.target.checked && state.period) { state.period = 0; state.offset = 0; render(false); }
    });
    opt('board-opt-anim')?.addEventListener('change', e => { state.anim = e.target.value; render(true); });

    render(false);
})(Site);
