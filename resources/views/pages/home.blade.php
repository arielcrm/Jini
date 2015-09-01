@extends('app')
@section('title') Home :: @parent @stop
@section('content')
<div id="sideBar1" class="side-bar side-bar-1">
    <nav>
        <ul>
            <li class="recommended">
                <a href="#">&nbsp;</a>
            </li>
            <li class="info">
                <a href="#">&nbsp;</a>
            </li>
            <li class="contact">
                <a href="#">&nbsp;</a>
            </li>
        </ul>
    </nav>
    <div class="info-pane-wrapper pane-wrapper">
        <div class="info-pane pane">
            <div class="top-pane"></div>
            <div class="main-pane">
                <div class="row heading">
                    <div class="col-md-12">
                        <h2 class="title"></h2>
                    </div>
                </div>
                <div class="row heading">
                    <div class="col-md-12">
                        <div class="content"></div>
                    </div>
                </div>
            </div>
            <button class="back-button">&nbsp;</button>
        </div>
    </div>
    <div class="info-pane-wrapper-1 pane-wrapper">
        <div class="info-pane-1 pane">
            <div class="top-pane"></div>
            <div class="main-pane">
                <div class="row heading">
                    <div class="col-md-12">
                        <h2 class="title"></h2>
                        <h3 class="occupation"></h3>
                    </div>
                </div>
                <hr />
                <div class="row actions actions-pane">
                    <div class="col-md-4"><button class="wishlist-button">Add to wishlist</button></div><div class="col-md-4"><button class="book-button">Book</button></div><div class="col-md-4"><button class="map-button"></button></div>
                </div>
                <hr />
                <div class="row sub-heading">
                    <div class="col-md-12">
                        <h3>Contact Info</h3><hr />
                    </div>
                </div>
                <div class="row contact">
                    <div class="col-md-5">
                        <span class="phone"></span><br />
                        <span class="email"></span>
                    </div>
                    <div class="col-md-7">
                        <span class="address"></span><br />
                        <span class="french_speakers"></span>
                    </div>
                </div>
                <div class="row sub-heading">
                    <div class="col-md-12">
                        <h3>More Info</h3><hr />
                    </div>
                </div>
                <div class="row contact">
                    <div class="col-md-4">
                        <span class="phone"></span><br />
                        <span class="email"></span>
                    </div>
                    <div class="col-md-4">
                        <span class="address"></span><br />
                        <span class="speakers"></span>
                    </div>
                </div>
                <hr />
                <div class="row content-pane">
                    <div class="col-md-12">
                        <div class="content"></div>
                    </div>
                </div>
            </div>
            <button class="back-button">Back to list view</button>
            <button class="close-button">&nbsp;</button>
        </div>
    </div>
    <div class="search-criteria-pane-wrapper pane-wrapper">
        <div class="search-criteria-pane pane">
            <h2 class="title">Filter results in <span class="criteria"></span></h2>
            <button class="close-button">&nbsp;</button>
            <ul class="view-mode">
                <li>
                    <button class="map-view-button"></button>
                </li>
                <li>
                    <button class="list-view-button active">&nbsp;</button>
                </li>
            </ul>
        </div>
    </div>
    <div class="search-results-pane-wrapper pane-wrapper">
        <div class="search-results-pane pane">
            <h2 class="title">Search by categorie <span class="criteria"></span></h2>
            <div class="info-content">
                <div class="content"></div>
            </div>
            <button class="close-button">&nbsp;</button>
        </div>
    </div>
    <div class="search-results-pane-wrapper-1 pane-wrapper">
        <div class="search-results-pane-1 pane">
            <div id="mapFrame"></div>
            <button class="close-button">&nbsp;</button>
        </div>
    </div>
</div>
<div class="container">
    <div class="demo-wrapper">
        <button id="backButton" class="back-button"></button>
        <div id="demo">
            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="-2 -2 504 504" id="menu">
                <style>
                    #menu {
                        display: block;
                        margin: 0 auto;
                        /*overflow: visible;*/ /* uncomment this if you are using bouncing animations*/
                    }

                    a {
                        cursor: pointer; /* SVG &lt;a&gt; elements don't get this by default, so you need to explicitly set it */
                        outline: none;
                        font-weight: bold;
                        font-size: 17px;
                    }

                    /* You can change these default styles any way you want */

                    .item .sector {
                        transition: all .1s linear;
                        fill: #fff;
                        stroke: transparent;
                        opacity: 0.8;
                    }


                    .item:hover .sector, .item:focus .sector {
                        fill: #fff;
                        opacity: 0.6;
                    }

                    .menu-trigger {
                        fill: #fff;
                        stroke: transparent;
                        opacity: 0.8;
                        pointer-events: auto; /* KEEP THIS to make sure it stays clickable even when SVG's pointer events is disabled */
                    }

                    .menu-trigger:hover, .menu-trigger:focus {
                        cursor: pointer;
                    }
                    symbol {
                        overflow: visible; /* KEEP THIS so that text will not get cut off it it is wider than the icon width */
                    }
                </style>
                <g id="trigger" class="trigger menu-trigger" role="button">
                    <circle cx="250" cy="250" r="110" />
                    <!-- menu button label or icon goes here -->
                </g>
                <g id="itemsContainer">
                    <!-- the menu items -->
                </g>
                <g id="symbolsContainer">
                    <!-- replace the contents of these symbols with the contents of your icons -->
                </g>
            </svg>
        </div>
    </div>

    <div class="options">
        <fieldset class="settings" id="settings">
            <legend>
                <svg width="20" viewBox="0 0 32 32" height="20">
                    <path d="M8 6.021v-3.021c0-1.654-1.346-3-3-3s-3 1.346-3 3v3.021c-1.208.915-2 2.348-2 3.979s.792 3.064 2 3.977v15.023c0 1.654 1.346 3 3 3s3-1.346 3-3v-15.023c1.208-.912 2-2.346 2-3.977s-.792-3.064-2-3.979zm-4-3.021c0-.553.447-1 1-1s1 .447 1 1v2.1c-.323-.065-.657-.1-1-.1s-.677.035-1 .1v-2.1zm2 26c0 .553-.447 1-1 1s-1-.447-1-1v-14.102c.323.067.657.102 1 .102s.677-.035 1-.102v14.102zm1.865-18.16l-.049.158c-.095.264-.217.514-.378.736l-.014.016c-.174.238-.381.449-.616.627l-.01.008c-.241.182-.51.328-.799.43-.313.113-.646.185-.999.185s-.686-.072-1-.186c-.289-.102-.558-.248-.799-.43l-.01-.008c-.235-.178-.442-.389-.616-.627l-.014-.016c-.161-.223-.283-.473-.378-.736l-.049-.158c-.079-.267-.134-.546-.134-.839 0-.295.055-.574.135-.842l.049-.156c.094-.264.216-.514.378-.738l.014-.016c.174-.236.381-.449.616-.627l.01-.008c.24-.179.509-.326.798-.429.314-.112.647-.184 1-.184s.686.072 1 .184c.289.104.558.25.799.43l.01.008c.235.178.442.391.616.627l.014.016c.161.223.283.473.377.737l.049.156c.08.268.135.547.135.842 0 .293-.055.572-.135.84zm22.135-4.819v-3.021c0-1.654-1.346-3-3-3s-3 1.346-3 3v3.021c-1.209.915-2 2.348-2 3.979s.791 3.064 2 3.977v15.023c0 1.654 1.346 3 3 3s3-1.346 3-3v-15.023c1.207-.912 2-2.346 2-3.977s-.793-3.064-2-3.979zm-4-3.021c0-.553.447-1 1-1s1 .447 1 1v2.1c-.324-.065-.658-.1-1-.1-.344 0-.678.035-1 .1v-2.1zm2 26c0 .553-.447 1-1 1s-1-.447-1-1v-14.102c.322.067.656.102 1 .102.342 0 .676-.035 1-.102v14.102zm1.865-18.16l-.049.158c-.096.264-.217.514-.379.736l-.014.016c-.174.238-.381.449-.615.627l-.01.008c-.242.182-.51.328-.799.43-.313.113-.647.185-.999.185-.354 0-.686-.072-1-.186-.289-.102-.559-.248-.799-.43l-.01-.008c-.236-.178-.443-.389-.617-.627l-.014-.016c-.16-.223-.283-.473-.377-.736l-.049-.158c-.079-.267-.134-.546-.134-.839 0-.295.055-.574.135-.842l.049-.156c.094-.264.217-.514.377-.738l.014-.016c.174-.236.381-.449.617-.627l.01-.008c.24-.18.51-.326.799-.43.313-.111.645-.183.999-.183.352 0 .686.072 1 .184.289.104.557.25.799.43l.01.008c.234.178.441.391.615.627l.014.016c.162.225.283.475.379.738l.049.156c.079.267.134.546.134.841 0 .293-.055.572-.135.84zm-10.865 7.181v-15.021c0-1.654-1.346-3-3-3s-3 1.346-3 3v15.021c-1.208.914-2 2.348-2 3.979s.792 3.064 2 3.977v3.023c0 1.654 1.346 3 3 3s3-1.346 3-3v-3.023c1.207-.912 2-2.346 2-3.977s-.793-3.064-2-3.979zm-4-15.021c0-.553.447-1 1-1s1 .447 1 1v14.1c-.324-.064-.658-.1-1-.1-.343 0-.677.035-1 .1v-14.1zm2 26c0 .553-.447 1-1 1s-1-.447-1-1v-2.102c.323.067.657.102 1 .102.342 0 .676-.035 1-.102v2.102zm1.865-6.16l-.049.158c-.096.264-.217.514-.379.736l-.014.016c-.174.238-.381.449-.615.627l-.01.008c-.242.182-.51.328-.799.43-.313.113-.647.185-.999.185s-.686-.072-1-.186c-.289-.102-.558-.248-.799-.43l-.01-.008c-.235-.178-.442-.389-.616-.627l-.014-.016c-.161-.223-.283-.473-.378-.736l-.049-.158c-.079-.267-.134-.546-.134-.839 0-.295.055-.574.135-.842l.049-.156c.095-.264.217-.514.378-.738l.014-.016c.174-.236.381-.449.616-.627l.01-.008c.241-.18.51-.326.799-.43.313-.111.646-.183.999-.183.352 0 .686.072 1 .184.289.104.557.25.799.43l.01.008c.234.178.441.391.615.627l.014.016c.162.225.283.475.379.738l.049.156c.079.267.134.546.134.841 0 .293-.055.572-.135.84z" stroke-width="1" />
                </svg> Menu Controls</legend>
            <table class="menu-type-style">
                <tr>
                    <td>
                        <input id="full" type="radio" name="type" value="fullCircle" checked/>
                        <label for="full">
                            <svg class="demo-icon icon-circle" width="1.5em" viewBox="0 0 30 30">
                                <circle cx="16" cy="16" r="13" stroke-width="2"></circle>
                            </svg> Full Circle</label>
                    </td>
                    <td>
                        <input id="semi" type="radio" name="type" value="semiCircle">
                        <label for="semi">
                            <svg class="demo-icon icon-semi-circle" width="1.5em" viewBox="0 0 30 17">
                                <path d="M29,16 C29,16 28.5833333,3 16,3 C3.41666666,3 3,16 3,16 L29,16 Z" stroke-width="2"></path>
                            </svg> Semi Circle</label>
                    </td>
                </tr>
                <tr>
                    <td>
                        <input id="pizza" type="radio" name="style" value="pizza"/>
                        <label for="pizza">
                            <svg viewBox="225 0 290 280" width="1.5em" class="demo-icon icon-pizza" style="margin-right: 10px">
                                <path stroke-width="15" d="M250,250 l250,0 A250,250 0 0,0 405.8724504646834,54.542129382992556 z"></path>
                            </svg><span>Pizza</span>
                        </label>
                    </td>
                    <td>
                        <input id="pie" type="radio" name="style" value="pie" checked />
                        <label for="pie">
                            <svg viewBox="320 90 190 175" preserveAspectRatio="xMaxYMax meet" width="1.5em" class="demo-icon icon-pie">
                                <path stroke-width="11" d="M375,250 l125,0 A250,250 0 0,0 452.25424859373686,103.05368692688171 l-101.12712429686843,73.47315653655915 A125,125 0 0,1 375,250"></path>
                            </svg><span>Cake</span>
                        </label>
                    </td>
                </tr>
            </table>
            <div>
                <label for="nb">Specify number of items: </label>
                <input type="number" id="nb" max="12" min="3" value="4">
            </div>
            <div>
                <input type="checkbox" id="gaps">
                <label for="gaps" class="checkbox">Add gaps between items</label>
            </div>
            <table>
                <tr>
                    <td>
                        <label for="gapControl">Adjust the gap:</label>
                    </td>
                    <td>
                        <input type="range" min="" value="10" max="" step="1" id="gapControl" style="transform: rotateZ(180deg)"/>
                    </td>
                </tr>
                <tr>
                    <td>
                        <label for="smallRadiusControl">Adjust the inner radius:</label>
                    </td>
                    <td>
                        <input type="range" min="80" value="150" max="175" step="5" id="smallRadiusControl" />
                    </td>
                </tr>
                <tr>
                    <td>
                        <label for="triggerControl">Adjust the trigger's width:</label>
                    </td>
                    <td>
                        <input type="range" min="20" value="100" max="80" step="5" id="triggerControl" />
                    </td>
                </tr>
                <tr>
                    <td>
                        <label for="iconSizeControl">Adjust the icon's size:</label>
                    </td>
                    <td>
                        <input type="range" min="35" value="40" max="90" step="2" id="iconSizeControl" />
                    </td>
                </tr>
                <tr>
                    <td>
                        <label for="iconPosControl">Adjust the icon's position:</label>
                    </td>
                    <td>
                        <input type="range" min="50" value="" max="" step="2" id="iconPosControl" />
                    </td>
                </tr>
            </table>
            <div>
                <button id="reset-button">Reset All</button>
            </div>
            <div>
                <a href="#" download="svg-menu.svg" class="button" id="download-button" title="Download Menu">
                    <svg width="32" height="32" viewBox="0 0 32 32">
                        <path d="M16 18l8-8h-6v-8h-4v8h-6zM23.273 14.727l-2.242 2.242 8.128 3.031-13.158 4.907-13.158-4.907 8.127-3.031-2.242-2.242-8.727 3.273v8l16 6 16-6v-8z"></path>
                    </svg> Download Menu</a>
            </div>
            <small>Hint: You can rotate the menu by dragging it.</small>
        </fieldset>
    </div>

    <div id="codeContainer" class="code-container">
        <code></code>
    </div>

</div>


    <script>
        var enterEvent = "mouseenter";
        var clickEvent = "mouseup";
        if (Detectizr.device.type != "desktop") {
            enterEvent = "touchstart";
            clickEvent = "touchend";
        }

        var arrMenu1 = [
            ["Start", "", ""],
            ["Start", "", ""],
            ["Start", "", ""]
        ];

        currentMenu = arrMenu1;


        var arrMenu1_2 = [

        ];

        jQuery(document).ready(function($){
            $('#sideBar1 .search-results-pane .info-content').slimScroll({
                height: 'auto',
                alwaysVisible: 'true',
                color: '#d3d3d3',
                size: '8px',
                opacity: 1,
                position: 'right'
            });

            $('#sideBar1 .info-pane .main-pane').slimScroll({
                height: '700px',
                alwaysVisible: 'true',
                color: '#d3d3d3',
                size: '8px',
                opacity: 1,
                position: 'left'
            });

            $('#sideBar1 .info-pane-1 .main-pane').slimScroll({
                height: '700px',
                alwaysVisible: 'true',
                color: '#d3d3d3',
                size: '8px',
                opacity: 1,
                position: 'left'
            });
        });

    </script>


    <script>
        function rebind() {
            $.ajax({
                url: '/categories/' + itemId + '/content',
                dataType: 'html',
                success: function(response) {
                    if (response) {
                        $('#sideBar1 .info-pane .content').html(response);
                    } else {
                        $('#sideBar1 .info-pane .content').html('');
                    }
                },
                complete: function(response) {
                    $('#sideBar1 .info-pane').removeClass('preloader');
                }
            });
        }

        $(function() {
            $('#backButton').on('click', function(e) {
                if (e.button == 0) {
                    $.ajax({
                        url: '/categories',
                        dataType: 'json',
                        success: function(response) {
                            var mm = [];

                            for ( i = 0; i < response.length; i++) {
                                var o = response[i];

                                mi = [];
                                mi[0] = o.title;
                                mi[1] = o.featuredImageUrl;
                                mi[2] = '#' + o.name;
                                mi[3] = o.id;
                                mi[4] = o.contentImageUrl;
                                mi[5] = o.childrenCount;
                                mi[6] = o.itemsCount;


                                mm.push(mi);
                            }

                            currentMenu = mm;

                            nbOfSlices = currentMenu.length;

                            init();

                            $(".demo-wrapper").removeClass("demo-wrapper-righter-1");
                            $(".demo-wrapper").removeClass("demo-wrapper-righter-2");
                            $(".demo-wrapper").removeClass("demo-wrapper-righter-3");
                            $('#sideBar1 .pane-wrapper').removeClass('collapsed');
                        }
                    });

                }
            });

            $.ajax({
                url: '/categories',
                dataType: 'json',
                success: function(response) {
                    var mm = [];

                    for ( i = 0; i < response.length; i++) {
                        var o = response[i];

                        mi = [];
                        mi[0] = o.title;
                        mi[1] = o.featuredImageUrl;
                        mi[2] = '#' + o.name;
                        mi[3] = o.id;
                        mi[4] = o.contentImageUrl;
                        mi[5] = o.childrenCount;
                        mi[6] = o.itemsCount;


                        mm.push(mi);
                    }


                    currentMenu = mm;
                    nbOfSlices = currentMenu.length;

                    //img.setAttributeNS(xlinkns, "xlink:href", "img/preloader.gif");

                    init();


                }
            });



            var arrMenu1 = [
                ["asdsa", "uploads/2cfbe23bf91d2da6d84b4953306c0430e353a1b1.jpg", "#Transportation",
                    [
                        ["רכב", "logo.png", "#Transportation",
                            [
                                ["קנייה", "logo.png", "#Transportation"],
                                ["ביטוחים, המרת רישיון נהיגה", "img/menu/3.png", "#Culture"],
                                ["השכרת רכב", "img/menu/2.png", "#Tourism"],
                                ["שיעורי נהיגה", "img/menu/1.png", "#HealthCare"],
                                ["car 2 go, קל אוטו", "img/menu/1.png", "#HealthCare"]
                            ]
                        ],
                        ["רכבות", "img/menu/3.png", "#Culture"],
                        ["טיסות", "img/menu/2.png", "#Tourism"],
                        ["מוניות/שירות", "img/menu/1.png", "#HealthCare"],
                        ["אוטובוסים", "img/menu/1.png", "#HealthCare"]
                    ]
                ],
                ["תרבות / חיי לילה", "img/menu/3.png", "#Culture"],
                ["תיירות", "img/menu/2.png", "#Tourism"],
                ["בריאות", "img/menu/1.png", "#HealthCare"]
            ];



            currentMenu = [];

            init();

            $('#demo svg').on('mouseleave', function(e) {
                //$('#sideBar1 .info-pane-wrapper').removeClass('collapsed');
            });

            $('#sideBar1 .pane-wrapper .close-button').on('click', function(e) {
                $('.demo-wrapper').removeClass('demo-wrapper-righter');
                $(this).closest('.pane-wrapper').removeClass('collapsed');
            });

            $('#sideBar1 .search-results-pane .close-button').on('click', function(e) {
                $(".demo-wrapper").removeClass("demo-wrapper-righter-2");
                $(".demo-wrapper").removeClass("demo-wrapper-righter-3");
                $(".demo-wrapper").removeClass("demo-wrapper-righter-1");
            });

            $('#sideBar1 .search-results-pane-1 .close-button').on('click', function(e) {
                $(".demo-wrapper").removeClass("demo-wrapper-righter-2");
                $(".demo-wrapper").removeClass("demo-wrapper-righter-3");
                $(".demo-wrapper").removeClass("demo-wrapper-righter-1");
            });



            $('#sideBar1 .list-view-button').on('click', function(e) {
                $(".demo-wrapper").removeClass("demo-wrapper-righter-1");
                $(".demo-wrapper").removeClass("demo-wrapper-righter-3");
                $(".demo-wrapper").addClass("demo-wrapper-righter-2");

                $('#sideBar1 .search-results-pane-wrapper-1').removeClass('collapsed');
                $('#sideBar1 .search-results-pane-wrapper').addClass('collapsed');

                $(this).closest('ul').find('button').removeClass("active");
                $(this).addClass('active');
            });

            $('#sideBar1 .map-view-button').on('click', function(e) {
                $(".demo-wrapper").removeClass("demo-wrapper-righter-1");
                $(".demo-wrapper").removeClass("demo-wrapper-righter-2");
                $(".demo-wrapper").addClass("demo-wrapper-righter-3");


                $('#sideBar1 .search-results-pane-wrapper').removeClass('collapsed');
                $('#sideBar1 .search-results-pane-wrapper-1').addClass('collapsed');

                $(this).closest('ul').find('button').removeClass("active");
                $(this).addClass('active');
            });
        });

    </script>

    <script src="js/scripts.js"></script>
    <script src="{{ elixir('js/site.js') }}"></script>

@stop
