<?php
define("DIR_PUT_CONTENTS", dirname(__FILE__)."/cache"); 
class Cache {

//FileExisit
function fileExists($x,$y,$tipo){
	$nombre_fichero = $tipo.'_'.$x.'_'.$y.'.json';
if (file_exists(DIR_PUT_CONTENTS.'/'.$nombre_fichero)) {
//    echo "El fichero $nombre_fichero existe";
	return true;
} else {
  //  echo "El fichero $nombre_fichero no existe";
	return false;
}
}

//get File cached
function getFile($x,$y,$tipo){
	$nombre_fichero = $tipo.'_'.$x.'_'.$y.'.json';
	if ($this->FileExists($x,$y,$tipo)) {
	$json=file_get_contents(DIR_PUT_CONTENTS.'/'.$nombre_fichero);
	return $json;
}
else{
	return null;
}
}

// save in cache file
function putFile($x,$y,$tipo,$json){
	$nombre_fichero = $tipo.'_'.$x.'_'.$y.'.json';
	file_put_contents(DIR_PUT_CONTENTS.'/'.$nombre_fichero, $json);
	}
}
?>
