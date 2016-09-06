ia.map = {
    key: 'AIzaSyBS6p3_5AsbRfuaujFDu300GzLzlsbTqPY',
    load: function (callback) {
        if (window.google && window.google.maps) {
            if (callback) callback();
            return;
        }
        window._googleMapsApiLoadCallback = function () {
            if (callback) callback();
        };
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://maps.googleapis.com/maps/api/js?key=' + ia.map.key + '&callback=_googleMapsApiLoadCallback';
        document.body.appendChild(script);
    },
    open: function (params) {
        $('.popup-map').once('opened', function () {
            function initializeMap() {
                var address = params.address;
                var location = params.location ? ' (' + params.location + ')' : '';
                var title = params.title ? '<div><strong>' + params.title + '</strong></div>' : '';
                var contentString = '<div class="contacts-map-bubble-content">' + title + '<div>' + address + location + '</div></div>';
                var mapOptions = {
                    zoom: 14
                };
                var map = new google.maps.Map($('.popup-map .map')[0], mapOptions);
                var geocoder = new google.maps.Geocoder();
                geocoder.geocode({'address': params.address}, function(results, status) {
                    if (status === google.maps.GeocoderStatus.OK) {
                        map.setCenter(results[0].geometry.location);
                        var marker = new google.maps.Marker({
                            position: results[0].geometry.location,
                            map: map,
                            title: params.title
                        });
                        var infowindow = new google.maps.InfoWindow({
                            content: contentString
                        });
                        google.maps.event.addListener(marker, 'click', function() {
                            infowindow.open(map,marker);
                        });
                    } else {
                        // console.log('Geocode was not successful for the following reason: ' + status);
                    }
                });
            }
            ia.map.load(function () {
                initializeMap();
            });
        });
        $('.popup-map .navbar .left span').text(params.address);
        app.popup('.popup-map');
    },
    init: function () {
        $(document).on('click', '.open-map', function () {
            var self = $(this);
            var address = self.attr('data-address');
            var title = self.attr('data-title');
            var location =self.attr('data-location');
            ia.map.open({
                address: self.attr('data-address'),
                title: self.attr('data-title'),
                location: self.attr('data-location')
            });
        });
        $('.popup-map').on('closed', function () {
            $('.popup-map .map').html('');
            $('.popup-map .navbar .left span').text('');
        });
    }
};