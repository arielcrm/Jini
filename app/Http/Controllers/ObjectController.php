<?php namespace App\Http\Controllers;

use App\Object;

use App\Http\Controllers\Controller;
use App\ObjectMeta;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Input;


class ObjectController extends Controller {
    private function processObject(&$object) {
        if ($featuredImageId = ObjectMeta::getValue($object->id, '_featured_image')) {
            $object->featured_image  = Url('/uploads/' . getImageSrc($featuredImageId, 'medium'));
        }


        if ($contentImageId = ObjectMeta::getValue($object->id, '_content_image')) {
            $object->content_image  = Url('/uploads/' . getImageSrc($contentImageId, 'medium'));
        }

        $object->excerpt = htmlentities( strlen($object->excerpt) > 50 ? substr($object->excerpt, 1, 50) . '...' : $object->excerpt );

        $object->phone = ObjectMeta::getValue($object->id, '_field_phone' );
        $object->email = ObjectMeta::getValue($object->id, '_field_email' );
        $object->occupation= ObjectMeta::getValue($object->id, '_field_occupation' );
        $object->address= ObjectMeta::getValue($object->id, '_field_address' );
        $object->address_location_g= ObjectMeta::getValue($object->id, '_field_address-location-g' );
        $object->address_location_k= ObjectMeta::getValue($object->id, '_field_address-location-k' );
        $object->address_street= ObjectMeta::getValue($object->id, '_field_address-address' );
        $object->address_city= ObjectMeta::getValue($object->id, '_field_address-city' );
        $object->address_country= ObjectMeta::getValue($object->id, '_field_address-country' );

        if ( $french_speakers = ObjectMeta::getValue($object->id, '_field_french_speakers' ) ) {
            $object->french_speakers= 'Franchophone';
        }

        $object->promoted= ObjectMeta::getValue($object->id, '_field_promoted' );
    }
    
    public function get($id) {
        if ( $object = Object::select( array( 'objects.id', 'objects.name', 'objects.title', 'objects.excerpt' ) )
            ->where('id', $id)
            ->first() ) {
            $this->processObject($object);

            return $object;
        }
    }
    
    public function getSearch() {
        $categoryId = Input::get('categoryid');
        $index = Input::get('index') ?: 0;
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


            $objects = DB::table('objects')
                ->whereIn('type', $types)
                ->select( array( 'objects.id', DB::raw( '"/uploads/'. $featuredImageUrl . '"' . ' as featured_image'), 'objects.name', 'objects.title', 'objects.excerpt' ) );

            $objects = DB::table('objects')
                ->whereIn('type', $types)
                ->select( array( 'objects.id', DB::raw( '"/uploads/'. $featuredImageUrl . '"' . ' as featured_image'), 'objects.name', 'objects.title', 'objects.excerpt' ) )
                ->whereExists(function ( $query ) {
                    $query->select(DB::raw(1))
                        ->from('object_meta')
                        ->whereRaw(DB::getTablePrefix() . 'object_meta.object_id = ' . DB::getTablePrefix() . 'objects.id')
                        ->where('meta_key', '_field_promoted')
                        ->where('meta_value', '1');
                })->
                union($objects);

        } else {
            if ( $search ) {
                $objects = Object::whereNotIn('type', ['object_type', 'image'])
                    ->where(function( $query ) use ( $search ) {
                        $query->where('title', 'LIKE', '%' . $search . '%')
                            ->orWhere('name', 'LIKE', '%' . $search . '%');
                    })
                    ->select('id', 'type', 'title')
                    ->get();

                return response( $objects );
            }
        }


        if ( $objects ) {
            $objects = $objects
            ->skip($index)
            ->take(50)
            ->get();

            foreach ($objects as $object) {
                $this->processObject($object);
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
                if ( $lat = ObjectMeta::getValue($result->id, '_field_address-location-g') ) {
                    if ( $long = ObjectMeta::getValue($result->id, '_field_address-location-k' ) )  {
                        $location = array(
                            'geo_latitude' => $lat,
                            'geo_longitude' => $long,
                            'location' => '',
                            'title' => $result['title'],
                            'excerpt' => $result['excerpt']
                        );

                        if ($contentImageId = ObjectMeta::getValue($result->id, '_content_image')) {
                            $location['content_image']  = Url('/uploads/' . getImageSrc($contentImageId, 'medium'));
                        } else {
                            $location['content_image'] = '';
                        }

                        $location['address_street']= ObjectMeta::getValue($result->id, '_field_address-address' );
                        $location['address_city']= ObjectMeta::getValue($result->id, '_field_address-city' );
                        $location['address_country']= ObjectMeta::getValue($result->id, '_field_address-country' );


                        $location['promoted'] = ObjectMeta::getValue($result->id, '_field_promoted' );

                        $data[] = $location;
                    }
                }
            }
        }

        $locations['data'] = $data;

        return $locations;
        //return view('partials.map', compact( 'locations' ));
    }

    public function getContent($id) {
        if ($id) {
            if ($object = Object::find($id)) {
                return $object->content;
            }
        }
    }

    public function getMap() {
        if ( $queryString = $_SERVER['QUERY_STRING'] ) {
            $criteria = '?' . $queryString;
        }

        return view('partials.map', compact( 'criteria' ));
    }
}
