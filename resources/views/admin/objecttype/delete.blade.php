@extends('admin.layouts.default')

{{-- Web site Title --}}
@section('title') {{{ trans("admin/objecttype.objecttypes") }}}
:: @parent @stop

{{-- Content --}}
@section('main')
<div class="page-header">
    <h3>
        {{{ trans("admin/objecttype.objecttypes") }}}
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
	<li class="active"><a href="#tab-general" data-toggle="tab">{{
			trans("admin/modal.general") }}</a></li>
</ul>
<!-- ./ tabs -->
{{-- Delete Post Form --}}
<form id="deleteForm" class="form-horizontal" method="post"
	action="@if (isset($objecttype)){{ URL::to('admin/object-types/' . $objecttype->id . '/delete') }}@endif"
	autocomplete="off">

	<!-- CSRF Token -->
	<input type="hidden" name="_token" value="{{{ csrf_token() }}}" /> <input
		type="hidden" name="id" value="{{ $objecttype->id }}" />
	<!-- <input type="hidden" name="_method" value="DELETE" /> -->
	<!-- ./ csrf token -->

	<!-- Form Actions -->
	<div class="form-group">
		<div class="controls">
			{{ trans("admin/modal.delete_message") }}<br>
			<element class="btn btn-warning btn-sm close_popup">
			<span class="glyphicon glyphicon-ban-circle"></span> {{
			trans("admin/modal.cancel") }}</element>
			<button type="submit" class="btn btn-sm btn-danger">
				<span class="glyphicon glyphicon-trash"></span> {{
				trans("admin/modal.delete") }}
			</button>
		</div>
	</div>
	<!-- ./ form actions -->
</form>
@stop
