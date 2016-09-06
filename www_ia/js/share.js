/* ============================================
** Share
============================================ */
ia.share = {
    init: function () {
        $(document).on('click', '.share', function () {

            if (window.plugins.socialsharing) {
                var clicked = $(this);
                var type = clicked.attr('data-type');
                var data = clicked.parents('.view').find('.page.page-on-center')[0].f7PageData.context, 
                    subject, message, img, url;
                if (type === 'employer') {
                    subject = data.name + ' profile - Intern Avenue';
                    message = 'Check out this great employer!';
                    img = data.logo && data.logo.src ? data.logo.src : undefined;
                    url = data.contact && data.contact.url && data.contact.url.ia ? data.contact.url.ia : undefined;
                    ia.segment.track('Candidate Shared an Employer', 'Candidate', {
                        name: data.name,
                        id: data.id,
                        url: url,
                    });
                }
                else {
                    subject = data.title + ' - Intern Avenue';
                    message = 'Hey, I thought you’d find this role interesting';
                    img = data.employer && data.employer.logo ? data.employer.logo.src : undefined;
                    url = data.url;
                    ia.segment.track('Candidate Shared an Opportunity', 'Opportunity', {
                        title: data.title,
                        id: data.id,
                        url: data.url,
                        employer: {
                            id: data.employer.id,
                            name: data.employer.name,
                        }
                    });
                }
                if (app.device.ipad) {
                    var button = $(this);
                    window.plugins.socialsharing.setIPadPopupCoordinates([
                        button.offset().left,
                        button.offset().top,
                        button[0].offsetWidth,
                        button[0].offsetHeight
                    ].join(','));
                }
                window.plugins.socialsharing.share(
                    message,
                    subject,
                    img, 
                    url
                );
            }
        });
    }
};