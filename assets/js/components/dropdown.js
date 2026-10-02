(function (Site) {
    'use strict';

    document.querySelectorAll('select[data-dropdown]').forEach(select => {
        const wrap = document.createElement('div');
        wrap.className = 'dd';

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'dd__btn';
        button.setAttribute('aria-haspopup', 'listbox');
        button.setAttribute('aria-expanded', 'false');
        if (select.getAttribute('aria-label')) button.setAttribute('aria-label', select.getAttribute('aria-label'));

        const list = document.createElement('ul');
        list.className = 'dd__list';
        list.setAttribute('role', 'listbox');
        list.tabIndex = -1;
        list.hidden = true;
        list.innerHTML = Array.from(select.options)
            .map((o, i) => '<li role="option" data-index="' + i + '">' + Site.esc(o.textContent) + '</li>').join('');

        select.hidden = true;
        select.after(wrap);
        wrap.append(button, list);

        const items = Array.from(list.children);
        let active = select.selectedIndex;

        const renderButton = () => {
            button.innerHTML = '<span>' + Site.esc(select.options[select.selectedIndex].textContent) + '</span>' + Site.icons.chevron;
        };
        const renderItems = () => items.forEach((li, i) => {
            li.setAttribute('aria-selected', String(i === select.selectedIndex));
            li.classList.toggle('is-active', i === active);
        });

        function setOpen(open) {
            list.hidden = !open;
            button.setAttribute('aria-expanded', String(open));
            if (open) { active = select.selectedIndex; renderItems(); list.focus(); }
        }
        function choose(i) {
            if (i !== select.selectedIndex) {
                select.selectedIndex = i;
                select.dispatchEvent(new Event('change', { bubbles: true }));
            }
            setOpen(false);
            renderButton();
            renderItems();
            button.focus();
        }

        button.addEventListener('click', () => setOpen(list.hidden));
        list.addEventListener('click', e => {
            const li = e.target.closest('li');
            if (li) choose(Number(li.dataset.index));
        });
        list.addEventListener('mousemove', e => {
            const li = e.target.closest('li');
            if (li) { active = Number(li.dataset.index); renderItems(); }
        });
        list.addEventListener('keydown', e => {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                active = (active + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
                renderItems();
            } else if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                choose(active);
            } else if (e.key === 'Escape' || e.key === 'Tab') {
                setOpen(false);
                button.focus();
            }
        });
        document.addEventListener('click', e => { if (!e.composedPath().includes(wrap)) setOpen(false); });

        renderButton();
        renderItems();
    });
})(Site);
