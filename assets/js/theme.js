(function () {
    var d = document.documentElement, t = null, l = null;
    d.classList.add('js');
    try { t = localStorage.getItem('theme'); l = localStorage.getItem('lang'); } catch (e) { }

    if (t !== 'light' && t !== 'dark') {
        t = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    d.setAttribute('data-theme', t);

    if (l !== 'ru' && l !== 'en') {
        var n = (navigator.languages && navigator.languages[0]) || navigator.language || 'ru';
        l = /^(ru|uk|be|kk)/i.test(n) ? 'ru' : 'en';
    }
    d.lang = l;

    if (l === 'en') {
        var src = document.currentScript && document.currentScript.src;
        if (src) document.write('<script src="' + src.replace(/theme\.js(\?.*)?$/, 'i18n/en.js') + '" defer><\/script>');
        d.classList.add('i18n-pending');
        var done = function () { d.classList.remove('i18n-pending'); };
        document.addEventListener('DOMContentLoaded', done);
        setTimeout(done, 3000);
    }
})();
