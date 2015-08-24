<?php namespace App\Http\Controllers\Admin;

use App\Object;
use App\ObjectType;
use App\ObjectMeta;
use App\Helpers\Hash;
use App\Language;
use App\Http\Controllers\AdminController;
use App\Http\Requests\Admin\ObjectRequest;
use App\Http\Requests\Admin\DeleteRequest;
use App\Http\Requests\Admin\ObjectImportRequest;
use App\Http\Requests\Admin\ReorderRequest;
use DoctrineTest\InstantiatorTestAsset\UnserializeExceptionArrayObjectAsset;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Input;
use Illuminate\View\Factory;
use Illuminate\View\View;
use Datatables;

use Maatwebsite\Excel\Facades\Excel;


class ObjectController extends AdminController {

	/**
	 * Display a listing of the resource.
	 *
	 * @return Response
	 */
	public function index()
	{
        $objecttype = null;

        if ( $type = Input::get('type') ) {
            $objecttype = Object::where('type', 'object_type')
                ->where('name', '_object_type_' . $type )
                ->first();

            if ( $objecttype ) {
                $objecttype->name = str_replace( '_object_type_', '', $objecttype->name );
            }
        }


        $types = Object::getTypes()->select(array('id', DB::raw("REPLACE(name, '_object_type_', '') as name"), DB::raw("REPLACE(title, 'Object Type: ', '') as title"), 'created_at' ))->get();

        return view('admin.object.index', compact( 'objecttype', 'types' ) );
	}

    public function postIndex(ObjectImportRequest $request) {
        if($request->hasFile('dd')) {
//            echo 'adasdasdasdasd';
//            echo 'sadfsda';
//            print_r($_FILES);
//            abort(500, 'sadfdsfs');
            $file = $request->file('dd');
            $filename = $file->getClientOriginalName();
            $extension = $file->getClientOriginalExtension();
            $mimeType = $file->getMimeType();

            $destinationPath = public_path() . '/temp/';

            $request->file('dd')->move($destinationPath, 'import.xls');


            return redirect('admin/objects')->with('message', 'Type saved successfully');
        }
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return Response
     */
    public function getCreate()
    {
        if ($typeName = Input::get('type')) {
            if ($type = Object::getType($typeName)->first()) {
                $fieldsRows = Object::getFields($type->id)->get();

                $fields = array();
                $fieldControls = array();

                // Occupation
                $field = array();
                $field['id'] = '_field_occupation';
                $field['name'] = 'occupation';
                $field['label'] = 'Occupation';
                $field['type'] = 'text';
                $field['instructions'] = '';
                $field['required'] = 0;

                $fieldControls[] = view('admin.partials.form.text', compact( 'field' ) );

                // Address
                $uniqueId = Hash::getUniqueId();

                $field = array();
                $field['id'] = '_field_address';
                $field['name'] = 'address';
                $field['label'] = 'Address';
                $field['type'] = 'map';
                $field['instructions'] = '';
                $field['required'] = 0;

                $fieldControls[] = view('admin.partials.form.map', compact( 'field', 'uniqueId' ) );

                // French
                $field = array();
                $field['id'] = '_field_french_speakers';
                $field['name'] = 'french_speakers';
                $field['label'] = 'French Speakers';
                $field['type'] = 'boolean';
                $field['instructions'] = '';
                $field['required'] = 0;

                $fieldControls[] = view('admin.partials.form.boolean', compact( 'field' ) );

                // Address
                $field = array();
                $field['id'] = '_field_phone';
                $field['name'] = 'phone';
                $field['label'] = 'Phone';
                $field['type'] = 'tel';
                $field['instructions'] = '';
                $field['required'] = 0;

                $fieldControls[] = view('admin.partials.form.tel', compact( 'field' ) );

                // Email
                $field = array();
                $field['id'] = '_field_email';
                $field['name'] = 'email';
                $field['label'] = 'Email';
                $field['type'] = 'email';
                $field['instructions'] = '';
                $field['required'] = 0;

                $fieldControls[] = view('admin.partials.form.email', compact( 'field' ) );




                foreach ($fieldsRows as $fieldRow) {
                    $field = unserialize($fieldRow['meta_value']);
                    $fields[] = $field;

                    $uniqueId = Hash::getUniqueId();

                    switch ($field['type']) {
                        case 'text':
                            $fieldControls[] = view('admin.partials.form.text', compact( 'field', 'uniqueId' ) );
                            break;
                        case 'wysiwyg':
                            $fieldControls[] = view('admin.partials.form.wysiwyg', compact( 'field', 'uniqueId' ) );
                            break;
                        case 'map':
                            $fieldControls[] = view('admin.partials.form.map', compact( 'field', 'uniqueId' ) );
                            break;
                        case 'tel':
                            $fieldControls[] = view('admin.partials.form.tel', compact( 'field', 'uniqueId' ) );
                            break;
                        case 'boolean':
                            $fieldControls[] = view('admin.partials.form.boolean', compact( 'field', 'uniqueId' ) );
                            break;
                    }

                }
            }
        }



        $types = Object::getTypes()->select(array('id', DB::raw("REPLACE(name, '_object_type_', '') as name"), DB::raw("REPLACE(title, 'Object Type: ', '') as title"), 'created_at' ))->get();

        return view('admin.object.create_edit', compact('fields', 'fieldControls', 'featuredImage', 'contentImage', 'types'));
    }


    public function postImport(ObjectImportRequest $request) {
        if ( $type = Input::get('type') )  {
            if ( $format = Input::get('format') )  {
                switch ($format) {
                    case 'excel':
                        if ($request->hasFile('dd')) {
                            $file = $request->file('dd');
                            $filename = $file->getClientOriginalName();
                            $extension = $file->getClientOriginalExtension();
                            $mimeType = $file->getMimeType();

                            $destinationPath = public_path() . '/temp';

                            $request->file('dd')->move($destinationPath, 'import.xls');

                            Excel::load($destinationPath . '/import.xls', function($reader) use ($type) {
                                if ( $rows = $reader->all() ) {
                                    foreach ( $rows as $row ) {
                                        $data = $row->toArray();

                                        $name = $data['name'];
                                        if (!$name) {
                                            $name = str_replace(' ', '-', $data['title']);
                                        }

                                        $object = new Object();
                                        $object->author_id = Auth::user()->id;
                                        $object->type = $type;
                                        $object->name = $name;
                                        $object->title = $data['title'];
                                        $object->content = $data['content'];
                                        $object->status = 'published';
                                        $object->guid = Hash::getUniqueId();
                                        $object->save();

                                        $keys = array_keys($data);
                                        foreach ( $keys as $key ) {
                                            if ( !in_array($key, array('type', 'title', 'name', 'content', 'excerpt' ) ) ) {
                                                $val = $data[$key];

                                                if ( !empty( $val ) ) {
                                                    $object->setValue('_field_' . $key, $val);
                                                }
                                            }
                                        }
                                    }
                                }
                            });
                        }
                        break;
                }
            }
        }
    }

    /**
     * Store a newly created resource in storage.
     *
     * @return Response
     */
    public function postCreate(ObjectRequest $request)
    {
        $object = new Object();
        $object -> author_id = Auth::user()->id;
        $object -> type = $request->_object_type;
        $object -> name = str_replace(' ', '-', $request->title);
        $object -> title = $request->title;
        $object -> status = 'published';
        $object -> guid = Hash::getUniqueId();
        $object -> save();


        foreach ( array_keys($_POST) as $key ) {
            if ( substr($key, 0, 7) == '_field_' ) {
                $object->setValue($key, $request->input($key));
            }
        }


        if($request->hasFile('featuredImage'))
        {
            $file = $request->file('featuredImage');
            $filename = $file->getClientOriginalName();
            $extension = $file->getClientOriginalExtension();
            $mimeType = $file->getMimeType();

            $destinationPath = public_path() . '/uploads/';
            $newfileName = sha1($filename . time());
            $picture = $newfileName . '.' . $extension;

            $request->file('featuredImage')->move($destinationPath, $picture);

            if ($imageObject = addImage($object, $destinationPath, $picture, $filename, $newfileName, $extension, $mimeType, '_featured_image')) {
            }
        }

        if($request->hasFile('contentImage'))
        {
            $file = $request->file('contentImage');
            $filename = $file->getClientOriginalName();
            $extension = $file->getClientOriginalExtension();
            $mimeType = $file->getMimeType();

            $destinationPath = public_path() . '/uploads/';
            $newfileName = sha1($filename . time());
            $picture = $newfileName . '.' . $extension;

            $request->file('contentImage')->move($destinationPath, $picture);

            if ($imageObject = addImage($object, $destinationPath, $picture, $filename, $newfileName, $extension, $mimeType, '_content_image')) {
            }
        }


        return redirect('admin/object-types')->with('message', 'Type saved successfully');
    }

    public function getFieldValues($id, $field) {
        $values = array();
        $valuesMeta = ObjectMeta::where('object_id', $id)
            ->where('meta_key', 'LIKE', $field['id'].'%')
            ->get();

        foreach ( $valuesMeta as $valueMeta ) {
            $valueMetaKey = str_replace( $field['id'], '', $valueMeta['meta_key']);

            if ( substr( $valueMetaKey, 0, 1 ) == '-' ) {
                $valueMetaKey = substr( $valueMetaKey, 1);
            }

            if ($valueMetaKey) {
                $values[$valueMetaKey] = $valueMeta['meta_value'];
            } else {
                $values[] = $valueMeta['meta_value'];
            }
        }

        return $values;
    }


    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return Response
     */
    public function getEdit($id)
    {
        $data = Object::get();

        $object = Object::find($id);

        if ($typeName = $object->type) {
            if ($type = Object::getType($typeName)->first()) {
                $fieldsRows = Object::getFields($type->id)->get();

                $fields = array();
                $fieldControls = array();

                // Promoted
                $field = array();
                $field['id'] = '_field_promoted';
                $field['name'] = 'promoted';
                $field['label'] = 'Promoted';
                $field['type'] = 'boolean';
                $field['instructions'] = '';
                $field['required'] = 0;

                $values = $this->getFieldValues($id, $field);

                foreach ($values as $key => $value) {
                    if ($values[$key] == '1') { $values[$key] = 'on'; }
                }

                $fieldControls[] = view('admin.partials.form.boolean', compact( 'field', 'values' ) );

                // Occupation
                $field = array();
                $field['id'] = '_field_occupation';
                $field['name'] = 'occupation';
                $field['label'] = 'Occupation';
                $field['type'] = 'text';
                $field['instructions'] = '';
                $field['required'] = 0;

                $values = $this->getFieldValues($id, $field);

                $fieldControls[] = view('admin.partials.form.text', compact( 'field', 'values' ) );

                // Address
                $uniqueId = Hash::getUniqueId();

                $field = array();
                $field['id'] = '_field_address';
                $field['name'] = 'address';
                $field['label'] = 'Address';
                $field['type'] = 'map';
                $field['instructions'] = '';
                $field['required'] = 0;

                $values = $this->getFieldValues($id, $field);

                $fieldControls[] = view('admin.partials.form.map', compact( 'field', 'values', 'uniqueId' ) );

                // French
                $field = array();
                $field['id'] = '_field_french_speakers';
                $field['name'] = 'french_speakers';
                $field['label'] = 'French Speakers';
                $field['type'] = 'boolean';
                $field['instructions'] = '';
                $field['required'] = 0;

                $values = $this->getFieldValues($id, $field);

                $fieldControls[] = view('admin.partials.form.boolean', compact( 'field', 'values' ) );

                // Address
                $field = array();
                $field['id'] = '_field_phone';
                $field['name'] = 'phone';
                $field['label'] = 'Phone';
                $field['type'] = 'tel';
                $field['instructions'] = '';
                $field['required'] = 0;

                $values = $this->getFieldValues($id, $field);

                $fieldControls[] = view('admin.partials.form.tel', compact( 'field', 'values' ) );

                // Email
                $field = array();
                $field['id'] = '_field_email';
                $field['name'] = 'email';
                $field['label'] = 'Email';
                $field['type'] = 'email';
                $field['instructions'] = '';
                $field['required'] = 0;

                $values = $this->getFieldValues($id, $field);

                $fieldControls[] = view('admin.partials.form.email', compact( 'field', 'values' ) );

                foreach ($fieldsRows as $fieldRow) {
                    $field = unserialize($fieldRow['meta_value']);
                    $fields[] = $field;

                    //$field['value'] = $object->getValue($field['id']);
                    $values = array();
                    $valuesMeta = ObjectMeta::where('object_id', $id)
                        ->where('meta_key', 'LIKE', $field['id'].'%')
                        ->get();

                    foreach ( $valuesMeta as $valueMeta ) {
                        $valueMetaKey = str_replace( $field['id'], '', $valueMeta['meta_key']);

                        if ( substr( $valueMetaKey, 0, 1 ) == '-' ) {
                            $valueMetaKey = substr( $valueMetaKey, 1);
                        }

                        $value = $valueMeta['meta_value'];

                        if ($value == '1') { $value = 'on'; }

                        if ($valueMetaKey) {
                            $values[$valueMetaKey] = $value;
                        } else {
                            $values[] = $value;
                        }
                    }

                    $uniqueId = Hash::getUniqueId();

                    switch ($field['type']) {
                        case 'text':
                            $fieldControls[] = view('admin.partials.form.text', compact( 'field', 'values', 'uniqueId' ) );
                            break;
                        case 'wysiwyg':
                            $fieldControls[] = view('admin.partials.form.wysiwyg', compact( 'field', 'values', 'uniqueId' ) );
                            break;
                        case 'map':
                            $fieldControls[] = view('admin.partials.form.map', compact( 'field', 'values', 'uniqueId' ) );
                            break;
                        case 'tel':
                            $fieldControls[] = view('admin.partials.form.tel', compact( 'field', 'values', 'uniqueId' ) );
                            break;
                        case 'boolean':
                            $fieldControls[] = view('admin.partials.form.boolean', compact( 'field', 'values', 'uniqueId' ) );
                            break;
                    }

                }
            }
        }

        if (isset($object)) {
            if ($imageObjectId = $object->getValue('_featured_image')) {
                $featuredImage = getImageSrc($imageObjectId, 'thumbnail');
            }

            if ($imageObjectId = $object->getValue('_content_image')) {
                $contentImage = getImageSrc($imageObjectId, 'thumbnail');
            }
        }

        return view('admin.object.create_edit', compact('object', 'fields', 'values', 'fieldControls', 'featuredImage', 'contentImage'));
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  int  $id
     * @return Response
     */
    public function postEdit(ObjectRequest $request, $id)
    {
        $object = Object::find($id);
        //$object->name = $request->name;
        $object->title = $request->title;
        $object->content = $request->content;

        $excerpt = strip_tags( $request->content );
        $excerpt = preg_replace('/\s+/', ' ', $excerpt);

        $object->excerpt = $excerpt;
        $object->save();

//        if ($objecttype = Object::where('type', 'object_type')
//            ->where('name', '_object_type_' . $object['type'] )
//            ->first() ) {
//
//            if ( $fields = Object::getFields( $objecttype['id'] )->get() ) {
//                foreach ( $fields as $field ) {
//                    if ( $fieldInfo = unserialize( $field['meta_value'] ) ) {
//                        $value = Input::get($fieldInfo['id']);
//
//                        echo $value;
//                    }
//                }
//            }
//        }

        //print_r(array_keys($_POST));
        //abort(500, 'sadfds');

        $fields = Object::getFields($id)->get();

        foreach ($fields as $field) {

            foreach ( array_keys($_POST) as $key ) {
                if ( substr($key, 0, 7) == '_field_' ) {
                    $value = $request->input($key);

                    if ($value == 'on') { $value = 1; }

                    $object->setValue($key, $value);
                }
            }
        }


        $promoted = $request->input('_field_french_speakers');
        if (!empty($promoted)) {
            $object->setValue('_field_french_speakers', 1);
        } else {
            $object->setValue('_field_french_speakers', 0);
        }


        $promoted = $request->input('_field_promoted');
        if (!empty($promoted)) {
            $object->setValue('_field_promoted', 1);
        } else {
            $object->setValue('_field_promoted', 0);
        }

        if($request->hasFile('featuredImage'))
        {
            $file = $request->file('featuredImage');
            $filename = $file->getClientOriginalName();
            $extension = $file->getClientOriginalExtension();
            $mimeType = $file->getMimeType();

            $destinationPath = public_path() . '/uploads/';
            $newfileName = sha1($filename . time());
            $picture = $newfileName . '.' . $extension;

            $request->file('featuredImage')->move($destinationPath, $picture);

            if ($imageObject = addImage($object, $destinationPath, $picture, $filename, $newfileName, $extension, $mimeType, '_featured_image')) {
            }
        }

        if($request->hasFile('contentImage'))
        {
            $file = $request->file('contentImage');
            $filename = $file->getClientOriginalName();
            $extension = $file->getClientOriginalExtension();
            $mimeType = $file->getMimeType();

            $destinationPath = public_path() . '/uploads/';
            $newfileName = sha1($filename . time());
            $picture = $newfileName . '.' . $extension;

            $request->file('contentImage')->move($destinationPath, $picture);

            if ($imageObject = addImage($object, $destinationPath, $picture, $filename, $newfileName, $extension, $mimeType, '_content_image')) {
            }
        }

        return redirect('admin/objects')->with('message', 'Type saved successfully');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param $id
     * @return Response
     */

    public function getDelete($id)
    {
        $object = object::find($id);
        // Show the page
        return view('admin.object.delete', compact('object'));
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param $id
     * @return Response
     */
    public function postDelete(DeleteRequest $request,$id)
    {
        if ( $object = object::find($id) ) {
            $object->delete();

            ObjectMeta::where('object_id', $id)->delete();

            return redirect('admin/objects')->with('message', 'Type deleted successfully');
        }
    }

    /**
     * Show a list of all the languages posts formatted for Datatables.
     *
     * @return Datatables JSON
     */
    public function data()
    {
        $type = Input::get('type');

        $objects = Object::where('type', '<>', 'object_type')
            ->where('type', '<>', 'image')
            ->where('type', '<>', 'category');

        if ( !empty( $type ) ) {
            $objects = $objects->where('type', $type);
        }

        $objects = $objects->select(array('id', 'title', 'type', 'status', 'created_at' ));
            //;// object::select(array('object_types.id','object_types.name','object_types.display_name', 'object_types.created_at'));

        return Datatables::of($objects)
            ->add_column('actions', '@if ($id>"4")<a href="{{{ URL::to(\'admin/objects/\' . $id . \'/edit\' ) }}}" class="btn btn-success btn-sm" ><span class="glyphicon glyphicon-pencil"></span>  {{ trans("admin/modal.edit") }}</a>
                    <a href="{{{ URL::to(\'admin/objects/\' . $id . \'/delete\' ) }}}" class="btn btn-sm btn-danger"><span class="glyphicon glyphicon-trash"></span> {{ trans("admin/modal.delete") }}</a>
                @endif')
            ->remove_column('id')

            ->make();


//        $objects = object::select(array('object_types.id','object_types.name','object_types.display_name', 'object_types.created_at'));
//
//        return Datatables::of($objects)
//            ->add_column('actions', '@if ($id>"4")<a href="{{{ URL::to(\'admin/object-types/\' . $id . \'/edit\' ) }}}" class="btn btn-success btn-sm" ><span class="glyphicon glyphicon-pencil"></span>  {{ trans("admin/modal.edit") }}</a>
//                    <a href="{{{ URL::to(\'admin/object-types/\' . $id . \'/delete\' ) }}}" class="btn btn-sm btn-danger"><span class="glyphicon glyphicon-trash"></span> {{ trans("admin/modal.delete") }}</a>
//                @endif')
//            ->remove_column('id')
//
//            ->make();
    }

    public function getFields($id)
    {

        //$object = Object::find($id);
        $fields = Object::getFields($id)->select(array( 'id', 'meta_key', 'meta_value', 'created_at' ));// object::select(array('object_types.id','object_types.name','object_types.display_name', 'object_types.created_at'));

//        $output = array();
//
//        foreach ($fields as $field) {
//            $fieldInfo = unserialize($field['meta_value']);
//
//            $output[] = array(
//               'label' => $fieldInfo['label']
//            );
//        }
//
//        $table = Datatable::table()
//            ->addColumn('Name', 'Last Login', 'View')
//            ->setUrl(route('api.users'))
//            ->noScript();


        return Datatables::of($fields)
            ->add_column('actions', '@if ($id>"4")<a href="{{{ URL::to(\'admin/object-types/\' . $id . \'/edit\' ) }}}" class="btn btn-success btn-sm" ><span class="glyphicon glyphicon-pencil"></span>  {{ trans("admin/modal.edit") }}</a>
                    <a href="{{{ URL::to(\'admin/object-types/\' . $id . \'/delete\' ) }}}" class="btn btn-sm btn-danger"><span class="glyphicon glyphicon-trash"></span> {{ trans("admin/modal.delete") }}</a>
                @endif')
            ->remove_column('id')

            ->make();
    }

    /**
     * Reorder items
     *
     * @param items list
     * @return items from @param
     */
    public function getReorder(ReorderRequest $request) {
        $list = $request->list;
        $items = explode(",", $list);
        $order = 1;
        foreach ($items as $value) {
            if ($value != '') {
                object::where('id', '=', $value) -> update(array('position' => $order));
                $order++;
            }
        }
        return $list;
    }

}
