(function (Site) {
    'use strict';

    if (Site.lang !== 'en') return;

    const HTML_NS = 'http://www.w3.org/1999/xhtml';
    const SKIP = /^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE)$/;
    const CYRILLIC = /[А-Яа-яЁё]/;
    const norm = s => s.replace(/\s+/g, ' ').trim();
    const find = key => (key in Site.dict ? Site.dict[key] : null);

    document.title = find('@' + norm(document.title)) || document.title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = find('@' + norm(meta.content)) || meta.content;

    for (const el of Array.from(document.body.querySelectorAll('*'))) {
        if (!el.isConnected || el.namespaceURI !== HTML_NS || SKIP.test(el.tagName)) continue;

        for (const attr of ['aria-label', 'title', 'alt']) {
            const value = el.getAttribute(attr);
            if (value && CYRILLIC.test(value)) el.setAttribute(attr, find('@' + norm(value)) || value);
        }

        const texts = Array.from(el.childNodes).filter(n => n.nodeType === 3 && CYRILLIC.test(n.nodeValue));
        if (!texts.length) continue;

        if (!el.children.length) {
            const ru = norm(el.textContent), en = find(ru);
            if (en) el.textContent = en;
            continue;
        }
        const whole = find(norm(el.innerHTML));
        if (whole) { el.innerHTML = whole; continue; }
        for (const node of texts) {
            const ru = norm(node.nodeValue), en = find(ru);
            if (en) node.nodeValue = node.nodeValue.replace(ru, () => en);
        }
    }
})(Site);
