<?php namespace App\Http\Controllers\Admin;

use App\ObjectType;
use App\Language;
use App\Http\Controllers\AdminController;
use App\Http\Requests\Admin\ObjectTypeRequest;
use App\Http\Requests\Admin\DeleteRequest;
use App\Http\Requests\Admin\ReorderRequest;
use Illuminate\Support\Facades\Auth;
use Datatables;

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
        $objecttype = new ObjectType();
        $objecttype -> name = $request->name;
        $objecttype -> display_name = $request->display_name;
        $objecttype -> description = $request->description;
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
        $objecttype = ObjectType::find($id);

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
        $objecttype = ObjectType::find($id);
        $objecttype -> name = $request->name;
        $objecttype -> display_name = $request->display_name;
        $objecttype -> description = $request->description;
        $objecttype -> save();

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
        $objecttypes = ObjectType::select(array('object_types.id','object_types.name','object_types.display_name', 'object_types.created_at'));

        return Datatables::of($objecttypes)
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
                ObjectType::where('id', '=', $value) -> update(array('position' => $order));
                $order++;
            }
        }
        return $list;
    }

}
