/* ============================================
** Intro Screen
============================================ */
ia.intro = {
    allowInputFocus: true,
    swiper: undefined,
    swiperVertical: undefined,
    container: $('.intro-screen'),
    open: function () {
        app.loginScreen(ia.intro.container);
    },
    close: function () {
        app.closeModal(ia.intro.container);
        localStorage.iaIntroShown = '1';
        //ia.segment.screen('Opportunities');
    },
    hide: function () {
        ia.intro.container.removeClass('modal-in').trigger('closed');
        localStorage.iaIntroShown = '1';
        //ia.segment.screen('Opportunities');
    },
    init: function () {
        // Intro Swiper
        ia.intro.allowInputFocus = true;
        ia.intro.swiper = new Swiper('.intro-screen .swiper-container-horizontal', {
            pagination: '.intro-screen .swiper-pagination',
            spaceBetween: 20,
            onTouchMove: function () {
                ia.intro.allowInputFocus = false;
            },
            onTouchEnd: function () {
                setTimeout(function () {
                    ia.intro.allowInputFocus = true;
                }, 100);
            },
            onSlideChangeEnd: function (s) {
                //ia.segment.screen('Opening Teaser ' + (s.activeIndex + 1));
            }
        });

        // Intro Swiper Vertical
        ia.intro.swiperVertical = new Swiper ('.intro-screen .swiper-container-vertical', {
            direction: 'vertical',
            spaceBetween: 20,
            nested: true,
            speed: 600,
            onlyExternal: true,
            initialSlide: 1
        });

        $('.intro-screen .button-next').on('click', function () {
            ia.intro.swiper.slideNext(true, 600);
        });
        $('.intro-screen .skip-intro').on('click', function () {
            ia.intro.close();
        });

        $('.intro-screen .button-up').on('click', function () {
            ia.intro.swiperVertical.slidePrev();
        });
        $('.intro-screen .button-down').on('click', function () {
            ia.intro.swiperVertical.slideNext();
        });

        // Intro Forgot
        $('.intro-screen .intro-forgot-form').on('submit', function (e) {
            e.preventDefault();
            var form = $('.intro-forgot-form');
            app.showIndicator();
            ia.auth.passwordReset({
                email: form.find('input[name="email"]').val(),
                success: function () {
                    app.hideIndicator();
                    form.find('input').blur();
                    app.alert('An e-mail containing your unique password reset link has been sent to specified e-mail address', function () {
                        ia.intro.swiperVertical.slideTo(1);
                    });
                },
                error: function () {
                    app.hideIndicator();
                }
            });
        });
        // Intro Login
        $('.intro-screen .intro-login-form').on('submit', function (e) {
            e.preventDefault();
            var form = $('.intro-login-form');
            app.showIndicator();
            ia.auth.login({
                user: {
                    email: form.find('input[name="email"]').val(),
                    password: form.find('input[name="password"]').val()
                },
                success: function () {
                    ia.intro.close();
                    app.hideIndicator();
                    form.find('input').blur();
                },
                error: function () {
                    app.hideIndicator();
                }
            });
        });
        // Social Login
        $('.intro-screen .sign-in-social').on('click', function (e) {
            app.showIndicator();
            ia.auth.loginSocial({
                provider: $(this).attr('data-provider'),
                success: function () {
                    ia.intro.close();
                    app.hideIndicator();
                },
                error: function () {
                    app.hideIndicator();
                }
            });
        });
        // Intro Register
        $('.intro-screen .intro-register-form').on('submit', function (e) {
            e.preventDefault();
            var form = $('.intro-register-form');
            app.showIndicator();
            ia.auth.register({
                user: {
                    first_name: form.find('input[name="first_name"]').val(),
                    last_name: form.find('input[name="last_name"]').val(),
                    email: form.find('input[name="email"]').val(),
                    password: form.find('input[name="password"]').val()
                },
                success: function () {
                    ia.intro.close();
                    app.hideIndicator();
                    form.find('input').blur();
                },
                error: function () {
                    app.hideIndicator();
                }
            });
        });
        // On Close
        ia.intro.container.once('closed', function () {
            ia.app.setStatusBar();
            if (ia.app.isOnline()) {
                ia.search.search();
            }
        });
    }
};

