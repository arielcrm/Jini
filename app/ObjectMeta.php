<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class ObjectMeta extends Model
{
    protected $table = 'object_meta';

    /**
     * Get the object's author.
     *
     * @return User
     */
    public function object()
    {
        return $this->belongsTo('App\Object', 'object_id');
    }

    public static function getMeta($objectId, $metaKey) {
        return ObjectMeta::where('object_id', $objectId)
            ->where('meta_key', $metaKey)->first();
    }

    public static function getValue($objectId, $metaKey) {
        if ($objectMeta = ObjectMeta::getMeta($objectId, $metaKey)) {
            return $objectMeta->meta_value;
        }
    }

    public static function setValue($objectId, $metaKey, $metaValue) {
        if (isset($metaValue)) {
            if (!$objectMeta = ObjectMeta::getMeta($objectId, $metaKey)) {
                $objectMeta = new ObjectMeta();
                $objectMeta->object_id = $objectId;
            }
            $objectMeta->meta_key = $metaKey;
            $objectMeta->meta_value = $metaValue;

            return $objectMeta->save();
        }
    }

    public static function addValue($objectId, $metaKey, $metaValue) {
        if (isset($metaValue)) {
            $objectMeta = ObjectMeta::getMeta($objectId, $metaKey);

            if ( !isset( $objectMeta ) || $objectMeta->meta_value != $metaValue ) {
                $objectMeta = new ObjectMeta();
                $objectMeta->object_id = $objectId;
            }

            $objectMeta->meta_key = $metaKey;
            $objectMeta->meta_value = $metaValue;

            return $objectMeta->save();
        }
    }
}
