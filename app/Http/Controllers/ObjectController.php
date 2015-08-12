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
            // Category Image
            if ($featuredImageId = ObjectMeta::getValue($categoryId, '_featured_image')) {
                $featuredImageUrl = getImageSrc($featuredImageId, 'thumbnail');
            }


            // Get objects where in category
            $objects = Object::Where('type', 'object_type')
                ->whereExists(function ( $query ) use ( $categoryId ) {
                    $query->select(DB::raw(1))
                    ->from('object_meta')
                    ->whereRaw(DB::getTablePrefix() . 'object_meta.object_id = ' . DB::getTablePrefix() . 'objects.id')
                    ->where('meta_key', '_category_id')
                    ->where('meta_value', $categoryId);
                })
                ->select(DB::raw('substr(name, 14) as field_name'))
                ->get()
                ->toArray();

            $types = array_map(function($v) {
                return $v['field_name'];
            }, $objects);

            if ( !empty( $types ) ) {
                $objects = Object::whereIn('type', $types);
            }


        }

        if ( $objects ) {
            $objects = $objects
            ->select( array( 'objects.id', DB::raw( '"/uploads/'. $featuredImageUrl . '"' . ' as featured_image'), 'objects.name', 'objects.title', 'objects.excerpt' ) )
            ->get();
        }

        return $objects;
    }
}
