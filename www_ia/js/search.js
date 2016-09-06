/* ============================================
** Search
============================================ */
ia.search = {
    perPage: 50,

    opportunitiesPage: 0,
    opportunitiesLoadedResults: 0,
    opportunitiesFeaturedLoaded: false,

    employersPage: 0,
    employersLoadedResults: 0,
    employersFeaturedLoaded: false,

    searchFor: 'opportunities',

    xhr: undefined,
    timeout: undefined,

    allowInfiniteOpportunities: false,
    allowInfiniteEmployers: false,

    navbarRight: function () {
        return '<a href="#" data-panel="right" class="link icon-only open-panel"><i class="icon material-icons">search</i></a>';
    },

    // Params
    getParams: function () {
        var p = {}, form;
        if (ia.search.searchFor === 'opportunities') {
            form = $('.form-filter-opportunities');

            // Types
            p.types = [];
            form.find('select[name="types"] option').each(function () {
                if (this.selected) p.types.push(this.value);
            });

            // Locations
            p.locations = [];
            form.find('select[name="locations"] option').each(function () {
                if (this.selected) p.locations.push(this.value);
            });

            // Employers
            p.employers = [];
            form.find('select[name="employers"] option').each(function () {
                if (this.selected) p.employers.push(this.value);
            });

            // Renumeration
            p.remuneration = form.find('input[name="remuneration"]').val() + ':3000';

            // Duration
            p.duration = form.find('input[name="duration"]').val() + ':24';

            // Checks
            p.status = (form.find('input[name="status"]:checked').length > 0).toString();
            p.potentially_permanent = (form.find('input[name="is_potentially_permanent"]:checked').length > 0).toString();
            p.graduateOnly = (form.find('input[name="graduateOnly"]:checked').length > 0).toString();
        }
        else {
            form = $('.form-filter-employers');

            // Locations
            p.locations = [];
            form.find('select[name="locations"] option').each(function () {
                if (this.selected) p.locations.push(this.value);
            });

            // Employers
            p.employers = [];
            form.find('select[name="employers"] option').each(function () {
                if (this.selected) p.employers.push(this.value);
            });

            // Types
            p.sectors = [];
            form.find('select[name="sectors"] option').each(function () {
                if (this.selected) p.sectors.push(this.value);
            });
        }
        return p;
    },
    search: function (reset, ptr) {
        // Disable Infinite
        if (ia.search.searchFor === 'opportunities') {
            ia.search.allowInfiniteOpportunities = false;
        }
        else {
            ia.search.allowInfiniteEmployers = false;
        }
        // Check For Online
        if (ptr && !ia.app.isOnline()) {
            if (ptr) {
                if (ia.search.searchFor === 'opportunities') {
                    app.pullToRefreshDone('#tab-search #tab-search-opportunities');
                }
                else {
                    app.pullToRefreshDone('#tab-search #tab-search-employers');
                }
            }
            ia.errors.alert('network');
            return;
        }
        // Reset Results
        function resetResults() {
            if (ia.search.searchFor === 'opportunities') {
                ia.search.opportunitiesPage = 0;
                ia.search.opportunitiesLoadedResults = 0;
                ia.search.opportunitiesFeaturedLoaded = false;
                if (!ptr) {
                    $('#tab-search-opportunities .list-block.search-results .preloader').show();
                    $('#tab-search-opportunities .list-block.search-results ul').html('');
                    $('#tab-search-opportunities .list-block.no-results').hide();
                }

            }
            else {
                ia.search.employersPage = 0;
                ia.search.employersLoadedResults = 0;
                ia.search.employersFeaturedLoaded = false;
                if (!ptr) {
                    $('#tab-search-employers .list-block.search-results .preloader').show();
                    $('#tab-search-employers .list-block.search-results ul').html('');
                    $('#tab-search-employers .list-block.no-results').hide();
                }
            }
        }
        // Do Reset
        if (reset) {
            resetResults();
        }

        // Handle Error
        function onError(xhr, status) {
            if (ia.search.searchFor === 'opportunities') {
                app.pullToRefreshDone('#tab-search #tab-search-opportunities');
                ia.search.allowInfiniteOpportunities = true;
            }
            else {
                app.pullToRefreshDone('#tab-search #tab-search-employers');
                ia.search.allowInfiniteEmployers = true;
            }
            if (status) {
                if (status === 'timeout') {
                    return;
                }
                ia.errors.alert('xhr', xhr, status);
            }
            else {
                ia.errors.alert('network');
            }
        }

        // Handle Opportunities Results
        function onSuccessOpportunities(data) {
            data = JSON.parse(data);
            ia.search.opportunitiesLoadedResults += data.internships.results.length;
            var html = '', i;
            if (!ia.search.opportunitiesFeaturedLoaded) {
                for (i = 0; i < data.featuredInternships.results.length; i++) {
                    data.featuredInternships.results[i].is_featured = true;
                    html += templates.searchOpportunitiesItem(data.featuredInternships.results[i]);
                }
                ia.search.opportunitiesFeaturedLoaded = true;
            }

            for (i = 0; i < data.internships.results.length; i++) {
                html += templates.searchOpportunitiesItem( data.internships.results[i] );
            }

            if (data.internships.results.length === 0 && ia.search.opportunitiesPage === 0) {
                $('#tab-search-opportunities .list-block.no-results').show();
                $('#tab-search-opportunities .list-block.search-results .preloader').hide();
                return;
            }
            else {
                $('#tab-search-opportunities .list-block.no-results').hide();
            }

            if (ia.search.opportunitiesPage === 0) {
                $('#tab-search-opportunities .list-block.search-results ul').html(html);
            }
            else {
                $('#tab-search-opportunities .list-block.search-results ul').append(html);
            }

            if (data.internships.results.length >= data.internships.totalResults || data.internships.results.length === 0 || ia.search.opportunitiesLoadedResults >= data.internships.totalResults || data.internships.results.length < ia.search.perPage) {
                $('#tab-search-opportunities .list-block .preloader').hide();
                ia.search.allowInfiniteOpportunities = false;
            }
            else {
                $('#tab-search-opportunities .list-block .preloader').show();
                ia.search.allowInfiniteOpportunities = true;
            }

            ia.search.opportunitiesPage++;
        }

        function onSuccessEmployers(data) {
            data = JSON.parse(data);
            ia.search.employersLoadedResults += data.companies.results.length;
            var html = '', i;
            if (!ia.search.employersFeaturedLoaded) {
                for (i = 0; i < data.featuredEmployers.results.length; i++) {
                    data.featuredEmployers.results[i].is_featured = true;
                    html += templates.searchEmployersItem(data.featuredEmployers.results[i]);
                }
                ia.search.employersFeaturedLoaded = true;
            }

            for (i = 0; i < data.companies.results.length; i++) {
                html += templates.searchEmployersItem( data.companies.results[i] );
            }

            if (data.companies.results.length === 0 && ia.search.employersPage === 0) {
                $('#tab-search-employers .list-block.no-results').show();
                $('#tab-search-employers .list-block.search-results .preloader').hide();
                return;
            }
            else {
                $('#tab-search-employers .list-block.no-results').hide();
            }

            if (ia.search.employersPage === 0) {
                $('#tab-search-employers .list-block.search-results ul').html(html);
            }
            else {
                $('#tab-search-employers .list-block.search-results ul').append(html);
            }

            if (data.companies.results.length === 0 || data.companies.results.length < ia.search.perPage && ia.search.employersPage === 0) {
                $('#tab-search-employers .list-block .preloader').hide();
                ia.search.allowInfiniteEmployers = false;
            }
            else {
                $('#tab-search-employers .list-block .preloader').show();
                ia.search.allowInfiniteEmployers = true;
            }
            ia.search.employersPage++;
        }

        // Reset XHR
        if (ia.search.xhr) {
            ia.search.xhr.abort();
            ia.search.xhr = undefined;
        }

        if (ia.search.searchFor === 'opportunities') {
            ia.search.xhr = $.ajax({
                url: ia.api.search.opportunities,
                method: 'GET',
                data: {
                    page: ia.search.opportunitiesPage,
                    per_page: ia.search.perPage,
                    params: ia.search.getParams()
                },
                success: function (data, status, xhr) {
                    app.pullToRefreshDone('#tab-search #tab-search-opportunities');
                    if (status >= 200 && status < 299) {
                        onSuccessOpportunities(data);
                    }
                    else {
                        onError(xhr, status);
                    }
                },
                error: function (xhr, status) {
                    // Error
                    app.pullToRefreshDone('#tab-search #tab-search-opportunities');
                    onError(xhr, status);
                }
            });
        }
        else {
            ia.search.xhr = $.ajax({
                url: ia.api.search.employers,
                method: 'GET',
                data: {
                    page: ia.search.employersPage,
                    per_page: ia.search.perPage,
                    params: ia.search.getParams()
                },
                success: function (data, status, xhr) {
                    app.pullToRefreshDone('#tab-search #tab-search-employers');
                    if (status >= 200 && status < 299) {
                        onSuccessEmployers(data);
                    }
                    else {
                        onError(xhr, status);
                    }
                },
                error: function (xhr, status) {
                    // Error
                    app.pullToRefreshDone('#tab-search #tab-search-employers');
                    onError(xhr, status);
                }
            });
        }

        return;
    },
    init: function () {
        // Remove Inputs List
        $('.search-filter').find('.inputs-list').removeClass('inputs-list');

        // PTR
        $('#tab-search-opportunities').on('refresh', function (){
            ia.search.search(true, true);
        });
        $('#tab-search-employers').on('refresh', function (){
            ia.search.search(true, true);
        });

        // Infinite Scroll
        $('#tab-search-opportunities').on('infinite', function (){
            if (ia.search.allowInfiniteOpportunities) {
                ia.search.search();
            }
        });
        $('#tab-search-employers').on('infinite', function (){
            if (ia.search.allowInfiniteEmployers) {
                ia.search.search();
            }
        });

        // Switch Search Tabs
        $('#tab-search #tab-search-opportunities').on('show', function () {
            $('#tab-search .opportunities-view-title').text('Opportunities');
            $('.tab#tab-filter-opportunities').addClass('active');
            $('.tab#tab-filter-employers').removeClass('active');
            app.sizeNavbars('#tab-search');
            app.pullToRefreshDone('#tab-search #tab-search-employers');
            ia.search.searchFor = 'opportunities';
        });
        $('#tab-search #tab-search-employers').on('show', function () {
            $('#tab-search .opportunities-view-title').text('Employers');
            $('.tab#tab-filter-employers').addClass('active');
            $('.tab#tab-filter-opportunities').removeClass('active');
            app.sizeNavbars('#tab-search');
            app.pullToRefreshDone('#tab-search #tab-search-opportunities');
            ia.search.searchFor = 'employers';

        });

        // Search Employers
        $('#tab-search #tab-search-employers').once('show', function () {
            ia.search.search();
        });

        // Autocomplete
        $('.search-filter').find('[data-autocomplete]').each(function () {
            var item = $(this);
            if (item.data('autocomplete-initialized')) return;
            item.data('autocomplete-initialized', true);

            var select = item.find('select');
            var isLocations = select.attr('name') === 'locations';
            var text = item.find('.item-after');
            var valueProperty = item.attr('data-autocomplete-value');
            var displayProperty = item.attr('data-autocomplete-display');
            var collection = item.attr('data-autocomplete-collection');

            var timeout, xhr, online, results;

            var autocomplete = app.autocomplete({
                opener: item,
                multiple: true,
                preloader: true,
                preloaderColor: 'white',
                valueProperty: valueProperty,
                displayProperty: displayProperty,
                limit: 50,
                source: function (a, query, renderItems) {
                    var res = [];
                    var page = $('.search-filter .autocomplete-page');
                    if (query.length === 0) {
                        renderItems(res);
                        if (!isLocations) return;
                        if (page.find('.autocomplete-values li').length > 0) {
                            page.find('.autocomplete-suggestions').hide();
                        }
                        else {
                            page.find('.autocomplete-suggestions').show();
                        }
                        return;
                    }
                    if (isLocations) page.find('.autocomplete-suggestions').hide();
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
                            error: function (data) {
                                autocomplete.hidePreloader();
                            }
                        });
                    }
                    if (timeout) clearTimeout(timeout);
                    timeout = setTimeout(sendRequest, 300);

                },
                onChange: function (a, values) {
                    var optionsHTML = '', valuesText = [];
                    for (var i = 0; i < values.length; i++) {
                        optionsHTML += '<option selected value="' + values[i][valueProperty] + '">' + values[i][displayProperty] + '</option>';
                        valuesText.push(values[i][displayProperty]);
                    }
                    select.html(optionsHTML);
                    text.text(valuesText.join(', '));
                    select.trigger('change');
                    if (isLocations) {
                        var page = $('.search-filter .autocomplete-page');
                        if (page.find('.autocomplete-values li').length > 0) {
                            page.find('.autocomplete-suggestions').hide();
                        }
                        else {
                            page.find('.autocomplete-suggestions').show();
                        }
                    }
                },
                onOpen: function (a) {
                    if (!isLocations) return;
                    var page = $('.search-filter .autocomplete-page');
                    page.find('.page-content').append(
                        '<div class="autocomplete-suggestions">' +
                          '<div class="content-block-title">Most Popular Locations</div>' +
                          '<div class="list-block">' +
                            '<ul>' +
                              '<li>' +
                                '<a href="" class="item-content item-link">' +
                                  '<div class="item-inner">' +
                                    '<div class="item-title">London</div>' +
                                  '</div>' +
                                '</a>' +
                              '</li>' +
                              '<li>' +
                                '<a href="" class="item-content item-link">' +
                                  '<div class="item-inner">' +
                                    '<div class="item-title">Bristol</div>' +
                                  '</div>' +
                                '</a>' +
                              '</li>' +
                              '<li>' +
                                '<a href="" class="item-content item-link">' +
                                  '<div class="item-inner">' +
                                    '<div class="item-title">Birmingham</div>' +
                                  '</div>' +
                                '</a>' +
                              '</li>' +
                              '<li>' +
                                '<a href="" class="item-content item-link">' +
                                  '<div class="item-inner">' +
                                    '<div class="item-title">Manchester</div>' +
                                  '</div>' +
                                '</a>' +
                              '</li>' +
                            '</ul>' +
                          '</div>' +
                        '</div>'
                    );
                    if (page.find('.autocomplete-values li').length > 0) {
                        page.find('.autocomplete-suggestions').hide();
                    }
                    var searchbar = page.find('.searchbar')[0].f7Searchbar;
                    page.find('.autocomplete-suggestions a').on('click', function () {
                        var text = $(this).find('.item-title').text();
                        searchbar.search(text);
                        setTimeout(function () {
                           searchbar.overlay.removeClass('searchbar-overlay-active');
                        }, 400);
                    });
                }
            });
        });


        // Range Pickers
        $('.search-filter').find('input[type="range"]').on('change input', function () {
            var value = $(this).val();
            if ($(this).attr('data-format') === 'money') {
                value = parseFloat(value);
                if (value === parseInt(value, 10)) value += '.00';
                else value += '0';
            }
            $(this).parents('li').prev('li').find('.item-after span').text(value);
        });

        // Do Search Filter
        function filter() {
            if (ia.search.timeout) clearTimeout(ia.search.timeout);
            ia.search.timeout = setTimeout(function () {
                $('#tab-search #tab-search-opportunities, #tab-search #tab-search-employers').scrollTop(0);
                ia.search.search(true);
            }, 500);
        }
        $('.search-filter').find('input[type="checkbox"], select').on('change', function (e) {
            filter();
        });
        $('.search-filter').find('input[type="range"]').on('input', function (e) {
            filter();
        });

        // Panel
        $('.panel.search-filter').on('open', function () {
            ia.app.setStatusBar('filter');
        });
        $('.panel.search-filter').on('close', function () {
            ia.app.setStatusBar('default');
        });
    }
};