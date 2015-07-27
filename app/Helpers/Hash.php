<?php

namespace App\Helpers;

class Hash {
	public static function getUniqueId() {
        return str_replace('.', '', uniqid('', true));
	}
}
