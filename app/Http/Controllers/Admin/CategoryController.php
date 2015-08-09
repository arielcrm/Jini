<?php namespace App\Http\Controllers\Admin;

use App\Object;
use App\ObjectMeta;
use App\Helpers\Thumbnail;
use App\Helpers\Hash;

use App\Language;
use App\Http\Controllers\AdminController;
use App\Http\Requests\Admin\ObjectRequest;
use App\Http\Requests\Admin\CategoryRequest;
use App\Http\Requests\Admin\DeleteRequest;
use App\Http\Requests\Admin\ReorderRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Input;
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
        $object->name = preg_replace('[ ]', '-', strtolower( $request->name ));
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

        if ($imageObjectId = $object->getValue('_featured_image')) {
            $featuredImage = getImageSrc($imageObjectId, 'thumbnail');
        }

        if ($imageObjectId = $object->getValue('_content_image')) {
            $contentImage = getImageSrc($imageObjectId, 'thumbnail');
        }

        $toolTip = $object->getValue('_tooltip');

        return view('admin.category.create_edit', compact('object', 'parent_id', 'categories', 'featuredImage', 'contentImage', 'toolTip'));
    }

    public function getSearch() {
        if ( $criteria = Input::get('query') ) {
            $categories = Object::where('type', 'category')
                ->where(function( $query ) use ( $criteria ) {
                $query->where('title', 'LIKE', '%' . $criteria . '%')
                    ->orWhere('name', 'LIKE', '%' . $criteria . '%');
                })
                ->select('id', 'title')
                ->get();

            return response( $categories );
        }



        //return response(array('afdfs', 'asdfsdfs'));//->header('Content-Type', 'application/json');

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
        $object->name = preg_replace('[ ]', '-', strtolower( $request->name ));
        $object->title = $request->title;
        $object->content = $request->content;
        $object->excerpt = $request->excerpt;

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

            echo 'sadfasdfdsa';
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

        $object->setValue('_tooltip', $request->toolTip);

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
            ->select('objects.id')
            ->addSelect('objects.title')
            ->addSelect('author.name AS author')
            ->addSelect('parent.name AS parent')
            ->addSelect('objects.created_at')
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

    public function getCategories($id = null) {
        //Config::set('laravel-debugbar::config.enabled', false);

        $categories = Object::where('type', 'category')
            ->where('parent_id', $id)
            ->get();

        return response()->json( $categories );
    }
}
