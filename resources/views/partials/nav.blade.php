<nav class="navbar navbar-default">
    <div class="container-fluid">
        <div class="navbar-header">
            <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
                <span class="sr-only">Toggle navigation</span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
            </button>
            <a class="navbar-brand" href="#">
                <img src="/img/logo_1.png" />
            </a>
        </div>
        <div id="navbar" class="navbar-collapse collapse">
            <ul class="nav navbar-nav">
                <form class="navbar-form" role="search">
                    <div class="input-group">
                            <div id="scrollable-dropdown-menu">
                                <input id="arr" class="form-contro typeahead" type="text" />
                            </div>

                            <script>
                                function preg_quote( str ) {
                                    // http://kevin.vanzonneveld.net
                                    // +   original by: booeyOH
                                    // +   improved by: Ates Goral (http://magnetiq.com)
                                    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
                                    // +   bugfixed by: Onno Marsman
                                    // *     example 1: preg_quote("$40");
                                    // *     returns 1: '\$40'
                                    // *     example 2: preg_quote("*RRRING* Hello?");
                                    // *     returns 2: '\*RRRING\* Hello\?'
                                    // *     example 3: preg_quote("\\.+*?[^]$(){}=!<>|:");
                                    // *     returns 3: '\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:'

                                    return (str+'').replace(/([\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:])/g, "\\$1");
                                }

                                var searchResults = new Bloodhound({
                                    datumTokenizer: Bloodhound.tokenizers.whitespace,
                                    queryTokenizer: Bloodhound.tokenizers.whitespace,
                                    remote: {
                                        url: '/objects/search?query=%QUERY' + '&t=' + Date.now(),
                                        wildcard: '%QUERY',
                                        ajax:{
                                            type: "POST",
                                            cache: false,
                                            data:{
                                                limit:5
                                            },
                                            beforeSend:function(jqXHR,settings){
                                                settings.data+="&q="+$('#arr').typeahead('val');
                                            },
                                            complete:function(jqXHR,textStatus){
                                                meslekler.clearRemoteCache();
                                            }
                                        }
//                                        filter: function (results) {
//                                            return $.map(results, function (result) {
//                                                return {
//                                                    id: result.id,
//                                                    title: result.title,
//                                                    type: result.type
//                                                };
//                                            });
//                                        }
                                    }
                                });

                                $('#scrollable-dropdown-menu .typeahead').typeahead(null, {
                                    name: 'searchResults',
                                    limit: 10,
                                    source: searchResults,
                                    displayKey: 'title',
                                    templates: {
                                        empty: [
                                            '<div class="empty-message">',
                                            'unable to find any Best Picture winners that match the current query',
                                            '</div>'
                                        ].join('\n'),
                                        suggestion: function (data) {
                                            return '<p>' + data.title.replace( new RegExp( "(" + preg_quote( data._query ) + ")" , 'gi' ), "<b>$1</b>"  ) + '</p>';
                                        }
                                    },
                                    hint: false,
                                    highlight: true
                                });
                                $('#scrollable-dropdown-menu .typeahead').on('typeahead:open', function(ev) {
                                    $('#sideBar1 .pane-wrapper').removeClass('collapsed');
                                    $(".demo-wrapper").removeClass("demo-wrapper-righter-1");
                                    $(".demo-wrapper").removeClass("demo-wrapper-righter-2");
                                    $(".demo-wrapper").removeClass("demo-wrapper-righter-3");
                                });
                                $('#scrollable-dropdown-menu .typeahead').on('typeahead:selected', function(ev, suggestion) {
                                    if (suggestion.type == 'category') {
                                        //alert("sadfsda");
                                        loadMenu(suggestion.id);

                                        var category = {};
                                        category["id"] = suggestion.id;
                                        loadCategoryObjects(suggestion.id);
                                        loadCategory(category);
                                    } else {
                                        loadObject(suggestion.id);
                                        //$(this).typeahead('val','');
                                    }
//                                    $.ajax({
//                                        url: 'categories',
//                                        method: "POST",
//                                        data: {
//                                            id  : suggestion.id,
//                                            _token : '{{{ csrf_token() }}}'
//                                        },
//                                        cache: false,
//                                        success: function(response) {
//                                            console.log(response);
//                                            if (response) {
//                                            }
//                                        },
//                                        complete: function(response) {
//                                            console.log(response);
//
//                                        }
//                                    });
                                });
                            </script>


                        <div class="input-group-btn">
                            <button class="btn btn-default" type="submit"><i class="glyphicon glyphicon-search"></i></button>
                        </div>
                    </div>
                </form>
            </ul>
            <ul class="nav navbar-nav navbar-right">
                @if (Auth::guest())
                <li class="{{ (Request::is('auth/login') ? 'active' : '') }}"><a href="{!! URL::to('auth/login') !!}"><i
                            class="fa fa-sign-in"></i> Login</a></li>
                <li class="{{ (Request::is('auth/register') ? 'active' : '') }}"><a
                        href="{!! URL::to('auth/register') !!}">Register</a></li>
                @else
                <li class="dropdown">
                    <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button"
                       aria-expanded="false"><i class="fa fa-user"></i> {{ Auth::user()->name }} <i
                            class="fa fa-caret-down"></i></a>
                    <ul class="dropdown-menu" role="menu">
                        @if(Auth::check())
                        @if(Auth::user()->admin==1)
                        <li>
                            <a href="{!! URL::to('admin/dashboard') !!}"><i class="fa fa-tachometer"></i> Dashboard</a>
                        </li>
                        @endif
                        <li role="presentation" class="divider"></li>
                        @endif
                        <li>
                            <a href="{!! URL::to('auth/logout') !!}"><i class="fa fa-sign-out"></i> Logout</a>
                        </li>
                    </ul>
                </li>
                @endif
            </ul>
        </div><!--/.nav-collapse -->
    </div><!--/.container-fluid -->
</nav>