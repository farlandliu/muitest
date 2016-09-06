/*==============================================
Opportunity Profile
==============================================*/
ia.opportunity = {
    xhr: undefined,
    isEnded: function (opp) {
        var ended = false;
        if ((opp.deadline.raw !== '0000-00-00' && new Date(opp.deadline.raw) < new Date()) || opp.is_finished || opp.employer.has_package === false) {
            ended = true;
        }
        return ended;
    },
    pageInit: function (page) {
        var container = $(page.container);
        var opp = page.context;
        ia.segment.screen('Opportunity: ' + opp.title, {
            employer: {
                id: opp.employer.id,
                name: opp.employer.name,
            },
            url: opp.url
        });

        /*==============================================
        Tabs
        ==============================================*/
        container.find('.profile-tabs-links a').on('click', function () {
            var link = $(this);
            var index = link.index();
            if (link.hasClass('active')) return;
            link.parent().find('.active').removeClass('active');
            link.addClass('active');
            link.parents('.page-content').find('.profile-tabs .tab.active').removeClass('active').trigger('hide');
            link.parents('.page-content').find('.profile-tabs .tab').eq(index).addClass('active').trigger('show');
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
            container.find('.profile-description-block .content-block-inner a').addClass('external').attr('_target', 'system');
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

        // Calendar
        $(page.container).find('.add-calendar-deadline').on('click', function () {
            ia.calendar.addDeadline($(this).dataset());
        });
    },
    loadProfilePage: function (params) {
        ia.opportunity.xhr = $.ajax(
            {
                method: 'GET',
                url: ia.api.opportunity.profile.replace('{{id}}', params.id),
                success: function (data) {
                    data = JSON.parse(data);
                    if (params.view) {
                        params.view.router.load({
                            template: templates.opportunityProfile,
                            context: data.opportunity
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
                        ia.errors.alert('network');
                    }
                }
            }
        );
    },
    init: function () {
        // On Page Init
        app.onPageInit('opportunity-profile', ia.opportunity.pageInit);

        // Load Profile
        $(document).on('click', 'a.load-opportunity-profile', function () {
            var id = $(this).attr('data-id') || $(this).parents('li').attr('data-id');
            var view = $(this).parents('.view')[0].f7View;

            if (view) {
                var prevPage = $(view.activePage.container).prev('.page');
                if (prevPage.length > 0) {
                    if (prevPage.attr('data-page') === 'opportunity-profile' && prevPage.attr('data-id') === id) {
                        view.router.back();
                        return;
                    }
                }
            }

            app.showIndicator();
            ia.opportunity.loadProfilePage({
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