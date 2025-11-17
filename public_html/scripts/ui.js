(function () {
    const THEME_STORAGE_KEY = '14stars-theme';
    const themeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    let canUseStorage = true;
    let themeToggleButton = null;
    const responsiveTableObservers = new WeakMap();
    const tableWrappers = new Set();

    const updateWrapperOverflow = (wrapper) => {
        if (!wrapper) return;
        const scrollWidth = Math.ceil(wrapper.scrollWidth);
        const clientWidth = Math.ceil(wrapper.clientWidth);
        const canScroll = scrollWidth > clientWidth + 1;
        const maxScrollLeft = scrollWidth - clientWidth;

        wrapper.classList.toggle('is-scrollable', canScroll);
        wrapper.classList.toggle('has-scroll-left', canScroll && wrapper.scrollLeft > 1);
        wrapper.classList.toggle('has-scroll-right', canScroll && wrapper.scrollLeft < maxScrollLeft - 1);
    };

    const registerWrapper = (wrapper) => {
        if (!wrapper || tableWrappers.has(wrapper)) {
            if (wrapper) {
                updateWrapperOverflow(wrapper);
            }
            return;
        }

        tableWrappers.add(wrapper);
        updateWrapperOverflow(wrapper);
        wrapper.addEventListener('scroll', () => updateWrapperOverflow(wrapper), { passive: true });
    };

    const handleWrapperResize = () => {
        tableWrappers.forEach((wrapper) => updateWrapperOverflow(wrapper));
    };

    window.addEventListener('resize', handleWrapperResize, { passive: true });

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

    const getHeaderLabels = (table) => {
        if (!table || !table.tHead) return [];
        return Array.from(table.tHead.querySelectorAll('th')).map((th) => th.textContent.trim());
    };

    const setCellLabel = (cell, label) => {
        if (!cell) return;
        if (cell.hasAttribute('data-label') && cell.dataset.autoLabel !== 'true') return;
        cell.dataset.autoLabel = 'true';
        cell.setAttribute('data-label', label || '');
    };

    const syncResponsiveTable = (table) => {
        if (!table || !table.tHead || !table.tBodies.length) return;
        const labels = getHeaderLabels(table);
        if (!labels.length) return;

        table.dataset.mobileStack = 'true';
        Array.from(table.tBodies).forEach((tbody) => {
            Array.from(tbody.rows).forEach((row) => {
                Array.from(row.cells).forEach((cell, index) => {
                    if (cell.colSpan && cell.colSpan > 1) {
                        setCellLabel(cell, '');
                        return;
                    }
                    const fallback = cell.getAttribute('aria-label') || cell.getAttribute('data-label') || '';
                    const headerLabel = labels[index] || fallback;
                    setCellLabel(cell, headerLabel);
                });
            });
        });

        registerWrapper(table.closest('.data-table-wrapper, .table-wrapper'));
    };

    const observeTableBody = (table, tbody) => {
        if (!tbody) return null;
        const observer = new MutationObserver(() => syncResponsiveTable(table));
        observer.observe(tbody, { childList: true, subtree: true });
        return observer;
    };

    const enhanceResponsiveTable = (table) => {
        if (!table || table.dataset.mobileEnhanced === 'true') return;
        if (!table.tHead || !table.tBodies.length) return;

        table.dataset.mobileEnhanced = 'true';
        syncResponsiveTable(table);

        const observers = Array.from(table.tBodies)
            .map((tbody) => observeTableBody(table, tbody))
            .filter(Boolean);

        if (observers.length) {
            responsiveTableObservers.set(table, observers);
        }
    };

    const initResponsiveTables = () => {
        document
            .querySelectorAll('.data-table-wrapper table, .table-wrapper table')
            .forEach((table) => enhanceResponsiveTable(table));
    };

    const initScrollableWrappers = () => {
        document
            .querySelectorAll('.data-table-wrapper, .table-wrapper')
            .forEach((wrapper) => registerWrapper(wrapper));
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
        initScrollableWrappers();
        initResponsiveTables();
        initThemeToggle();
        const storedTheme = readStoredTheme();
        applyTheme(storedTheme);
        bindSystemThemeListener();
    });
})();
