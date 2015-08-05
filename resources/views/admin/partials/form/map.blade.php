<div class="col-md-12">
    <label class="control-label" for="label"> {{ $field['label'] }} - {{{ isset( $values['address'] ) ? $values['address'] : null }}}
        {{{ isset( $values['city'] ) ? $values['city'] : null }}} {{{ isset( $values['country'] ) ? ', ' . $values['country'] : null }}}
        ({{{ isset( $values['location-g'] ) ? $values['location-g'] : null }}}, {{{ isset( $values['location-k'] ) ? $values['location-k'] : null }}})
    </label>
    {!!$errors->first('label', '<span class="help-block">:message </span>')!!}

    <input class="form-control" type="hidden" name="{{{ $field['id'] }}}-location-g" id="{{{ $field['id'] }}}-location-g" />
    <input class="form-control" type="hidden" name="{{{ $field['id'] }}}-location-k" id="{{{ $field['id'] }}}-location-k" />
    <input class="form-control" type="hidden" name="{{{ $field['id'] }}}-address" id="{{{ $field['id'] }}}-address" />
    <input class="form-control" type="hidden" name="{{{ $field['id'] }}}-city" id="{{{ $field['id'] }}}-city" />
    <input class="form-control" type="hidden" name="{{{ $field['id'] }}}-country" id="{{{ $field['id'] }}}-country" />


    <input id="pac-input" class="controls" type="text"
           placeholder="Enter a location">
    <div id="type-selector" class="controls">
        <input type="radio" name="type" id="changetype-all" checked="checked">
        <label for="changetype-all">All</label>

        <input type="radio" name="type" id="changetype-establishment">
        <label for="changetype-establishment">Establishments</label>

        <input type="radio" name="type" id="changetype-address">
        <label for="changetype-address">Addresses</label>

        <input type="radio" name="type" id="changetype-geocode">
        <label for="changetype-geocode">Geocodes</label>
    </div>
    <div id="map-canvas"></div>


</div>

<script>
    function initialize() {
        var mapOptions = {
            center: new google.maps.LatLng(-33.8688, 151.2195),
            zoom: 13
        };
        var map = new google.maps.Map(document.getElementById('map-canvas'),
            mapOptions);

        var input = /** @type {HTMLInputElement} */(
            document.getElementById('pac-input'));

        var types = document.getElementById('type-selector');
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(types);

        var autocomplete = new google.maps.places.Autocomplete(input);
        autocomplete.bindTo('bounds', map);

        var infowindow = new google.maps.InfoWindow();
        var marker = new google.maps.Marker({
            map: map,
            anchorPoint: new google.maps.Point(0, -29)
        });


        // Set here

        @if ( !empty( $values['location-g'] ) && !empty( $values['location-k'] ) )
            var myLatLng = new google.maps.LatLng({{ $values['location-g'] }}, {{ $values['location-k'] }});
            map.setCenter(myLatLng);
            map.setZoom(17);
        @endif


        google.maps.event.addListener(autocomplete, 'place_changed', function() {
            infowindow.close();
            marker.setVisible(false);
            var place = autocomplete.getPlace();

            if (!place.geometry) {
                window.alert("Autocomplete's returned place contains no geometry");
                return;
            }

            console.log(place);

            $('#{{{ $field['id'] }}}-location-g').val(place.geometry.location.G);
            $('#{{{ $field['id'] }}}-location-k').val(place.geometry.location.K);

            if ( place.adr_address ) {
                var addressElement = $('<div/>').append( place.adr_address );

                var addressAddress = $( addressElement).children('.street-address');
                var addressCity = $( addressElement).children('.locality');
                var addressCountry = $( addressElement).children('.country-name');

                if ($(addressAddress).length > 0) {
                    $('#{{{ $field['id'] }}}-address').val($(addressAddress).html());
                }
                if ($(addressCity).length > 0) {
                    $('#{{{ $field['id'] }}}-city').val($(addressCity).html());
                }
                if ($(addressCountry).length > 0) {
                    $('#{{{ $field['id'] }}}-country').val($(addressCountry).html());
                }
            }


            // If the place has a geometry, then present it on a map.
            if (place.geometry.viewport) {
                map.fitBounds(place.geometry.viewport);
            } else {
                map.setCenter(place.geometry.location);
                map.setZoom(17);  // Why 17? Because it looks good.
            }
            marker.setIcon(/** @type {google.maps.Icon} */({
                url: place.icon,
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(35, 35)
            }));
            marker.setPosition(place.geometry.location);
            marker.setVisible(true);

            var address = '';
            if (place.address_components) {
                address = [
                    (place.address_components[0] && place.address_components[0].short_name || ''),
                    (place.address_components[1] && place.address_components[1].short_name || ''),
                    (place.address_components[2] && place.address_components[2].short_name || '')
                ].join(' ');
            }

            infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
            infowindow.open(map, marker);
        });

        // Sets a listener on a radio button to change the filter type on Places
        // Autocomplete.
        function setupClickListener(id, types) {
            var radioButton = document.getElementById(id);
            google.maps.event.addDomListener(radioButton, 'click', function() {
                autocomplete.setTypes(types);
            });
        }

        setupClickListener('changetype-all', []);
        setupClickListener('changetype-address', ['address']);
        setupClickListener('changetype-establishment', ['establishment']);
        setupClickListener('changetype-geocode', ['geocode']);
    }

    google.maps.event.addDomListener(window, 'load', initialize);

</script>