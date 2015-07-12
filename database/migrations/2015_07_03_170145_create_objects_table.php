<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateObjectsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('objects', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('parent_id')->nullable();
            $table->foreign('parent_id')->references('id')->on('objects')->onUpdate('cascade')->onDelete('set null');
            $table->unsignedInteger('author_id')->nullable();
            $table->foreign('author_id')->references('id')->on('users')->onUpdate('cascade')->onDelete('set null');
            $table->string('type', 255);
            $table->string('name', 255);
            $table->text('title');
            $table->longText('content')->nullable();
            $table->text('excerpt')->nullable();
            $table->string('status', 255);
            $table->string('guid', 255);
            $table->timestamps();
            $table->index('parent_id');
            $table->index('author_id');
            $table->index('name');
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('objects');
    }
}
