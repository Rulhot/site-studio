(function (Site) {
    'use strict';

    const host = document.querySelector('[data-builds-catalog]');
    if (!host) return;
    const { esc, t } = Site;

    const card = b =>
        '<a class="pcard spot reveal" href="' + Site.buildUrl(b) + '" style="--accent:' + Site.accentOf(b) + '">' +
        '<span class="pcard__icon">' + Site.iconImg(b, 30) + '</span>' +
        '<span class="pcard__name">' + esc(b.name) + '</span>' +
        '<span class="pcard__text">' + esc(t(b.text)) + '</span>' +
        '<span class="pcard__meta">' + esc(b.meta) + ' <span class="pcard__arrow" aria-hidden="true">→</span></span></a>';

    const soon =
        '<a class="pcard pcard--soon reveal" href="https://discord.gg/qh7HUMdW" target="_blank" rel="noopener noreferrer" style="--accent: var(--text-3)">' +
        '<span class="pcard__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></span>' +
        '<span class="pcard__name">' + t('Скоро') + '</span>' +
        '<span class="pcard__text">' + t('Новая сборка уже в работе. Анонсы первыми появляются в нашем Discord.') + '</span>' +
        '<span class="pcard__meta">Discord <span class="pcard__arrow" aria-hidden="true">→</span></span></a>';

    host.innerHTML = Site.visibleBuilds.map(card).join('') + soon;
})(Site);
