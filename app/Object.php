<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

/**
 * Class Object
 * @package App
 */
class Object extends Model
{
    /**
     * Get the object's parent
     *
     * @return Object
     */
    public function parent()
    {
        return $this->belongsTo('App\Object', 'parent_id');
    }

    /**
     * Get the object's author
     *
     * @return User
     */
    public function author()
    {
        return $this->belongsTo('App\User', 'author_id');
    }

    public function scopeParent($query) {
        return $query->whereNull('parent_id');
    }

    public function getValue($key) {
        return ObjectMeta::getValue($this->id, $key);
    }

    public function setValue($key, $value) {
        return ObjectMeta::setValue($this->id, $key, $value);
    }

    public function addValue($key, $value) {
        return ObjectMeta::addValue($this->id, $key, $value);
    }

    public static function getTypes() {
        return Object::where('name', 'LIKE', '_object_type_%');
    }

    public static function getType($name) {
        return Object::where('name', '=', "_object_type_$name");
    }

    public static function getFields($id) {
        return ObjectMeta::where('object_id', $id)
            ->where('meta_key', 'LIKE', '_field_%');
    }

    public static function getField($id, $name) {
        return ObjectMeta::where('object_id', $id)
            ->where('meta_key', '=', '_field_'. $name);
    }
}
