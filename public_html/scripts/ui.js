(function () {
    const toggleNav = (toggle) => {
        const targetId = toggle.getAttribute('data-target');
        if (!targetId) return;
        const nav = document.getElementById(targetId);
        if (!nav) return;
        toggle.addEventListener('click', () => {
            const isOpen = nav.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', String(isOpen));
        });
    };

    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('[data-nav-toggle]').forEach(toggleNav);
    });
})();
