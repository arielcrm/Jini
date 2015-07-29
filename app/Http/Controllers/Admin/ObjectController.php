<?php namespace App\Http\Controllers\Admin;

use App\Object;
use App\Helpers\Hash;
use App\Language;
use App\Http\Controllers\AdminController;
use App\Http\Requests\Admin\ObjectRequest;
use App\Http\Requests\Admin\DeleteRequest;
use App\Http\Requests\Admin\ReorderRequest;
use DoctrineTest\InstantiatorTestAsset\UnserializeExceptionArrayObjectAsset;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Input;
use Datatables;

class ObjectController extends AdminController {

	/**
	 * Display a listing of the resource.
	 *
	 * @return Response
	 */
	public function index()
	{
        // Show the page
        return view('admin.object.index');
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
                foreach ($fieldsRows as $fieldRow) {
                    $fields[] = unserialize($fieldRow['meta_value']);
                }
            }
        }
        return view('admin.object.create_edit', compact('fields'));
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
        $object = Object::find($id);

        if ($typeName = $object->type) {
            if ($type = Object::getType($typeName)->first()) {
                $fieldsRows = Object::getFields($type->id)->get();

                $fields = array();
                foreach ($fieldsRows as $fieldRow) {
                    $fields[] = unserialize($fieldRow['meta_value']);
                }
            }
        }

        return view('admin.object.create_edit', compact('object', 'fields'));
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
        $object->name = $request->name;
        $object->title = $request->title;
        $object->content = $request->content;
        $object->save();





        //print_r($request);
//        $fieldLabel = $request->field_label;
//        $fieldName = $request->field_name;
//        $fieldId = "_field_$fieldName";
//        $fieldType = $request->field_type;
//        $fieldRequired = empty($request->field_required) ? 0 : $request->field_required;
//        $fieldInstructions = $request->field_instructions;
//
//        if ($fieldLabel && $fieldName && $fieldType) {
//            $fieldInfo['id'] = $fieldId;
//            $fieldInfo['name'] = $fieldName;
//            $fieldInfo['label'] = $fieldLabel;
//            $fieldInfo['type'] = $fieldType;
//            $fieldInfo['instructions'] = $fieldInstructions;
//            $fieldInfo['required'] = $fieldRequired;
//
//            $object->setValue($fieldId, serialize($fieldInfo));
//        }

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
        $object = object::find($id);
        $object->delete();

        return redirect('admin/object-types')->with('message', 'Type deleted successfully');
    }

    /**
     * Show a list of all the languages posts formatted for Datatables.
     *
     * @return Datatables JSON
     */
    public function data()
    {
        $objects = Object::where('type', '<>', 'object_type')
            ->where('type', '<>', 'image')
            ->where('type', '<>', 'category')
            ->select(array('id','title', 'created_at' ));
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
