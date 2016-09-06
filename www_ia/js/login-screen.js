/* ============================================
** More Section Login/Register
============================================ */
ia.loginScreen = {
    init: function () {
        $('.login-screen-auth, .login-screen-register').on('open', function () {
            $('body').addClass('with-login-screen');
            ia.app.setStatusBar('login');
        });
        $('.login-screen-auth, .login-screen-register').on('close', function () {
            $('body').removeClass('with-login-screen');
            if (window.StatusBar) StatusBar.styleLightContent();
            ia.app.setStatusBar('default');
        });

        // Login
        $('.login-screen-auth form').on('submit', function (e) {
            e.preventDefault();
            var form = $(this);
            app.showIndicator();
            ia.auth.login({
                user: {
                    email: form.find('input[name="email"]').val(),
                    password: form.find('input[name="password"]').val()
                },
                success: function () {
                    app.closeModal('.login-screen-auth');
                    app.hideIndicator();
                    form.find('input').blur();
                },
                error: function () {
                    app.hideIndicator();
                }
            });
        });
        // Social Login
        $('.login-screen-auth .sign-in-social, .login-screen-register .sign-in-social').on('click', function (e) {
            app.showIndicator();
            ia.auth.loginSocial({
                provider: $(this).attr('data-provider'),
                success: function () {
                    app.hideIndicator();
                    app.closeModal('.login-screen-auth');
                },
                error: function () {
                    app.hideIndicator();
                }
            });
        });

        // Reset
        $('.login-screen-password form').on('submit', function (e) {
            e.preventDefault();
            var form = $(this);
            app.showIndicator();
            ia.auth.passwordReset({
                email: form.find('input[name="email"]').val(),
                success: function () {
                    app.hideIndicator();
                    form.find('input').blur();
                    app.alert('An e-mail containing your unique password reset link has been sent to specified e-mail address', function () {
                        app.closeModal('.login-screen-password');
                        app.loginScreen('.login-screen-auth');
                    });
                },
                error: function () {
                    app.hideIndicator();
                }
            });
        });

        // Register
        $('.login-screen-register form').on('submit', function (e) {
            e.preventDefault();
            var form = $(this);
            app.showIndicator();
            ia.auth.register({
                user: {
                    first_name: form.find('input[name="first_name"]').val(),
                    last_name: form.find('input[name="last_name"]').val(),
                    email: form.find('input[name="email"]').val(),
                    password: form.find('input[name="password"]').val()
                },
                success: function () {
                    app.closeModal('.login-screen-register');
                    app.hideIndicator();
                    form.find('input').blur();
                },
                error: function () {
                    app.hideIndicator();
                }
            });
        });
    }
};