// FamilyShield Background Service Worker
// Handles time tracking, blocking, and reporting

const FamilyShield = {
    // Storage keys
    KEYS: {
        SETTINGS: 'fs_settings',
        BROWSING: 'fs_browsing',
        TIME_LIMIT: 'fs_time_limit',
        BLOCKED: 'fs_blocked_sites',
        PIN: 'fs_pin',
        CHILD_NAME: 'fs_child_name'
    },

    // Default settings
    defaults: {
        dailyLimitMinutes: 120,
        blockedCategories: ['adult', 'gambling', 'violence'],
        bedtimeStart: '21:00',
        bedtimeEnd: '07:00',
        homeworkStart: '16:00',
        homeworkEnd: '18:00',
        safeSearch: true,
        notifications: true
    },

    // Adult/inappropriate site patterns
    adultPatterns: [
        'porn', 'xxx', 'sex', 'nude', 'naked', 'adult', 'escort',
        'gambling', 'casino', 'bet', 'poker', 'lottery',
        'drugs', 'weed', 'cocaine', 'meth',
        'violence', 'gore', 'kill', 'murder',
        'darkweb', 'tor.onion'
    ],

    // Initialize
    async init() {
        const settings = await this.getSettings();
        if (!settings.initialized) {
            await this.saveSettings({ ...this.defaults, initialized: true });
            await this.savePIN('1234'); // Default PIN
        }
        this.setupAlarms();
        this.setupBlocklist();
    },

    // Settings management
    async getSettings() {
        const data = await chrome.storage.local.get(this.KEYS.SETTINGS);
        return data[this.KEYS.SETTINGS] || this.defaults;
    },

    async saveSettings(settings) {
        await chrome.storage.local.set({ [this.KEYS.SETTINGS]: settings });
    },

    async getPIN() {
        const data = await chrome.storage.local.get(this.KEYS.PIN);
        return data[this.KEYS.PIN] || '1234';
    },

    async savePIN(pin) {
        await chrome.storage.local.set({ [this.KEYS.PIN]: pin });
    },

    // Time tracking
    async getTodayBrowsing() {
        const today = new Date().toDateString();
        const data = await chrome.storage.local.get(this.KEYS.BROWSING);
        const browsing = data[this.KEYS.BROWSING] || {};
        return browsing[today] || { totalMinutes: 0, sites: [], lastActive: null };
    },

    async updateBrowsing(domain, minutes) {
        const today = new Date().toDateString();
        const data = await chrome.storage.local.get(this.KEYS.BROWSING);
        const browsing = data[this.KEYS.BROWSING] || {};
        
        if (!browsing[today]) {
            browsing[today] = { totalMinutes: 0, sites: [], lastActive: null };
        }
        
        browsing[today].totalMinutes += minutes;
        browsing[today].lastActive = Date.now();
        
        // Track per-site time
        const existingSite = browsing[today].sites.find(s => s.domain === domain);
        if (existingSite) {
            existingSite.minutes += minutes;
        } else {
            browsing[today].sites.push({ domain, minutes, visits: 1 });
        }
        
        // Sort sites by time spent
        browsing[today].sites.sort((a, b) => b.minutes - a.minutes);
        
        await chrome.storage.local.set({ [this.KEYS.BROWSING]: browsing });
        
        // Check time limit
        await this.checkTimeLimit(browsing[today].totalMinutes);
    },

    // Time limit checking
    async checkTimeLimit(totalMinutes) {
        const settings = await this.getSettings();
        if (totalMinutes >= settings.dailyLimitMinutes) {
            // Time limit reached!
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icons/icon128.png',
                title: 'FamilyShield - Time Limit Reached',
                message: `Daily limit of ${settings.dailyLimitMinutes} minutes reached.`
            });
            
            // Could block further browsing here
            await this.blockAllSites();
        } else if (totalMinutes >= settings.dailyLimitMinutes * 0.8) {
            // Warning at 80%
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icons/icon128.png',
                title: 'FamilyShield - Warning',
                message: `80% of daily screen time used (${totalMinutes}/${settings.dailyLimitMinutes} min)`
            });
        }
    },

    // Site blocking
    isBlocked(url) {
        const domain = new URL(url).hostname.toLowerCase();
        
        // Check adult patterns
        for (const pattern of this.adultPatterns) {
            if (domain.includes(pattern)) return true;
        }
        
        return false;
    },

    async setupBlocklist() {
        // Create blocking rules for known bad sites
        const rules = [
            { id: 1, priority: 1, action: { type: 'block' }, condition: { urlFilter: '*://*.porn*', resourceTypes: ['main_frame'] } },
            { id: 2, priority: 1, action: { type: 'block' }, condition: { urlFilter: '*://*.xxx*', resourceTypes: ['main_frame'] } },
            { id: 3, priority: 1, action: { type: 'block' }, condition: { urlFilter: '*://*.casino*', resourceTypes: ['main_frame'] } },
            { id: 4, priority: 1, action: { type: 'block' }, condition: { urlFilter: '*://*.gambling*', resourceTypes: ['main_frame'] } }
        ];
        
        try {
            await chrome.declarativeNetRequest.updateDynamicRules({
                addRules: rules
            });
        } catch (e) {
            console.log('Blocklist setup:', e);
        }
    },

    async blockAllSites() {
        // Block all sites when time limit reached
        const rules = [{
            id: 100,
            priority: 1,
            action: { type: 'block' },
            condition: { urlFilter: '*', resourceTypes: ['main_frame'] }
        }];
        
        try {
            await chrome.declarativeNetRequest.updateDynamicRules({
                addRules: rules
            });
        } catch (e) {
            console.log('Block all:', e);
        }
    },

    async unblockAllSites() {
        try {
            await chrome.declarativeNetRequest.updateDynamicRules({
                removeRuleIds: [100]
            });
        } catch (e) {
            console.log('Unblock:', e);
        }
    },

    // Bedtime/homework checking
    isRestrictedTime() {
        const now = new Date();
        const time = now.getHours() * 60 + now.getMinutes();
        
        return this.isBedtime(time) || this.isHomeworkTime(time);
    },

    isBedtime(time) {
        // 9 PM to 7 AM
        return time >= 21 * 60 || time < 7 * 60;
    },

    isHomeworkTime(time) {
        // 4 PM to 6 PM
        return time >= 16 * 60 && time < 18 * 60;
    },

    // Alarms setup
    setupAlarms() {
        // Check every minute for time tracking
        chrome.alarms.create('timeCheck', { periodInMinutes: 1 });
        
        // Daily reset at midnight
        chrome.alarms.create('dailyReset', { 
            when: this.nextMidnight() 
        });
    },

    nextMidnight() {
        const now = new Date();
        const midnight = new Date(now);
        midnight.setHours(24, 0, 0, 0);
        return midnight.getTime();
    },

    // Generate report
    async generateReport() {
        const browsing = await this.getTodayBrowsing();
        const settings = await this.getSettings();
        
        return {
            date: new Date().toDateString(),
            totalMinutes: browsing.totalMinutes,
            limitMinutes: settings.dailyLimitMinutes,
            percentUsed: Math.round(browsing.totalMinutes / settings.dailyLimitMinutes * 100),
            topSites: browsing.sites.slice(0, 10),
            isOverLimit: browsing.totalMinutes >= settings.dailyLimitMinutes,
            remainingMinutes: Math.max(0, settings.dailyLimitMinutes - browsing.totalMinutes)
        };
    }
};

// Listen for alarms
chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === 'timeCheck') {
        // Time tracking happens in content script
    } else if (alarm.name === 'dailyReset') {
        // Reset daily limits
        await FamilyShield.unblockAllSites();
    }
});

// Listen for messages from popup/content
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    (async () => {
        switch (message.type) {
            case 'getSettings':
                sendResponse(await FamilyShield.getSettings());
                break;
            case 'saveSettings':
                await FamilyShield.saveSettings(message.settings);
                sendResponse({ success: true });
                break;
            case 'getReport':
                sendResponse(await FamilyShield.generateReport());
                break;
            case 'updateBrowsing':
                await FamilyShield.updateBrowsing(message.domain, message.minutes);
                sendResponse({ success: true });
                break;
            case 'checkPIN':
                const pin = await FamilyShield.getPIN();
                sendResponse({ valid: message.pin === pin });
                break;
            case 'changePIN':
                await FamilyShield.savePIN(message.pin);
                sendResponse({ success: true });
                break;
            case 'isBlocked':
                sendResponse({ blocked: FamilyShield.isBlocked(message.url) });
                break;
            case 'unblock':
                await FamilyShield.unblockAllSites();
                sendResponse({ success: true });
                break;
        }
    })();
    return true; // Keep channel open for async response
});

// Initialize on install
chrome.runtime.onInstalled.addListener(() => {
    FamilyShield.init();
});

// Initialize on startup
chrome.runtime.onStartup.addListener(() => {
    FamilyShield.init();
});
