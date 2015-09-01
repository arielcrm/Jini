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
    <script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?libraries=visualization"></script>


    <link href="{{ elixir('css/site.css') }}" rel="stylesheet">

    {{-- TODO: Incorporate into elixer workflow. --}}
    {{--<link rel="stylesheet"--}}
    {{--href="{{asset('assets/site/css/half-slider.css')}}">--}}
    {{--<link rel="stylesheet"--}}
    {{--href="{{asset('assets/site/css/justifiedGallery.min.css')}}"/>--}}
    {{--<link rel="stylesheet"--}}
    {{--href="{{asset('assets/site/css/lightbox.min.css')}}"/>--}}

    @yield('styles')

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

        button {
            display: block;
            border: 0;
            background: 0;
            outline: 0;
        }

        /* Map Pupup */
        .marker-popup {
            width: 512px;
            background-color: rgba(255, 255, 255, 0.9);
        }
        .marker-popup:not(.no-content-image) .top-pane {
            position: relative;
            width: 512px;
            height: 264px;
            background-repeat: no-repeat;
            background-position: top center;
            background-size: cover;
        }
        .marker-popup.no-content-image .top-pane {
            display: none;
        }
        .marker-popup:not(.no-content-image) .slimScrollDiv {
        }
        .marker-popup .main-pane {
            padding: 15px 30px;
        }
        .marker-popup .main-pane .actions-pane {
            margin: 20px 0 0 0;
        }

        .marker-popup h2 {
            margin: 0 0 5px 0;
            padding: 0;
            font-family: 'BodoniBT-Roman';
            font-weight: bold;
            font-size: 2.5em;
        }
        .marker-popup p {
            font-size: 1.250em;
            line-height: 30px;
        }

        .marker-popup .address {
            background: url('../img/icons/pin_black.png') no-repeat left center;
            padding: 0 0 0 26px;
            height: 25px;
            white-space: nowrap;
            display: block;
        }

        .marker-popup .actions .book-button {
            background: url('../img/icons/credit_card_black.png') no-repeat left center;
            padding: 0 0 0 45px;
            height: 25px;
            font-size: 1.125em;
            text-transform: uppercase;
            font-weight: bold;
        }

        .gm-style-iw {
            width: 512px !important;
            top: 15px !important;
            left: 0px !important;
            background-color: #fff;
            box-shadow: 0 1px 6px rgba(178, 178, 178, 0.6);
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


        var infowindow = null;

        function setMarker(location, info, iconUrl) {
            var marker = new google.maps.Marker({
                map: map,
                position: location,
                animation: google.maps.Animation.DROP
            });

            if (iconUrl) {
                marker.setIcon(iconUrl);
            }

            //this.map.setCenter(marker.getPosition());
            if (info == "" || typeof info == 'undefined')
                return;

            marker.info = info;


            google.maps.event.addListener(marker, 'click', function() {
                if (infowindow) {
                    infowindow.close();
                }
                infowindow = new google.maps.InfoWindow({
                    content: marker.info,
                    maxWidth: 512,
                    height: 264
                });
                // *
                // START INFOWINDOW CUSTOMIZE.
                // The google.maps.event.addListener() event expects
                // the creation of the infowindow HTML structure 'domready'
                // and before the opening of the infowindow, defined styles are applied.
                // *
                google.maps.event.addListener(infowindow, 'domready', function() {
                    // Reference to the DIV that wraps the bottom of infowindow
                    var iwOuter = $('.gm-style-iw');

                    /* Since this div is in a position prior to .gm-div style-iw.
                     * We use jQuery and create a iwBackground variable,
                     * and took advantage of the existing reference .gm-style-iw for the previous div with .prev().
                     */
                    var iwBackground = iwOuter.prev();

                    // Removes background shadow DIV
                    iwBackground.children(':nth-child(2)').css({'display' : 'none'});

                    // Removes white background DIV
                    iwBackground.children(':nth-child(4)').css({'display' : 'none'});

                    // Moves the infowindow 115px to the right.
                    //iwOuter.parent().parent().css({ top: '15px', left: '195px'});

                    // Moves the shadow of the arrow 76px to the left margin.
                    //iwBackground.children(':nth-child(1)').attr('style', function(i,s){ return s + 'left: 76px !important;'});

                    // Moves the arrow 76px to the left margin.
                    //iwBackground.children(':nth-child(3)').attr('style', function(i,s){ return s + 'left: 76px !important;'});

                    // Changes the desired tail shadow color.
                    iwBackground.children(':nth-child(3)').find('div').children().css({'box-shadow': 'rgba(72, 181, 233, 0.6) 0px 1px 6px', 'z-index' : '1'});

                    // Reference to the div that groups the close button elements.
                    var iwCloseBtn = iwOuter.next();
                    // Apply the desired effect to the close button
                    iwCloseBtn.css({opacity: '1', left:'auto', right: '75px', top: '35px', width: '33px', '-webkit-border-radius': '50%', '-moz-border-radius': '50%', 'border-radius': '50%', 'border': '0', 'height': '33px', 'background-color': '#fff', 'background-repeat': 'no-repeat', 'background-image': 'url(/img/icons/close.png)'});

                    $(iwCloseBtn).children('img').hide();

                    // If the content of infowindow not exceed the set maximum height, then the gradient is removed.
                    if($('.iw-content').height() < 140){
                        $('.iw-bottom-gradient').css({display: 'none'});
                    }

                    // The API automatically applies 0.7 opacity to the button after the mouseout event. This function reverses this event to the desired value.
                    iwCloseBtn.mouseout(function(){
                        $(this).css({opacity: '1'});
                    });
                });
                infowindow.open(this.map, marker);
            });



//            google.maps.event.addListener(marker, 'mouseover', function() {
//                infowindow.open(map, this);
//            });
//
//// assuming you also want to hide the infowindow when user mouses-out
//            google.maps.event.addListener(marker, 'mouseout', function() {
//                infowindow.close();
//            });
        }
        var map_canvas = document.getElementById('map_canvas_1');
        var map_options = {
            center: new google.maps.LatLng(31.9026026, 34.946152, 9.75),
            zoom: 10,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            mapTypeControl: true,
            scrollwheel: true,
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
                            var data = response.data[i];
                            
                            if (data) {
                                latlngbounds.extend(new google.maps.LatLng(response.data[i].geo_latitude, response.data[i].geo_longitude));

                                if (data.promoted == 1) {
                                    iconUrl = '/img/icons/map_pin_promoted_xs.png';
                                } else {
                                    iconUrl = '/img/icons/map_pin_xs.png';
                                }

                                var html = '<div class="marker-popup' + (!data.content_image ? ' no-content-image' : '') +'">' +
                                                '<div class="top-pane" style="background-image: url(' + data.content_image + ');"></div>' +
                                                '   <div class="main-pane">' +
                                                '       <div class="row heading">' +
                                                '           <div class="col-md-12">' +
                                                '               <h2 class="title">' + data.title + '</h2>' +
                                                '           </div>' +
                                                '       </div>' +
                                                '       <div class="row heading">' +
                                                '           <div class="col-md-12">' +
                                                '               <div class="content">' + data.excerpt + '</div>' +
                                                '           </div>' +
                                                '       </div>' +
                                                '       <div class="row actions actions-pane">' +
                                                '           <div class="pull-left"><span class="address">' + data.address_street + ' ' + data.address_city + '</span></div>' +
                                                '           <div class="pull-right"><button class="book-button">Book</button></div>' +
                                                '       </div>' +
                                                '   </div>' +
                                                '   <button class="close-button"></button>' +
                                                '</div>' +
                                            '</div>';

                                setMarker(new google.maps.LatLng(data.geo_latitude, data.geo_longitude), html, iconUrl);
                            }
                        }
                        //map.fitBounds(latlngbounds);
                    }
                }
            });
        });

    </script>
</body>
</html>