<?php
/**
 * Created by PhpStorm.
 * User: Ariel
 * Date: 11/07/15
 * Time: 23:48
 */

use App\Object;
use App\ObjectMeta;
use App\Helpers\Thumbnail;


function getImageSrc($imageId, $size = null) {
    if ($image = Object::find($imageId)) {
        if ($imageInfo = ObjectMeta::getValue($image->id, '_image_info')) {
            $imageInfoData = unserialize($imageInfo);

            if (!empty($size) && isset($imageInfoData['sizes'][$size])) {
                $imageSizeInfoData = &$imageInfoData['sizes'][$size];
                if (!empty($imageSizeInfoData)) {
                    $fileName = &$imageSizeInfoData['fileName'];

                    if (!empty($fileName)) {
                        return $fileName;
                    }
                }
            } else {
                $filePath = &$imageInfoData['filePath'];

                return $filePath;
            }
        }
    }
}

function getImageTag($imageId, $size) {
    if ($imageSrc = getImageSrc($imageId, $size)) {
        return sprintf( '<img src="%s" alt="" title="" />',
            URL::to('/public/' . $imageSrc));
    }
}

function addImage($object, $destinationPath, $picture, $filename, $newfileName, $extension, $mimeType, $fieldName) {
    list($source_image_width, $source_image_height, $source_image_type) = getimagesize($destinationPath . $picture);

    $imageObjectInfo = array();
    $imageObjectInfo['width'] = $source_image_width;
    $imageObjectInfo['height'] = $source_image_height;
    $imageObjectInfo['fileName'] = $filename;
    $imageObjectInfo['filePath'] = $newfileName . '.' . $extension;
    $imageObjectInfo['sizes'] = array();


    if ($source_image_width > 1920) {//} || $source_image_height > 1080) {
        Thumbnail::generate_image_thumbnail($destinationPath . $picture, $destinationPath . $newfileName . '-resized.'. $extension, 1920, 1080);

        list($siw, $sih, $sit) = getimagesize($destinationPath . $newfileName . '-resized.'. $extension);

        rename( $destinationPath . $newfileName . '-resized.'. $extension,
            $destinationPath . $newfileName . '-'. $siw . 'x'. $sih .  '.'. $extension);

        $imageInfo = array();

        $imageInfo['fileName'] = $destinationPath . $newfileName . '-'. $siw . 'x'. $sih .  '.'. $extension;
        $imageInfo['width'] = $siw;
        $imageInfo['height'] = $sih;
        $imageInfo['mimeType'] = $mimeType;

        $imageObjectInfo['sizes']['large'] = $imageInfo;
    }
    if ($source_image_width > 1024) { // || $source_image_height > 768) {
        Thumbnail::generate_image_thumbnail($destinationPath . $picture, $destinationPath . $newfileName . '-resized.'. $extension, 1024, 768);

        list($siw, $sih, $sit) = getimagesize($destinationPath . $newfileName . '-resized.'. $extension);

        rename( $destinationPath . $newfileName . '-resized.'. $extension,
            $destinationPath . $newfileName . '-'. $siw . 'x'. $sih .  '.'. $extension);

        $imageInfo = array();

        $imageInfo['fileName'] = $newfileName . '-'. $siw . 'x'. $sih .  '.'. $extension;
        $imageInfo['width'] = $siw;
        $imageInfo['height'] = $sih;
        $imageInfo['mimeType'] = $mimeType;

        $imageObjectInfo['sizes']['medium'] = $imageInfo;
    }
    if ($source_image_width > 350) {//|| $source_image_height > 350) {
        Thumbnail::generate_image_thumbnail($destinationPath . $picture, $destinationPath . $newfileName . '-resized.'. $extension, 350, 350);

        list($siw, $sih, $sit) = getimagesize($destinationPath . $newfileName . '-resized.'. $extension);

        rename( $destinationPath . $newfileName . '-resized.'. $extension,
            $destinationPath . $newfileName . '-'. $siw . 'x'. $sih .  '.'. $extension);

        $imageInfo = array();

        $imageInfo['fileName'] = $newfileName . '-'. $siw . 'x'. $sih .  '.'. $extension;
        $imageInfo['width'] = $siw;
        $imageInfo['height'] = $sih;
        $imageInfo['mimeType'] = $mimeType;

        $imageObjectInfo['sizes']['small'] = $imageInfo;
    }

    if ($source_image_width > 300) {//|| $source_image_height > 350) {
        Thumbnail::generate_image_thumbnail($destinationPath . $picture, $destinationPath . $newfileName . '-resized.'. $extension, 300, 300);

        list($siw, $sih, $sit) = getimagesize($destinationPath . $newfileName . '-resized.'. $extension);

        rename( $destinationPath . $newfileName . '-resized.'. $extension,
            $destinationPath . $newfileName . '-'. $siw . 'x'. $sih .  '.'. $extension);

        $imageInfo = array();

        $imageInfo['fileName'] = $newfileName . '-'. $siw . 'x'. $sih .  '.'. $extension;
        $imageInfo['width'] = $siw;
        $imageInfo['height'] = $sih;
        $imageInfo['mimeType'] = $mimeType;

        $imageObjectInfo['sizes']['thumbnail'] = $imageInfo;
    }


    // Save image object
    if ($imageObjectId = ObjectMeta::getValue($object->id, $fieldName)) {
        $imageObject = Object::find($imageObjectId);
    }
    if (empty($imageObject)) {
        $imageObject = new Object();
    }

    $imageObject->author_id = Auth::user()->id;
    $imageObject->type = 'image';
    $imageObject->name = $newfileName . '.' . $extension;
    $imageObject->title = $filename;
    $imageObject->status = 'inherit';
    $imageObject->guid = $newfileName;
    $imageObject->save();

    ObjectMeta::setValue($imageObject->id, '_file_path', $newfileName . '.' . $extension);
    ObjectMeta::setValue($imageObject->id, '_image_info', serialize($imageObjectInfo));

    ObjectMeta::setValue($object->id, $fieldName, $imageObject->id);

    return $imageObject;
}