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
                        class="glyphicon glyphicon-plus-sign"></span> {{ trans("admin/admin.new") }}</a>
            </div>
        </div>
    </h3>
</div>
<ul class="nav nav-tabs">
    <li class="active"><a href="#tab-general" data-toggle="tab"> {{
            trans("admin/admin.general") }}</a></li>
</ul>
<form class="form-horizontal" enctype="multipart/form-data"
      method="post"
      action="@if(isset($object)){{ URL::to('admin/categories/'.$object->id.'/edit') }}
	        @else{{ URL::to('admin/categories/create') }}@endif"
      autocomplete="off">
    <input type="hidden" name="_token" value="{{{ csrf_token() }}}" />
    <div class="tab-content">
        <div class="tab-pane active" id="tab-general">
            <div class="tab-pane active" id="tab-general">
                <div
                    class="form-group {{{ $errors->has('title') ? 'has-error' : '' }}}">
                    <div class="col-md-12">
                        <label class="control-label" for="title"> {{
                            trans("admin/admin.title") }}</label> <input
                            class="form-control" type="text" name="title" id="title"
                            value="{{{ Input::old('title', isset($object) ? $object->title : null) }}}" />
                        {!!$errors->first('title', '<label class="control-label">:message</label>')!!}
                    </div>
                </div>
                <div class="form-group {{{ $errors->has('parent_id') ? 'error' : '' }}}">
                    <div class="col-md-12">
                        <label class="control-label" for="parent_id">{{
                            trans("admin/admin.parent") }}</label>
                        <select
                            style="width: 100%" name="parent_id" id="parent_id"
                            class="form-control"> <option value="" text=""></option> @foreach($categories as $item)
                            <option value="{{$item->id}}"
                            @if(!empty($parent_id))
                            @if($item->id==$parent_id)
                            selected="selected" @endif @endif >{{$item->name}}</option>
                            @endforeach
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <div class="col-md-12">
                        <label class="control-label" for="content">{{
                            trans("admin/admin.content") }}</label>
                        <textarea class="form-control full-width wysihtml5"
                                  name="content" rows="10">{{{ Input::old('content', isset($object) ? $object->content : null) }}}</textarea>
                    </div>
                </div>
            </div>
        </div>
        <div class="form-group">
            <div class="col-md-12">
                <button type="reset" class="btn btn-sm btn-warning close_popup">
                    <span class="glyphicon glyphicon-ban-circle"></span> {{
                    trans("admin/admin.cancel") }}
                </button>
                <button type="reset" class="btn btn-sm btn-default">
                    <span class="glyphicon glyphicon-remove-circle"></span> {{
                    trans("admin/admin.reset") }}
                </button>
                <button type="submit" class="btn btn-sm btn-success">
                    <span class="glyphicon glyphicon-ok-circle"></span>
                    @if	(isset($object))
                    {{ trans("admin/admin.edit") }}
                    @else
                    {{trans("admin/admin.create") }}
                    @endif
                </button>
            </div>
        </div>
    </div>
</form>
@stop
