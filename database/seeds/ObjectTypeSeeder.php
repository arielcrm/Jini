<?php

use Illuminate\Database\Seeder;

class ObjectTypeSeeder extends Seeder {

	public function run()
	{

		\App\ObjectType::create([
			'name' => 'page',
			'display_name' => 'Page'
		]);

        \App\ObjectType::create([
            'name' => 'article',
            'display_name' => 'article'
        ]);

        \App\ObjectType::create([
            'name' => 'file',
            'display_name' => 'File'
        ]);

        \App\ObjectType::create([
            'name' => 'category',
            'display_name' => 'Category'
        ]);
	}

}
