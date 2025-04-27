document.addEventListener('DOMContentLoaded', function() {
    const toggleSwitch = document.getElementById('redirectToggle');
    const statusText = document.getElementById('status');

    // Load saved state
    chrome.storage.sync.get(['enabled'], function(result) {
        toggleSwitch.checked = result.enabled !== false; // Default to true if not set
        updateStatus(toggleSwitch.checked);
    });

    // Handle toggle changes
    toggleSwitch.addEventListener('change', function() {
        const isEnabled = toggleSwitch.checked;
        
        // Save state
        chrome.storage.sync.set({ enabled: isEnabled }, function() {
            updateStatus(isEnabled);
            
            // Notify background script
            chrome.runtime.sendMessage({ action: 'toggleRedirect', enabled: isEnabled });
        });
    });

    function updateStatus(isEnabled) {
        statusText.textContent = isEnabled ? 'Статус: Яндекс идет нахуй' : 'Статус: ТЫ СЫН ЯНДЕКСА';
        statusText.className = 'status ' + (isEnabled ? 'enabled' : 'disabled');
    }
}); 