/* ============================================
** App Init
* 修改INIT, 去掉CORDOVA
============================================ */
ia.app = {
    /* ============================================
    ** Init App
    ============================================ */
    init: function () {
        // Init App
        app.init();
        // Init Views
        ia.views.init();
        // Init User
        ia.user.init();
        // Init Auth
        ia.auth.init();
        // Init Intro Screen
        ia.intro.init();
        // Login Screens in More section
        ia.loginScreen.init();
        // Init Search
        ia.search.init();
        // Init Messages
        //ia.messages.init();
        // Init User Profile Edit
        ia.userEdit.init();
        // Init Employer Profile
        ia.employer.init();
        // Init Opportunity Profile
        ia.opportunity.init();
        // Init Applications
        ia.applications.init();
        // Init Bookmarks
        ia.bookmarks.init();
        // Init Shares
        //ia.share.init();
        // Init Map
        //ia.map.init();
        // Init Rating
        //ia.rate.init();
        // Init Segment
        ia.segment.init();
    },
    /* ============================================
    ** Check for online connection
    ============================================ */
    isOnline: function () {
//      if (!window.Connection) return true;
//      return Connection.NONE !== navigator.connection.type;
	return true;
    },
    /* ============================================
    ** Check is Cordova
    ============================================ */
    isCordova: function () { return true;
//      return /^file:\/{3}[^\/]/i.test(window.location.href) && /ios|iphone|ipod|ipad|android/i.test(navigator.userAgent);
    },
    /* ============================================
    ** Update all data
    ============================================ */
    updateData: function (params) {
        // Update User Data
        ia.user.update({
            silent: true,
            success: function () {
                // Update Messages
                ia.messages.update();

                // Update Bookmarks Data
                ia.bookmarks.update();

                // Update Applications List
                ia.applications.update();

                if (params.success) params.success();
            },
            error: function (xhr, status) {
                // Logout???
                if (status && status !== 'timeout' && status !== 0) {
                    ia.auth.onLogout();
                }
            }
        });
    },
    /* ============================================
    ** Update data on app resume
    ============================================ */
    onResume: function (e) {
        if (!ia.app.deviceIsReady) return;
        $(document).off('online', ia.app.onResume, false);
        if (ia.app.isOnline()) {
            ia.segment.dispatchSchedule();
        }
        if (ia.auth.isLoggedIn() && ia.app.isOnline()) {
            ia.app.updateData({
                success: function () {
                    // Prompt for Rate
                    ia.rate.prompt();
                }
            });
        }
        else {
            $(document).on('online', ia.app.onResume, false);
            // Prompt for Rate
            ia.rate.prompt();
        }
    },
    /* ============================================
    ** On Offline
    ============================================ */
    onOffline: function (e) {
        if (!ia.app.deviceIsReady) return;
        if ($('.page[data-page="user-profile-edit"]').length > 0) {
            if ($('#view-profile').hasClass('active')) {
                ia.errors.alert('networkProfile');
            }
            else {
                $('#view-profile').once('show', function () {
                    if (!ia.app.isOnline()) {
                        ia.errors.alert('networkProfile');
                    }
                });
            }
        }
    },
    /* ============================================
    ** Back Button
    ============================================ */
    onBackButton: function (e) {
        // Check for panel
        if ($('.panel.active').length > 0) {
            if (ia.views.searchFilter.history.length > 1) {
                ia.views.searchFilter.router.back();
            }
            else {
                app.closePanel();
            }
            e.preventDefault();
            return false;
        }
        // Check for Photo Browser
        else if ($('.photo-browser-in').length > 0) {
            ia.employer.photoBrowser.close();
            e.preventDefault();
            return false;
        }
        // Check For Popups
        else if ($('.popup.modal-in').length > 0) {
            app.closeModal('.popup.modal-in');
            e.preventDefault();
            return false;
        }
        // Check For Modals
        else if ($('.modal.modal-in').length > 0) {
            app.closeModal('.modal.modal-in');
            e.preventDefault();
            return false;
        }
        else if ($('.popover.modal-in').length > 0) {
            app.closeModal('.popover.modal-in');
            e.preventDefault();
            return false;
        }
        else {
            if (ia.views.main.history.length > 1) {
                ia.views.main.router.back();
                e.preventDefault();
                return false;
            }
            else {
                return true;
            }
        }
    },
    /* ============================================
    ** StatusBar
    ============================================ */
    setStatusBar: function (type) {
        var color = '#018db3';
        if (type === 'intro') color = '#000';
        if (type === 'filter') color = '#001920';
        if (type === 'photobrowser') color = '#181818';
        if (window.StatusBar) {
            StatusBar.backgroundColorByHexString(color);
        }
    },
    /* ============================================
    ** Device ready, app launch
    ============================================ */
    deviceIsReady: true,
    onDeviceReady: function (e) {
        ia.app.deviceIsReady = true;
        // IA Device UUID
//      if (window.device) {
//          ia.app.uuid = device.uuid;
//      }
		ia.app.uuid = "ios";
//      if (ia.app.isCordova()) {
//          // Init Push Notifications
//          ia.push.init();
//
//          // Init LeanPlum
//          ia.leanplum.init();
//      }

        // Init App
        ia.app.init();

        // On Log In Procedure
        if (ia.auth.isLoggedIn()) {
            ia.auth.onLogin();
        }

        // Set Status Bar Color
        ia.app.setStatusBar('intro');

        // Hide Login Screen
        if (ia.auth.isLoggedIn() || localStorage.iaIntroShown) {
            ia.intro.hide();
        }

        // Hide Splash Screen
        setTimeout(function() {
            if (navigator.splashscreen) navigator.splashscreen.hide();
        }, 2000);

    }
};
/* ============================================
** Device ready, app launch
============================================ */
if (ia.app.isCordova()) {
	ia.app.onDeviceReady();
    $(document).on('deviceready', ia.app.onDeviceReady, false);
    $(document).on('backbutton', ia.app.onBackButton, false);
    $(document).on('resume', ia.app.onResume, false);
    $(document).on('online', ia.app.onResume, false);
    $(document).on('offline', ia.app.onOffline, false);
}
else {
    ia.app.onDeviceReady();
}
