<div class="col-md-12">
    <label class="control-label" for="label"> {{ $field['label'] }}</label>
    <input class="form-control" type="email" name="{{{ $field['id'] }}}" id="{{{ $field['id'] }}}"
    value="{{{ !empty( $values ) && !empty( $values[0] ) ? $values[0] : null }}}" />
{!!$errors->first('label', '<span class="help-block">:message </span>')!!}
</div>