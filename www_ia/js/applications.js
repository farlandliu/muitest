/*==============================================
Applications
==============================================*/
ia.applications = {
    xhr: undefined,
    coverLetter: localStorage.iaCoverLetter ? localStorage.iaCoverLetter : '',
    list: $('#tab-applications .applications-list ul'),
    listPreloader: $('#tab-applications .applications-list .preloader'),
    listNoResults: $('#tab-applications .no-results'),
    listPtr: $('#tab-applications.page-content'),
    authBlock: $('#tab-applications .auth-required'),
    data: [],
    apply: function (opp) {
        if (!opp) return;
        var threshold = 50;
        var isStudent, isGraduate;
        var allowApplication = true;
        var applicationDeniedReason = '';
        if (!ia.auth.isLoggedIn()) {
            ia.errors.alert('login');
            allowApplication = false;
            return ;
        }
        else {
            if (ia.user.data.user_meta_availability === '2') {
                app.alert('Your current availability settings show you as not available. It is very off-putting to employers when candidates who are shown as not available apply for their internships. You have to change your status to "available on specific dates".', 'You are not available');
                allowApplication = false;
                return;
            }
            if (ia.user.data.percent_complete < threshold) {
                app.alert('You cannot apply for this opportunity as your profile is currently only <strong>' + ia.user.data.percent_complete + '%</strong> complete. Many employers won\'t consider connecting with candidates who have incomplete profiles.', 'Complete your profile');
                allowApplication = false;
                return;
            }
            else {

                if (opp.is_applied) {
                    app.alert('You have already applied for this opportunity', 'Already applied');
                    allowApplication = false;
                    return;
                }
                else {
                    isStudent = ia.user.data.still_studying;
                    isGraduate = ia.user.data.was_student;
                    switch (opp.allow_applications_from) {
                        case 'STUDENT_ONLY' : {
                            if (!isStudent) {
                                allowApplication = false;
                                applicationDeniedReason = 'you are not a student.';
                            }
                            break;
                        }

                        case 'GRADUATE_ONLY' : {
                            if (!isGraduate || !isStudent) {
                                allowApplication = false;
                                applicationDeniedReason = 'you are not a graduate.';
                            }
                            break;
                        }

                        case 'STUDENT_AND_GRADUATE' : {
                            if (!isGraduate || !isStudent) {
                                allowApplication = false;
                                applicationDeniedReason = 'you are not a student or a graduate.';
                            }
                            break;
                        }

                    }
                    if (!allowApplication) {
                        app.alert('Unfortunately you cannot apply for this opportunity because ' + applicationDeniedReason);
                        return;
                    }
                }
            }
        }

        var popup = app.popup(templates.popupApply({
            opportunity: opp,
            user: ia.user.data,
            coverLetter: ia.applications.coverLetter
        }));
        $(popup).find('textarea').on('change', function () {
            ia.applications.coverLetter = this.value;
            localStorage.iaCoverLetter = this.value;
        });
        $(popup).find('.button').on('click', function () {
            app.showIndicator();
            ia.applications.sendApplication({
                id: opp.id,
                coverLetter: $(popup).find('textarea').val(),
                success: function (data) {
                    ia.segment.track('Candidate Applied to an Opportunity', 'Opportunity', {
                        title: opp.title,
                        id: opp.id,
                        employer: {
                            id: opp.employer.id,
                            name: opp.employer.name,
                        }
                    });
                    $('.page[data-page="opportunity-profile"][data-id="' + opp.id + '"]').each(function () {
                        $(this).find('.opportunity-header .apply-opportunity').remove();
                        $(this).find('.opportunity-apply-block .content-block-inner').html('<p>You have already applied for this opportunity</p>');
                    });
                    var successAlert = app.alert('Your application has been received. You will be notified when this opportunity closes.', 'Good luck!');
                    app.closeModal('.popup-apply');

                    app.hideIndicator();

                    // Prompt for Rating
                    $(successAlert).on('close', function () {
                        ia.rate.prompt();
                    });
                },
                error: function (xhr, status) {
                    app.hideIndicator();
                }
            });
        });
    },
    sendApplication: function (params) {
        $.ajax({
            url: ia.api.applications.apply.replace('{{id}}', params.id),
            method: 'POST',
            data: {
                cover_letter: params.coverLetter
            },
            success: function (data) {
                ia.applications.update();
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
    fetch: function (params) {
        params = params || {};
        if (ia.applications.xhr) ia.applications.xhr.abort();
        ia.applications.xhr = undefined;
        ia.applications.xhr = $.ajax({
            url: ia.api.applications.fetch,
            method: 'GET',
            success: function (data, xhr, status) {
                data = JSON.parse(data);
                ia.applications.data = data.applications;
                if (params.success) params.success(data.applications);
            },
            error: function (xhr, status) {
                if (params.error) params.error(xhr, status);
            }
        });
    },
    update: function (reset, ptr) {
        if (!ia.app.isOnline()) {
            if (ptr) {
                app.pullToRefreshDone(ia.applications.listPtr);
            }
            ia.errors.alert('network');
            return;
        }
        if (!ia.auth.isLoggedIn()) {
            if (ptr) {
                app.pullToRefreshDone(ia.applications.listPtr);
            }
            ia.applications.authBlock.show();
            ia.applications.listPreloader.hide();
            ia.applications.list.html('');
            ia.applications.listNoResults.hide();
            return;
        }
        else {
            ia.applications.authBlock.hide();
            if (reset) ia.applications.listPreloader.show();
        }
        if (reset && !ptr) {
            ia.applications.listPreloader.show();
            ia.applications.list.html('');
        }


        ia.applications.fetch({
            success: function (data) {
                if (ptr) {
                    app.pullToRefreshDone(ia.applications.listPtr);
                }
                var applications = data || [];
                if (applications.length > 0) {
                    ia.applications.listNoResults.hide();
                }
                else {
                    ia.applications.listNoResults.show();
                }
                ia.applications.listPreloader.hide();
                ia.applications.authBlock.hide();
                ia.applications.list.html(templates.applicationsList({
                    applications: applications
                }));
            },
            error: function (xhr, status) {
                if (ptr) {
                    app.pullToRefreshDone(ia.applications.listPtr);
                }
                if (status) {
                    // Probably because of login? Also need to check for network error
                    ia.applications.list.html('');
                    ia.applications.authBlock.show();
                    ia.applications.listPreloader.hide();

                    ia.errors.alert('xhr', xhr, status);
                }
                else {
                    // Connection error?
                    ia.errors.alert('network');
                }
            }
        });
    },
    onLogin: function () {
        ia.applications.authBlock.hide();
        ia.applications.listPreloader.show();
        ia.applications.listNoResults.hide();

        // Update applications
        if (ia.app.isOnline()) {
            ia.applications.update(true);
        }
    },
    onLogout: function () {
        // Clean applications
        ia.applications.list.html('');
        ia.applications.authBlock.show();
        app.pullToRefreshDone(ia.applications.listPtr);
        ia.applications.listPreloader.hide();

        // Clean Data
        ia.applications.data = [];
        localStorage.removeItem('iaCoverLetter');

        // Go Back
        // ia.views.main.router.back({force: true, pageName: 'applications-list', animatePages: false});

        //
    },
    init: function () {
        /*==============================================
        Fetch applications on tab show
        ==============================================*/
        $('#tab-applications').on('show', function () {
            if (ia.applications.data.length === 0 && ia.app.isOnline()) ia.applications.update();
        });

        /*==============================================
        Reload applications on PTR
        ==============================================*/
        ia.applications.listPtr.on('refresh', function () {
            ia.applications.update(false, true);
        });

        /*==============================================
        Apply Button
        ==============================================*/
        $(document).on('click', '.opportunity-apply-button', function () {
            var button = $(this);
            var opp = button.parents('.page')[0].f7PageData.context;
            if (opp.is_external || opp.external_url || button.hasClass('external-opportunity-apply-button')) {
                var url = '';
                url = opp.external_url || opp.employer.url || ('http://www.google.co.uk/?q=' + opp.employer.name);
                window.open(url, '_system');
                return;
            }
            else {
                ia.applications.apply(opp);
            }
        });
    }
};