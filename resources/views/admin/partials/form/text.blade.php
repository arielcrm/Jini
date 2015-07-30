<input
    class="form-control" type="text" name="{{{ $field['id'] }}}" id="{{{ $field['id'] }}}"
    value="{{{ isset( $values[$field['id']] ) ? $values[$field['id']] : null }}}" />
{!!$errors->first('label', '<span class="help-block">:message </span>')!!}