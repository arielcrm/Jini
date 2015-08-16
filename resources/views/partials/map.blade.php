<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>@section('title') Laravel 5 Sample Site @show</title>
    @section('meta_keywords')
    <meta name="keywords" content="your, awesome, keywords, here"/>
    @show @section('meta_author')
    <meta name="author" content="Jon Doe"/>
    @show @section('meta_description')
    <meta name="description"
          content="Lorem ipsum dolor sit amet, nihil fabulas et sea, nam posse menandri scripserit no, mei."/>
    @show

    <script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js"></script>
    <script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/jqueryui/1.10.4/jquery-ui.min.js"></script>
    <script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?language=iw"></script>

    <!--[if lt IE 9]>
    <script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
    <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
    <![endif]-->

    <link rel="shortcut icon" href="{{{ asset('assets/site/ico/favicon.ico') }}}">

    <style type="text/css">
        html, body {
            margin: 0;
            padding: 0;
        }
    </style>

</head>
<body>
    <div id="map_canvas_1" style="width: 1178px; height: 980px;"></div>

    <script>
        var prplMap = [{
            "featureType": "road",
            "stylers": [{
                "hue": "#5e00ff"
            }, {
                "saturation": -79
            }]
        }, {
            "featureType": "poi",
            "stylers": [{
                "saturation": -78
            }, {
                "hue": "#6600ff"
            }, {
                "lightness": -47
            }, {
                "visibility": "off"
            }]
        }, {
            "featureType": "road.local",
            "stylers": [{
                "lightness": 22
            }]
        }, {
            "featureType": "landscape",
            "stylers": [{
                "hue": "#6600ff"
            }, {
                "saturation": -11
            }]
        }, {}, {}, {
            "featureType": "water",
            "stylers": [{
                "saturation": -65
            }, {
                "hue": "#1900ff"
            }, {
                "lightness": 8
            }]
        }, {
            "featureType": "road.local",
            "stylers": [{
                "weight": 1.3
            }, {
                "lightness": 30
            }]
        }, {
            "featureType": "transit",
            "stylers": [{
                "visibility": "simplified"
            }, {
                "hue": "#5e00ff"
            }, {
                "saturation": -16
            }]
        }, {
            "featureType": "transit.line",
            "stylers": [{
                "saturation": -72
            }]
        }, {}];


        function setMarker(location, info) {
            var marker = new google.maps.Marker({
                map: map,
                position: location,
                animation: google.maps.Animation.DROP,
                icon: '/img/icons/map_pin_promoted_xs.png'
            });
            this.map.setCenter(marker.getPosition());
            if (info == "" || typeof info == 'undefined')
                return;
            var infowindow = new google.maps.InfoWindow({
                content: info,
                maxWidth: 200
            });
            google.maps.event.addListener(marker, 'click', function() {
                infowindow.open(this.map, marker);
            });
        }
        var map_canvas = document.getElementById('map_canvas_1');
        var map_options = {
            center: new google.maps.LatLng(32.0121253, 34.9916148,9.75),
            zoom: 10,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            mapTypeControl: true,
            scrollwheel: false,
            mapTypeControlOptions: {
                style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
            },
            zoomControl: true,
            zoomControlOptions: {
                position: google.maps.ControlPosition.LEFT_CENTER,
                style: google.maps.ZoomControlStyle.LARGE
            }
        };
        var map = new google.maps.Map(map_canvas, map_options);
//        map.setOptions({
//            styles: prplMap
//        });


        $(function() {
            $.ajax({
                url: '/objects/locations{{{ $criteria }}}',
                dataType: 'json',
                contentType:"application/json; charset=utf-8",
                success: function(response) {
                    if ( response ) {
                        console.log(response);
                        var latlngbounds = new google.maps.LatLngBounds();
                        for (var i = 0; i < response.data.length; i++) {
                            console.log(response[i]);
                            latlngbounds.extend(new google.maps.LatLng(response.data[i].geo_latitude, response.data[i].geo_longitude));
                            setMarker(new google.maps.LatLng(response.data[i].geo_latitude, response.data[i].geo_longitude), response.data[i].title);
                        }
                        //map.fitBounds(latlngbounds);
                    }
                }
            });
        });

    </script>
</body>
</html>