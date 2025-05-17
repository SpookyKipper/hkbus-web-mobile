console.log("Additionals - Cordova: In App Browser ")
// Open all links in InAppBrowser //
document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady() {
    window.open = cordova.InAppBrowser.open;
}