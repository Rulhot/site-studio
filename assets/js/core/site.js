const Site = (function () {
    'use strict';

    const lang = document.documentElement.lang === 'en' ? 'en' : 'ru';
    const dict = typeof I18N_EN === 'undefined' ? {} : I18N_EN;
    const nf = new Intl.NumberFormat(lang === 'en' ? 'en-US' : 'ru-RU');
    const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    const Site = {
        root: document.documentElement,
        lang,
        dict,
        page: document.body.dataset.page || '',
        base: document.body.dataset.root || './',
        url(path) {
            const u = this.base + path;
            return location.protocol === 'file:' ? u.replace(/^([^#?]*\/)(?=[#?]|$)/, '$1index.html') : u;
        },
        pluginUrl(p) { return this.url('plugins/' + p.id + '/'); },
        reduceMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        canHover: window.matchMedia('(hover: hover)').matches,
        nf,
        esc,

        store(key, value) {
            try {
                if (value === undefined) return localStorage.getItem(key);
                localStorage.setItem(key, value);
            } catch (e) { }
            return null;
        },

        PLUGINS,
        visiblePlugins: PLUGINS.filter(p => !p.hidden),
        pluginByName: name => PLUGINS.find(p => p.name === name || p.id === String(name).toLowerCase()),
        accentOf: p => (p ? 'var(--' + p.accent + ')' : 'var(--text-2)'),
        iconImg: (p, size) => '<img src="' + esc(Site.url(p.icon)) + '" alt="" width="' + size + '" height="' + size + '"' + (p.iconSmooth ? '' : ' class="pixel"') + ' loading="lazy">',

        BUILDS,
        visibleBuilds: BUILDS.filter(b => !b.hidden),
        buildUrl(b) { return this.url('builds/' + b.id + '/'); },

        t(key, vars) {
            let s = lang === 'en' && key in dict ? dict[key] : key;
            if (vars) s = s.replace(/\{(\w+)\}/g,(m, k) => (k in vars ? vars[k] : m));
            return s;
        },
        setLang(next) {
            this.store('lang', next);
            location.reload();
        },

        plural(n, one, few, many) {
            if (lang === 'en') return this.t(n === 1 ? one : many);
            const n10 = n % 10, n100 = n % 100;
            if (n10 === 1 && n100 !== 11) return one;
            if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return few;
            return many;
        },

        whenVisible(el, fn) {
            if (!('IntersectionObserver' in window)) return fn(el);
            const io = new IntersectionObserver(entries => {
                if (entries[0].isIntersecting) { io.disconnect(); fn(el); }
            }, { rootMargin: '200px 0px' });
            io.observe(el);
        },

        icons: {
            chevron: '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>'
        }
    };
    return Site;
})();
