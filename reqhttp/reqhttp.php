<?php

header("Content-Type: text/html"); 
/*
$postdata = http_build_query(
  array(
    'var1' => 'some content',
    'var2' => 'doh'
  )
);
*/
if ( $_GET["method"] == "GET") {
  $postdata = http_build_query($_POST);

  $opts = array('http' =>
    array(
      'method'  => 'GET',
      'header'  => 'Content-type: application/x-www-form-urlencoded',
    )
  );
  
  $context  = stream_context_create($opts);

  $url = $_GET["full_url"];
  $url = $url . "?" . $postdata;
  
} else {

  $postdata = http_build_query($_POST);
  $data_len = strlen ($postdata);
  $opts = array('http' =>
    array(
      'method'  => 'POST',
      'header'  => 'Content-type: application/x-www-form-urlencoded',
      //'header'  => "Content-Type: text/xml\r\n Authorization: Basic ".base64_encode("$https_user:$https_password")."\r\n",
      //'header'  => "Connection: close\r\nContent-Length: $data_len\r\n",  
      'content' => $postdata,
      //'timeout' => 60
    )
  );
  
  $context  = stream_context_create($opts);
  
  $url = $_GET["full_url"];
  
}
print($url);
echo "<br />";
print_r($context);
echo "<br />";

$result = file_get_contents($url, false, $context);
print($result);
?>