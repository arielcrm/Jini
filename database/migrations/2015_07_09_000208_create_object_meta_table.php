<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateObjectMetaTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('object_meta', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('object_id');
            $table->foreign('object_id')->references('id')->on('objects')->onUpdate('cascade')->onDelete('cascade');
            $table->index('object_id');
            $table->string('meta_key', 255);
            $table->index('meta_key');
            $table->longText('meta_value');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('object_meta');
    }
}
