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
                <a href="{{{ URL::to('admin/objects/create') }}}"
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
<form class="form-horizontal" id="fupload" enctype="multipart/form-data"
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
                    <div class="col-md-8">
                        <div
                            <div class="col-md-12">
                                <label class="control-label" for="type">{{
                                    trans("admin/admin.type") }}</label>

                                @if (isset($object))
                                {{ $object->type }}
                                @else
                                @if(!empty($types) ) :
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
                            @if ( !empty( $fieldControls ) ) :
                            @foreach($fieldControls as $fieldControl)
                                {!! $fieldControl !!}
                            @endforeach
                            @endif
                    </div>
                    <div class="col-md-4">
                        <div
                            class="form-group {{{ $errors->has('featuredImage') ? 'error' : '' }}}">
                            <div class="col-lg-12">
                                <label class="control-label" for="featuredImage">{{
                                    trans("admin/admin.featured_image") }}</label>
                                @if (!empty($featuredImage))
                                <img src="{{ URL::to('/uploads/' . $featuredImage) }}" />
                                @endif
                                <input name="featuredImage" type="file" class="uploader" id="featuredImage" value="Upload" />
                            </div>

                        </div>
                        <div
                            class="form-group {{{ $errors->has('contentImage') ? 'error' : '' }}}">
                            <div class="col-lg-12">
                                <label class="control-label" for="contentImage">{{
                                    trans("admin/admin.content_image") }}</label>
                                @if (!empty($contentImage))
                                <img src="{{ URL::to('/uploads/' . $contentImage) }}" />
                                @endif
                                <input name="contentImage" type="file" class="uploader" id="contentImage" value="Upload" />
                            </div>

                        </div>
                    </div>

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
