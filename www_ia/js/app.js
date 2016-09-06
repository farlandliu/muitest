/* ============================================
** App IA Instance
============================================ */
var ia = {app: {}};

/* ============================================
** App F7 Instance
============================================ */
var app = new Framework7({
    modalTitle: 'Intern Avenue',
    statusbarOverlay: false,
    animateNavBackIcon: false,
    externalLinks: '.external, .profile-description-block a',
    material: true,
    materialPageLoadDelay: 200,
    materialRipple: (function () {
        var osVersion = Framework7.prototype.device.osVersion;
        if (!osVersion) return true;
        var major = Framework7.prototype.device.osVersion.split('.');
        if (major < 5) return false;
        return true;
    })(),
    init: false
});

/* ============================================
** DEV/PROD Evironment
============================================ */
// ia.env = 'DEV';
ia.env = 'PROD';


/* ============================================
** API Endpoint URL
============================================ */
ia.api = (function(){
    var server, endpoint;
    if (ia.env === 'DEV') {
        // server = 'https://www.vagrant.internavenue.com/';
        server = 'https://staging.internavenue.com/';
    }
    else {
        // server = 'https://staging.internavenue.com/';
        // server = 'http://www.vagrant.internavenue.com/';
        server = 'https://www.internavenue.com/';
    }

    endpoint = server + 'api/v1/';

    return {
        server: server,
        endpoint: endpoint,
        autocomplete: endpoint + 'autocomplete',
        search: {
            opportunities: endpoint + 'internships/search',
            employers: endpoint + 'companies/search'
        },
        auth: {
            signin: endpoint + 'auth/signin',
            signup: endpoint + 'auth/signup',
            signout: endpoint + 'auth/signout',
            facebook: endpoint + 'auth/connect/facebook',
            linkedin: endpoint + 'auth/connect/linkedin',
            passwordReset: endpoint + 'auth/requestpasswordreset'
        },
        messages: {
            fetch: endpoint + 'messaging/fetch',
            create: endpoint + 'messaging/create',
            mark_as_read: endpoint + 'messaging/mark_as_read',
            unread_count: endpoint + 'notifications/get_count',
        },
        employer: {
            profile: endpoint + 'employers/{{id}}/',
            followers: endpoint + 'companies/fetch_followers'
        },
        opportunity: {
            profile: endpoint + 'opportunities/{{id}}/'
        },
        user: {
            profile: endpoint + 'candidate/me',
            edit: {
                personal: endpoint + 'candidate/me/profile',
                qualifications: endpoint + 'candidate/me/qualifications',
                experiences: endpoint + 'candidate/me/experiences',
                awards: endpoint + 'candidate/me/awards',
                societies: endpoint + 'candidate/me/societies',
                diversities: endpoint + 'candidate/me/diversities',
                schools: endpoint + 'candidate/me/schools',
                languages: endpoint + 'candidate/me/languages',
                skills: endpoint + 'candidate/me/skills',
                preferences: endpoint + 'candidate/me/preferences',
                links: endpoint + 'candidate/me/links',
                image: endpoint + 'candidate/me/image',
                cv: endpoint + 'candidate/me/cv',
                availability: endpoint + 'candidate/me/availability',
                facts: {
                    fetch: endpoint + 'intern/generate_facts',
                    save: endpoint + 'intern/save_facts',
                }
            }
        },
        bookmarks: {
            add: endpoint + 'opportunities/{{id}}/bookmarks',
            remove: endpoint + 'opportunities/{{id}}/bookmarks',
            follow: endpoint + 'companies/follow',
            unfollow: endpoint + 'companies/unfollow',
            fetchOpportunities: endpoint + 'bookmarks',
            fetchEmployers: endpoint + 'candidate/me/following',
        },
        applications: {
            apply: endpoint + 'opportunities/{{id}}/apply',
            fetch: endpoint + 'applications',
        },
        push: {
            register: endpoint + 'auth/registerdevice'
        }
    };
})();

/* ============================================
** Dom 7
============================================ */
var $ = Dom7;

/* ============================================
** Ajax Setup
============================================ */
$.ajaxSetup({
    timeout: 30 * 1000
});

/* ============================================
** Save Screen Size
============================================ */
ia.windowWidth = $(window).width();
ia.pixelRatio = app.device.pixelRatio;

/* ============================================
** iPad/Tablet
============================================ */
ia.tablet = false;
Template7.global = {};
if (app.device.ipad || (app.device.ios && screen.width >= 768) || screen.width >= 768) {
    $('html').addClass('tablet');
    // $('.tabbar').addClass('tabbar-labels');
    // $('.views').removeClass('toolbar-through').addClass('tabbar-labels-through');
    Template7.global.tablet = true;
    ia.tablet = true;
}

/* ============================================
** Templates
============================================ */
var templates = {
    searchOpportunitiesItem: Template7.compile($('#search-opportunities-item-template').html()),
    searchEmployersItem: Template7.compile($('#search-employers-item-template').html()),
    messagesList: Template7.compile($('#messages-list-template').html()),
    messagesDetails: Template7.compile($('#messages-details-template').html()),
    userProfile: Template7.compile($('#user-profile-template').html()),
    userProfileEdit: Template7.compile($('#user-profile-edit-template').html()),
    opportunityProfile: Template7.compile($('#opportunity-profile-template').html()),
    employerProfile: Template7.compile($('#employer-profile-template').html()),
    employerProfileFollowers: Template7.compile($('#employer-profile-followers-template').html()),
    bookmarksOpportunities: Template7.compile($('#bookmarks-opportunities-template').html()),
    bookmarksEmployers: Template7.compile($('#bookmarks-employers-template').html()),
    applicationsList: Template7.compile($('#applications-list-template').html()),
    popupApply: Template7.compile($('#popup-apply-template').html()),
};

/* ============================================
** Prevent Focuses
============================================ */
$(document).on('focus', 'input, select, textarea', function (e){
    var target = $(e.target);
    var form = target.parents('form');
    if (form.length === 0) return;
    var page = form.parents('.page').eq(0);
    if (page.length === 0) return;

    var otherForms = $('form').filter(function() {
        return $(this).parents(page[0]).length === 0;
    });
    
    otherForms.find('input, select, textarea').each(function(){
        if (this.disabled) this.originallyDisabled = true;
        else this.originallyDisabled = false;

        this.disabled = true;
    });
    
    target.once('blur', function () {
        otherForms.find('input, select, textarea').each(function () {
            if (!this.originallyDisabled) {
                this.disabled = false;
            }
        });
    });
}, true);