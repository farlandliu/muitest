/* ============================================
** Calendar
============================================ */
ia.calendar = {
    addInterview: function (params) {
        var title, location, notes, startDate, endDate;
        if (params.type === 'telephone') {
            title = 'Telephone interview with ' + params.employer;
            notes = params.employer + ' invited you to a telephone interview with ' + params.interviewer + '.';
            if (params.employerWillCall) {
                notes += ' ' + params.interviewer + ' will call you at the allocated time.';
            }
            else if (params.telephone){
                notes += ' ' + params.interviewer + ' would like you to call them at the allocated time. Please telephone the interviewer on ' + params.telephone + '.';
            }
            if (params.instructions) {
                notes += ' "' + params.instructions + '"';
            }
            startDate = moment(params.date).toDate();
            endDate = moment(params.date).add(30, 'm').toDate();
        }
        else {
            title = 'Interview with ' + params.employer + '.';
            notes = params.employer + ' invited you to an "in-person" interview with ' + params.interviewer + '.';
            if (params.instructions) {
                notes += ' "' + params.instructions + '"';
            }
            startDate = moment(params.date).toDate();
            endDate = moment(params.date).add(60, 'm').toDate();
            location = params.address;
        }
        window.plugins.calendar.createEventInteractively(
            title,
            location,
            notes,
            startDate,
            endDate,
            function (a) {
                // Prompt for Rate
                ia.rate.prompt();
            },
            function (a) {}
        );
    },
    addDeadline: function (params) {
        var title, location, notes, startDate, endDate;
        title = 'Deadline for "' + params.title + '" opportunity at Intern Avenue';
        startDate = moment(params.date).subtract(60, 'm').toDate();
        endDate = moment(params.date).toDate();
        window.plugins.calendar.createEventInteractivelyWithOptions(
            title,
            location,
            notes,
            startDate,
            endDate,
            {
                url: params.url
            },
            function (a) {
                // Prompt for Rate
                ia.rate.prompt();
            },
            function (a) {}
        );
    }
};