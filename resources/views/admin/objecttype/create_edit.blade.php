@extends('admin.layouts.default')

{{-- Web site Title --}}
@section('title') {{{ trans("admin/objecttype.objecttypes") }}}
:: @parent @stop

{{-- Content --}}
@section('main')
<div class="page-header">
    <h3>
        {{{ trans("admin/objecttype.objecttypes") }}} @if (isset($objecttype)) - {{ $objecttype->title }} @endif
        <div class="pull-right">
            <div class="pull-right">
                <a href="{{{ URL::to('admin/object-types/create') }}}"
                   class="btn btn-sm  btn-primary"><span
                        class="glyphicon glyphicon-plus-sign"></span> {{ trans("admin/modal.new") }}</a>
            </div>
        </div>
    </h3>
</div>
<!-- Tabs -->
<ul class="nav nav-tabs">
	<li class="active"><a href="#tab-general" data-toggle="tab"> {{
			trans("admin/modal.general") }}</a></li>
    <li><a href="#tab-fields" data-toggle="tab"> {{
            trans("admin/admin.fields") }}</a></li>
    <li>
        <a href="#tab-categories" data-toggle="tab"> {{ trans("admin/admin.categories") }}</a>
    </li>
</ul>
<!-- ./ tabs -->
{{-- Edit Blog Form --}}
<form class="form-horizontal" enctype="multipart/form-data"
	method="post"
	action="@if(isset($objecttype)){{ URL::to('admin/object-types/'.$objecttype->id.'/edit') }}
	        @else{{ URL::to('admin/object-types/create') }}@endif"
	autocomplete="off">
	<!-- CSRF Token -->
	<input type="hidden" name="_token" value="{{{ csrf_token() }}}" />
	<!-- ./ csrf token -->
	<!-- Tabs Content -->
	<div class="tab-content">
		<!-- General tab -->
		<div class="tab-pane active" id="tab-general">
			<div class="tab-pane active" id="tab-general">
				<div class="form-group {{{ $errors->has('name') ? 'has-error' : '' }}}">
					<div class="col-md-12">
						<label class="control-label" for="name"> {{
							trans("admin/admin.name") }}</label> <input
							class="form-control" type="text" name="name" id="name" disabled
							value="{{{ Input::old('name', isset($objecttype) ? $objecttype->name : null) }}}" />
						{!!$errors->first('name', '<span class="help-block">:message </span>')!!}
					</div>
                    <div class="col-md-12">
                        <label class="control-label" for="title"> {{
                            trans("admin/admin.title") }}</label> <input
                            class="form-control" type="text" name="title" id="title"
                            value="{{{ Input::old('title', isset($objecttype) ? $objecttype->title : null) }}}" />
                        {!!$errors->first('title', '<span class="help-block">:message </span>')!!}
                    </div>
                    <div class="col-md-12">
                        <label class="control-label" for="description"> {{
                            trans("admin/admin.description") }}</label> <textarea
                            class="form-control" name="description" id="description">{{{ Input::old('description', isset($objecttype) ? $objecttype->description : null) }}}</textarea>
                        {!!$errors->first('description', '<span class="help-block">:message </span>')!!}
                    </div>
				</div>

			</div>
			<!-- ./ general tab -->
		</div>

@if(isset($objecttype))
        <!-- Fields tab -->
        <div class="tab-pane" id="tab-fields">
            <table id="table" class="table table-striped table-hover">
                <thead>
                <tr>
                    <th>{{{ trans("admin/admin.name") }}}</th>
                    <th>{{{ trans("admin/admin.value") }}}</th>
                    <th>{{{ trans("admin/admin.created_at") }}}</th>
                    <th>{{{ trans("admin/admin.action") }}}</th>
                </tr>
                </thead>
                <tbody></tbody>
            </table>

            {{-- Scripts --}}
            @section('scripts')
            @parent
            <script type="text/javascript">
                var oTable;
                $(document).ready(function () {
                    oTable = $('#table').DataTable({
                        "sDom": "<'row'<'col-md-6'l><'col-md-6'f>r>t<'row'<'col-md-6'i><'col-md-6'p>>",
                        "sPaginationType": "bootstrap",
                        "processing": true,
                        "serverSide": true,
//                        "columnDefs": [ {
//                            "targets": -1,
//                            "data": null,
//                            "defaultContent": "<button>Click!</button>"
//                        } ],
                        "createdRow": function ( row, data, index ) {
                            console.log(row);
                            console.log(data);
                            //if ( data[5].replace(/[\$,]/g, '') * 1 > 150000 ) {
                            var href = $('td a.btn-danger', row).attr('href');
                            //$('td a.btn-danger', row).attr('href', href + '/' + data[0].replace('_field_', ''));
                            //}
                        },
                        "ajax": "{{ URL::to('admin/object-types/'.$objecttype->id.'/fields') }}",
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
                            $.getJSON("{{ URL::to('admin/object-types/reorder') }}", {
                                list: navigationList
                            }, function (data) {
                            });
                        }
                    });
                });
            </script>
            @stop



            <div class="form-group {{{ $errors->has('name') ? 'has-error' : '' }}}">
                <div class="col-md-12">
                    <label class="control-label" for="field_label"> {{
                        trans("admin/admin.label") }}</label> <input
                        class="form-control" type="text" name="field_label" id="field_label"
                        value="" />
                    {!!$errors->first('label', '<span class="help-block">:message </span>')!!}
                </div>
                <div class="col-md-12">
                    <label class="control-label" for="name"> {{
                        trans("admin/admin.name") }}</label> <input
                        class="form-control" type="text" name="field_name" id="field_name"
                        value="" />
                    {!!$errors->first('name', '<span class="help-block">:message </span>')!!}
                </div>
                <div class="col-md-12">
                    <label class="control-label" for="field_type">{{
                        trans("admin/admin.type") }}</label>
                    <select
                        style="width: 100%" name="field_type" id="parent_id"
                        class="form-control">
                        <optgroup label="Basic">
                            <option value="text">Text</option>
                            <option value="textarea">Text Area</option>
                            <option value="number">Number</option>
                            <option value="tel">Phone</option>
                            <option value="email">Email</option>
                            <option value="password">Password</option>
                        </optgroup>
                        <optgroup label="Content">
                            <option value="wysiwyg">Wysiwig</option>
                            <option value="image">Image</option>
                            <option value="file">File</option>
                        </optgroup>
                        <optgroup label="Choice">
                            <option value="select">Select</option>
                            <option value="checkbox">Checkbox</option>
                            <option value="radio">Radio</option>
                            <option value="boolean">True/False</option>
                        </optgroup>
                        <optgroup label="Other">
                            <option value="map">Map</option>
                        </optgroup>
                    </select>
                </div>
                <div class="col-md-12">
                    <label class="control-label" for="field_instructions"> {{
                        trans("admin/admin.instructions") }}</label> <textarea
                        class="form-control" name="field_instructions" id="field_instructions"></textarea>
                    {!!$errors->first('label', '<span class="help-block">:message </span>')!!}
                </div>
                <div class="col-md-12">
                    <label class="control-label" for="field_required"> {{
                        trans("admin/admin.required") }}</label> <input
                        class="form-control" type="checkbox" name="field_required" id="field_required"></textarea>
                    {!!$errors->first('label', '<span class="help-block">:message </span>')!!}
                </div>
            </div>


        </div>

@endif

        @if(isset($objecttype))
        <!-- Fields tab -->
        <div class="tab-pane" id="tab-categories">
            <div id="prefetch">
                <input id="arr" class="typeahead" type="text" placeholder="Categories">
            </div>

            <script>
                var categories = new Bloodhound({
                    datumTokenizer: Bloodhound.tokenizers.whitespace,
                    queryTokenizer: Bloodhound.tokenizers.whitespace,
                    remote: {
                        url: '/admin/categories/search?query=%QUERY' + '&t=' + Date.now(),
                        wildcard: '%QUERY',
                        ajax:{
                            type:"POST",
                            cache:false,
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
//                        filter: function (results) {
//                            return $.map(results, function (result) {
//                                return {
//                                    text: result.title,
//                                    value: result.id
//                                };
//                            });
//                        }
                    }
                });

                $('#prefetch .typeahead').typeahead(null, {
                    name: 'categories',
                    source: categories,
                    display: 'title',
                    templates: {
                        empty: [
                            '<div class="empty-message">',
                            'unable to find any Best Picture winners that match the current query',
                            '</div>'
                        ].join('\n')
                    }
                });
                $('.typeahead').bind('typeahead:select', function(ev, suggestion) {
                    $.ajax({
                        url: 'categories',
                        method: "POST",
                        data: {
                            id  : suggestion.id,
                            _token : '{{{ csrf_token() }}}'
                        },
                        cache: false,
                        success: function(response) {
                            console.log(response);
                            if (response) {
                            }
                        },
                        complete: function(response) {
                            console.log(response);

                        }
                    });
                });
            </script>


            <table id="table-categories" class="table table-striped table-hover">
                <thead>
                <tr>
                    <th>{{{ trans("admin/admin.title") }}}</th>
                    <th>{{{ trans("admin/admin.action") }}}</th>
                </tr>
                </thead>
                <tbody></tbody>
            </table>

            {{-- Scripts --}}
            @section('scripts')
            @parent
            <script type="text/javascript">
                var oTable;
                $(document).ready(function () {
                    oTable = $('#table-categories').DataTable({
                        "sDom": "<'row'<'col-md-6'l><'col-md-6'f>r>t<'row'<'col-md-6'i><'col-md-6'p>>",
                        "sPaginationType": "bootstrap",
                        "processing": true,
                        "serverSide": true,
//                        "columnDefs": [ {
//                            "targets": -1,
//                            "data": null,
//                            "defaultContent": "<button>Click!</button>"
//                        } ],
                        "createdRow": function ( row, data, index ) {
                            console.log(row);
                            console.log(data);
                            //if ( data[5].replace(/[\$,]/g, '') * 1 > 150000 ) {
                            var href = $('td a.btn-danger', row).attr('href');
                            //$('td a.btn-danger', row).attr('href', href + '/' + data[0].replace('_field_', ''));
                            //}
                        },
                        "ajax": "{{ URL::to('admin/object-types/'.$objecttype->id.'/categories') }}",
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
                            $.getJSON("{{ URL::to('admin/object-types/reorder') }}", {
                                list: navigationList
                            }, function (data) {
                            });
                        }
                    });
                });
            </script>
            @stop

        </div>

        @endif
    </div>
		<!-- Form Actions -->

		<div class="form-group">
			<div class="col-md-12">
				<button type="reset" class="btn btn-sm btn-warning close_popup">
					<span class="glyphicon glyphicon-ban-circle"></span> {{
					trans("admin/modal.cancel") }}
				</button>
				<button type="reset" class="btn btn-sm btn-default">
					<span class="glyphicon glyphicon-remove-circle"></span> {{
					trans("admin/modal.reset") }}
				</button>
				<button type="submit" class="btn btn-sm btn-success">
					<span class="glyphicon glyphicon-ok-circle"></span> 
					@if (isset($objecttype))
						{{ trans("admin/modal.edit") }}
					@else 
						{{trans("admin/modal.create") }}
				    	@endif
				</button>
			</div>
		</div>
		<!-- ./ form actions -->

</form>


@stop
