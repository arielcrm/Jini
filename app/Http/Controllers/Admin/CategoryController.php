<?php namespace App\Http\Controllers\Admin;

use App\Object;
use App\ObjectMeta;
use App\Helpers\Thumbnail;

use App\Language;
use App\Http\Controllers\AdminController;
use App\Http\Requests\Admin\ObjectRequest;
use App\Http\Requests\Admin\CategoryRequest;
use App\Http\Requests\Admin\DeleteRequest;
use App\Http\Requests\Admin\ReorderRequest;
use Illuminate\Support\Facades\Auth;
use Datatables;



class CategoryController extends AdminController {

	/**
	 * Display a listing of the resource.
	 *
	 * @return Response
	 */
	public function index()
	{
        // Show the page
        return view('admin.category.index');
	}

    /**
     * Show the form for creating a new resource.
     *
     * @return Response
     */
    public function getCreate()
    {
        $categories = Object::where('type', 'category')
            ->get();

        return view('admin.object.create_edit', compact('categories'));
    }

    /**
     * Store a newly created resource in storage.
     *
     * @return Response
     */
    public function postCreate(ObjectRequest $request)
    {
        $object = new object();
        if ($request->parent_id) {
            $object->parent_id = $request->parent_id;
        } else {
            $object->parent_id = null;
        }
        $object->author_id = Auth::user()->id;
        $object->type = 'category';
        $object->name = preg_replace('[ ]', '-', $request->title);
        $object->title = $request->title;
        $object->content = $request->content;
        $object->excerpt = $request->content;
        $object->status = 1;
        $object->guid = str_replace(".", "", uniqid('', true));
        $object->save();

        return redirect('admin/categories')->with('message', 'Category saved successfully');
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
        $parent_id = $object->parent_id;
        $categories = Object::where('type', 'category')
            ->where('id', '!=', $id)
            ->get();

        if ($imageObjectId = ObjectMeta::getValue($id, '_featured_image')) {
            $featuredImage = getImageSrc($imageObjectId, 'thumbnail');
        }

        if ($imageObjectId = ObjectMeta::getValue($id, '_content_image')) {
            $contentImage = getImageSrc($imageObjectId, 'thumbnail');
        }


        return view('admin.category.create_edit', compact('object', 'parent_id', 'categories', 'featuredImage', 'contentImage'));
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  int  $id
     * @return Response
     */
    public function postEdit(CategoryRequest $request, $id)
    {
        $object = Object::find($id);

        if ($request->parent_id) {
            $object->parent_id = $request->parent_id;
        } else {
            $object->parent_id = null;
        }
        $object->author_id = Auth::user()->id;
        $object->name = preg_replace('[ ]', '-', $request->title);
        $object->title = $request->title;
        $object->content = $request->content;
        $object->excerpt = $request->content;

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


        $object->save();

        return redirect('admin/categories')->with('message', 'Object saved successfully');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param $id
     * @return Response
     */

    public function getDelete($id)
    {
        $object = Object::find($id);

        // Show the page
        return view('admin.category.delete', compact('object'));
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param $id
     * @return Response
     */
    public function postDelete(DeleteRequest $request,$id)
    {
        $object = Object::find($id);
        $object->delete();

        return redirect('admin/categories')->with('message', 'Category deleted successfully');
    }

    /**
     * Show a list of all the languages posts formatted for Datatables.
     *
     * @return Datatables JSON
     */
    public function data()
    {

        $categories = Object::leftJoin('users as author', 'author.id', '=', 'objects.author_id')
            ->leftJoin('objects as parent', 'parent.id', '=', 'objects.parent_id')
            ->select(array('objects.id', 'objects.title', 'author.name as author', 'parent.name as parent', 'objects.created_at'))
            ->where('objects.type', 'category');

        return Datatables::of($categories)
            ->add_column('actions', '<a href="{{{ URL::to(\'admin/categories/\' . $id . \'/edit\' ) }}}" class="btn btn-success btn-sm" ><span class="glyphicon glyphicon-pencil"></span>  {{ trans("admin/modal.edit") }}</a>
                    <a href="{{{ URL::to(\'admin/categories/\' . $id . \'/delete\' ) }}}" class="btn btn-sm btn-danger"><span class="glyphicon glyphicon-trash"></span> {{ trans("admin/modal.delete") }}</a>')
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
                category::where('id', '=', $value)->update(array('position' => $order));
                $order++;
            }
        }
        return $list;
    }

}
