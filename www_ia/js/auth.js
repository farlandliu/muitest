/* ============================================
** Auth
============================================ */
ia.auth = {
    xhr: undefined,
    accessToken: localStorage.iaAccessToken || undefined,
    isLoggedIn: function () {
        return (ia.auth.accessToken && ia.user.data);
    },
    onError: function (params, xhr, status) {
        ia.errors.alert('xhr', xhr, status);
        if (params.error) {
            params.error(xhr, status);
        }
    },
    onSuccess: function (params, xhr, status) {
        if (xhr && xhr.responseText) {
            var res = JSON.parse(xhr.responseText);
            if (res.status && !(res.status >= 200 && res.status < 300)) {
                ia.auth.onError(params, xhr, status);
                return;
            }
            if (res.user && res.user.group_id !== '2') {
                ia.auth.onError(params, xhr, status);
                return;
            }

            // Save Token
            if (res.token) {
                ia.auth.accessToken = res.token;
                localStorage.iaAccessToken = res.token;
            }

            // Save User Data
            if (res.user) {
                ia.user.data = res.user;
                localStorage.iaUserData = JSON.stringify(res.user);
            }

            // Do onLogin actions
            ia.auth.onLogin();


            if (params.success) {
                params.success(xhr, status);
            }
        }
        else {
            ia.auth.onError(params, xhr, status);
        }

    },
    passwordReset: function (params) {
        if (!ia.app.isOnline()) {
            ia.errors.alert('network');
            return;
        }
        if (ia.auth.xhr) ia.auth.xhr.abort();
        ia.auth.xhr = $.ajax({
            url: ia.api.auth.passwordReset,
            method: 'POST',
            processData: false,
            data: JSON.stringify({
                email: params.email
            }),
            complete: function (xhr, status) {
                if (status >= 200 && status < 300) {
                    if (params.success) params.success();
                    ia.segment.track('Candidate Password Reset Requested', 'Login');
                }
            },
            error: function (xhr, status) {
                ia.auth.onError(params, xhr, status);
            }
        });
    },
    login: function (params) {
        if (!ia.app.isOnline()) {
            ia.errors.alert('network');
            return;
        }
        if (ia.auth.xhr) ia.auth.xhr.abort();
        ia.auth.xhr = $.ajax({
            url: ia.api.auth.signin,
            method: 'POST',
            processData: false,
            data: JSON.stringify({
                email: params.user.email,
                password: params.user.password
            }),
            complete: function (xhr, status) {
                if (status >= 200 && status < 300) {
                    ia.auth.onSuccess(params, xhr, status);
                    ia.segment.track('Candidate Logged In', 'Login');
                }
            },
            error: function (xhr, status) {
                ia.auth.onError(params, xhr, status);
            }
        });
    },
    loginSocial: function (params) {
        var auth_url = ia.api.auth[params.provider];
        var ref = window.open(auth_url, '_blank', 'location=no,closebuttoncaption=Cancel');
        var closedBySuccess = false;
        ref.addEventListener('error', function () {
            ref.close();
            // if (params.error) params.error();
        });
        ref.addEventListener('loadstart', function (e) {
            var url = e.url, query, token;
            if (url && url.indexOf(auth_url + '?token=') === 0) {
                query = $.parseUrlQuery(url);
                token = query.token;
                if (token && token.indexOf('#') > 0) {
                    token = token.split('#')[0];
                }
                closedBySuccess = true;
                ia.auth.accessToken = token;
                localStorage.iaAccessToken = token;
                ref.close();
                ia.user.fetch({
                    token: token,
                    success: function () {
                        ia.auth.onLogin();
                        ia.segment.track('Candidate Logged In', 'Login');
                        if (params.success) params.success();
                    },
                    error: function (xhr, status) {
                        if (status) {
                            ia.errors.alert('xhr', xhr, status);
                        }
                        if (params.error) params.error();
                    }
                });
            }
            if (url === 'https://www.internavenue.com' || url === 'https://www.internavenue.com/' || url === 'https://www.internavenue.com/#_=_') {
                // Cancel return
                ref.close();
            }
        });
        ref.addEventListener('exit', function (e) {
            if (!closedBySuccess) {
                if (params.error) params.error();
            }
        });
    },
    logout: function (params) {
        if (ia.app.isOnline()) {
            $.ajax({
                url: ia.api.auth.signout,
                method: 'POST',
                processData: false,
                data: JSON.stringify({
                    hwid: ia.push.hwid,
                    push_token: ia.push.token,
                    platform: 3
                })
            });
            ia.segment.track('Candidate Logged Out', 'Login');
        }
        ia.auth.onLogout();
    },
    register: function (params) {
        if (!ia.app.isOnline()) {
            ia.errors.alert('network');
            return;
        }
        if (ia.auth.xhr) ia.auth.xhr.abort();
        ia.auth.xhr = $.ajax({
            url: ia.api.auth.signup,
            method: 'POST',
            processData: false,
            timeout: 60 * 1000,
            data: JSON.stringify({
                email: params.user.email,
                password: params.user.password,
                first_name: params.user.first_name,
                last_name: params.user.last_name,
                account_type: 'candidate',
            }),
            complete: function (xhr, status) {
                if (status >= 200 && status < 300) {
                    ia.auth.onSuccess(params, xhr, status);
                    ia.segment.track('Candidate Registered (Mobile)', 'Registration');
                }
            },
            error: function (xhr, status) {
                ia.auth.onError(params, xhr, status);
            }
        });
    },
    onLogin: function () {
        if (!ia.user.data) return;
        // Set Class To Body
        $('body').addClass('logged-in');

        // User
        ia.user.onLogin();

        // Applications
        ia.applications.onLogin();

        // Message
        ia.messages.onLogin();

        // Bookmarks
        ia.bookmarks.onLogin();

        // Register Device
        if (ia.app.isCordova()) {
            ia.push.onLogin();
        }

        // Identify
        ia.segment.onLogin();

    },
    onLogout: function () {
        // Unset user data and access token
        ia.user.data = undefined;
        ia.auth.accessToken = undefined;
        localStorage.removeItem('iaUserData');
        localStorage.removeItem('iaAccessToken');

        // Unset Class To Body
        $('body').removeClass('logged-in');

        // Unset Pass Field
        $('.login-screen-auth input[type="password"]').val('');

        // User
        ia.user.onLogout();

        // Applications
        ia.applications.onLogout();

        // Messages
        ia.messages.onLogout();

        // Bookmarks
        ia.bookmarks.onLogout();

        // Identify
        ia.segment.onLogout();
    },

    // Init
    init: function () {
        // Add Token To Request
        $(document).on('ajaxStart', function (e) {
            var xhr = e.detail.xhr;
            if(xhr.requestUrl.indexOf('internavenue.com') < 0) {
                return;
            }
            if (ia.auth.isLoggedIn()) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + ia.auth.accessToken);
            }
        });

        // Sign Out Link
        $(document).on('click', '.signout-link', function () {
            ia.auth.logout();
        });
    }
};