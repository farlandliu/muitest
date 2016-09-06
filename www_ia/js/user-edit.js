/* ============================================
** User Edit
============================================ */
ia.userEdit = {
    /*==============================================
    Update Active Tab Saved Instances
    ==============================================*/
    updateTabInstances: function (tabName) {
        var newInstancesHTML = $('<div>' + templates.userProfileEdit(ia.user.data) + '</div>')
            .find('.profile-edit-tab-' + tabName + ' .profile-block-added-instances')
            .html();
        $('.page[data-page="user-profile-edit"] .profile-edit-tab-' + tabName + ' .profile-block-added-instances').html(newInstancesHTML);
    },
    /*==============================================
    Update Tabs Links Percentage
    ==============================================*/
    updatePercentage: function () {
        $('.profile-tabs-links a').each(function () {
            var link = $(this);
            var section = link.attr('data-percentage');
            if (!section) return;
            if (ia.user.data.percent_complete_breakdown[section].awarded) {
                if (link.find('.badge').length > 0) link.find('.badge').remove();
            }
            else {
                if (link.find('.badge').length > 0) {
                    link.find('.badge').text('+' + ia.user.data.percent_complete_breakdown[section].worth + '%');
                }
                else {
                    link.find('span.text').append('<span class="badge">+' + ia.user.data.percent_complete_breakdown[section].worth + '%</span>');
                }
            }
            var percentage = ia.user.data.percent_complete_breakdown[section].awarded ? 0 : ia.user.data.percent_complete_breakdown[section].worth;

        });
    },
    /*==============================================
    Reset Form
    ==============================================*/
    resetForm: function (form) {
        if (!form) return;
        form = $(form);
        if (form.length === 0) return;
        form[0].reset();
        form.find('[data-initial]').each(function () {
            var input = $(this);
            var initial = input.attr('data-initial');
            var node = input[0].nodeName.toLowerCase();
            if (input.hasClass('item-after')) {
                input.text(initial);
                if (input.parents('[data-autocomplete]').length > 0) {
                    input.parents('[data-autocomplete]')[0].f7Autocomplete.value = [];
                }
            }
            else if (node === 'select') {
                for (var i = 0; i < input[0].options.length; i++) {
                    input[0].options[i].selected = input[0].options[i].value === initial ? true : false;
                }
            }
            else if (node === 'input' || node === 'textarea'){
                input.val(initial);
            }
        });
    },
    /*==============================================
    Get Form Field Name/Value
    ==============================================*/
    getFormField: function (input) {
        input = $(input);
        if (input.length === 0) return;
        var name = input.attr('name');
        var value = input.val();
        var field = {
            name: name,
            value: value
        };
        if (input.attr('type') === 'checkbox') {
            if (!input[0].checked) field.value = false;
            else field.value = true;
        }
        if (input[0].nodeName.toLowerCase() === 'select' && input.prop('multiple')) {
            value = [];
            input.find('option').each(function () {
                if (this.selected) value.push(this.value);
            });
            field.value = value;
        }
        return field;
    },
    pageInit: function (page) {
        var container = $(page.container);

        /*==============================================
        Init Tabs
        ==============================================*/
        function updateTabbarHighlight() {
            var highlight = $('.profile-edit-tabbar .tab-link-highlight');
            var activeLink = $('.profile-edit-tabbar .tab-link.active');
            highlight.css({width: activeLink[0].offsetWidth + 'px'});
            highlight.transform('translate3d(' + (activeLink[0].offsetLeft) + 'px,0,0)');
        }
        var activeTabTitle = $(container.find('.profile-edit-tabbar a.active span.text')[0].cloneNode(true));
        activeTabTitle.find('span').remove();
        activeTabTitle = activeTabTitle.text();
        ia.segment.screen('Edit Profile: ' + activeTabTitle);
        container.find('.profile-edit-tabbar a').on('click', function () {
            var link = $(this);
            var index = link.index();
            if (link.hasClass('active')) return;
            link.parent().find('.active').removeClass('active');
            link.addClass('active');
            link.parents('.page').find('.profile-tabs .tab.active').removeClass('active').trigger('hide');
            link.parents('.page').find('.profile-tabs .tab').eq(index).addClass('active').trigger('show');
            updateTabbarHighlight();

            activeTabTitle = $(container.find('.profile-edit-tabbar a.active span.text')[0].cloneNode(true));
            activeTabTitle.find('span').remove();
            activeTabTitle = activeTabTitle.text();
            ia.segment.screen('Edit Profile: ' + activeTabTitle);
        });
        updateTabbarHighlight();


        /*==============================================
        Init Autocompletes
        ==============================================*/
        function initAutocompletes() {
            container.find('[data-autocomplete]').each(function () {
                var item = $(this);
                if (item.data('autocomplete-initialized') || item.parents('.profile-block-instance-form-template').length > 0) return;
                item.data('autocomplete-initialized', true);
                var value = null;
                var input = item.find('input');
                var text = item.find('.item-after');
                var valueProperty = item.attr('data-autocomplete-value');
                var displayProperty = item.attr('data-autocomplete-display');
                var collection = item.attr('data-autocomplete-collection');

                if (input.val()) {
                    value = {};
                    value[valueProperty] = input.val();
                    value[displayProperty] = text.text();
                    input.parents('li').find('.item-inner').addClass('not-empty-state');
                }
                var timeout, xhr, online, results;

                var autocomplete = app.autocomplete({
                    opener: item,
                    value: value ? [value] : [],
                    preloader: true,
                    preloaderColor: 'white',
                    valueProperty: valueProperty,
                    displayProperty: displayProperty,
                    backOnSelect: true,
                    limit: 50,
                    source: function (a, query, renderItems) {
                        var res = [];
                        if (query.length === 0) {
                            renderItems(res);
                            return;
                        }
                        autocomplete.showPreloader();
                        function sendRequest() {
                            if (xhr) xhr.abort();
                            online = ia.app.isOnline();
                            xhr = $.ajax({
                                url: online ? ia.api.autocomplete : 'autocomplete/' + collection + '.json',
                                data: {
                                    collection: collection,
                                    text: query,
                                    limit: 50
                                },
                                valueProperty: valueProperty,
                                displayProperty: displayProperty,
                                success: function (data) {
                                    data = JSON.parse(data);
                                    results = data.results;
                                    if (!online) {
                                        results = [];
                                        for (var i = 0; i < data.results.length; i++) {
                                            if (data.results[i][displayProperty].toLowerCase().indexOf(query.toLowerCase()) === 0) {
                                                results.push(data.results[i]);
                                            }
                                        }
                                    }
                                    renderItems(results);
                                    autocomplete.hidePreloader();
                                },
                                error: function () {
                                    autocomplete.hidePreloader();
                                }
                            });
                        }
                        if (timeout) clearTimeout(timeout);
                        timeout = setTimeout(sendRequest, 300);
                    },
                    onChange: function (a, values) {
                        input.val(values[0][valueProperty]);
                        text.text(values[0][displayProperty]);
                        if (values[0][valueProperty]) {
                            input.parents('li').find('.item-inner').addClass('not-empty-state');
                        }
                        input.trigger('change');
                    }
                });
                item[0].f7Autocomplete = autocomplete;
            });
        }
        initAutocompletes();

        /*==============================================
        Toggle Forms
        ==============================================*/
        container.find('.profile-block-show-instance-form .button').on('click', function () {
            $(this).parents('.profile-block').hide().next('.profile-block').show();
        });
        container.find('.profile-block-add-instance-form-template .button').on('click', function () {
            var block = $(this).parents('.profile-block');
            var lastIndex = block.prev('.profile-block').attr('data-index');
            if (typeof lastIndex === 'undefined' || lastIndex === null) lastIndex = -1;
            var newIndex = parseInt(lastIndex, 0) + 1;
            var template = block.next('.profile-block-instance-form-template');
            var newBlock = $(template[0].cloneNode(true));
            newBlock
                .removeClass('profile-block-instance-form-template')
                .attr('data-index', newIndex)
                .insertBefore($(this).parents('.profile-block'));

            if (block.parents('.tab').attr('data-tab-name') === 'schools' && newIndex > 0) {
                var oldSchool = newBlock.prev().find('[name="school"]').val();
                var oldYear = newBlock.prev().find('[name="year"]').val();
                newBlock.find('[name="school"]').val(oldSchool);
                newBlock.find('[name="year"]').val(oldYear);
                if (oldSchool) {
                    newBlock.find('[name="school"]').parents('.item-inner').addClass('not-empty-state');
                }
                if (oldYear) {
                    newBlock.find('[name="year"]').parents('.item-inner').addClass('not-empty-state');
                }
            }
            if (block.parents('.tab').attr('data-tab-name') === 'links' && newBlock.parent().find('form').length > 5) {
                block.parents('.tab').find('.profile-block-add-instance-form-template').hide();
            }

            initAutocompletes();
        });

        /*==============================================
        Dependand Fields
        ==============================================*/
        container.find('[data-show-by]').each(function () {
            var item = $(this);
            var showBy = item.attr('data-show-by').split(':').map(function (el) {return el.split('=');});
            var form = item.parents('form');
            function checkToShow() {
                var show = true;
                for (var i = 0; i < showBy.length; i++) {
                    if (form.find('[name="' + showBy[i][0] + '"]').val() !== showBy[i][1]) show = false;
                }
                if (show) {
                    item.show();
                    item.find('input, select, textarea').each(function () {
                        if ($(this).attr('data-name')) $(this).attr('name', $(this).attr('data-name'));
                    });
                }
                else {
                    item.hide();
                    item.find('input, select, textarea').each(function () {
                        if ($(this).attr('name')) {
                            $(this).attr('data-name', $(this).attr('name'));    
                            $(this).attr('name', '');
                        }
                    });
                }
            }
            for (var i = 0; i < showBy.length; i++) {
                form.find('[name="' + showBy[i][0] + '"]').on('change', checkToShow);
            }
            checkToShow();
        });

        /*==============================================
        Personal Details + Statement + Diversity + Preferences
        ==============================================*/
        var rangeInputTimeout;
        container.find('.profile-edit-tab-personal form, .profile-edit-tab-statement form, .profile-edit-tab-diversity form, .profile-edit-tab-preferences form').on('change input', function (e) {
            var input = $(e.target);
            if (e.type === 'input' && input.attr('type') !== 'range') {
                return;
            }
            var field = ia.userEdit.getFormField(input);
            var dataToSend = {};
                dataToSend[field.name] = field.value;
            var endpointName = input.parents('.tab').attr('data-endpoint-name');
            var tabName = input.parents('.tab').attr('data-tab-name');
            if (input[0].nodeName.toLowerCase() === 'select' && input.parents('.smart-select').length > 0 && $('.smart-select-page.page-on-center').length > 0) {
                if ($('.smart-select-page')[0].iaEventAssigned) return;
                $('.smart-select-page')[0].iaEventAssigned = true;
                $('.smart-select-page').once('pageAfterBack', function () {
                    input.trigger('change');
                });
                return;
            }
            function sendField() {
                $.ajax({
                    url: ia.api.user.edit[endpointName],
                    method: 'PATCH',
                    data: JSON.stringify(dataToSend),
                    processData: false,
                    dataType: 'json',
                    success: function (data) {
                        // Update user data on field update
                        ia.user.update({
                            success: function () {
                                // Update percentage
                                ia.userEdit.updatePercentage();
                                ia.segment.track('Candidate Updated the Profile', 'Candidate');
                            }
                        });
                    },
                    error: function (xhr, status) {
                        // Notify about error
                        var errorMessage = ia.errors.getXhrError(xhr);
                        ia.errors.alert('saveProfile', xhr, status);
                        
                        // Return value
                        if (input.attr('type') === 'checkbox') {
                            // Checkbox
                            if (parseInt(ia.user.data[field.name], 10) === parseInt(input.attr('val'), 10)) {
                                input.prop('checked', true);
                            }
                            else {
                                input.prop('checked', false);
                            }
                        }
                        else if (input[0].nodeName.toLowerCase() === 'select') {
                            // Select
                            if (input.prop('multiple')) {
                                if (input.attr('name') === 'locations') {
                                    input.find('option').each(function () {
                                        var value = this.value;
                                        var selected = false;
                                        for (var i = 0; i < ia.user.data.user_meta_location.length; i++) {
                                            if (ia.user.data.user_meta_location[i].location_id === value) selected = true;
                                        }
                                        this.selected = selected;
                                    });
                                }
                                if (input.attr('name') === 'sectors') {
                                    input.find('option').each(function () {
                                        var value = this.value;
                                        var selected = false;
                                        for (var i = 0; i < ia.user.data.user_meta_sector.length; i++) {
                                            if (ia.user.data.user_meta_sector[i].sector_id === value) selected = true;
                                        }
                                        this.selected = selected;
                                    });
                                }
                            }
                            else {
                                input.val(ia.user.data[field.name]);
                            }
                            if (input.parents('.smart-select').length > 0) {
                                app.initSmartSelects(input.parents('.smart-select'));
                            }
                        }
                        else if (input.attr('type') === 'range') {
                            // Range Salary
                            var textValue = ia.user.data[field.name];
                            if (input.attr('data-format') === 'money') {
                                textValue = parseFloat(ia.user.data.pay_expectation_hourly);
                                if (textValue === parseInt(textValue, 10)) textValue += '.00';
                                else textValue += '0';
                            }
                            input.parents('li').prev('li').find('.range-picker-value').text(textValue);
                            input.val(ia.user.data[field.name]);
                        }
                        else {
                            if (input.attr('name') === 'telephone') return;
                            input.val(ia.user.data[field.name]);
                            if (ia.user.data[field.name]) {
                                input.parents('.item-inner').addClass('not-empty-state');
                            }
                        }
                    }
                });
            }
            if (input.attr('type') === 'range') {
                if (e.type === 'change') return;
                if (rangeInputTimeout) clearTimeout(rangeInputTimeout);
                rangeInputTimeout = setTimeout(sendField, 300);
            }
            else {
                sendField();
            }
        });
        
        /*==============================================
        Universities + Work + Awards + Teams & Societies
        ==============================================*/
        // Add/Save
        container.find('.profile-edit-tab-universities form, .profile-edit-tab-work form, .profile-edit-tab-societies form, .profile-edit-tab-awards form').on('submit', function (e) {
            e.preventDefault();
            var form = $(this);
            var dataToSend = app.formToJSON(form);
            var endpointName = form.parents('.tab').attr('data-endpoint-name');
            var tabName = form.parents('.tab').attr('data-tab-name');
            var button = form.find('input.button');
            button.parent().addClass('loading-state').append('<span class="preloader preloader-white">'+app.params.materialPreloaderHtml+'</span>');
            $.ajax({
                url: ia.api.user.edit[endpointName],
                method: 'POST',
                data: JSON.stringify(dataToSend),
                processData: false,
                dataType: 'json',
                success: function (data) {
                    ia.user.update({
                        success: function () {
                            button.parent().removeClass('loading-state').find('.preloader').remove();
                            ia.userEdit.updateTabInstances(tabName);
                            ia.userEdit.updatePercentage();
                            ia.userEdit.resetForm(form);
                            form.hide().prev('.profile-block-show-instance-form').show();
                            ia.segment.track('Candidate Updated the Profile', 'Candidate');
                        },
                        error: function () {
                            button.parent().removeClass('loading-state').find('.preloader').remove();
                        }
                    });
                },
                error: function (xhr, status) {
                    button.parent().removeClass('loading-state').find('.preloader').remove();
                    var errorMessage = ia.errors.getXhrError(xhr);
                    ia.errors.alert('saveProfile', xhr, status);
                }
            });
        });
        // Delete
        container.on('click', '.profile-edit-tab-universities .list-delete-instance, .profile-edit-tab-work .list-delete-instance, .profile-edit-tab-societies .list-delete-instance, .profile-edit-tab-awards .list-delete-instance', function () {
            var button = $(this);
            var item = button.parents('li');
            var id = item.attr('data-id');
            var needsUpdate = item.parents('ul').find('li').length === 1;
            var endpointName = button.parents('.tab').attr('data-endpoint-name');
            var tabName = button.parents('.tab').attr('data-tab-name');
            app.confirm(button.attr('data-confirm-text'), button.attr('data-confirm-title'), function () {
                button.addClass('loading-state').append('<span class="preloader">'+app.params.materialPreloaderHtml+'</span>');
                $.ajax({
                    url: ia.api.user.edit[endpointName] + '/' + id,
                    method: 'DELETE',
                    dataType: 'json',
                    success: function (data) {
                        ia.user.update({
                            success: function () {
                                button.removeClass('loading-state').find('.preloader').remove();
                                if (!needsUpdate) {
                                    item.remove();
                                }
                                else {
                                    ia.userEdit.updateTabInstances(tabName);
                                }
                                ia.userEdit.updatePercentage();
                                ia.segment.track('Candidate Updated the Profile', 'Candidate');
                            },
                            error: function () {
                                button.removeClass('loading-state').find('.preloader').remove();
                            }
                        });
                    },
                    error: function (xhr, status) {
                        button.removeClass('loading-state').find('.preloader').remove();
                        ia.errors.alert('xhr', xhr, status);
                    }
                });
            }, function () {
                app.swipeoutClose(item);
            });
        });
        /*==============================================
        Availability
        ==============================================*/
        // Add/Save
        container.find('.profile-edit-tab-availability').on('change', 'form', function (e) {
            e.preventDefault();
            var target = $(this);
            var tab = target.parents('.tab').eq(0);
            var endpointName = tab.attr('data-endpoint-name');
            var tabName = tab.attr('data-tab-name');
            var button = tab.find('input.button');
            var dataToSend = {
                available_status: tab.find('input[name="available_status"]:checked').val()
            };
            if (dataToSend.available_status === '1') {
                dataToSend.ranges = [];
                tab.find('.profile-block-availability-range:not(.profile-block-instance-form-template)').each(function () {
                    var from = $(this).find('input[name="from"]').val();
                    var to = $(this).find('input[name="to"]').val();
                    if (from && to) {
                        dataToSend.ranges.push({
                            from: from,
                            to: to,
                        });
                    }
                });
                tab.find('.profile-block-add-instance-form-template').show();
                tab.find('.profile-block-availability-range:not(.profile-block-instance-form-template)').show();
                if (dataToSend.ranges.length === 0) return;
            }
            else {
                tab.find('.profile-block-availability-range:not(.profile-block-instance-form-template)').hide();
                tab.find('.profile-block-add-instance-form-template').hide();
            }
            $.ajax({
                url: ia.api.user.edit[endpointName],
                method: 'PATCH',
                data: JSON.stringify(dataToSend),
                processData: false,
                dataType: 'json',
                success: function (data) {
                    ia.user.update({
                        success: function () {
                            ia.userEdit.updatePercentage();
                            ia.segment.track('Candidate Updated the Profile', 'Candidate');
                        }
                    });
                },
                error: function (xhr, status) {
                    var errorMessage = ia.errors.getXhrError(xhr);
                    ia.errors.alert('saveProfile', xhr, status);
                }
            });
        });
        container.find('.profile-edit-tab-availability').on('click', '.delete-instance', function (e) {
            var from = $(this).parents('form').find('[name="from"]').val();
            var to = $(this).parents('form').find('[name="to"]').val();
            if (from && to) {
                $(this).parents('.tab').eq(0).find('form').eq(0).trigger('change');
            }
            $(this).parents('form').eq(0).remove();
        });
        /*==============================================
        School Subjects + Langugages + Skills + Links
        ==============================================*/
        // Add/Edit
        container.find('.profile-edit-tab-schools, .profile-edit-tab-languages, .profile-edit-tab-skills, .profile-edit-tab-links').on('change', 'input, select', function (e) {
            var input = $(this);
            var form = input.parents('form.profile-block');
            var id = form.attr('data-id');
            var index = form.attr('data-index');
            var endpointName = form.parents('.tab').attr('data-endpoint-name');
            var tabName = form.parents('.tab').attr('data-tab-name');
            var toAdd = !id;
            var dataToSend = {};
                dataToSend[input.attr('name')] = input.val();
            if (toAdd) {
                // Add
                var allowAdd = true;
                input.parents('.profile-block').find('.required').each(function () {
                    if (!$(this).val()) allowAdd = false;
                });
                if (!allowAdd) return;

                dataToSend = app.formToJSON(form);
                $.ajax({
                    method: 'POST',
                    url: ia.api.user.edit[endpointName],
                    dataType: 'json',
                    processData: false,
                    data: JSON.stringify(dataToSend),
                    success: function (data) {
                        form.attr('data-id', data.id);
                        // Update user data on field update
                        ia.user.update({
                            success: function () {
                                // Update percentage
                                ia.userEdit.updatePercentage();
                                ia.segment.track('Candidate Updated the Profile', 'Candidate');
                            }
                        });
                    },
                    error: function (xhr, error) {
                        // Notify about error
                        var errorMessage = ia.errors.getXhrError(xhr);
                        ia.errors.alert('saveProfile', xhr, status);
                    }
                });
            }
            else {
                // Update/Edit
                $.ajax({
                    method: 'PATCH',
                    url: ia.api.user.edit[endpointName] + '/' + id,
                    dataType: 'json',
                    processData: false,
                    data: JSON.stringify(dataToSend),
                    success: function (data) {
                        // Update user data on field update
                        ia.user.update({
                            success: function () {
                                // Update percentage
                                ia.userEdit.updatePercentage();
                                ia.segment.track('Candidate Updated the Profile', 'Candidate');
                            }
                        });
                    },
                    error: function (xhr, error) {
                        // Notify about error
                        var errorMessage = ia.errors.getXhrError(xhr);
                        ia.errors.alert('saveProfile', xhr, status);
                        var i, j, oldObj;
                        // Return value
                        if (tabName === 'schools') {
                            for (i = 0; i < ia.user.data.user_meta_school.length; i++) {
                                if (ia.user.data.user_meta_school[i].id === id) {
                                    oldObj = ia.user.data.user_meta_school[i];
                                }
                            }
                            if (oldObj) {
                                if (input.attr('name') === 'subject_id') {
                                    input.val(oldObj[input.attr('name')]);
                                    input.parents('li').find('.item-after').text(oldObj.subject_name);
                                    input.parents('li').find('[data-autocomplete]')[0].f7Autocomplete.value = [];
                                }
                                else {
                                    input.val(oldObj[input.attr('name')]);    
                                    if (oldObj[input.attr('name')]) input.parents('.item-inner').addClass('not-empty-state');
                                }
                            }
                        }
                        if (tabName === 'languages') {
                            for (i = 0; i < ia.user.data.user_meta_language.length; i++) {
                                if (ia.user.data.user_meta_language[i].id === id) {
                                    oldObj = ia.user.data.user_meta_language[i];
                                    for (j = 0; j < ia.user.data.languages.length; j++) {
                                        if (ia.user.data.languages[j].lang.id === oldObj.id) {
                                            oldObj = ia.user.data.languages[j];
                                        }
                                    }
                                }
                            }
                            if (oldObj) {
                                if (input.attr('name') === 'language_id') {
                                    input.val(oldObj.lang.id);
                                    input.parents('li').find('.item-after').text(oldObj.lang.name);
                                    input.parents('li').find('[data-autocomplete]')[0].f7Autocomplete.value = [];
                                }
                                else if(input.attr('name') === 'proficiency_s') {
                                    input.val(oldObj.prof_s.id);
                                }
                                else if(input.attr('name') === 'proficiency_w') {
                                    input.val(oldObj.prof_w.id);
                                }
                            }
                                
                        }
                        if (tabName === 'skills') {
                            for (i = 0; i < ia.user.data.skill[form.attr('data-type')].length; i++) {
                                if (ia.user.data.skill[form.attr('data-type')][i].id === id) {
                                    oldObj = ia.user.data.user_meta_link[i];
                                }
                            }
                            if (oldObj) {
                                if (input.attr('name') === 'skill_id') {
                                    input.val(oldObj.skill_id);
                                    input.parents('li').find('.item-after').text(oldObj.skill_name);
                                    input.parents('li').find('[data-autocomplete]')[0].f7Autocomplete.value = [];
                                }
                                else {
                                    input.val(oldObj[input.attr('name')]);
                                }
                            }
                        }
                        if (tabName === 'links') {
                            for (i = 0; i < ia.user.data.user_meta_link.length; i++) {
                                if (ia.user.data.user_meta_link[i].id === id) {
                                    oldObj = ia.user.data.user_meta_link[i];
                                }
                            }
                            if (oldObj) {
                                input.val(oldObj[input.attr('name')]);
                                if (oldObj[input.attr('name')]) input.parents('.item-inner').addClass('not-empty-state');
                            }
                        }
                    }
                });
            }
        });
        // Delete
        container.on('click', '.profile-edit-tab-schools .delete-instance, .profile-edit-tab-languages .delete-instance, .profile-edit-tab-skills .delete-instance, .profile-edit-tab-links .delete-instance', function () {
            var button = $(this);
            var item = button.parents('.profile-block');
            var id = item.attr('data-id');
            var endpointName = button.parents('.tab').attr('data-endpoint-name');
            var tabName = button.parents('.tab').attr('data-tab-name');
            if (!id) {
                if (tabName === 'links') {
                    item.parents('.tab').eq(0).find('.profile-block-add-instance-form-template').show();
                }
                item.remove();
                return;
            }
            app.confirm(button.attr('data-confirm-text'), button.attr('data-confirm-title'), function () {
                button.addClass('loading-state').append('<span class="preloader">' + app.params.materialPreloaderHtml + '</span>');
                $.ajax({
                    url: ia.api.user.edit[endpointName] + '/' + id,
                    method: 'DELETE',
                    dataType: 'json',
                    success: function (data) {
                        ia.user.update({
                            success: function () {
                                button.removeClass('loading-state').find('.preloader').remove();
                                if (tabName === 'links') {
                                    item.parents('.tab').find('.profile-block-add-instance-form-template').show();
                                }
                                item.remove();
                                ia.userEdit.updatePercentage();
                                ia.segment.track('Candidate Updated the Profile', 'Candidate');
                            },
                            error: function () {
                                button.removeClass('loading-state').find('.preloader').remove();
                                item.remove();
                            }
                        });
                    },
                    error: function (xhr, status) {
                        button.removeClass('loading-state').find('.preloader').remove();
                        if (tabName === 'links') {
                            item.parents('.tab').find('.profile-block-add-instance-form-template').show();
                        }
                        ia.errors.alert('xhr', xhr, status);
                    }
                });
            });
        });
        /*==============================================
        Profile Image
        ==============================================*/
        // Upload
        container.find('.profile-edit-tab-image').on('change', 'form', function (e) {
            var form = $(this);
            var button = form.find('.button-upload');
            var endpointName = button.parents('.tab').attr('data-endpoint-name');
            var tabName = button.parents('.tab').attr('data-tab-name');

            button.addClass('loading-state').append('<span class="preloader preloader-white">' + app.params.materialPreloaderHtml + '</span>');
            $.ajax({
                url: ia.api.user.edit[endpointName],
                method: 'POST',
                dataType: 'json',
                data: new FormData(form[0]),
                processData: false,
                contentType: 'multipart/form-data', 
                success: function (data) {
                    ia.user.update({
                        success: function () {
                            form[0].reset();
                            button.removeClass('loading-state').find('.preloader').remove();
                            ia.userEdit.updateTabInstances(tabName);
                            ia.userEdit.updatePercentage();

                            // Prompt for Rate
                            ia.rate.prompt();

                            ia.segment.track('Candidate Updated the Profile', 'Candidate');
                        },
                        error: function () {
                            form[0].reset();
                            button.removeClass('loading-state').find('.preloader').remove();
                        }
                    });
                },
                error: function (xhr, status) {
                    form[0].reset();
                    button.removeClass('loading-state').find('.preloader').remove();
                    ia.errors.alert('xhr', xhr, status);
                }
            });
        });
        container.find('.profile-edit-tab-image').on('click', '.delete-instance, .button-delete', function (e) {
            var button = $(this);
            var endpointName = button.parents('.tab').attr('data-endpoint-name');
            var tabName = button.parents('.tab').attr('data-tab-name');
            var form = $(this).parents('.tab').eq(0).find('form');

            app.confirm(button.attr('data-confirm-text'), button.attr('data-confirm-title'), function () {
                button.addClass('loading-state').append('<span class="preloader">' + app.params.materialPreloaderHtml + '</span>');
                $.ajax({
                    url: ia.api.user.edit[endpointName],
                    method: 'DELETE',
                    dataType: 'json',
                    success: function (data) {
                        ia.user.update({
                            success: function () {
                                form[0].reset();
                                button.removeClass('loading-state').find('.preloader').remove();
                                ia.userEdit.updateTabInstances(tabName);
                                ia.userEdit.updatePercentage();
                                ia.segment.track('Candidate Updated the Profile', 'Candidate');
                            },
                            error: function () {
                                form[0].reset();
                                button.removeClass('loading-state').find('.preloader').remove();
                            }
                        });
                    },
                    error: function (xhr, status) {
                        form[0].reset();
                        button.removeClass('loading-state').find('.preloader').remove();
                        ia.errors.alert('xhr', xhr, status);
                    }
                });
            });
        });
        container.find('.profile-edit-tab-image').on('load error', function (e) {
            $(e.target).parent().addClass('profile-img-wrap-loaded');
        }, true);
        /*==============================================
        Matching Preferences
        ==============================================*/
        // Wage Slider
        container.find('.profile-edit-tab-preferences input[type="range"]').on('change input', function () {
            var self = $(this);
            var textPlace = $(this).parents('li').prev('li').find('.range-picker-value span');
            if (textPlace.length === 0) return;
            var value = $(this).val();
            if (self.attr('data-format') === 'money') {
                value = parseFloat(value);
                if (value === parseInt(value, 10)) value += '.00';
                else value += '0';
            }
            textPlace.text(value);
        });

        /*==============================================
        Profile Facts
        ==============================================*/
        container.find('.profile-edit-tab-facts .button.generate-facts').on('click', function () {
            var button = $(this);
            button.addClass('loading-state').append('<span class="preloader preloader-white">' + app.params.materialPreloaderHtml + '</span>');
            $.ajax({
                url: ia.api.user.edit.facts.fetch,
                dataType: 'json',
                method: 'GET',
                success: function (data) {
                    button.removeClass('loading-state').find('.preloader').remove();
                    var factsHTML = '';
                    for (var i = 0; i < data.facts.length; i++) {
                        var fact = data.facts[i];
                        fact.text = fact.text.replace('{{MASK}}', '').replace('{{/MASK}}', '');
                        factsHTML += 
                        '<li>' +
                          '<label class="label-checkbox item-content"><input type="checkbox" name="fact" data-type-id="' + fact.type.id + '" value="' + fact.value + '">' +
                            '<div class="item-media"><i class="icon icon-form-checkbox"></i></div>' +
                            '<div class="item-inner">' +
                              '<div class="item-title">' + fact.text + '</div>' +
                            '</div>' +
                          '</label>' +
                        '</li>';
                    }
                    container.find('.profile-generate-facts').hide();
                    container.find('.profile-choose-facts').show();
                    container.find('.profile-choose-facts ul').html(factsHTML);

                },
                error: function (xhr, status) {
                    button.removeClass('loading-state').find('.preloader').remove();
                    ia.errors.alert('xhr', xhr, status);
                }
            });
        });
        container.find('.profile-choose-facts').on('change', function (e) {
            var checkbox = $(e.target);
            if (checkbox.parents('ul').find('.profile-fact-selected').length >= 4) {
                checkbox.prop('checked', false);
            }

            if (checkbox[0].checked) {
                checkbox.parents('li').addClass('profile-fact-selected');
            }
            else {
                checkbox.parents('li').removeClass('profile-fact-selected');   
            }

            if (checkbox.parents('ul').find('.profile-fact-selected').length >= 4) {
                checkbox.parents('ul').addClass('profile-facts-selected');
            }
            else {
                checkbox.parents('ul').removeClass('profile-facts-selected');
            }
        });
        container.find('.profile-edit-tab-facts .button.save-facts').on('click', function () {
            var button = $(this);
            var tabName = button.parents('.tab').attr('data-tab-name');
            button.addClass('loading-state').append('<span class="preloader preloader-white">' + app.params.materialPreloaderHtml + '</span>');
            var _data = [];
            container.find('.profile-choose-facts input:checked').each(function(){
                _data.push({
                    type_id: $(this).attr('data-type-id'),
                    value: $(this).val(),
                });
            });
            $.ajax({
                url: ia.api.user.edit.facts.save,
                dataType: 'json',
                method: 'POST',
                data: {facts:_data},
                success: function (data) {
                    function onComplete() {
                        container.find('.profile-generate-facts').show();
                        container.find('.profile-choose-facts').hide();
                        container.find('.profile-choose-facts ul').html('');
                    } 
                    ia.user.update({
                        success: function () {
                            onComplete();
                            button.removeClass('loading-state').find('.preloader').remove();
                            ia.userEdit.updateTabInstances(tabName);
                            ia.segment.track('Candidate Updated the Profile', 'Candidate');
                        },
                        error: function () {
                            onComplete();
                            button.removeClass('loading-state').find('.preloader').remove();
                        }
                    });
                },
                error: function (xhr, status) {
                    button.removeClass('loading-state').find('.preloader').remove();
                    var errorMessage = ia.errors.getXhrError(xhr);
                    ia.errors.alert('saveProfile', xhr, status);
                }
            });
        });
    },
    init: function () {
        app.onPageInit('user-profile-edit', ia.userEdit.pageInit);
    }
};
        