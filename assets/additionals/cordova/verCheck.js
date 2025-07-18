console.log("Additionals - Cordova: App Version Check ")
document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady() {
    cordova.getAppVersion().then(function (version) {
        // Version comparison script for HKBus app - updated for multiple apps
        async function checkAppVersion() {
            // Define the existing version variable (you can modify this as needed)
            try {
                // Fetch the JSON data from the URL
                const response = await fetch('https://appupdate.spooky.hk/versions.json');

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                // Target app ID to look for
                const targetAppId = "hk.spooky.hkbusapp";

                // Handle different JSON structures
                let appData = null;

                // Check if data is an array of apps
                if (Array.isArray(data)) {
                    appData = data.find(app => app.appid === targetAppId);
                }
                // Check if data is an object with apps as properties
                else if (data && typeof data === 'object') {
                    // If it's a single app object with matching appid
                    if (data.appid === targetAppId) {
                        appData = data;
                    }
                    // If it's an object containing multiple apps
                    else if (data.apps && Array.isArray(data.apps)) {
                        appData = data.apps.find(app => app.appid === targetAppId);
                    }
                    // If apps are stored as object properties
                    else if (data[targetAppId]) {
                        appData = data[targetAppId];
                    }
                }

                // Check if we found the app
                if (!appData) {
                    console.log(`App with ID "${targetAppId}" not found in the JSON data`);
                    return {
                        found: false,
                        targetAppId: targetAppId
                    };
                }

                const remoteVersion = appData.full; // Get the full version

                if (!remoteVersion) {
                    console.error(`No 'full' version found for app ID: ${targetAppId}`);
                    return {
                        found: true,
                        error: "No version data available"
                    };
                }

                console.log(`Local version: ${version}`);
                console.log(`Remote version: ${remoteVersion}`);

                // Compare versions
                if (version === remoteVersion) {
                    console.log("Versions are identical - no update needed");
                    return {
                        localVersion: version,
                        remoteVersion: remoteVersion,
                        needsUpdate: false
                    };
                }

                // Parse version numbers
                const localParts = version.split('.').map(Number);
                const remoteParts = remoteVersion.split('.').map(Number);

                // Ensure we have at least 3 parts (major.minor.patch)
                while (localParts.length < 3) localParts.push(0);
                while (remoteParts.length < 3) remoteParts.push(0);

                const [localMajor, localMinor, localPatch] = localParts;
                const [remoteMajor, remoteMinor, remotePatch] = remoteParts;

                let verStatus;

                // Compare major version
                if (localMajor !== remoteMajor) {
                    verStatus = "major";
                }
                // Compare minor version (if major is the same)
                else if (localMinor !== remoteMinor) {
                    verStatus = "minor";
                }
                // Compare patch version (if major and minor are the same)
                else if (localPatch !== remotePatch) {
                    verStatus = "patch";
                }

                console.log(`Version status: ${verStatus}`);
                console.log(`Local: ${localMajor}.${localMinor}.${localPatch}`);
                console.log(`Remote: ${remoteMajor}.${remoteMinor}.${remotePatch}`);

                return {
                    found: true,
                    localVersion: version,
                    remoteVersion: remoteVersion,
                    verStatus: verStatus,
                    needsUpdate: verStatus !== undefined,
                    appData: appData
                };

            } catch (error) {
                console.error('Error fetching or parsing version data:', error);
                return {
                    error: error.message
                };
            }
        }

        // Usage example
        checkAppVersion().then(result => {
            if (result.error) {
                console.error('Version check failed:', result.error);
            } else if (!result.found) {
                console.log('App not found in version data');
            } else {
                console.log('Version check completed:', result);

                // Access the verStatus variable
                if (result.verStatus) {
                    const config = {
                        major: {
                            title: 'Major Update Available',
                            text: 'A major version update is available. It may include breaking changes. Please update now!',
                            icon: 'warning',
                            showCancelButton: false,
                            allowOutsideClick: false
                        },
                        minor: {
                            title: 'Minor Update Available',
                            text: 'A minor version update is available with new features. Would you like to update?',
                            icon: 'info',
                            showCancelButton: false,
                            allowOutsideClick: false
                        },
                        patch: {
                            title: 'Patch Update Available',
                            text: 'A patch update is available with bug fixes and improvements. Update now?',
                            icon: 'info',
                            showCancelButton: true,
                            allowOutsideClick: true
                        }
                    };

                    const { title, text, icon, allowOutsideClick, showCancelButton } = config[result.verStatus];

                    Swal.fire({
                        title: title,
                        text: text,
                        icon: icon,
                        confirmButtonText: 'Update',
                        cancelButtonText: 'Later',
                        color: "#c7c7c7ff",
                        allowOutsideClick: allowOutsideClick,
                        showCancelButton: showCancelButton
                    }).then((result) => {
                        if (result.isConfirmed) {
                            // Replace this with your own update logic, e.g., redirect or reload
                            console.log('User chose to update.');
                            // Example: window.location.reload();
                            updateApp();
                        } else {
                            console.log('User postponed the update.');
                        }
                    });






                } else {
                    console.log('No update needed');
                }
            }
        });
    });



    function updateApp() {

        Swal.fire({
            title: "Downloading",
            html: `<span id="progress" style="color: #c7c7c7ff">0% (0 Bytes done)</span>`,
            showConfirmButton: false
        });

        function updateProgress(text) {
            document.querySelector("#progress").innerHTML = text;
        }
        const apkUrl = 'https://github.com/SpookyKipper/hkbus-web-mobile/releases/latest/download/HKBus-Release.apk';
        const options = {
            onDownloadProgress: (e) => {
                updateProgress(e.progress + '%' +
                    '(' + e.bytesWritten + ' Bytes / ' + e.bytes + ' Bytes)');
            }
        };

        // 1. Download APK
        ApkUpdater.download(apkUrl, options)
            .then((response) => {
                console.log('Downloaded APK to:', response.path);
                // 2. Install the downloaded APK
                Swal.fire({
                    title: "Download Succeed",
                    text: `Please click on Update`,
                    icon: "info",
                    showConfirmButton: false
                });
                return ApkUpdater.install();
            })
            .catch(err => console.error('Update error', err));
    }


}





