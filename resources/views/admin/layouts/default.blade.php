@extends('layouts.sidenav')

{{-- Web site Title --}}
@section('title')
    Administration :: @parent
@endsection

{{-- Styles --}}
@section('styles')
    @parent

    <link href="{{ elixir('css/admin.css') }}" rel="stylesheet">

    <link
        href="{{{ asset('assets/admin/css/jquery-ui-1.10.3.custom.css') }}}"
        rel="stylesheet" type="text/css">
    <link href="{{{ asset('assets/admin/css/colorbox.css') }}}"
          rel="stylesheet) }}}" type="text/css">
    <link href="{{{ asset('assets/admin/css/jquery.multiselect.css') }}}"
          rel="stylesheet" type="text/css">
    <link href="{{{ asset('assets/admin/css/style_modal.min.css') }}}"
          rel="stylesheet" type="text/css">
    <link href="{{{ asset('assets/admin/css/select2.css') }}}"
          rel="stylesheet" type="text/css">
    <link href="{{ asset('assets/admin/css/summernote.css')}}"
          rel="stylesheet" type="text/css">

    <link
        href="{{asset('assets/admin/font-awesome-4.2.0/css/font-awesome.min.css')}}"
        rel="stylesheet" type="text/css">

@endsection

{{-- Sidebar --}}
@section('sidebar')
    @include('admin.partials.nav')
@endsection

{{-- Scripts --}}
@section('scripts')
    @parent

<script src="{{{ asset('assets/admin/js/jquery-2.1.1.min.js') }}}"></script>
<!--<![endif]-->
<!--[if IE]>
<script src="{{{ asset('assets/admin/js/jquery-1.11.1.min.js') }}}"></script>
<![endif]-->
<script src="{{{ asset('assets/admin/js/bootstrap.min.js') }}}"></script>
<!-- page scripts -->
<script src="{{{ asset('assets/admin/js/jquery-ui.1.11.2.min.js') }}}"></script>
<script src="{{{ asset('assets/admin/js/jquery.colorbox.js') }}}"></script>
<script src="{{  asset('assets/admin/js/summernote.js')}}"></script>
<script src="{{  asset('assets/admin/js/select2.js') }}"></script>
<script type="text/javascript">
    $(function() {
        $('textarea').summernote({height: 250});
        $('form').submit(function(event) {
            event.preventDefault();
            var form = $(this);

            if (form.attr('id') == '' || form.attr('id') != 'fupload'){
                $.ajax({
                    type : form.attr('method'),
                    url : form.attr('action'),
                    data : form.serialize()
                }).success(function() {
                        setTimeout(function() {
                            parent.$.colorbox.close();
                            window.parent.location.reload();
                        }, 10);
                    }).fail(function(jqXHR, textStatus, errorThrown) {
                        // Optionally alert the user of an error here...
                        var textResponse = jqXHR.responseText;
                        var alertText = "One of the following conditions is not met:\n\n";
                        var jsonResponse = jQuery.parseJSON(textResponse);

                        $.each(jsonResponse, function(n, elem) {
                            alertText = alertText + elem + "\n";
                        });
                        alert(alertText);
                    });
            }
            else{
                var formData = new FormData(this);
                $.ajax({
                    type : form.attr('method'),
                    url : form.attr('action'),
                    data : formData,
                    mimeType:"multipart/form-data",
                    contentType: false,
                    cache: false,
                    processData:false
                }).success(function() {
                        setTimeout(function() {
                            parent.$.colorbox.close();
                            window.parent.location.reload();
                        }, 10);

                    }).fail(function(jqXHR, textStatus, errorThrown) {
                        // Optionally alert the user of an error here...
                        var textResponse = jqXHR.responseText;
                        var alertText = "One of the following conditions is not met:\n\n";
                        var jsonResponse = jQuery.parseJSON(textResponse);

                        $.each(jsonResponse, function(n, elem) {
                            alertText = alertText + elem + "\n";
                        });

                        alert(alertText);
                    });
            };
        });

        $('.close_popup').click(function() {
            parent.$.colorbox.close()
            window.parent.location.reload();
        });
    });
</script>


    <script src="{{ elixir('js/admin.js') }}"></script>

    {{-- Not yet a part of Elixir workflow --}}
    <script src="{{asset('assets/admin/js/bootstrap-dataTables-paging.js')}}"></script>
    <script src="{{asset('assets/admin/js/datatables.fnReloadAjax.js')}}"></script>
    <script src="{{asset('assets/admin/js/modal.js')}}"></script>

    {{-- Default admin scripts--}}
    <script type="text/javascript">
        {{-- from sb-admin-2 --}}
        $(function () {
            $('.metismenu > ul').metisMenu();
        });
    </script>

@endsection
