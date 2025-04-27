let isEnabled = true;

// Load initial state
chrome.storage.sync.get(['enabled'], function(result) {
    isEnabled = result.enabled !== false; // Default to true if not set
});

// Listen for toggle messages from popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'toggleRedirect') {
        isEnabled = request.enabled;
    }
});

// Redirect main Yandex domains to game
chrome.webNavigation.onBeforeNavigate.addListener(
    function(details) {
        try {
            const url = new URL(details.url);
            // Исключаем метрику и технические домены
            if (url.hostname === 'mc.yandex.ru' && url.pathname.includes('/metrika/metrika_match.html')) {
                return;
            }

            // Проверяем все возможные домены яндекса и связанные сервисы
            const isYandexDomain = url.hostname.endsWith('yandex.ru') || 
                                 url.hostname.endsWith('yandex.com') || 
                                 url.hostname.endsWith('yandex.net') ||
                                 url.hostname.endsWith('.yandex') ||  // Любой поддомен .yandex
                                 url.hostname === 'yandex' ||         // Сам домен yandex
                                 url.hostname.endsWith('yandex.cloud') || // Яндекс.Облако
                                 url.hostname === 'ya.ru' ||
                                 url.hostname === 'www.ya.ru' ||
                                 url.hostname === 'dzen.ru' ||
                                 url.hostname === 'www.dzen.ru' ||
                                 url.hostname === 'elama.ru' ||       // eLama
                                 url.hostname === 'www.elama.ru';
            
            if (isEnabled && isYandexDomain) {
                chrome.tabs.update(details.tabId, {
                    url: chrome.runtime.getURL('/game/siskiplay.html')
                });
            }
        } catch (error) {
            console.error('Error processing URL:', error);
        }
    },
    {
        url: [
            {hostSuffix: 'yandex.ru'},
            {hostSuffix: 'yandex.com'},
            {hostSuffix: 'yandex.net'},
            {hostSuffix: '.yandex'},
            {hostSuffix: 'yandex.cloud'},
            {hostEquals: 'yandex'},
            {hostEquals: 'ya.ru'},
            {hostEquals: 'www.ya.ru'},
            {hostEquals: 'dzen.ru'},
            {hostEquals: 'www.dzen.ru'},
            {hostEquals: 'elama.ru'},
            {hostEquals: 'www.elama.ru'}
        ]
    }
); 