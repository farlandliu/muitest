Template7.registerHelper('log', function (ctx, options) {
    console.log(ctx);
    return '';
});
Template7.registerHelper('headerImageSize', function (ctx, options) {
    var url = '';
    if (!ctx || ctx && ctx.length === 0) {
        return url;
    }
    var sizes = [640, 750, 960, 1080, 1200, 1600];
    var screenSize = ia.windowWidth * ia.pixelRatio;
    var targetSize;
    for (var i = 0; i < sizes.length; i++) {
        if (sizes[i] >= screenSize) {
            targetSize = sizes[i];
            break;
        }
    }
    if (targetSize) url = ctx['w_' + targetSize];
    else url = ctx.original;

    return url || '';
});
Template7.registerHelper('listItemImageSize', function (ctx, options) {
    var url = '';
    if (!ctx || ctx && ctx.length === 0) {
        return url;
    }
    var sizes = [640, 750, 960, 1080, 1200, 1600];
    var screenSize = ia.windowWidth * ia.pixelRatio;
    if (ia.tablet) screenSize = screenSize / 2;
    var targetSize;
    for (var i = 0; i < sizes.length; i++) {
        if (sizes[i] >= screenSize) {
            targetSize = sizes[i];
            break;
        }
    }
    if (targetSize) url = ctx['w_' + targetSize];
    else url = ctx.original;

    return url || '';
});
Template7.registerHelper('externalUrl', function (url) {
    if (url && url.indexOf('http') !== 0) {
        url = 'http://' + url;
    }
    return url;
});
Template7.registerHelper('profile_edit_language_id', function (languages, index, options) {
    if (index > 0) {
        return languages[index - 1].id;
    }
    else return '';
});
Template7.registerHelper('if_is_opportunity_ended', function (opp, options) {
    var ended = ia.opportunity.isEnded(opp);
    if (ended) {
        return options.fn(this, options.data);
    }
    else {
        return options.inverse(this, options.data);   
    }
});
Template7.registerHelper('numeric_prop', function (context, prop, options) {
    return context[prop];
});
Template7.registerHelper('uppercaseFirstLetter', function (string, options) {
    if (typeof string !== 'string') return '';
    return string.split(' ').map(function(el){
        return el[0].toUpperCase() + el.substr(1);
    }).join(' ');
});
Template7.registerHelper('index_plus', function (index, options) {
    return index + 1;
});
Template7.registerHelper('index_minus', function (index, options) {
    return index - 1;
});
Template7.registerHelper('if_selected', function (val1, val2, prop, options) {
    if ($.isArray(val1)) {
        var selected = '';
        for (var i = 0; i < val1.length; i++) {
            if (val1[i][prop] === val2) selected = 'selected';
        }
        return selected;
    }
    else {
        if (val1 === val2) return 'selected';    
    }
    
    return '';
});
Template7.registerHelper('if_checked', function (val1, val2, prop, options) {
    if (val1 === val2) return 'checked';
    else return '';
});
Template7.registerHelper('if_compare', function (val1, val2, options) {
    if (val1 === val2) {
        return options.fn(this, options.data);
    }
    else {
        return options.inverse(this, options.data);
    }
});
Template7.registerHelper('br2nl', function (text, options) {
    return text ? text.replace(/<br>/g, '\n').replace(/<br\/>/g, '\n').replace(/<br \/>/g, '\n') : '';
});
Template7.registerHelper('moment', function (date, options) {
    if (date) {
        if (options.hash.oldFormat) {
            return moment(date, options.hash.oldFormat).format(options.hash.newFormat);
        }
        else {
            return moment(date).format(options.hash.newFormat);
        }
    }
    else return '';
});

Template7.registerHelper('date_messages_single', function (date, options) {
    // if (date) return moment(date).format('H:mm, Do MMM');
    if (date) return moment(date).format('H:mm, D MMM YYYY');
    else return '';
});
Template7.registerHelper('date_messages_list', function (date, options) {
    if (date) return moment(date).fromNow();
    else return '';
});
Template7.registerHelper('date_profile_dob', function (date, options) {
    if (date) return moment(date, 'YYYY-MM-DD').format('D MMM YYYY');
    else return '';
});
Template7.registerHelper('date_profile_dates_range', function (dateStart, dateEnd, options) {
    var date = moment(dateStart, 'YYYY-MM-DD').format('MMMM YYYY');
    if (dateEnd && dateEnd !== '0000-00-00') date += ' - ' + moment(dateEnd, 'YYYY-MM-DD').format('MMMM YYYY');
    return date;
});
Template7.registerHelper('date_profile_years_range', function (yearFrom, yearTo, options) {
    return yearFrom + ' - ' + (yearTo && yearTo !== '0' ? yearTo : 'Present');
});

