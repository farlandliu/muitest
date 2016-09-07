/*==============================================
Segment Anayltics
==============================================*/
ia.segment = {
    api: "127.0.0.1", //'https://api.segment.io/v1/',
    key: (function(){
        if (ia.env === 'DEV') {
            // DEV Key
            return 'fWOWUn3KFHilTJyS45xu1BzNqAxJGN75';
        }
        else {
            // PROD Key
            return '35DX9lAwNnZM5HnzqFzvNH1FLz2hAH3E';
        }
    })(),
    context: {
        screen: {
            width: screen.width,
            height: screen.height,
            density: window.devicePixelRatio || 1
        },
        app: {},
        device: {},
        os: {},
        locale: undefined,
        library: {
            'name': 'http'
        }
    },
    scheduled: (function () {
        var s = [];
        if (localStorage.iaScheduledSegment) s = JSON.parse(localStorage.iaScheduledSegment);
        return s;
    })(),
    schedule: function (action, data) {
        ia.segment.scheduled.push({
            action: action,
            data: data
        });
        localStorage.iaScheduledSegment = JSON.stringify(ia.segment.scheduled);
    },
    dispatchSchedule: function () {
        if (!ia.app.isOnline()) return;
        if (ia.segment.scheduled.length === 0) return;
        var data = {batch: []};
        for (var i = 0; i < ia.segment.scheduled.length; i++) {
            data.batch.push(_.assignIn({action: ia.segment.scheduled[i].action}, ia.segment.scheduled[i].data));
            data.context = ia.segment.context;
        }
        $.ajax({
            url: ia.segment.api + 'import',
            method: 'POST',
            processData: false,
            contentType: 'application/json',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa(ia.segment.key + ':')
            },
            data: JSON.stringify(data),
            success: function (data) {
                ia.segment.scheduled = [];
                localStorage.iaScheduledSegment = JSON.stringify(ia.segment.scheduled);
                console.log('batch sent');
            }
        });
    },
    getContext: function (callback) {
        var cbs = 0, maxCbs = 4;
        // Device
        ia.segment.context.device = {
            id: window.device.uuid,
            manufacturer: window.device.manufacturer,
            model: window.device.model,
            type: 'android',
        };
        // OS
        ia.segment.context.os = {
            name: window.device.platform,
            version: window.device.version,
        };
        // Locale
        if (navigator.globalization) navigator.globalization.getLocaleName(function(locale) {
            ia.segment.context.locale = locale.value;
            cbs++;
            if (cbs === maxCbs && callback) callback(ia.segment.context);
        });
        // Version
        if (cordova.getAppVersion) cordova.getAppVersion.getVersionNumber(function (version) {
            ia.segment.context.app.version = version;
            cbs++;
            if (cbs === maxCbs && callback) callback(ia.segment.context);
        });
        // Build
        if (cordova.getAppVersion) cordova.getAppVersion.getVersionCode(function (code) {
            ia.segment.context.app.build = code;
            cbs++;
            if (cbs === maxCbs && callback) callback(ia.segment.context);
        });
        // Name
        if (cordova.getAppVersion) cordova.getAppVersion.getAppName(function (name) {
            ia.segment.context.app.name = name;
            cbs++;
            if (cbs === maxCbs && callback) callback(ia.segment.context);
        });
    },
    track: function (event, category, props) {
        var data = {
            event: event,
            context: ia.segment.context,
            timestamp: new Date(),
            properties: {
                category: category
            }
        };
        if (ia.auth.isLoggedIn()) {
            data.userId = ia.user.data.id;
        }
        else {
            data.anonymousId = ia.segment.context.device.id;
        }
        if (props) data.properties.properties = props;

        if (ia.app.isOnline()) {
            $.ajax({
                url: ia.segment.api + 'track',
                method: 'POST',
                processData: false,
                contentType: 'application/json',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + btoa(ia.segment.key + ':')
                },
                data: JSON.stringify(data),
                success: function (data) {
                    console.log('event sent');
                }
            });
        }
        else {
            // delete data.context;
            ia.segment.schedule('track', data);
        }
    },
    page: function (name, props) {
        var data = {
            name: name,
            context: ia.segment.context,
            timestamp: new Date(),
        };
        if (ia.auth.isLoggedIn()) {
            data.userId = ia.user.data.id;
        }
        else {
            data.anonymousId = ia.segment.context.device.id;
        }
        if (props) data.properties = props;
        if (ia.app.isOnline()) {
            $.ajax({
                url: ia.segment.api + 'page',
                method: 'POST',
                processData: false,
                contentType: 'application/json',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + btoa(ia.segment.key + ':')
                },
                data: JSON.stringify(data),
                success: function (data) {
                    console.log('page sent');
                }
            });
        }
        else {
            // delete data.context;
            ia.segment.schedule('page', data);
        }
    },
    screen: function (name, props) {
        var data = {
            name: name,
            context: ia.segment.context,
            timestamp: new Date()
        };
        if (ia.auth.isLoggedIn()) {
            data.userId = ia.user.data.id;
        }
        else {
            data.anonymousId = ia.segment.context.device.id;
        }
        if (props) data.properties = props;
        if (ia.app.isOnline()) {
            $.ajax({
                url: ia.segment.api + 'screen',
                method: 'POST',
                processData: false,
                contentType: 'application/json',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + btoa(ia.segment.key + ':')
                },
                data: JSON.stringify(data),
                success: function (data) {
                    console.log('screen sent');
                }
            });
        }
        else {
            // delete data.context;
            ia.segment.schedule('screen', data);
        }
    },
    alias: function () {
        var data = {
            userId: ia.user.data.id,
            context: ia.segment.context,
            timestamp: new Date(),
            previousId: ia.segment.context.device.id
        };
        if (ia.app.isOnline()) {
            $.ajax({
                url: ia.segment.api + 'alias',
                method: 'POST',
                processData: false,
                contentType: 'application/json',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + btoa(ia.segment.key + ':')
                },
                data: JSON.stringify(data),
                success: function (data) {
                    console.log('alias sent');
                }
            });
        }
        else {
            // delete data.context;
            ia.segment.schedule('alias', data);
        }
    },
    identify: function () {
        var data = {
            context: ia.segment.context,
            timestamp: new Date()
        };
        // User Id
        if (ia.auth.isLoggedIn()) {
            data.userId = ia.user.data.id;
            data.traits = {
                email: ia.user.data.email,
                firstName: ia.user.data.first_name,
                name: ia.user.data.first_name + ' ' + ia.user.data.last_name,
                username: ia.user.data.email,
                lastName: ia.user.data.last_name,
                avatar: ia.user.data.profile_img,
                profilePercentComplete: ia.user.data.percent_complete
            };
        }
        else {
            data.anonymousId = ia.segment.context.device.id;
        }
        if (ia.app.isOnline()) {
            $.ajax({
                url: ia.segment.api + 'identify',
                method: 'POST',
                processData: false,
                contentType: 'application/json',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + btoa(ia.segment.key + ':')
                },
                data: JSON.stringify(data),
                success: function (data) {
                    console.log('login sent');
                }
            });
        }
        else {
            // delete data.context;
            ia.segment.schedule('page', data);
        }
    },
    onLogin: function () {
        ia.segment.getContext(function (ctx) {
            ia.segment.identify();
            if (ia.auth.isLoggedIn()) {
                ia.segment.alias();
            }
        });
    },
    onLogout: function () {
        ia.segment.identify();
    },
    init: function () {
        ia.segment.getContext(function (ctx) {
            if (!ia.auth.isLoggedIn()) ia.segment.identify();

            if (!(ia.auth.isLoggedIn() || localStorage.iaIntroShown) && $('.intro-screen.modal-in').length > 0) {
                ia.segment.screen('Opening Teaser 1');
            }
        });
        app.onPageInit('about', function () {
            ia.segment.screen('About');
        });
        app.onPageInit('faq', function () {
            ia.segment.screen('FAQ');
        });
    }
};