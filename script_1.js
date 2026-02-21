
                    // Global variables
                        window.pageId = '6be3a7bd6e4b';
                        window.formId = '[%FORM_ID%]';
                        window.redirect_url = '[%REDIRECT_URL%]';
                        window.webhook_url = '[%WEBHOOK_URL%]';
                    function acceptGdpr() {
                        localStorage.setItem('gdpr-accepted', 'true');
                        document.getElementById('gdprPopup').style.display = 'none';
                    }

                    function declineGdpr() {
                        localStorage.setItem('gdpr-accepted', 'false');
                        document.getElementById('gdprPopup').style.display = 'none';
                    }

                    // GDPR Popup Logic
                    (function() {
                        var gdprData = [%GDPR%]; // You'll need to replace [%GDPR%] with your actual GDPR data
                        try {
                            var parsedGdpr = typeof gdprData === 'string' ? JSON.parse(gdprData) : gdprData;
                            if (parsedGdpr?.isEnabled && localStorage.getItem('gdpr-accepted') === null) {
                                document.getElementById('gdprPopup').style.display = 'block';
                                document.getElementById('gdprText').textContent = parsedGdpr.text || 'This website uses cookies to ensure you get the best experience on our website.';
                            }
                        } catch (e) {
                            console.error("Error parsing GDPR data:", e);
                        }
                    })();
                