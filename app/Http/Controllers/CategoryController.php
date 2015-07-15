<?php namespace App\Http\Controllers;

use App\Object;

use App\Http\Controllers\Controller;
use App\ObjectMeta;
use Illuminate\Support\Facades\DB;


class CategoryController extends Controller {

    public function getCategories($id = null) {
        //Config::set('laravel-debugbar::config.enabled', false);

        $categories = Object::where('objects.type', 'category')
            ->where('parent_id', $id)
            ->select(array('objects.id', 'objects.title', 'objects.name'))
            ->get();


        $response = $categories;

        foreach ($categories as $category) {
            if ($contentImageId = ObjectMeta::getValue($category->id, '_content_image')) {
                if ($contentImageUrl = getImageSrc($contentImageId, 'thumbnail')) {
                    $category['contentImageUrl'] = '/uploads/' . $contentImageUrl;
                }
            }
        }

//        $categories = Object::leftJoin('objects as t1', function($join) {
//            $join->on('objects.id', '=', 't1.parent_id');
//        })
//            ->where('objects.type', 'category')
//        //->whereNull('objects.parent_id')
//            ->where('t1.parent_id', $id)
//            ->select(DB::raw('jini_t1.*'))
//            ->get();



        //print_r($categories);
//
//        $response = array(
//            'categories' => $categories
//            //'contentImage' =>
//        );

        return response()->json( $categories );
    }

    public function getCategoryContent($id) {
        if ($id) {
            $category = Object::find($id);

            return $category->content;

        }
    }
}
