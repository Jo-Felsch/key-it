// Cookie Banner Management
class CookieBanner {
    constructor() {
        this.consentKey = 'keyit_cookie_consent';
        this.consentIdKey = 'keyit_consent_id';
        this.consentDateKey = 'keyit_consent_date';
        this.init();
    }

    init() {
        // Check if user has already given consent
        const consent = this.getConsent();
        if (!consent) {
            this.showBanner();
        } else {
            this.applyConsent(consent);
        }
    }

    showBanner() {
        const banner = this.createBanner();
        document.body.appendChild(banner);

        // Add event listeners
        document.getElementById('cookie-accept-all').addEventListener('click', () => this.acceptAll());
        document.getElementById('cookie-decline').addEventListener('click', () => this.declineAll());
        document.getElementById('cookie-save-selection').addEventListener('click', () => this.saveSelection());
        document.getElementById('cookie-show-details').addEventListener('click', () => this.toggleDetails());
    }

    createBanner() {
        const banner = document.createElement('div');
        banner.id = 'cookie-banner';
        banner.innerHTML = `
            <div class="cookie-banner-overlay"></div>
            <div class="cookie-banner-content">
                <div class="cookie-banner-header">
                    <h3>This website uses cookies</h3>
                    <p>We use cookies to personalise content and to analyse our traffic. We also share information about your use of our site with our analytics partners who may combine it with other information that you've provided to them or that they've collected from your use of their services. You can at any time change or withdraw your consent from the Cookie Declaration on our website.</p>
                </div>
                
                <div class="cookie-banner-buttons">
                    <button id="cookie-decline" class="cookie-btn cookie-btn-secondary">Decline</button>
                    <button id="cookie-show-details" class="cookie-btn cookie-btn-outline">Customize</button>
                    <button id="cookie-accept-all" class="cookie-btn cookie-btn-primary">Accept All</button>
                </div>

                <div id="cookie-details" class="cookie-details" style="display: none;">
                    <div class="cookie-category">
                        <div class="cookie-category-header">
                            <label class="cookie-checkbox-label">
                                <input type="checkbox" id="cookie-necessary" checked disabled>
                                <span class="cookie-category-title">Necessary</span>
                            </label>
                        </div>
                        <p class="cookie-category-description">Required for basic functions like navigation and access to secure areas. The website cannot function properly without them.</p>
                    </div>

                    <div class="cookie-category">
                        <div class="cookie-category-header">
                            <label class="cookie-checkbox-label">
                                <input type="checkbox" id="cookie-statistics">
                                <span class="cookie-category-title">Statistics</span>
                            </label>
                        </div>
                        <p class="cookie-category-description">Used to understand how visitors interact with the website by collecting and reporting information anonymously.</p>
                    </div>

                    <div class="cookie-category">
                        <div class="cookie-category-header">
                            <label class="cookie-checkbox-label">
                                <input type="checkbox" id="cookie-preferences">
                                <span class="cookie-category-title">Preferences</span>
                            </label>
                        </div>
                        <p class="cookie-category-description">Allow the website to remember information that changes how it behaves or looks (e.g., language or region).</p>
                    </div>

                    <div class="cookie-category">
                        <div class="cookie-category-header">
                            <label class="cookie-checkbox-label">
                                <input type="checkbox" id="cookie-marketing">
                                <span class="cookie-category-title">Marketing</span>
                            </label>
                        </div>
                        <p class="cookie-category-description">Used to track visitors across websites to display relevant and engaging ads for individual users.</p>
                    </div>

                    <button id="cookie-save-selection" class="cookie-btn cookie-btn-primary" style="margin-top: 1rem; width: 100%;">Save Selection</button>
                </div>

                <div class="cookie-banner-footer">
                    <p style="font-size: 0.85rem; color: var(--text-body);">
                        Learn more about who we are and how we process personal data in our
                        <a href="privacy-policy.html" target="_blank" style="color: var(--cyan); text-decoration: underline;">Privacy Policy</a>.
                        Please state your consent ID and date when contacting us regarding your consent.
                    </p>
                </div>
            </div>
        `;
        return banner;
    }

    toggleDetails() {
        const details = document.getElementById('cookie-details');
        const button = document.getElementById('cookie-show-details');

        if (details.style.display === 'none') {
            details.style.display = 'block';
            button.textContent = 'Hide Details';
        } else {
            details.style.display = 'none';
            button.textContent = 'Customize';
        }
    }

    acceptAll() {
        const consent = {
            necessary: true,
            statistics: true,
            preferences: true,
            marketing: true
        };
        this.saveConsent(consent);
        this.removeBanner();
        this.applyConsent(consent);
    }

    declineAll() {
        const consent = {
            necessary: true,
            statistics: false,
            preferences: false,
            marketing: false
        };
        this.saveConsent(consent);
        this.removeBanner();
        this.applyConsent(consent);
    }

    saveSelection() {
        const consent = {
            necessary: true,
            statistics: document.getElementById('cookie-statistics').checked,
            preferences: document.getElementById('cookie-preferences').checked,
            marketing: document.getElementById('cookie-marketing').checked
        };
        this.saveConsent(consent);
        this.removeBanner();
        this.applyConsent(consent);
    }

    saveConsent(consent) {
        const consentId = this.generateConsentId();
        const consentDate = new Date().toISOString();

        localStorage.setItem(this.consentKey, JSON.stringify(consent));
        localStorage.setItem(this.consentIdKey, consentId);
        localStorage.setItem(this.consentDateKey, consentDate);
    }

    getConsent() {
        const consent = localStorage.getItem(this.consentKey);
        return consent ? JSON.parse(consent) : null;
    }

    generateConsentId() {
        return 'consent_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    removeBanner() {
        const banner = document.getElementById('cookie-banner');
        if (banner) {
            banner.remove();
        }
    }

    applyConsent(consent) {
        // Apply consent settings
        if (consent.statistics) {
            this.enableStatistics();
        }
        if (consent.preferences) {
            this.enablePreferences();
        }
        if (consent.marketing) {
            this.enableMarketing();
        }
    }

    enableStatistics() {
        // Add Google Analytics or other statistics tracking here
        console.log('Statistics cookies enabled');
    }

    enablePreferences() {
        // Add preference cookies here
        console.log('Preference cookies enabled');
    }

    enableMarketing() {
        // Add marketing cookies here
        console.log('Marketing cookies enabled');
    }

    // Public method to show consent info (for user support)
    static showConsentInfo() {
        const consentId = localStorage.getItem('keyit_consent_id');
        const consentDate = localStorage.getItem('keyit_consent_date');

        if (consentId && consentDate) {
            alert(`Consent ID: ${consentId}\nConsent Date: ${new Date(consentDate).toLocaleString()}\n\nPlease provide this information when contacting Key IT Solutions LTD regarding your consent.`);
        } else {
            alert('No consent information found.');
        }
    }

    // Public method to reset consent (for testing or user request)
    static resetConsent() {
        localStorage.removeItem('keyit_cookie_consent');
        localStorage.removeItem('keyit_consent_id');
        localStorage.removeItem('keyit_consent_date');
        location.reload();
    }
}

// Initialize cookie banner when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new CookieBanner();
    });
} else {
    new CookieBanner();
}
