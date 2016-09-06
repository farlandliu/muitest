/*==============================================
Employer Profile
==============================================*/
ia.employer = {
    xhr: undefined,
    pageInit: function (page) {
        var container = $(page.container);
        var employer = page.context;
        var employerId = employer.id || container.attr('data-id');
        ia.segment.screen('Employer: ' + employer.name, {
            id: employer.id,
            url: employer.contact.url.ia,
            name: employer.name
        });
        /*==============================================
        Tabs
        ==============================================*/
        var activeTabIndex = 0;
        function updateTabbarHighlight() {
            var highlight = container.find('.tab-link-highlight');
            var activeLink = container.find('.profile-tabs-links a.active');
            highlight.css({width: activeLink[0].offsetWidth + 'px'});
            highlight.transform('translate3d(' + (activeLink[0].offsetLeft) + 'px,0,0)');
        }
        container.find('.profile-tabs-links a').on('click', function () {
            var link = $(this);
            var index = link.index();
            if (link.hasClass('active')) return;
            link.parent().find('.active').removeClass('active');
            link.addClass('active');
            link.parents('.page-content').find('.profile-tabs .tab.active').removeClass('active').trigger('hide');
            link.parents('.page-content').find('.profile-tabs .tab').eq(index).addClass('active').trigger('show');
            activeTabIndex = index;
            updateTabbarHighlight();
        });
        updateTabbarHighlight();
        $(window).on('resize', function () {
            updateTabbarHighlight();
        });

        /*==============================================
        Full Description
        ==============================================*/
        if (container.find('.profile-description-block').length > 0) {
            if (container.find('.profile-description-block .content-block-inner')[0].scrollHeight < 200) {
                container.find('.full-description-link').remove();
            }
            else {
                container.find('.full-description-link').on('click', function () {
                    $(this).parents('.profile-description-block').addClass('opened');
                });
            }
            // Fix links
            container.find('.profile-description-block .content-block-inner a').addClass('external').attr('target', '_system');
            container.find('a.external').on('click', function (e) {
                var url = $(this).attr('href');
                if (!url || url && url.indexOf('http') !== 0) {
                    if (url) $(this).attr('href', 'http://' + url);
                    e.preventDefault();
                    e.sropPropagation();
                    return false;
                }
            });
        }

        /*==============================================
        Gallery
        ==============================================*/
        if (container.find('.profile-gallery').length > 0) {
            var photoBrowser;
            container.find('.gallery-item').on('click', function () {
                if (!photoBrowser) {
                    photoBrowser = app.photoBrowser({
                        photos: (function () {
                            var p = [];
                            container.find('.gallery-item').each(function () {
                                p.push($(this).attr('data-original'));
                            });
                            return p;
                        })(),
                        theme: 'dark',
                        lazyLoading: true,
                        onClick: function () {
                            $('body').toggleClass('with-photo-browser-exposition');
                        },
                        onOpen: function () {
                            $('body').addClass('with-photo-browser');
                            ia.app.setStatusBar('photobrowser');
                        },
                        onClose: function () {
                            $('body').removeClass('with-photo-browser');
                            $('body').removeClass('with-photo-browser-exposition');
                            ia.app.setStatusBar('default');
                        }
                    });
                }
                photoBrowser.open($(this).index());
            });
        }

        /*==============================================
        Followers
        ==============================================*/
        var fetchFollowersOffset = 0;
        var allowFollowersInfinite = false;
        var fetchFollowersPerPage = 50;
        var fetchFollowersMax = 500;
        function fetchFollowers() {
            allowFollowersInfinite = false;
            $.ajax({
                url: ia.api.employer.followers,
                method: 'GET',
                data: {
                    company_id: employerId,
                    offset: fetchFollowersOffset,
                    per_page: fetchFollowersPerPage
                },
                success: function (data) {
                    data = JSON.parse(data);
                    container.find('.employer-profile-followers .row').append(templates.employerProfileFollowers(data.followers));
                    if (data.followers.length < fetchFollowersPerPage || fetchFollowersOffset >= fetchFollowersMax) {
                        container.find('.employer-profile-followers .preloader').remove();
                    }
                    else {
                        allowFollowersInfinite = true;
                    }
                    fetchFollowersOffset += fetchFollowersPerPage;

                },
                error: function (data) {
                    allowFollowersInfinite = true;
                }
            });
        }
        if (employer.num_followers > 0) {
            container.find('.employer-tab-followers').once('show', function () {
                fetchFollowers();
                
            });
            container.on('infinite', function () {
                if (!allowFollowersInfinite) return;
                if (activeTabIndex === 2) {
                    fetchFollowers();
                }
            });
        }
            
        
    },
    
    loadProfilePage: function (params) {
        ia.employer.xhr = $.ajax(
            {
                method: 'GET',
                url: ia.api.employer.profile.replace('{{id}}', params.id),
                success: function (data) {
                    data = JSON.parse(data);
                    if (params.view) {
                        params.view.router.load({
                            template: templates.employerProfile,
                            context: data.employer
                        });
                    }
                    if (params.success) params.success();
                },
                error: function (xhr, status) {
                    if (params.error) params.error();
                    if (status) {
                        ia.errors.alert('xhr', xhr, status);
                    }
                    else {
                        ia.errors.alert('network', xhr);
                    }
                }
            }
        );
    },
    init: function () {
        app.onPageInit('employer-profile', ia.employer.pageInit);

        // Load Profile
        $(document).on('click', 'a.load-employer-profile', function () {
            var id = $(this).attr('data-id') || $(this).parents('li').attr('data-id');
            var view = $(this).parents('.view')[0].f7View;

            if (view) {
                var prevPage = $(view.activePage.container).prev('.page');
                if (prevPage.length > 0) {
                    if (prevPage.attr('data-page') === 'employer-profile' && prevPage.attr('data-id') === id) {
                        view.router.back();
                        return;
                    }
                }
            }

            app.showIndicator();
            ia.employer.loadProfilePage({
                id: id,
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