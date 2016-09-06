ia.errors = {
    defaults: {
        xhr: {
            title: 'Error occurred',
            message: 'Try again later'
        },
        network: {
            title: 'Network error',
            message: 'It appears you don\'t have an Internet connection right now'
        },
        login: {
            title: 'Sign in required',
            message: 'You must be logged in'
        },
        networkProfile: {
            title: 'Network error',
            message: 'It appears you don\'t have an Internet connection right now and you won\'t be able to save your profile details while you are offline'
        },
        saveProfile: {
            title: 'Error saving your data',
            message: 'Try again later'
        },
        messageInvalid: {
            title: 'Error occurred',
            message: 'Sorry, you must type a valid message'
        },
        messageShort: {
            title: 'Error occurred',
            message: 'Sorry, your message is too short'
        },
        
    },
    getXhrError: function (xhr, status) {
        var errorMessage;
        if (xhr && xhr.responseText) {
            var res = JSON.parse(xhr.responseText);
            if (res.error && typeof res.error === 'string') {
                res.errors = [{message: res.error}];
            }
            if (res.error && $.isArray(res.error) && !res.errors) {
                res.errors = res.error;
            }
            if (res.errors && $.isArray(res.errors) && res.errors.length > 0) {
                errorMessage = [];
                for (var i = 0; i < res.errors.length; i++) {
                    errorMessage.push(res.errors[i].message);
                }
                errorMessage = errorMessage.join('<br>');
            }
        }
        errorMessage = errorMessage || ia.errors.defaults.xhr.message;
        return errorMessage;
            
    },
    title: function (type, xhr) {
        return ia.errors.defaults[type].title;
    },
    message: function (type, xhr, status) {
        var errorMessage = ia.errors.defaults[type].message;
        if ((type === 'xhr' || type === 'saveProfile') && xhr && xhr.responseText) {
            errorMessage = ia.errors.getXhrError(xhr, status);
        }
        return errorMessage;
    },
    alert: function (type, xhr, status) {
        if ($('.modal.modal-in.' + type).length > 0) return;
        var modal = app.alert(ia.errors.message(type, xhr, status), ia.errors.title(type, xhr, status));
        $(modal).addClass(type || '');
        return modal;
    }
};