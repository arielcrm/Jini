<div class="col-md-12">
    <label class="control-label" for="label"> {{ $field['label'] }}</label>
    <textarea
        class="form-control" type="text" name="{{{ $field['id'] }}}" id="{{{ $field['id'] }}}"
        >{{{ isset( $field['value'] ) ? $field['value'] : null }}}</textarea>
    {!!$errors->first('label', '<span class="help-block">:message </span>')!!}
</div>