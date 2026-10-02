(function (Site) {
    'use strict';

    const { root, page, esc, t } = Site;

    if (location.protocol === 'file:') {
        document.querySelectorAll('a[href]').forEach(a => {
            const href = a.getAttribute('href');
            if (!/^[a-z]+:/i.test(href)) a.setAttribute('href', href.replace(/^([^#?]*\/)(?=[#?]|$)/, '$1index.html'));
        });
    }

    const themeMeta = document.querySelector('meta[name="theme-color"]');
    const syncThemeColor = () => {
        if (themeMeta) themeMeta.setAttribute('content', root.dataset.theme === 'light' ? '#f5f4f0' : '#14161b');
    };
    syncThemeColor();
    document.addEventListener('click', e => {
        if (!e.target.closest('[data-theme-toggle]')) return;
        const next = root.dataset.theme === 'light' ? 'dark' : 'light';
        root.dataset.theme = next;
        Site.store('theme', next);
        syncThemeColor();
        document.dispatchEvent(new Event('themechange'));
    });

    const themeButton =
        '<button class="theme-toggle" type="button" data-theme-toggle aria-label="' + t('Сменить тему') + '" title="' + t('Сменить тему') + '">' +
        '<svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4"/></svg>' +
        '<svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>' +
        '</button>';

    const langButton =
        '<button class="lang-toggle" type="button" data-lang-toggle aria-label="' + t('Сменить язык') + '" title="' + t('Сменить язык') + '">' +
        ['ru', 'en'].map(l => '<span' + (l === Site.lang ? ' class="is-on"' : '') + '>' + l.toUpperCase() + '</span>').join('') + '</button>';
    document.addEventListener('click', e => {
        if (e.target.closest('[data-lang-toggle]')) Site.setLang(Site.lang === 'en' ? 'ru' : 'en');
    });

    const navHost = document.querySelector('[data-include="nav"]');
    if (navHost) {
        const link = (href, text, key) =>
            '<a href="' + href + '" class="nav__link' + (page === key ? ' is-active' : '') + '"' +
            (page === key ? ' aria-current="page"' : '') + '>' + text + '</a>';
        const item = (entry, url) =>
            '<a class="nav__item' + (entry.id === page ? ' is-current' : '') + '" href="' + url + '" style="--accent:' + Site.accentOf(entry) + '"' +
            (entry.id === page ? ' aria-current="page"' : '') + '>' +
            '<span class="nav__item-icon">' + Site.iconImg(entry, 26) + '</span>' +
            '<span><b>' + esc(entry.name) + '</b><small>' + esc(t(entry.tagline)) + '</small></span></a>';
        const dropdown = (id, label, entries, urlOf, allHref, allText) =>
            '<div class="nav__dd"><button type="button" class="nav__link' + (entries.some(e => e.id === page) ? ' is-active' : '') +
            '" aria-expanded="false" aria-controls="nav-' + id + '">' + label + Site.icons.chevron + '</button>' +
            '<div class="nav__panel" id="nav-' + id + '" hidden>' + entries.map(e => item(e, urlOf(e))).join('') +
            '<a class="nav__all" href="' + allHref + '">' + allText + '</a></div></div>';

        navHost.id = 'nav';
        navHost.innerHTML =
            '<div class="container nav__inner">' +
            '<a href="' + Site.url('') + '" class="brand" aria-label="' + t('На главную') + '"><img src="' + Site.url('assets/img/favicon.svg') + '" alt="" width="30" height="30"><span>' + t('Разработчики на выходных') + '</span></a>' +
            '<nav class="nav__links" aria-label="' + t('Разделы') + '">' +
            dropdown('plugins', t('Плагины'), Site.visiblePlugins, Site.pluginUrl.bind(Site), Site.url('#plugins'), t('Все плагины →')) +
            dropdown('builds', t('Сборки'), Site.visibleBuilds, Site.buildUrl.bind(Site), Site.url('#builds'), t('Все сборки →')) +
            link(Site.url('stats/'), t('Статистика'), 'stats') +
            '</nav><div class="nav__tools">' + langButton + themeButton + '</div></div>';

        const dds = navHost.querySelectorAll('.nav__dd');
        const setOpen = (dd, open) => {
            dd.querySelector('.nav__panel').hidden = !open;
            dd.querySelector('button').setAttribute('aria-expanded', String(open));
        };
        dds.forEach(dd => {
            const button = dd.querySelector('button'), panel = dd.querySelector('.nav__panel');
            button.addEventListener('click', () => {
                const willOpen = panel.hidden;
                dds.forEach(other => setOpen(other, false));
                setOpen(dd, willOpen);
            });
        });
        document.addEventListener('click', e => { if (!e.target.closest('.nav__dd')) dds.forEach(dd => setOpen(dd, false)); });
        document.addEventListener('keydown', e => {
            if (e.key !== 'Escape') return;
            dds.forEach(dd => { if (!dd.querySelector('.nav__panel').hidden) { setOpen(dd, false); dd.querySelector('button').focus(); } });
        });
    }

    const footerHost = document.querySelector('[data-include="footer"]');
    if (footerHost) {
        footerHost.innerHTML =
            '<div class="container"><div class="footer__bottom">' +
            '<p>© ' + new Date().getFullYear() + ' · ' + t('Все права защищены') + '</p>' +
            '<p class="footer__status"><span class="footer__dot" aria-hidden="true"></span>' + t('Все системы работают') + '</p>' +
            '</div></div>';

        const toTop = document.createElement('button');
        toTop.className = 'back-to-top';
        toTop.type = 'button';
        toTop.setAttribute('aria-label', t('Наверх'));
        toTop.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"/></svg>';
        toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: Site.reduceMotion ? 'auto' : 'smooth' }));
        document.body.appendChild(toTop);
    }

    const nav = document.getElementById('nav');
    const toTop = document.querySelector('.back-to-top');
    let ticking = false;
    const onScroll = () => {
        ticking = false;
        const y = window.scrollY;
        if (nav) nav.classList.toggle('is-scrolled', y > 8);
        if (toTop) toTop.classList.toggle('is-visible', y > 600);
    };
    window.addEventListener('scroll', () => {
        if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
    }, { passive: true });
    onScroll();
})(Site);
