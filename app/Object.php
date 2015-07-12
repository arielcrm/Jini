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
}
