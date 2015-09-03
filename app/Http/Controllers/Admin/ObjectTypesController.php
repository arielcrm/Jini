<?php namespace App\Http\Controllers\Admin;

use App\Object;
use App\ObjectMeta;
use App\ObjectType;
use App\Helpers\Hash;
use App\Language;
use App\Http\Controllers\AdminController;
use App\Http\Requests\Admin\ObjectTypeRequest;
use App\Http\Requests\Admin\DeleteRequest;
use App\Http\Requests\Admin\ReorderRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Input;
use Datatables;

use Maatwebsite\Excel\Facades\Excel;

class ObjectTypesController extends AdminController {

	/**
	 * Display a listing of the resource.
	 *
	 * @return Response
	 */
	public function index()
	{
        // Show the page
        return view('admin.objecttype.index');
	}

    /**
     * Show the form for creating a new resource.
     *
     * @return Response
     */
    public function getCreate()
    {
        $languages = Language::all();
        $language = "";
        // Show the page
        return view('admin.objecttype.create_edit', compact('languages','language'));
    }

    /**
     * Store a newly created resource in storage.
     *
     * @return Response
     */
    public function postCreate(ObjectTypeRequest $request)
    {
        $objecttype = new Object();
        $objecttype -> author_id = Auth::user()->id;
        $objecttype -> type = 'object_type';
        $objecttype -> name = "_object_type_" . str_replace(' ', '-', $request->title);
        $objecttype -> title = "Object Type: $request->title";
        $objecttype -> status = 'published';
        $objecttype -> guid = Hash::getUniqueId();
        $objecttype -> save();

        return redirect('admin/object-types')->with('message', 'Type saved successfully');
    }
    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return Response
     */
    public function getEdit($id)
    {
        $objecttype = Object::find($id);

        if ($objecttype) {
            $objecttype->title = str_replace('Object Type: ', '', $objecttype->title);
        }

        return view('admin.objecttype.create_edit', compact('objecttype'));
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  int  $id
     * @return Response
     */
    public function postEdit(ObjectTypeRequest $request, $id)
    {
        $objecttype = Object::find($id);
        //$objecttype -> name = $request->name;
        //$objecttype -> display_name = $request->display_name;
        //$objecttype -> description = $request->description;
        $objecttype -> save();

        //print_r($request);
        $fieldLabel = $request->field_label;
        $fieldName = $request->field_name;
        $fieldId = "_field_$fieldName";
        $fieldType = $request->field_type;
        $fieldRequired = empty($request->field_required) ? 0 : $request->field_required;
        $fieldInstructions = $request->field_instructions;

        if ($fieldLabel && $fieldName && $fieldType) {
            $fieldInfo['id'] = $fieldId;
            $fieldInfo['name'] = strtolower($fieldName);
            $fieldInfo['label'] = $fieldLabel;
            $fieldInfo['type'] = $fieldType;
            $fieldInfo['instructions'] = $fieldInstructions;
            $fieldInfo['required'] = $fieldRequired;

            $objecttype->setValue($fieldId, serialize($fieldInfo));
        }

        return redirect('admin/object-types')->with('message', 'Type saved successfully');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param $id
     * @return Response
     */

    public function getDelete($id)
    {
        $objecttype = ObjectType::find($id);
        // Show the page
        return view('admin.objecttype.delete', compact('objecttype'));
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param $id
     * @return Response
     */
    public function postDelete(DeleteRequest $request,$id)
    {
        $ObjectType = ObjectType::find($id);
        $ObjectType->delete();

        return redirect('admin/object-types')->with('message', 'Type deleted successfully');
    }

    /**
     * Show a list of all the languages posts formatted for Datatables.
     *
     * @return Datatables JSON
     */
    public function data()
    {
        $objecttypes = Object::getTypes()
            ->select(array('id', 'title', 'status', 'created_at' ));// ObjectType::select(array('object_types.id','object_types.name','object_types.display_name', 'object_types.created_at'));

        return Datatables::of($objecttypes)
            ->add_column('actions', '@if ($id>"4")<a href="{{{ URL::to(\'admin/object-types/\' . $id . \'/edit\' ) }}}" class="btn btn-success btn-sm" ><span class="glyphicon glyphicon-pencil"></span>  {{ trans("admin/modal.edit") }}</a>
                    <a href="{{{ URL::to(\'admin/object-types/\' . $id . \'/delete\' ) }}}" class="btn btn-sm btn-danger"><span class="glyphicon glyphicon-trash"></span> {{ trans("admin/modal.delete") }}</a>
                    <a href="{{{ URL::to(\'admin/object-types/\' . $id . \'/export?format=excel\' ) }}}" class="btn btn-sm btn-primary"><span class="glyphicon glyphicon-export"></span> {{ trans("admin/admin.export") }}</a>
                @endif')
            ->remove_column('id')

            ->make();


//        $objecttypes = ObjectType::select(array('object_types.id','object_types.name','object_types.display_name', 'object_types.created_at'));
//
//        return Datatables::of($objecttypes)
//            ->add_column('actions', '@if ($id>"4")<a href="{{{ URL::to(\'admin/object-types/\' . $id . \'/edit\' ) }}}" class="btn btn-success btn-sm" ><span class="glyphicon glyphicon-pencil"></span>  {{ trans("admin/modal.edit") }}</a>
//                    <a href="{{{ URL::to(\'admin/object-types/\' . $id . \'/delete\' ) }}}" class="btn btn-sm btn-danger"><span class="glyphicon glyphicon-trash"></span> {{ trans("admin/modal.delete") }}</a>
//                @endif')
//            ->remove_column('id')
//
//            ->make();
    }

    public function getCategories($id)
    {
        if ( $objectType = Object::find($id) ) {
            $categories = ObjectMeta::where('object_id', $id)
                ->where('meta_key', '_category_id')
                ->select( array( 'id', 'meta_value' ))
                ->get();
            //$cc
            $c = array();
            foreach ($categories as $categoryId) {
                $c[] = $categoryId->meta_value;
            }

            $categories = Object::where('type', 'category')
                ->whereIn('id', $c)
                ->select('id', 'title')
                ->get();

            return Datatables::of($categories)
                ->add_column('actions', '<a href="{{{ URL::to(\'admin/object-types/\' . $id . \'/delete\' ) }}}" class="btn btn-sm btn-danger"><span class="glyphicon glyphicon-trash"></span> {{ trans("admin/modal.delete") }}</a>')
                ->remove_column('id')
                ->make();

        }


//        $objecttypes = ObjectType::select(array('object_types.id','object_types.name','object_types.display_name', 'object_types.created_at'));
//
//        return Datatables::of($objecttypes)
//            ->add_column('actions', '@if ($id>"4")<a href="{{{ URL::to(\'admin/object-types/\' . $id . \'/edit\' ) }}}" class="btn btn-success btn-sm" ><span class="glyphicon glyphicon-pencil"></span>  {{ trans("admin/modal.edit") }}</a>
//                    <a href="{{{ URL::to(\'admin/object-types/\' . $id . \'/delete\' ) }}}" class="btn btn-sm btn-danger"><span class="glyphicon glyphicon-trash"></span> {{ trans("admin/modal.delete") }}</a>
//                @endif')
//            ->remove_column('id')
//
//            ->make();
    }


    public function deleteField($id) {
        if ($field = ObjectMeta::find($id)) {
            $field->delete();
        }
    }

    public function postCategory($id) {
        if ( $objectType = Object::find($id) ) {
            if ( $categoryId = Input::get('id') ) {
                $objectType->addValue('_category_id', $categoryId);
            }
        }
    }

    public function getFields($id)
    {

        //$objectType = Object::find($id);
        $fields = Object::getFields($id)->select(array( 'id', 'meta_key', 'meta_value', 'created_at' ));// ObjectType::select(array('object_types.id','object_types.name','object_types.display_name', 'object_types.created_at'));

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
                    <a href="{{{ URL::to(\'admin/object-types/fields/\' . $id . \'/delete\' ) }}}" class="btn btn-sm btn-danger"><span class="glyphicon glyphicon-trash"></span> {{ trans("admin/modal.delete") }}</a>
                @endif')
            ->remove_column('id')

            ->make();
    }

    public function getExport($id) {
        if ( $objectType = Object::find($id) ) {
            if ( $data = ObjectType::getFields($id)->get() ) {
                $fields = array();

                $fields[] = 'name';
                $fields[] = 'title';
                $fields[] = 'content';
                $fields[] = 'occupation';
                $fields[] = 'address';
                $fields[] = 'french_speakers';
                $fields[] = 'phone';
                $fields[] = 'email';


                foreach ($data as $field) {
                    $fieldInfo = unserialize($field->meta_value);
                    $fields[] = $fieldInfo['name'];
                }

                if ( $format = Input::get('format') )  {
                    switch ($format) {
                        case 'excel':
                            Excel::create( str_replace('Object Type: ', '', $objectType['title'] ), function($excel) use($objectType, $fields) {

                                $excel->sheet(str_replace('Object Type: ', '', $objectType['title'] ), function($sheet) use($fields) {

                                    $sheet->setOrientation('landscape');

                                    $sheet->fromArray($fields);

                                });

                            })->export('xls');
                            break;
                    }
                }
            }
        }
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
                ObjectType::where('id', '=', $value) -> update(array('position' => $order));
                $order++;
            }
        }
        return $list;
    }

}
