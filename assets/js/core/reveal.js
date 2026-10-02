(function (Site) {
    'use strict';

    const items = document.querySelectorAll('.reveal');

    items.forEach(el => {
        const parent = el.parentElement;
        if (parent && parent.matches('.pcards, .principles, .adv-grid, .steps, .stats-grid')) {
            el.style.transitionDelay = (Array.prototype.indexOf.call(parent.children, el) % 6) * 60 + 'ms';
        }
    });

    const done = el => {
        el.classList.remove('reveal', 'is-in');
        el.style.removeProperty('transition-delay');
    };

    if (!('IntersectionObserver' in window) || Site.reduceMotion) {
        items.forEach(done);
        return;
    }

    const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            io.unobserve(el);
            el.classList.add('is-in');
            setTimeout(() => done(el), 650 + (parseFloat(el.style.transitionDelay) || 0));
        });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.forEach(el => io.observe(el));
})(Site);
