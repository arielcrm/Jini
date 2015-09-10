var categoryRequest;
var objectRequest;

function loadCategory(categoryId) {
    categoryRequest = $.ajax({
        url: '/categories/' + categoryId + '/content',
        dataType: 'html',
        async: true,
        success: function(response) {
            if (response) {
                $('#sideBar1 .info-pane .content').html(response);
            } else {
                $('#sideBar1 .info-pane .content').empty();
            }
        },
        complete: function(response) {
            $('#sideBar1 .info-pane').removeClass('preloader');
        }
    });
}

function loadCategoryObjects(categoryId) {
    objectRequest = $.ajax({
        async: true,
        url: '/objects/search?categoryid=' + categoryId,
        dataType: 'json',
        success: function(response) {
            if (response && response.length > 0) {
                var html = '<ul>'
                for (i = 0; i < response.length; i++) {
                    var result = response[i];
                    var cssClass = "more-button";

                    if (result.promoted == 1){
                        cssClass += " promoted";
                    }
                    html += '<li data-index="' + i + '" data-id="' + result.id + '" data-title="' + result.title + '" data-content-image="' + result.content_image + '" data-address-street="' + result.address_street + '"  data-address-city="' + result.address_city + '" data-email="' + result.email + '" data-phone="' + result.phone + '"  data-occupation="' + result.occupation + '" data-french-speakers="' + result.french_speakers + '" >';
                    html += '<div class="row"><div class="col-md-5"><img src="' +  result.featured_image + '" class="thumb" /></div><div class="col-md-7 no-padding"><div class="content"><h3>' + result.title  + '</h3><p class="excerpt">' + result.excerpt + '</p><button class="' + cssClass + '"><span>More Info</span</button></div></div></div>';
                    html += '<div class="row actions"><div class="col-md-4"><button class="map-button">View on map</button></div><div class="col-md-4 no-padding"><button class="wishlist-button">Add to wishlist</button></div><div class="col-md-4"><button class="book-button">Book now</button></div></div>'
                    html += '</li>';

                }
                html += '</ul>';
                $('#sideBar1 .search-results-pane .info-content .content').html(html);
                $('#sideBar1 .search-results-pane .info-content .content .more-button').on('click', function() {
                    var parent = $(this).closest('li');
                    var itemId =  $(parent).attr("data-id");
                    var itemTitle = $(parent).attr("data-title");
                    var itemContentImageSrc = $(parent).attr("data-content-image");
                    var itemEmail = $(parent).attr("data-email");
                    var itemPhone = $(parent).attr("data-phone");
                    var itemAddressStreet = $(parent).attr("data-address-street");
                    var itemAddressCity = $(parent).attr("data-address-city");
                    var itemOccupation = $(parent).attr("data-occupation");
                    var itemFrenchSpeakers = $(parent).attr("data-french-speakers");

                    if (itemTitle) {
                        $('#sideBar1 .info-pane-1 .title').html(itemTitle);
                    } else {
                        $('#sideBar1 .info-pane-1 .title').empty();
                    }

                    if (itemOccupation) {
                        $('#sideBar1 .info-pane-1 .occupation').html(itemOccupation);
                    } else {
                        $('#sideBar1 .info-pane-1 .occupation').empty();
                    }


                    if (itemContentImageSrc && itemContentImageSrc != 'undefined') {
                        $('#sideBar1 .info-pane-1 .top-pane').css('background-image', 'url(' + itemContentImageSrc + ')');
                        $('#sideBar1 .info-pane-1').removeClass("no-content-image")
                    } else {
                        $('#sideBar1 .info-pane-1').addClass("no-content-image")
                    }
                    $('#sideBar1 .info-pane-1 .contact span').empty();
                    $('#sideBar1 .info-pane-1 .contact .phone').html(itemPhone);
                    $('#sideBar1 .info-pane-1 .contact .email').html(itemEmail);
                    $('#sideBar1 .info-pane-1 .contact .address').html(itemAddressStreet + ' ' + itemAddressCity);
                    $('#sideBar1 .info-pane-1 .contact .french_speakers').html("Franchophone");

                    if (itemAddressCity) {
                        $('#sideBar1 .info-pane-1 .address').html(itemAddressCity);
                    }


                    $(".demo-wrapper").removeClass("demo-wrapper-righter-1");
                    $(".demo-wrapper").removeClass("demo-wrapper-righter-3");
                    $(".demo-wrapper").addClass("demo-wrapper-righter-2");


                    $('#sideBar1 .pane-wrapper').removeClass('collapsed');


                    $('#sideBar1 .info-pane-wrapper-1').addClass('collapsed');

                    $('#sideBar1 .info-pane-1 .contact .phone').html(response.phone);
                    $('#sideBar1 .info-pane-1 .contact .email').html(response.email);
                    $('#sideBar1 .info-pane-1 .contact .address').html(response.address_street + ' ' + response.city);
                    $('#sideBar1 .info-pane-1 .contact .speakers').html(response);

                    //if (objectRequest) { objectRequest.abort(); }
                    objectRequest = $.ajax({
                        async: true,
                        url: '/objects/' + itemId + '/content',
                        dataType: 'html',
                        success: function(response) {
                            console.log(response);
                            if (response) {
                                $('#sideBar1 .info-pane-1 .content-pane .content').html(response);
                            } else {
                                $('#sideBar1 .info-pane-1 .content-pane .content').empty();
                            }
                        },
                        complete: function(response) {
                            $('#sideBar1 .info-pane-1 .content-pane .content').removeClass('preloader');
                        }
                    });
                });
                $('#sideBar1 .search-results-pane-1 #mapFrame').html('<iframe src="/objects/map?categoryid=' + categoryId + '" width="1178" height="980" frameBorder="0" scrolling="no"></iframe>');


                $('#sideBar1 .info-pane-wrapper').removeClass('collapsed');
                $('#sideBar1 .info-pane-wrapper-1').removeClass('collapsed');

//                $('#sideBar1 .search-criteria-pane').find('.criteria').html(itemTitle);
                $('#sideBar1 .search-criteria-pane-wrapper').addClass('collapsed');


//                $('#sideBar1 .search-results-pane').find('.criteria').html(itemTitle);
                $('#sideBar1 .search-results-pane-wrapper').addClass('collapsed');

                $(".demo-wrapper").removeClass("demo-wrapper-righter-1");
                $(".demo-wrapper").removeClass("demo-wrapper-righter-2");
                $(".demo-wrapper").addClass("demo-wrapper-righter-3");

//                                $('#sideBar1 .search-results-pane .info-content .content').slimScroll({
//                                    height: '250px'
//                                });
            }
        }
    });
}

$(function() {
    //loadObject(31);
});

function bindElement(elementId, value) {
    if (elementId) {
        if (value && typeof value != 'undefined') {
            $('#' + elementId).html(value);
        } else {
            $('#' + elementId).empty();
        }
    }
}

function loadObject(objectId) {
    objectRequest = $.ajax({
        url: '/objects/' + objectId,
        dataType: 'json',
        async: true,
        success: function(response) {
            if (response) {
                bindElement('sideBar1 .info-pane-1 .title', response.title);
                bindElement('sideBar1 .info-pane-1 .occupation', response.occupation);

                if (response.content_image && typeof response.content_image != 'undefined') {
                    $('#sideBar1 .info-pane-1 .top-pane').css('background-image', 'url(' + response.content_image + ')');
                    $('#sideBar1 .info-pane-1').removeClass("no-content-image")
                } else {
                    $('#sideBar1 .info-pane-1').addClass("no-content-image")
                }
                $('#sideBar1 .info-pane-1 .contact span').empty();

                bindElement('sideBar1 .info-pane-1 .contact .phone', response.phone);
                bindElement('sideBar1 .info-pane-1 .contact .email', response.email);
                bindElement('sideBar1 .info-pane-1 .contact .address', response.address_street + ' ' + response.address_city);
                bindElement('sideBar1 .info-pane-1 .contact .french_speakers', response.french_speakers);

                objectRequest = $.ajax({
                    async: true,
                    url: '/objects/' + objectId + '/content',
                    dataType: 'html',
                    success: function(response) {
                        console.log(response);
                        if (response) {
                            $('#sideBar1 .info-pane-1 .content-pane .content').html(response);
                        } else {
                            $('#sideBar1 .info-pane-1 .content-pane .content').empty();
                        }
                    },
                    complete: function(response) {
                        $('#sideBar1 .info-pane-1 .content-pane .content').removeClass('preloader');
                    }
                });


                $(".demo-wrapper").removeClass("demo-wrapper-righter-1");
                $(".demo-wrapper").removeClass("demo-wrapper-righter-3");
                $(".demo-wrapper").addClass("demo-wrapper-righter-2");


                $('#sideBar1 .pane-wrapper').removeClass('collapsed');
                $('#sideBar1 .info-pane-wrapper-1').addClass('collapsed');
            }
        },
        complete: function(response) {
        }
    });
}