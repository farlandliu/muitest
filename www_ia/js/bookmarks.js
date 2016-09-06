/*==============================================
Bookmarks/Follows
==============================================*/
ia.bookmarks = {
    xhr: undefined,
    data: {
        opportunities: [],
        employers: []
    },
    add: function (params) {
        if (!ia.app.isOnline()) {
            ia.errors.alert('network');
            return;
        }
        if (!ia.auth.isLoggedIn()) {
            ia.errors.alert('login');
            return;
        }
        if (params.type === 'opportunity') {
            // Add to Bookmark
            // if (ia.bookmarks.xhr) ia.bookmarks.xhr.abort();
            app.closeNotification('.notification-item');
            app.addNotification({
                message: 'Opportunity has been saved',
                button: false,
                hold: 3000,
                closeOnClick: true
            });
            ia.bookmarks.xhr = $.ajax({
                url: ia.api.bookmarks.add.replace('{{id}}', params.id),
                method: 'POST',
                success: function () {
                    ia.segment.track('Candidate Saved an Opportunity', 'Opportunity', {
                        title: params.title,
                        id: params.id,
                    });
                    $('.bookmarks-add[data-type="opportunity"][data-id="' + params.id + '"]').each(function(){
                        var self = $(this);
                        self.removeClass('bookmarks-add').addClass('bookmarks-delete');
                        self.find('.icon').text('star');
                    });
                    ia.bookmarks.updateOpportunitiesPage();
                },
                error: function (xhr, status) {
                    ia.errors.alert('xhr', xhr, status);
                }
            });

        }
        else {
            // Follow
            // app.confirm('Do you want to follow "' + params.title + '"?', 'Follow', function () {
            // if (ia.bookmarks.xhr) ia.bookmarks.xhr.abort();
            app.closeNotification('.notification-item');
            app.addNotification({
                message: 'You follow "' + params.title + '"',
                button: false,
                hold: 3000,
                closeOnClick: true
            });
            ia.bookmarks.xhr = $.ajax({
                url: ia.api.bookmarks.follow.replace('{{id}}', params.id),
                data: {
                    company_id: params.id
                },
                method: 'POST',
                success: function () {
                    ia.segment.track('Candidate Followed an Employer', 'Candidate', {
                        name: params.title,
                        id: params.id,
                    });
                    $('.bookmarks-add[data-type="employer"][data-id="' + params.id + '"]').each(function(){
                        var self = $(this);
                        self.removeClass('bookmarks-add').addClass('bookmarks-delete');
                        self.find('.icon').text('star');
                        self.find('.follow-text').text('Unfollow');
                    });
                    ia.bookmarks.updateEmployersPage();

                    // Prompt for Rate
                    ia.rate.prompt();
                },
                error: function (xhr, status) {
                    ia.errors.alert('xhr', xhr, status);
                }
            });
            // });
        }
    },
    remove: function (params) {
        if (!ia.app.isOnline()) {
            ia.errors.alert('network');
            return;
        }
        if (!ia.auth.isLoggedIn()) {
            ia.errors.alert('login');
            return;
        }
        if (params.type === 'opportunity') {
            // Remove from Bookmarks
            // app.confirm('Do you want to remove "' + params.title + '" from saved opportunities?', 'Remove from saved opportunities', function () {
            // if (ia.bookmarks.xhr) ia.bookmarks.xhr.abort();
            app.closeNotification('.notification-item');
            app.addNotification({
                message: 'Opportunity has been removed from saved opportunities',
                button: false,
                hold: 3000,
                closeOnClick: true
            });
            ia.bookmarks.xhr = $.ajax({
                url: ia.api.bookmarks.add.replace('{{id}}', params.id),
                method: 'DELETE',
                success: function () {
                    $('.bookmarks-delete[data-type="opportunity"][data-id="' + params.id + '"]').each(function(){
                        var self = $(this);
                        self.addClass('bookmarks-add').removeClass('bookmarks-delete');
                        self.find('.icon').text('star_border');
                    });
                    ia.bookmarks.updateOpportunitiesPage();
                },
                error: function (xhr, status) {
                    ia.errors.alert('xhr', xhr, status);
                }
            });
            // });
        }
        else {
            // Unfollow
            // app.confirm('Do you want to unfollow "' + params.title + '"?', 'Unfollow', function () {
            // if (ia.bookmarks.xhr) ia.bookmarks.xhr.abort();
            app.closeNotification('.notification-item');
            app.addNotification({
                message: 'You don\'t follow "' + params.title + '" anymore',
                button: false,
                hold: 3000,
                closeOnClick: true
            });
            ia.bookmarks.xhr = $.ajax({
                url: ia.api.bookmarks.unfollow.replace('{{id}}', params.id),
                method: 'POST',
                data: {
                    company_id: params.id
                },
                success: function () {
                    $('.bookmarks-delete[data-type="employer"][data-id="' + params.id + '"]').each(function(){
                        var self = $(this);
                        self.addClass('bookmarks-add').removeClass('bookmarks-delete');
                        self.find('.icon').text('star_border');
                        self.find('.follow-text').text('Follow');
                    });
                    ia.bookmarks.updateEmployersPage();
                },
                error: function (xhr, status) {
                    ia.errors.alert('xhr', xhr, status);
                }
                });
            // });
        }
    },
    fetchBookmarks: function (params) {
        $.ajax({
            url: ia.api.bookmarks.fetchOpportunities,
            method: 'GET',
            success: function (data) {
                data = JSON.parse(data);
                ia.bookmarks.data.opportunities = data.opportunities || [];
                if (params.success) params.success(data);
            },
            error: function (xhr, status) {
                if (params.error) params.error(xhr, status);
            }
        });
    },
    fetchEmployers: function (params) {
        $.ajax({
            url: ia.api.bookmarks.fetchEmployers,
            method: 'GET',
            success: function (data) {
                data = JSON.parse(data);
                ia.bookmarks.data.employers = data.employers || [];
                if (params.success) params.success(data);
            },
            error: function (xhr, status) {
                if (params.error) params.error(xhr, status);
            }
        });
    },
    updateBookmarksData: function (params) {
        params = params || {};
        ia.bookmarks.fetchBookmarks({
            success: function () {
                function update(opp) {
                    $('.bookmarks-add[data-type="opportunity"][data-id="' + opp.id + '"]').each(function(){
                        var self = $(this);
                        self.removeClass('bookmarks-add').addClass('bookmarks-delete');
                        self.find('.icon').text('star');
                    });
                }
                for (var i = 0; i < ia.bookmarks.data.opportunities.length; i++) {
                    update(ia.bookmarks.data.opportunities[i]);
                }
                ia.bookmarks.updateOpportunitiesPage({fetch: false});
            }
        });
    },
    updateEmployerData: function (params) {
        params = params || {};
        ia.bookmarks.fetchEmployers({
            success: function () {
                function update(employer) {
                    $('.bookmarks-add[data-type="employer"][data-id="' + employer.id + '"]').each(function(){
                        var self = $(this);
                        self.removeClass('bookmarks-add').addClass('bookmarks-delete');
                        self.find('.icon').text('star');
                    });
                }
                for (var i = 0; i < ia.bookmarks.data.employers.length; i++) {
                    update(ia.bookmarks.data.employers[i]);
                }
                ia.bookmarks.updateEmployersPage({fetch: false});
            }
        });

    },
    update: function (params) {
        if (!ia.auth.isLoggedIn()) return;
        ia.bookmarks.updateBookmarksData(params);
        ia.bookmarks.updateEmployerData(params);
    },
    // Silent update of bookmarks pages
    updateOpportunitiesPage: function (params) {
        params = params || {};
        if ($(ia.views.main.container).find('.page[data-page="bookmarks-opportunities"]').length === 0) {
            return;
        }
        function onSuccess(opportunities) {
            var compiled = templates.bookmarksOpportunities({
                opportunities: opportunities || []
            });
            var pageContent;
            $(compiled).each(function () {
                if (this.nodeType === 1 && $(this).hasClass('page')) {
                    pageContent = $(this).find('.page-content').html();
                }
            });
            if (pageContent) {
                $(ia.views.main.container).find('.page[data-page="bookmarks-opportunities"] .page-content').html(pageContent);
            }
        }
        if (params.fetch === false) {
            onSuccess(ia.bookmarks.data.opportunities);
        }
        else {
            ia.bookmarks.fetchBookmarks({
                success: function (data) {
                    onSuccess(data.opportunities);
                }
            });
        }
    },
    updateEmployersPage: function (params) {
        params = params || {};
        if ($(ia.views.main.container).find('.page[data-page="bookmarks-employers"]').length === 0) {
            return;
        }
        function onSuccess(employers) {
            var compiled = templates.bookmarksEmployers({
                employers: employers || []
            });
            var pageContent;
            $(compiled).each(function () {
                if (this.nodeType === 1 && $(this).hasClass('page')) {
                    pageContent = $(this).find('.page-content').html();
                }
            });
            if (pageContent) {
                $(ia.views.main.container).find('.page[data-page="bookmarks-employers"] .page-content').html(pageContent);
            }
        }
        if (params.fetch === false) {
            onSuccess(ia.bookmarks.data.employers);
        }
        else {
            ia.bookmarks.fetchEmployers({
                success: function (data) {
                    onSuccess(data.employers);
                }
            });
        }
    },
    loadOpportunitiesPage: function (params) {
        if (!params.view) return;
        ia.segment.screen('Saved Opportunities');
        ia.bookmarks.fetchBookmarks({
            success: function (data) {
                if (params.view) {
                    params.view.router.load({
                        template: templates.bookmarksOpportunities ,
                        context: {
                            opportunities: data.opportunities || []
                        }
                    });
                }
                if (params.success) params.success(data);
            },
            error: function (xhr, status) {
                if (status) {
                    ia.errors.alert('xhr', xhr, status);
                }
                else {
                    ia.errors.alert('network');
                }
                if (params.error) params.error(xhr, status);
            }
        });
    },
    loadEmployersPage: function (params) {
        if (!params.view) return;
        ia.segment.screen('Following Employers');
        ia.bookmarks.fetchEmployers({
            success: function (data) {
                if (params.view) {
                    params.view.router.load({
                        template: templates.bookmarksEmployers,
                        context: {
                            employers: data.employers || []
                        }
                    });
                }
                if (params.success) params.success(data);
            },
            error: function (xhr, status) {
                if (status) {
                    ia.errors.alert('xhr', xhr, status);
                }
                else {
                    ia.errors.alert('network');
                }
                if (params.error) params.error(xhr, status);
            }
        });
    },
    onLogin: function () {
        if (ia.app.isOnline()) {
            ia.bookmarks.update();
        }
    },
    onLogout: function () {
        $('.bookmarks-delete').each(function () {
            var self = $(this);
            self.addClass('bookmarks-add').removeClass('bookmarks-delete');
            self.find('.icon').text('star_border');
            self.find('.follow-text').text('Follow');
        });
    },
    init: function () {
        $(document).on('click', '.bookmarks-add', function () {
            var self = $(this);
            ia.bookmarks.add({
                title: self.attr('data-title'),
                type: self.attr('data-type'),
                id: self.attr('data-id')
            });
        });
        $(document).on('click', '.bookmarks-delete', function () {
            var self = $(this);
            ia.bookmarks.remove({
                title: self.attr('data-title'),
                type: self.attr('data-type'),
                id: self.attr('data-id')
            });
        });
        $(document).on('click', '.load-bookmarks-opportunities', function() {
            var self = $(this);
            var view = self.parents('.view')[0].f7View;
            if (!view) return;

            app.showIndicator();
            ia.bookmarks.loadOpportunitiesPage({
                view: view,
                success: function () {
                    app.hideIndicator();
                },
                error: function () {
                    app.hideIndicator();  
                }
            });
        });
        $(document).on('click', '.load-bookmarks-employers', function() {
            var self = $(this);
            var view = self.parents('.view')[0].f7View;
            if (!view) return;

            app.showIndicator();
            ia.bookmarks.loadEmployersPage({
                view: view,
                success: function () {
                    app.hideIndicator();
                },
                error: function () {
                    app.hideIndicator();  
                }
            });
        });
    }
};