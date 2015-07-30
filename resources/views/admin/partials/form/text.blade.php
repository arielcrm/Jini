<div class="col-md-12">
    <label class="control-label" for="label"> {{ $field['label'] }}</label>
    <input class="form-control" type="text" name="{{{ $field['id'] }}}" id="{{{ $field['id'] }}}"
    value="{{{ isset( $field['value'] ) ? $field['value'] : null }}}" />
{!!$errors->first('label', '<span class="help-block">:message </span>')!!}
</div>