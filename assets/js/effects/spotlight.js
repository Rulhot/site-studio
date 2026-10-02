(function (Site) {
    'use strict';

    if (!Site.canHover || Site.reduceMotion) return;
    let raf = 0, last = null;
    document.addEventListener('pointermove', e => {
        last = e;
        if (raf) return;
        raf = requestAnimationFrame(() => {
            raf = 0;
            const el = last.target.closest && last.target.closest('.spot');
            if (!el) return;
            const r = el.getBoundingClientRect();
            el.style.setProperty('--mx', last.clientX - r.left + 'px');
            el.style.setProperty('--my', last.clientY - r.top + 'px');
        });
    }, { passive: true });
})(Site);
