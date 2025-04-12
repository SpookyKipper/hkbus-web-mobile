
// Store the BeforeInstallPromptEvent for later use
let deferredPrompt = null;

// Listen for the beforeinstallprompt event
console.info('Installing Listener');
window.addEventListener("beforeinstallprompt", (e) => {
    // Prevent the default mini-infobar from appearing (optional, browser-dependent)
    e.preventDefault();
    // Store the event for triggering later
    deferredPrompt = e;


    if (document.getElementById('install-pwa')) return;


    //<button class="" tabindex="0" type="button" id="install-pwa">En</button>

    const pwaButton = document.createElement('button');
    pwaButton.setAttribute('class', 'MuiButtonBase-root MuiButton-root MuiButton-text MuiButton-textPrimary MuiButton-sizeMedium MuiButton-textSizeMedium MuiButton-disableElevation MuiButton-root MuiButton-text MuiButton-textPrimary MuiButton-sizeMedium MuiButton-textSizeMedium MuiButton-disableElevation hkbus-j2u18s');
    pwaButton.tabIndex = "0";
    pwaButton.type = "button";
    pwaButton.id = "install-pwa";
    pwaButton.innerHTML = "安裝";

    const topBarSelector = '#root > div > div.MuiToolbar-root.MuiToolbar-gutters.MuiToolbar-regular.hkbus-3vko9u-MuiToolbar-root > div.MuiBox-root.hkbus-1glkq6a';

    let prependToTopBar = () => {
        const topBar = document.querySelector(topBarSelector);
        if (topBar) {
            topBar.prepend(pwaButton);
            clickListener();
        } else {
            console.log('Top bar not found, retrying in 0.5 seconds');
            setTimeout(prependToTopBar, 500);
        }
    }
    prependToTopBar();

});

// Add click event listener to the target element
function clickListener() {
    const installTrigger = document.getElementById('install-pwa');
    if (installTrigger) {
        installTrigger.addEventListener("click", async () => {
            if (deferredPrompt) {
                try {
                    // Show the install prompt
                    await deferredPrompt.prompt();
                    // Wait for the user's response
                    const { outcome } = await deferredPrompt.userChoice;
                    console.log(`User response to install prompt: ${outcome}`);
                    // Clear the deferred prompt after use
                    deferredPrompt = null;
                } catch (error) {
                    console.error("Error triggering PWA install prompt:", error);
                }
            } else {
                console.warn(
                    "PWA install prompt is not available. Ensure the app is installable."
                );
            }
        });
    } else {
        console.error("Target element not found. Please verify the selector.");
        setTimeout(clickListener, 500);
    }
}




