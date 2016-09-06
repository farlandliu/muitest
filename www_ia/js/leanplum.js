/* ============================================
** Lean Plum
============================================ */
ia.leanplum = {
    init: function () {
        if (!window.Leanplum) return;
        // Calling 'start' will run your app in production mode.
        // Call 'enableDebugging' before calling 'start' to run this session in developer mode.
        if (ia.env === 'DEV') {
            Leanplum.enableDebugging();
        }

        function onPushNotificationReceived(e) {
            console.log('Push Notification received: ' + JSON.stringify(e));
        }

        Leanplum.start(
            function(msg) {
                // success handler
                console.log('Started Leanplum. Message was: ' + msg);
                Leanplum.registerPush({
                    'badge': 'true',
                    'sound': 'true',
                    'alert': 'true',
                    'callback': 'onPushNotificationReceived'
                });
            },  
            function(msg) {
                // error handler
                console.log('ERROR, Leanplum did not start: ' + msg);
            }  
        );
    }
};