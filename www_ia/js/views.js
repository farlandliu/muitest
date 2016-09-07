/* ============================================
** Views
============================================ */
ia.views = {
    init: function () {
        // Main View
        ia.views.main = app.addView('.view-main', {
            domCache: true
        });
        // Helper Views
        ia.views.searchFilter = app.addView('.view-search-filter', {
            dynamicNavbar: true,
            swipeBackPage: false
        });

        // Tabbar
        $('.page[data-page="home"] > .tab').on('show', function (){
            var tab = $(this);
            var id = tab.attr('id');
            var title = '', right = '';
            var screenName = '';
            // Title
            if (id === 'tab-search') {
                if (tab.find('#tab-search-employers.active').length > 0) {
                    title = 'Employers';
                }
                else {
                    title = 'Opportunities';
                }
                screenName = 'Opportunities';
            }
            if (id === 'tab-applications') {
                title = 'My Applications';
                screenName = 'My Applications';
            }
            if (id === 'tab-messages') {
                title = 'Messages';
                screenName = 'Messages';
            }
            if (id === 'tab-profile') {
                title = 'My Profile';
                screenName = 'My Profile';
            }
            if (id === 'tab-more') {
                title = 'More';
                screenName = 'More';
            }

            // Right
            if (id === 'tab-search') {
                right = ia.search.navbarRight();
            }
            else if (id === 'tab-profile') {
                right = ia.user.navbarRight();
            }

            //ia.segment.screen(screenName);

            // Update
            $('.page[data-page="home"] .navbar .center').text(title);
            $('.page[data-page="home"] .navbar .right').html(right);

        });
    }
};