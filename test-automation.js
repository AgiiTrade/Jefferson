/**
 * Automated Game Testing Script
 * Run in browser console while playing each game
 */

const GameTester = {
    bugs: [],
    testsRun: 0,
    testsPassed: 0,
    
    // Log a bug
    logBug(game, severity, description, steps, expected, actual) {
        this.bugs.push({
            id: this.bugs.length + 1,
            game,
            severity,
            description,
            steps,
            expected,
            actual,
            timestamp: new Date().toISOString()
        });
        console.log(`🐛 BUG #${this.bugs.length}: ${description}`);
    },
    
    // Test element exists
    testElement(selector, name) {
        this.testsRun++;
        const el = document.querySelector(selector);
        if (el) {
            this.testsPassed++;
            console.log(`✅ ${name} exists`);
            return true;
        } else {
            console.log(`❌ ${name} missing`);
            this.logBug('Unknown', 'High', `${name} not found`, [`Look for ${selector}`], 'Element exists', 'Element missing');
            return false;
        }
    },
    
    // Test button clickable
    testButton(selector, name) {
        this.testsRun++;
        const btn = document.querySelector(selector);
        if (btn && !btn.disabled) {
            this.testsPassed++;
            console.log(`✅ ${name} is clickable`);
            return true;
        } else {
            console.log(`❌ ${name} not clickable`);
            return false;
        }
    },
    
    // Test text content
    testText(selector, expectedText, name) {
        this.testsRun++;
        const el = document.querySelector(selector);
        if (el && el.textContent.includes(expectedText)) {
            this.testsPassed++;
            console.log(`✅ ${name}: "${expectedText}" found`);
            return true;
        } else {
            console.log(`❌ ${name}: "${expectedText}" not found`);
            return false;
        }
    },
    
    // Test no duplicate items
    testNoDuplicates(items, name) {
        this.testsRun++;
        const unique = new Set(items);
        if (unique.size === items.length) {
            this.testsPassed++;
            console.log(`✅ ${name}: No duplicates (${items.length} items)`);
            return true;
        } else {
            console.log(`❌ ${name}: Found ${items.length - unique.size} duplicates`);
            this.logBug('Unknown', 'Critical', `Duplicate items in ${name}`, 
                ['Play through session'], 'No duplicates', `${items.length - unique.size} duplicates found`);
            return false;
        }
    },
    
    // Test localStorage
    testLocalStorage(key, name) {
        this.testsRun++;
        const data = localStorage.getItem(key);
        if (data) {
            this.testsPassed++;
            console.log(`✅ ${name}: Data saved (${data.length} chars)`);
            return true;
        } else {
            console.log(`⚠️ ${name}: No data found (may not have played yet)`);
            return false;
        }
    },
    
    // Generate report
    report() {
        console.log('\n📊 TESTING REPORT');
        console.log(`Tests Run: ${this.testsRun}`);
        console.log(`Passed: ${this.testsPassed}`);
        console.log(`Failed: ${this.testsRun - this.testsPassed}`);
        console.log(`Score: ${Math.round((this.testsPassed / this.testsRun) * 100)}%`);
        console.log(`Bugs Found: ${this.bugs.length}`);
        
        if (this.bugs.length > 0) {
            console.log('\n🐛 BUGS:');
            this.bugs.forEach(b => {
                console.log(`#${b.id} [${b.severity}] ${b.description}`);
            });
        }
        
        return {
            testsRun: this.testsRun,
            passed: this.testsPassed,
            failed: this.testsRun - this.testsPassed,
            score: Math.round((this.testsPassed / this.testsRun) * 100),
            bugs: this.bugs
        };
    }
};

// Export for use
window.GameTester = GameTester;
console.log('🎮 GameTester loaded! Use GameTester.report() to see results.');
