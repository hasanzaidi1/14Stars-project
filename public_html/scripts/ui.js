(function () {
    const THEME_STORAGE_KEY = '14stars-theme';
    const themeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    let canUseStorage = true;
    let themeToggleButton = null;

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

    const readStoredTheme = () => {
        if (!canUseStorage) return null;
        try {
            const stored = localStorage.getItem(THEME_STORAGE_KEY);
            return stored === 'light' || stored === 'dark' ? stored : null;
        } catch (error) {
            canUseStorage = false;
            console.warn('Theme preference unavailable:', error);
            return null;
        }
    };

    const persistTheme = (theme) => {
        if (!canUseStorage) return;
        try {
            if (theme === 'light' || theme === 'dark') {
                localStorage.setItem(THEME_STORAGE_KEY, theme);
            } else {
                localStorage.removeItem(THEME_STORAGE_KEY);
            }
        } catch (error) {
            canUseStorage = false;
            console.warn('Unable to store theme preference:', error);
        }
    };

    const getSystemTheme = () => (themeMediaQuery.matches ? 'dark' : 'light');
    const getActiveTheme = () => readStoredTheme() || getSystemTheme();

    const updateToggleLabel = () => {
        if (!themeToggleButton) return;
        const effectiveTheme = getActiveTheme();
        const nextTheme = effectiveTheme === 'dark' ? 'light' : 'dark';
        const label = themeToggleButton.querySelector('.theme-toggle__label');

        themeToggleButton.setAttribute('aria-pressed', String(effectiveTheme === 'dark'));
        themeToggleButton.dataset.mode = effectiveTheme;

        if (label) {
            label.textContent = nextTheme === 'dark' ? 'Dark Mode' : 'Light Mode';
        }
    };

    const applyTheme = (theme) => {
        const root = document.documentElement;
        if (theme === 'light' || theme === 'dark') {
            root.dataset.theme = theme;
        } else {
            delete root.dataset.theme;
        }
        updateToggleLabel();
    };

    const handleThemeToggle = () => {
        const nextTheme = getActiveTheme() === 'dark' ? 'light' : 'dark';
        persistTheme(nextTheme);
        applyTheme(nextTheme);
    };

    const initThemeToggle = () => {
        const header = document.querySelector('.site-header');
        if (!header || header.querySelector('.theme-toggle')) return;

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn btn--ghost theme-toggle';
        button.setAttribute('aria-label', 'Toggle between light and dark appearance');
        button.setAttribute('aria-pressed', 'false');
        button.innerHTML = '<span class="theme-toggle__label">Dark Mode</span>';
        button.addEventListener('click', handleThemeToggle);

        header.appendChild(button);
        themeToggleButton = button;
        updateToggleLabel();
    };

    const handleSystemThemeChange = () => {
        if (!readStoredTheme()) {
            applyTheme(null);
        }
    };

    const bindSystemThemeListener = () => {
        if (typeof themeMediaQuery.addEventListener === 'function') {
            themeMediaQuery.addEventListener('change', handleSystemThemeChange);
        } else if (typeof themeMediaQuery.addListener === 'function') {
            themeMediaQuery.addListener(handleSystemThemeChange);
        }
    };

    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('[data-nav-toggle]').forEach(toggleNav);
        initThemeToggle();
        const storedTheme = readStoredTheme();
        applyTheme(storedTheme);
        bindSystemThemeListener();
    });
})();
