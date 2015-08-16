<div class="col-md-12">
    <label class="control-label" for="label"> {{ $field['label'] }}</label>
    {!!  Form::checkbox( $field['id'], !empty( $values ) && !empty( $values[0] ) ? $values[0] : null , !empty( $values ) && !empty( $values[0] ) ? true : false) !!}
    {!! $errors->first('label', '<span class="help-block">:message </span>') !!}
</div>