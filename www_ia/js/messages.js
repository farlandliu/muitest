/* ============================================
** Messages
============================================ */
ia.messages = {
    list: $('#tab-messages .chat-list ul'),
    listPreloader: $('#tab-messages .chat-list .preloader'),
    listNoResults: $('#tab-messages .no-results'),
    listPtr: $('#tab-messages.page-content'),
    authBlock: $('#tab-messages .auth-required'),
    data: [],
    xhr: undefined,
    fetch: function (params) {
        params = params || {};
        if (ia.messages.xhr) ia.messages.xhr.abort();
        ia.messages.xhr = undefined;
        ia.messages.xhr = $.ajax({
            url: ia.api.messages.fetch,
            method: 'GET',
            success: function (data, xhr, status) {
                data = JSON.parse(data);
                ia.messages.data = data.connections;
                if (params.success) params.success(data.connections);
            },
            error: function (xhr, status) {
                if (params.error) params.error(xhr, status);
            }
        });
    },
    update: function (reset, ptr) {
        if (!ia.app.isOnline()) {
            if (ptr) {
                app.pullToRefreshDone(ia.messages.listPtr);
            }
            ia.errors.alert('network');
            return;
        }
        if (!ia.auth.isLoggedIn()) {
            if (ptr) {
                app.pullToRefreshDone(ia.messages.listPtr);
            }
            ia.messages.authBlock.show();
            ia.messages.listPreloader.hide();
            ia.messages.list.html('');
            ia.messages.listNoResults.hide();
            return;
        }
        else {
            ia.messages.authBlock.hide();
            if (reset) ia.messages.listPreloader.show();
        }
        if (reset && !ptr) {
            ia.messages.listPreloader.show();
            ia.messages.list.html('');
        }
        // ia.messages.listNoResults.hide();

        ia.messages.fetch({
            success: function (data) {
                if (ptr) {
                    app.pullToRefreshDone(ia.messages.listPtr);
                }
                var messages = data || [];
                if (messages.length > 0) {
                    ia.messages.listNoResults.hide();
                }
                else {
                    ia.messages.listNoResults.show();   
                }
                ia.messages.listPreloader.hide();
                ia.messages.authBlock.hide();
                ia.messages.list.html(templates.messagesList({
                    messages: messages
                }));
                ia.messages.updateUnreadCount();
            },
            error: function (xhr, status) {
                if (ptr) {
                    app.pullToRefreshDone(ia.messages.listPtr);
                }
                if (status) {
                    // Probably because of login? Also need to check for network error
                    ia.messages.list.html('');
                    ia.messages.authBlock.show();
                    ia.messages.listPreloader.hide();

                    ia.errors.alert('xhr', xhr, status);
                }
                else {
                    // Connection error?
                    ia.errors.alert('network');
                }
            }
        });
    },
    markAsRead: function (id) {
        $.ajax({
            url: ia.api.messages.mark_as_read,
            method: 'GET',
            data: {
                connection_id: id
            },
            success: function () {
                ia.messages.updateUnreadCount();
                for (var i = 0; i < ia.messages.data.length; i++) {
                    if (ia.messages.data[i].id === id) {
                        ia.messages.data[i].thread.unread = 0;
                        ia.messages.list.html(templates.messagesList({
                            messages: ia.messages.data
                        }));
                    }
                }
            }
        });
    },

    // Update Unread messages count
    updateUnreadCount: function () {
        $.ajax({
            url: ia.api.messages.unread_count,
            method: 'GET',
            data: {
                type: 'message'
            },
            success: function(data, status) {
                var res = JSON.parse(data);    
                var count = res.count;
                if (count > 0) {
                    var badges = $('.tabbar a[href="#tab-messages"] i .badge');
                    if (badges.length === 0) {
                        $('.tabbar a[href="#tab-messages"] i').append('<span class="badge bg-red">' + count + '</span>');
                    }
                    else {
                        badges.text(count);
                    }

                }
                else {
                    $('.tabbar a[href="#tab-messages"] i .badge').remove();
                }
            }
        });
    },
    sendMessage: function (params) {
        if (!ia.app.isOnline()) {
            ia.errors.alert('network');
            return;
        }
        $.ajax({
            url: ia.api.messages.create,
            method: 'POST',
            data: {
                connection_id : params.id, 
                message : params.text 
            },
            success: function (data) {
                ia.segment.track('Candidate Sent a Message', 'Message', {
                    employer: {
                        id: params.id
                    }
                });
                ia.messages.update();
                if (params.success) params.success(data);
            },
            error: function (xhr, status) {
                ia.errors.alert('xhr', xhr, status);
                if (params.error) params.error(xhr, status);
            }
        });
    },
    loadDetailsPage: function (id, markAsRead) {
        var connection;

        for (var i = 0; i < ia.messages.data.length; i++) {
            if (ia.messages.data[i].id === id) connection = ia.messages.data[i];
        }

        if (connection) {

            // Load Page
            ia.views.main.router.load({
                template: templates.messagesDetails,
                context: connection
            });

            // Mark as read
            if (markAsRead === true || typeof markAsRead === 'undefined') ia.messages.markAsRead(id);
        }
    },

    // Log In
    onLogin: function () {
        ia.messages.authBlock.hide();
        ia.messages.listPreloader.show();
        ia.messages.listNoResults.hide();

        // Update messages
        if (ia.app.isOnline()) {
            ia.messages.update(true);
        }
    },
    // Log Out
    onLogout: function () {
        // Clean messages
        ia.messages.list.html('');
        ia.messages.authBlock.show();
        app.pullToRefreshDone(ia.messages.listPtr);
        ia.messages.listPreloader.hide();

        // Clean Data
        ia.messages.data = [];

        // Remove messages toolbar badge count
        $('.tabbar a[href="#tab-messages"] i .badge').remove();

        // Go Back
        // ia.views.messages.router.back({force: true, pageName: 'messages-list', animatePages: false});
    },
    // Init Messages
    init: function () {
        // Fetch messages on tab show
        $('#tab-messages').on('show', function () {
            if (ia.messages.data.length === 0 && ia.app.isOnline()) ia.messages.update();
        });

        // Reload messages on PTR
        ia.messages.listPtr.on('refresh', function () {
            ia.messages.update(false, true);
        });

        // Load Messages Details
        $(document).on('click', 'a.load-messages-details', function (e) {
            var li = $(this).parents('li');
            ia.messages.loadDetailsPage(li.attr('data-connection-id'), li.hasClass('has-unread-messages'));
        });

        // Init Messages Details Page
        app.onPageInit('messages-details', function (page) {
            var ctx = page.context;
            ia.segment.screen('Conversation', {
                employer: {
                    id: ctx.employer.id,
                    name: ctx.employer.name
                }
            });
            var messages = app.messages($('.messages', page.container), {
                autoLayout: true
            });
            var messagebar = app.messagebar($('.messagebar', page.container), {

            });
            messagebar.container.find('.link.send').on('click', function (e) {
                var text = messagebar.textarea.val().trim();

                var errorModal;
                if (text.replace( /[^a-zA-Z0-9]/gi, '' ) === '') {
                    errorModal = ia.errors.alert('messageInvalid');
                }
                else if (text.trim().length <= 6) {
                    errorModal = ia.errors.alert('messageShort');
                }
                if (errorModal) {
                    $(errorModal).on('close', function () {
                        messagebar.textarea.focus();
                    });
                    return;
                }
                else {
                    messagebar.textarea.focus();
                }

                messagebar.container.addClass('sending');
                ia.messages.sendMessage({
                    text: text,
                    id: messages.container.attr('data-id'),
                    success: function () {
                        // Ok
                        text = '<p>' + text.split('\n').join('</p><p>') + '</p>';
                        messages.addMessage({
                            text: text + '<div class="message-date">' + (moment(new Date()).format('H:mm, D MMM YYYY')) + '</div>',
                            avatar: ia.tablet ? ia.user.data.profile_img : null
                        });
                        messagebar.clear();
                        messagebar.container.removeClass('sending');

                        // Prompt for Rate
                        ia.rate.prompt();
                    },
                    error: function () {
                        // Error
                        messagebar.container.removeClass('sending');
                    }
                });
            }, true);

            // Add To Calendar
            $(page.container).find('.add-calendar-interview').on('click', function () {
                var data = $(this).dataset();
                ia.calendar.addInterview(data);
            });

        });
        app.onPageAfterBack('messages-details', function () {
            if (ia.auth.isLoggedIn()) {
                ia.rate.prompt();
            }
        });
    }
};