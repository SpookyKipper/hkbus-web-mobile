console.log("Additionals - Cordova: Runtime Permissions (Android) ")
// Request for Location Permissions //
document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady() {
    var permissions = cordova.plugins.permissions;
    permissions.requestPermission(permissions.ACCESS_FINE_LOCATION, success, error);

    function error() {
        console.warn('Location permission is not turned on');
    }

    function success(status) {
        if (!status.hasPermission) error();
    }
}