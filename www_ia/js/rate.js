/*==============================================
Rate App
==============================================*/
ia.rate = {
    rateDate: function () {
        return localStorage.iaRateDate;
    },
    rated: function () {
        return localStorage.iaRateRated === '1';
    },
    canceled: function () {
        return localStorage.iaRateCanceled === '1';
    },
    delay: 1000 * 60 * 60 * 24 * 5, //once per 5 days
    title: 'Rate InternAvenue',
    text: 'If you enjoy using InternAvenue, would you mind taking a moment to rate it? It won’t take more than a minute. Thanks for your support!',
    prompt: function () {
        if (ia.rate.canceled() || ia.rate.rated()) return;
        if (ia.rate.rateDate()) {
            var rateDate = new Date(ia.rate.rateDate() * 1);
            if (new Date().getTime() - rateDate < ia.rate.delay) {
                return;
            }
        }
        localStorage.iaRateDate = new Date().getTime();
        app.modal({
            title: ia.rate.title,
            text: ia.rate.text,
            verticalButtons: true,
            buttons: [
                {
                    text: 'No, Thanks',
                    onClick: function (modal, e) {
                        localStorage.iaRateCanceled = '1';
                        app.closeModal(modal);
                    }
                },
                {
                    text: 'Remind Me Later',
                    onClick: function (modal, e) {
                        app.closeModal(modal);
                    }
                },
                {
                    text: 'Rate It Now',
                    bold: true,
                    onClick: function (modal, e) {
                        localStorage.iaRateRated = '1';
                        app.closeModal(modal);
                        ia.segment.track('Candidate Rated the App', 'Candidate');
                        setTimeout(function () {
                            window.open('market://details?id=com.internavenue.candidate', '_system');
                        }, 150);
                    }
                },
            ]
        });
    },
    init: function () {
        $(document).on('click', '.rate-link', function () {
            localStorage.iaRateRated = '1';
            setTimeout(function () {
                window.open('market://details?id=com.internavenue.candidate', '_system');
            }, 300);
        });
    }
};