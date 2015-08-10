<?php namespace App\Http\Controllers;

use App\Object;

use App\Http\Controllers\Controller;
use App\ObjectMeta;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Input;


class ObjectController extends Controller {

    public function getSearch() {
        $categoryId = Input::get('categoryid');
        $search = Input::get('query');

        $objects = null;

        if ( $categoryId ) {
            // Get objects where in category
            $objects = Object::Where('type', 'object_type')
                ->whereExists(function ( $query ) use ( $categoryId ) {
                    $query->select(DB::raw(1))
                    ->from('object_meta')
                    ->whereRaw(DB::getTablePrefix() . 'object_meta.object_id = ' . DB::getTablePrefix() . 'objects.id')
                    ->where('meta_key', '_category_id')
                    ->where('meta_value', $categoryId);
                })
                ->select('SUBSTRING(name, 1,2) AS s');

//                ::join('object_meta', 'objects.id', '=', 'object_meta.object_id')
//                ->where('object_meta.meta_key', '_category_id')
//                ->where('object_meta.meta_value', $categoryId)
//                ->whereNotIn('type', ['object_type', 'image', 'category']);
//
//            // Get objects where types category
//            $objects = Object::join('object_meta', 'objects.id', '=', 'object_meta.object_id')
//                ->where('object_meta.meta_key', '_category_id')
//                ->where('object_meta.meta_value', $categoryId)
//                ->where('type', 'object_type');

        }

        if ( $objects ) {
            $objects = $objects
            //->select( array( 'objects.id', 'objects.name', 'objects.title' ) )
            ->get();
        }

        return $objects;
    }
}
