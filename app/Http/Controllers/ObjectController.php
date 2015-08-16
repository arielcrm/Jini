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
            if ($categoryFeaturedImageId = ObjectMeta::getValue($categoryId, '_featured_image')) {
                $featuredImageUrl = getImageSrc($categoryFeaturedImageId, 'thumbnail');
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

            foreach ($objects as $object) {
                if ($featuredImageId = ObjectMeta::getValue($object['id'], '_featured_image')) {
                    $object['featured_image']  = Url('/uploads/' . getImageSrc($featuredImageId, 'thumbnail'));
                }
            }
        }

        return $objects;
    }

    public function getLocations() {
        $results = $this->getSearch();

        $data = array();
        $locations = array(
            'type' => 1,
            'userMsg' => false
        );

        if ( !empty( $results ) ) {
            foreach ( $results as $result ) {
                if ( $lat = ObjectMeta::getValue($result['id'], '_field_address-location-g') ) {
                    if ( $long = ObjectMeta::getValue($result['id'], '_field_address-location-k' ) )  {
                        $location = array(
                            'geo_latitude' => $lat,
                            'geo_longitude' => $long,
                            'location' => '',
                            'title' => $result['title']
                        );

                        $data[] = $location;
                    }
                }
            }
        }

        $locations['data'] = $data;

        return $locations;
        //return view('partials.map', compact( 'locations' ));
    }


    public function getMap() {
        if ( $queryString = $_SERVER['QUERY_STRING'] ) {
            $criteria = '?' . $queryString;
        }

        return view('partials.map', compact( 'criteria' ));
    }
}
