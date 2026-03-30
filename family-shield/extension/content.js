// FamilyShield Content Script
// Tracks time spent on each page

(function() {
    const domain = window.location.hostname;
    let startTime = Date.now();
    let isActive = true;
    
    // Track visibility changes
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            // Page hidden, stop tracking
            if (isActive) {
                reportTime();
                isActive = false;
            }
        } else {
            // Page visible, start tracking
            startTime = Date.now();
            isActive = true;
        }
    });
    
    // Track before page unload
    window.addEventListener('beforeunload', () => {
        if (isActive) {
            reportTime();
        }
    });
    
    // Report time every 30 seconds
    setInterval(() => {
        if (isActive && !document.hidden) {
            reportTime();
        }
    }, 30000);
    
    function reportTime() {
        const elapsed = (Date.now() - startTime) / 60000; // minutes
        if (elapsed > 0.1) { // Only report if more than 6 seconds
            chrome.runtime.sendMessage({
                type: 'updateBrowsing',
                domain: domain,
                minutes: elapsed
            });
        }
        startTime = Date.now();
    }
    
    // Check if site is blocked
    chrome.runtime.sendMessage({
        type: 'isBlocked',
        url: window.location.href
    }, (response) => {
        if (response && response.blocked) {
            document.body.innerHTML = `
                <div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#0f172a;color:#f1f5f9;font-family:system-ui;">
                    <div style="text-align:center;padding:40px;">
                        <div style="font-size:4em;margin-bottom:20px;">🛡️</div>
                        <h1 style="margin-bottom:16px;">Site Blocked by FamilyShield</h1>
                        <p style="color:#94a3b8;margin-bottom:24px;">This website has been blocked by your parent's parental control settings.</p>
                        <p style="color:#94a3b8;font-size:0.9em;">If you believe this is an error, please contact your parent.</p>
                    </div>
                </div>
            `;
        }
    });
})();
