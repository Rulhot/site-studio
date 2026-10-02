(function (Site) {
    'use strict';

    const demo = document.getElementById('exp-demo');
    if (!demo) return;

    const LEVELS_PER_BOTTLE = 15, KEEP_LEVELS = 30, MAX_PER_CYCLE = 64;
    const state = { level: 45, bottles: 2, glass: 14, auto: false };
    const $ = id => document.getElementById(id);
    const btn = name => demo.querySelector('[data-exp="' + name + '"]');
    const els = {
        level: $('exp-level'), bar: $('exp-bar'), bottles: $('exp-bottles'), glass: $('exp-glass'),
        auto: $('exp-auto'), note: $('exp-note'),
        gain: btn('gain'), pack: btn('pack'), drink: btn('drink'),
        packAll: btn('pack-all'), drinkAll: btn('drink-all'), give: btn('give')
    };
    const bottleSlot = els.bottles.parentElement, glassSlot = els.glass.parentElement;
    const { t } = Site;
    const bottles = n => n + ' ' + Site.plural(n, 'бутылочка', 'бутылочки', 'бутылочек');

    function bump(el) {
        el.classList.remove('bump', 'pop');
        void el.offsetWidth;
        el.classList.add(el === els.level ? 'bump' : 'pop');
        setTimeout(() => el.classList.remove('bump', 'pop'), 320);
    }
    function packOnce() {
        if (state.level < LEVELS_PER_BOTTLE || state.glass < 1) return false;
        state.level -= LEVELS_PER_BOTTLE;
        state.glass -= 1;
        state.bottles += 1;
        return true;
    }
    const note = text => { els.note.textContent = text; };
    function render() {
        els.level.textContent = state.level;
        els.bar.style.width = (20 + (state.level * 7) % 70) + '%';
        els.bottles.textContent = state.bottles;
        els.glass.textContent = state.glass;
        bottleSlot.classList.toggle('is-empty', state.bottles === 0);
        glassSlot.classList.toggle('is-empty', state.glass === 0);
        els.pack.disabled = els.packAll.disabled = state.level < LEVELS_PER_BOTTLE || state.glass < 1;
        els.drink.disabled = els.drinkAll.disabled = state.bottles === 0;
        els.give.disabled = state.bottles >= 64;
        els.gain.disabled = state.level >= 999;
    }

    els.gain.addEventListener('click', () => {
        state.level += 10;
        let packed = 0;
        if (state.auto) while (state.level - LEVELS_PER_BOTTLE >= KEEP_LEVELS && packed < MAX_PER_CYCLE && packOnce()) packed++;
        bump(els.level);
        if (packed) {
            bump(bottleSlot);
            note(t('Автоконвертация упаковала {n}, у игрока осталось {lvl} LVL.', {
                n: packed + ' ' + Site.plural(packed, 'бутылочку', 'бутылочки', 'бутылочек'), lvl: state.level
            }));
        } else if (state.auto && state.glass === 0) {
            note(t('Для автоконвертации нужна пустая склянка в инвентаре (require-glass-bottle).'));
        } else {
            note(t('Игрок получил 10 уровней.'));
        }
        render();
    });
    els.pack.addEventListener('click', () => {
        if (packOnce()) {
            bump(els.level);
            bump(bottleSlot);
            note(t('/rexp pack bottle 15 - одна склянка превратилась в бутылочку на 15 LVL.'));
        }
        if (state.glass === 0) note(t('Склянки закончились: без пустой бутылки упаковать опыт нельзя.'));
        render();
    });
    els.packAll.addEventListener('click', () => {
        let packed = 0;
        while (packed < MAX_PER_CYCLE && packOnce()) packed++;
        if (!packed) return;
        bump(els.level);
        bump(bottleSlot);
        note(t('/rexp pack bottle 15 {count} - упаковано {n}, осталось {lvl} LVL.', { count: packed, n: bottles(packed), lvl: state.level }));
        render();
    });
    els.drink.addEventListener('click', () => {
        if (state.bottles < 1) return;
        state.bottles -= 1;
        state.level += LEVELS_PER_BOTTLE;
        bump(els.level);
        bump(bottleSlot);
        note(t('ПКМ по бутылочке - вернули 15 уровней.'));
        render();
    });
    els.drinkAll.addEventListener('click', () => {
        const n = state.bottles;
        if (!n) return;
        state.bottles = 0;
        state.level += n * LEVELS_PER_BOTTLE;
        bump(els.level);
        bump(bottleSlot);
        note(t('Выпито {n}: +{lvl} LVL.', { n: bottles(n), lvl: n * LEVELS_PER_BOTTLE }));
        render();
    });
    els.give.addEventListener('click', () => {
        state.bottles += 1;
        bump(bottleSlot);
        note(t('/rexp give Steve 15 - админ выдал бутылочку на 15 LVL, опыт и склянки не тратятся.'));
        render();
    });
    els.auto.addEventListener('change', () => {
        state.auto = els.auto.checked;
        note(state.auto
            ? t('Автоконвертация включена: всё, что выше 30 LVL, уходит в бутылочки после получения опыта.')
            : t('Автоконвертация выключена.'));
    });

    render();
})(Site);
