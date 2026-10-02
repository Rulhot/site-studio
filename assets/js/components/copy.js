(function (Site) {
    'use strict';

    function copyText(text) {
        if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand('copy');
        ta.remove();
        return ok ? Promise.resolve() : Promise.reject(new Error('copy failed'));
    }

    document.addEventListener('click', e => {
        const el = e.target.closest('[data-copy]');
        if (!el) return;
        copyText(el.dataset.copy).then(() => {
            el.dataset.copied = Site.t('скопировано');
            el.classList.add('is-copied');
            setTimeout(() => el.classList.remove('is-copied'), 1400);
        }).catch(() => {});
    });
})(Site);
