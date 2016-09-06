/* ============================================
** Push Notifications
============================================ */
ia.push = {
    appId: (function () {
        if (ia.env === 'DEV') return '1B0B9-EA3B0'; //DEV
        else return '82DF4-DC791'; //PROD
    })(),
    projectNumber: (function () {
        if (ia.env === 'DEV') return '861840682200'; //DEV
        else return '506631925814'; //PROD
    })(),
    woosh: undefined,
    hwid: undefined,
    token: undefined,
    linkDevice: function () {
        if (!ia.app.isOnline()) {
            return;
        }
        function sendRegisterRequest() {
            if (!ia.push.token || !ia.push.hwid) return;
            $.ajax({
                url: ia.api.push.register,
                method: 'POST',
                processData: false,
                data: JSON.stringify({
                    hwid: ia.push.hwid,
                    push_token: ia.push.token,
                    platform: 3
                })
            });
        }
        if (!ia.push.token || !ia.push.hwid) {
            ia.push.registerDevice(function(){
                sendRegisterRequest();
            });
        }
        else {
            sendRegisterRequest();
        }
    },
    unlinkDevice: function () {

    },
    registerDevice: function (success, error) {
        if (!ia.push.woosh) return;
        //register for pushes
        ia.push.woosh.registerDevice(
            function(status) {
                var pushToken = status;
                console.warn('registerDevice: ' + pushToken);
                // Get Tokens
                var tokens = 0;
                ia.push.woosh.getPushwooshHWID(function(hwid){
                    ia.push.hwid = hwid;
                    // $('#view-more .tokens').append('<p>HWID: ' + ia.push.hwid + '</p>');
                    tokens ++;
                    if (tokens === 2 && success) success();
                });
                ia.push.woosh.getPushToken(function(token){
                    ia.push.token = token;
                    // $('#view-more .tokens').append('<p>PushToken: ' + ia.push.token + '</p>');
                    tokens ++;
                    if (tokens === 2 && success) success();
                });
            },
            function(status) {
                console.warn('failed to register : ' + JSON.stringify(status));
                // app.alert(JSON.stringify(['failed to register ', status]));
                if (error) error();
            }
        );

    },
    init: function () {
        ia.push.woosh = cordova.require('pushwoosh-cordova-plugin.PushNotification');
        //set push notification callback before we initialize the plugin
        document.addEventListener('push-notification', function(event) {
            //get the notification payload
            var title = event.notification.title;
            var userData = event.notification.userdata;

            //display alert to the user for example
            // app.alert(notification.aps.alert);

            //clear the app badge
            ia.push.woosh.clearNotificationCenter();
        });

        //initialize the plugin
        ia.push.woosh.onDeviceReady({
            projectid: ia.push.projectNumber,
            pw_appid: ia.push.appId
        });

        // Register device
        ia.push.registerDevice();

        //reset badges on app start
        ia.push.woosh.clearNotificationCenter();
    },
    onLogin: function () {
        ia.push.linkDevice();
    },
    onLogout: function () {
        ia.push.unlinkDevice();
    }
};