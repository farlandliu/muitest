/* ============================================
** User & User Profile
============================================ */
ia.user = {
    data: localStorage.iaUserData ? JSON.parse(localStorage.iaUserData) : undefined,
    navbar: $('.page[data-page="home"] .navbar'),
    navbarRight: function () {
        if (ia.auth.isLoggedIn()) {
            // var stroke = 210 * ia.user.data.percent_complete / 100 + 'px, 210px';
            return '<a href="#" data-popover=".popover-user-profile-percentage" class="link open-popover user-profile-percentage">' +
                // '<svg xmlns="http://www.w3.org/2000/svg" height="75" width="75" viewBox="0 0 75 75">' +
                //     '<circle cx="37.5" cy="37.5" r="33.5" stroke-width="4" style="stroke-dasharray: ' + stroke + '"></circle>' +
                // '</svg>' +
                '<span>' + ia.user.data.percent_complete + '%</span>' +
            '</a>' +
            '<a href="#" class="link icon icon-only load-profile-edit"><i class="icon material-icons">mode_edit</i></a>';
        }
        else {
            return '';
        }

    },
    updateNavbar: function () {
        if ($('.page[data-page="home"] > .tab.active').attr('id') !== 'tab-profile') return;
        $('.page[data-page="home"] .navbar .right').html(ia.user.navbarRight());
    },

    profileBlock: $('#tab-profile .user-profile'),
    // percentageLink: $('#tab-profile .navbar .user-profile-percentage'),
    percentagePopover: $('.popover.popover-user-profile-percentage'),
    authBlock: $('#tab-profile .auth-required'),
    xhr: undefined,
    popoverMessageLow: '<p>Your profile is only {{percentage}}% complete. Can you get to 100%?</p><p>When you have a complete profile, we\'ll recommend you to employers and match you to internships.</p>',
    popoverMessageHigh: '<p>Well done! Your profile is now 100% complete and now you\'re  more likely to be contacted by employers.</p>',

    renderProfile: function () {
        if (!ia.user.data) return;
        // Set Percentage
        ia.user.updateNavbar();
        var popoverMessage = ia.user.data.percent_complete < 100 ? ia.user.popoverMessageLow : ia.user.popoverMessageHigh;
        ia.user.percentagePopover.find('.popover-inner').html(popoverMessage.replace('{{percentage}}', ia.user.data.percent_complete));
        // Render Profile Info
        ia.user.profileBlock.html(templates.userProfile(ia.user.data));
    },

    fetch: function (params) {
        params = params || {};
        if (ia.user.xhr) ia.user.xhr.abort();
        ia.user.xhr = $.ajax({
            url: ia.api.user.profile,
            success: function (data, xhr, status) {
                data = JSON.parse(data);
                ia.user.data = data.user;
                localStorage.iaUserData = JSON.stringify(data.user);
                if (params.success) params.success(data, xhr, status);
            },
            error: function (xhr, status) {

                if (params.error) params.error(xhr, status);
            },
            headers: (function () {
                if (params.token) {
                    return {
                        'Authorization': 'Bearer ' + params.token
                    };
                }
                return {};
            })()
        });
    },

    update: function (params) {
        params = params || {};
        if (!ia.auth.isLoggedIn()) {
            if (params.error) params.error();
            return;
        }
        if (!ia.app.isOnline()) {
            if (!params.silent) {
                ia.errors.alert('network');    
            }
            if (params.error) params.error();
            return;
        }
        ia.user.fetch({
            success: function (data) {
                ia.user.renderProfile();
                if (params.success) params.success(data);
            },
            error: function (xhr, status) {
                if (!params.silent) {
                    if (status) {
                        // Probably because of login? Also need to check for network error
                        if (status === 403 && ia.auth.isLoggedIn()) {
                            ia.auth.onLogout();
                        }
                        ia.errors.alert('xhr', xhr, status);
                    }
                    else {
                        // Connection error?
                        ia.errors.alert('network');
                    }
                }
                if (params.error) params.error(xhr, status);
            }
        });
    },

    loadEditPage: function () {
        ia.views.main.router.load({
            template: templates.userProfileEdit,
            context: ia.user.data
        });
    },

    // Log In
    onLogin: function () {
        // Add Nav Elements
        ia.user.updateNavbar();

        // Hide Profile Auth Block
        ia.user.authBlock.hide();

        // Fill Profile Page
        ia.user.renderProfile();

        if (ia.app.isOnline()) {
            ia.user.update();
        }
    },
    // Log Out
    onLogout: function () {
        // Show Profile Auth Block
        ia.user.authBlock.show();

        // Update Navbar
        ia.user.updateNavbar();

        // Clean Profile Page
        ia.user.profileBlock.html('');

        // Go Back
        // ia.views.main.router.back({animatePages: false, force: true, pageName: 'user-profile'});
    },

    // Init User
    init: function () {
        $(document).on('click', '.load-profile-edit', function () {
            ia.user.loadEditPage();
            if (!ia.app.isOnline()) {
                ia.errors.alert('networkProfile');
            }
        });

        // Prompt for Rate
        app.onPageAfterBack('user-profile-edit', function () {
            if (ia.auth.isLoggedIn()) {
                ia.rate.prompt();
            }
        });
    }
};