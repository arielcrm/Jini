@extends('admin.layouts.default')

{{-- Web site Title --}}
@section('title') {{{ trans("admin/admin.objects") }}}
:: @parent @stop

{{-- Content --}}
@section('main')
<div class="page-header">
    <h3>
        {{{ trans("admin/admin.objects") }}} @if (isset($object)) - {{ $object->title }} @endif
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
</ul>
<!-- ./ tabs -->
{{-- Edit Blog Form --}}
<form class="form-horizontal" enctype="multipart/form-data"
	method="post"
	action="@if(isset($object)){{ URL::to('admin/objects/'.$object->id.'/edit') }}
	        @else{{ URL::to('admin/objects/create') }}@endif"
	autocomplete="off">
	<!-- CSRF Token -->
	<input type="hidden" name="_token" value="{{{ csrf_token() }}}" />
    <input type="hidden" name="_object_type" value="{{{ Input::get('type') }}}" />
	<!-- ./ csrf token -->
	<!-- Tabs Content -->
	<div class="tab-content">
		<!-- General tab -->
		<div class="tab-pane active" id="tab-general">
			<div class="tab-pane active" id="tab-general">
				<div class="form-group {{{ $errors->has('name') ? 'has-error' : '' }}}">
                    <div class="col-md-12">
                        <label class="control-label" for="type">{{
                            trans("admin/admin.type") }}</label>

                        @if(!isset($object)) :
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
                        @else
                            {{ $object->type }}
                        @endif
                    </div>
					<div class="col-md-12">
						<label class="control-label" for="name"> {{
							trans("admin/admin.name") }}</label> <input
							class="form-control" type="text" name="name" id="name" disabled
							value="{{{ Input::old('name', isset($object) ? $object->name : null) }}}" />
						{!!$errors->first('name', '<span class="help-block">:message </span>')!!}
					</div>
                    <div class="col-md-12">
                        <label class="control-label" for="title"> {{
                            trans("admin/admin.title") }}</label> <input
                            class="form-control" type="text" name="title" id="title"
                            value="{{{ Input::old('title', isset($object) ? $object->title : null) }}}" />
                        {!!$errors->first('title', '<span class="help-block">:message </span>')!!}
                    </div>
                    <div class="col-md-12">
                        <label class="control-label" for="content"> {{
                            trans("admin/admin.content") }}</label> <textarea
                            class="form-control" name="content" id="content">{{{ Input::old('content', isset($object) ? $object->content : null) }}}</textarea>
                        {!!$errors->first('content', '<span class="help-block">:message </span>')!!}
                    </div>

                    @foreach($fieldControls as $fieldControl)
                    {{{ $fieldControl }}}
                    @endforeach

                    @if (!empty($fields)) :
                    @foreach($fields as $field)
                    <div class="col-md-12">
                        <label class="control-label" for="label"> {{ $field['label'] }}</label>

<!--                        @if ($field['type'] == 'text') :-->
<!--                        <input-->
<!--                            class="form-control" type="text" name="{{{ $field['id'] }}}" id="{{{ $field['id'] }}}"-->
<!--                            value="{{{ isset( $values[$field['id']] ) ? $values[$field['id']] : null }}}" />-->
<!--                        {!!$errors->first('label', '<span class="help-block">:message </span>')!!}-->
<!--                        @endif-->
<!--                        @if ($field['type'] == 'wysiwyg') :-->
<!--                        <textarea-->
<!--                            class="form-control" type="text" name="{{{ $field['id'] }}}" id="{{{ $field['id'] }}}"-->
<!--                            >{{{ isset( $values[$field['id']] ) ? $values[$field['id']] : null }}}</textarea>-->
<!--                        {!!$errors->first('label', '<span class="help-block">:message </span>')!!}-->
<!--                        @endif-->
                    </div>
                    @endforeach
                    @endif



				</div>

			</div>
		</div>
    </div>
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
                @if (isset($object))
                    {{ trans("admin/modal.edit") }}
                @else
                    {{trans("admin/modal.create") }}
                    @endif
            </button>
        </div>
    </div>
</form>
@stop
