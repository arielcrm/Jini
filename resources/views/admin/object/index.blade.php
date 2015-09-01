@extends('admin.layouts.default')

{{-- Web site Title --}}
@section('title') {{{ trans("admin/object.objects") }}}
:: @parent @stop

{{-- Content --}}
@section('main')
    <div class="page-header">
        <h3>
            {{{ trans("admin/object.objects") }}}
            <div class="pull-right">
                <div class="pull-right">
                    <a href="{{{ URL::to('admin/objects/create') }}}"
                       class="btn btn-sm  btn-primary"><span
                                class="glyphicon glyphicon-plus-sign"></span> {{ trans("admin/modal.new") }}</a>
                </div>
                <div class="pull-right">
                    @if(!empty($types) )
                    <select
                        style="width: 100%" name="type" id="type"
                        class="form-control" onchange="location.search = 'type=' + this.value;"> <option value="" text=""></option>
                        @foreach($types as $type)
                        <option value="{{{ $type->name }}}"
                        @if(!empty($_GET['type']) && $type->name==$_GET['type'])
                        selected="selected" @endif

                        >{{$type->title}}</option>
                        @endforeach
                    </select>
                    @endif
                </div>
            </div>
        </h3>
    </div>

    <table id="table" class="table table-striped table-hover">
        <thead>
        <tr>
            <th>{{{ trans("admin/admin.title") }}}</th>
            <th>{{{ trans("admin/admin.type") }}}</th>
            <th>{{{ trans("admin/admin.status") }}}</th>
            <th>{{{ trans("admin/admin.created_at") }}}</th>
            <th>{{{ trans("admin/admin.action") }}}</th>
        </tr>
        </thead>
        <tbody></tbody>
    </table>

<form class="form-horizontal" id="fupload" enctype="multipart/form-data"
      method="post"
      action="{{ URL::to('admin/objects/import?type=' . ( !empty( $objecttype ) ? $objecttype->name : '' ) . '&format=excel') }}"
      autocomplete="off">
    <!-- CSRF Token -->
    <input type="hidden" name="_token" value="{{{ csrf_token() }}}" />
    <input name="dd" type="file" class="uploader" id="dd" value="Upload" />
    <button type="submit" class="btn btn-sm btn-success">
        <span class="glyphicon glyphicon-import"></span>
        @if	(isset($object))
        {{ trans("admin/modal.edit") }}
        @else
        {{ trans("admin/admin.import") }}
        @endif
    </button>
</form>
@stop

{{-- Scripts --}}
@section('scripts')
    @parent
    <script type="text/javascript">
        var oTable;
        var ot = "{{{ ( !empty( $objecttype ) ? $objecttype->name : '' ) }}}";
        var q = '';

        if (ot) {
            q = 'type=' + encodeURIComponent(ot);
        }

        $(document).ready(function () {
            oTable = $('#table').DataTable({
                "sDom": "<'row'<'col-md-6'l><'col-md-6'f>r>t<'row'<'col-md-6'i><'col-md-6'p>>",
                "sPaginationType": "bootstrap",
                "processing": true,
                "serverSide": true,
                "ajax": "{{ URL::to('admin/objects/data') }}" + (q ? '?' + q : ''),
                "fnDrawCallback": function (oSettings) {
                    $(".iframe").colorbox({
                        iframe: true,
                        width: "80%",
                        height: "80%",
                        onClosed: function () {
                            window.location.reload();
                        }
                    });
                }
            });
            var startPosition;
            var endPosition;
            $("#table tbody").sortable({
                cursor: "move",
                start: function (event, ui) {
                    startPosition = ui.item.prevAll().length + 1;
                },
                update: function (event, ui) {
                    endPosition = ui.item.prevAll().length + 1;
                    var navigationList = "";
                    $('#table #row').each(function (i) {
                        navigationList = navigationList + ',' + $(this).val();
                    });
                    $.getJSON("{{ URL::to('admin/objects/reorder') }}", {
                        list: navigationList
                    }, function (data) {
                    });
                }
            });
        });
    </script>
@stop
