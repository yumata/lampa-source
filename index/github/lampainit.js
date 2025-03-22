(async function () {
    'use strict';

    const FETCH_URL = '/initialSettings.json';
    const CHECK_LAMPA_INTERVAL = 200;
    const CHECK_DCMA_INTERVAL = 100;
    let initialSettings = [];

    // Fetch and initialize settings
    async function fetchInitialSettings() {
        try {
            const response = await fetch(FETCH_URL);
            if (response.ok)
                initialSettings = await response.json();
        } catch (error) {
            console.error(error);
        }
    }

    // Check and initialize Lampa's configuration
    async function waitForLampaInitialization() {
        while (typeof Lampa === 'undefined') {
            await delay(CHECK_LAMPA_INTERVAL);
        }

        const unicId = Lampa.Storage.get('lampa_uniq_id', generateUniqueId());
        Lampa.Storage.set('lampa_uniq_id', unicId);

        const accountEmail = encodeURIComponent(Lampa.Storage.get('account_email', ''));
        const encodedUid = encodeURIComponent(Lampa.Storage.get('lampa_uniq_id', ''));
        const initScript = `/privateinit.js?account_email=${accountEmail}&uid=${encodedUid}`;
        Lampa.Utils.putScriptAsync([initScript]);

        Object.assign(window.lampa_settings, {
            torrents_use: true,
            demo: false,
            read_only: false
        });
    }

    // Check and disable DCMA if required
    async function waitForDcmaDisable() {
        while (!window.lampa_settings || !window.lampa_settings.fixdcma && !window.lampa_settings.dcma) {
            await delay(CHECK_DCMA_INTERVAL);
        }

        if (window.lampa_settings.dcma) {
            window.lampa_settings.dcma = false;
        }
    }

    // Delay utility for `await`
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Generate unique ID
    function generateUniqueId() {
        return Lampa.Utils.uid(8).toLowerCase();
    }

    // Start initialization
    function start(settings) {
        Lampa.Storage.set('lampa_initialized', 'true');
        initializeSettings(settings);
        initializePlugins(settings['plugins'] || []);
    }

    // Load settings into storage
    function initializeSettings(settings) {
        for (const [key, value] of Object.entries(settings)) {
            if (key !== 'plugins') {
                Lampa.Storage.set(key, value);
            }
        }
    }

    // Load plugins
    function initializePlugins(pluginsToAdd) {
        const existingPlugins = Lampa.Plugins.get();
        const newPluginUrls = [];

        pluginsToAdd.forEach(plugin => {
            if (!existingPlugins.some(({url}) => url === plugin.url)) {
                Lampa.Plugins.add(plugin);
                Lampa.Plugins.save();
                newPluginUrls.push(plugin.url);
            }
        });

        if (newPluginUrls.length > 0) {
            Lampa.Utils.putScript(newPluginUrls);
        }
    }

    await Promise.all([waitForLampaInitialization(), fetchInitialSettings()]);

    if (!Lampa.Storage.get('lampa_initialized', 'false')) {
        start(initialSettings);
    }

    await waitForDcmaDisable();

})();
