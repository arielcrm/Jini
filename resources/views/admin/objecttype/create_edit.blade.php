@extends('admin.layouts.default')

{{-- Web site Title --}}
@section('title') {{{ trans("admin/objecttype.objecttypes") }}}
:: @parent @stop

{{-- Content --}}
@section('main')
<div class="page-header">
    <h3>
        {{{ trans("admin/objecttype.objecttypes") }}} @if (isset($objecttype)) - {{ $objecttype->display_name }} @endif
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
							class="form-control" type="text" name="name" id="name"
							value="{{{ Input::old('name', isset($objecttype) ? $objecttype->name : null) }}}" />
						{!!$errors->first('name', '<span class="help-block">:message </span>')!!}
					</div>
                    <div class="col-md-12">
                        <label class="control-label" for="name"> {{
                            trans("admin/admin.display_name") }}</label> <input
                            class="form-control" type="text" name="display_name" id="display_name"
                            value="{{{ Input::old('display_name', isset($objecttype) ? $objecttype->display_name : null) }}}" />
                        {!!$errors->first('display_name', '<span class="help-block">:message </span>')!!}
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
        <!-- General tab -->
        <div class="tab-pane active" id="tab-fields">
            <div class="tab-pane active" id="tab-fields">
                <div class="form-group {{{ $errors->has('name') ? 'has-error' : '' }}}">

                </div>

            </div>
            <!-- ./ general tab -->
        </div>

		<!-- ./ tabs content -->
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
