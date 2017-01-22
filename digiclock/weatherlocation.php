<?php
error_reporting(0);

header("Content-type: text/html; charset=utf-8");

$file_WeatherLocation = "WeatherLocationDatabase.txt";



if ( filesize($file_WeatherLocation) > 0 ) {
  $f = fopen($file_WeatherLocation, 'r');
  $content_WeatherLocation = fread($f, filesize($file_WeatherLocation));
} else {
  print("error");
  die;
}

//echo str_replace("\n","<br />",$content_WeatherLocation);
/*

City Name = "Aachen, DE" Location = "EUR|DE|GM011|AACHEN" Country = "Germany"
City Name = "Aalborg, DK" Location = "EUR|DK|DA007|AALBORG" Country = "Denmark"
City Name = "Aalesund, NO" Location = "EUR|NO|NO007|AALESUND" Country = "Norway"

*/

$tab_lignes = explode("\n",$content_WeatherLocation);

foreach ($tab_lignes as $k) {
  $tab_locations = explode('"',$k);
  //echo "City Name = " . $tab_locations[1] . " / Location = " . $tab_locations[3] . " / Country = " . $tab_locations[5] . " <br /> ";
  $Country[] = $tab_locations[5];
  $City[] = $tab_locations[1];
  $Location[] = $tab_locations[3];
  $Locations[] = array('Country' => $tab_locations[5], 'City' => $tab_locations[1], 'Location' => $tab_locations[3]);
}

/*
echo "<script>";
echo "_tab_City = " . json_encode($City) .";";
echo "_tab_Location = " . json_encode($Location) .";";
echo "_tab_Country = " . json_encode($Country) .";";
*/

?>
<script type="text/javascript" >
_tab_Locations = <?php echo json_encode($Locations); ?>;

function selectCountry(value) {
  var selCity = document.getElementById("City");
  selCity.innerHTML=null;
  for (i=0; i<_tab_Locations.length; i++) {
    if (_tab_Locations[i]["Country"] == value ) {
      //document.write(_tab_Locations[i]['City'] + " <br />");
      selCity.options[selCity.options.length] = new Option(_tab_Locations[i]['City'], _tab_Locations[i]['City'] );
    }
  }
}

function selectCity(value) {
  var selCountry = document.getElementById("Country");
  var selLocation = document.getElementById("Location");
  for (i=0; i<_tab_Locations.length; i++) {
    if (_tab_Locations[i]["City"] == value ) {
      //document.write(_tab_Locations[i]['City'] + " <br />");
      selLocation.textContent = _tab_Locations[i]['Location'];
    }
  }
}

</script>
<?php
//echo "</script>";
/*
echo "Country : <select>";
echo '<option value="" > -- Select a Country -- </option>';
foreach ($Country as $k => $v) {
  echo '<option value="' .$k . '" >' . $v . '</option>';
}
echo '</select>';

echo "City : <select>";
foreach ($City as $k => $v) {
  echo '<option value="' .$k . '" >' . $v . '</option>';
}
echo '</select>';


echo "Location : <select>";
foreach ($Location as $k => $v) {
  echo '<option value="' .$k . '" >' . $v . '</option>';
}
echo '</select>';

echo '<br /><br />';
*/

echo 'Country : <select id="Country" onchange="selectCountry(this.value);" >';
echo '<option value="" > -- Select a Country -- </option>';
foreach ($Country as $k => $v) {
  echo '<option value="' .$v . '" >' . $v . '</option>';
}
echo '</select>';
echo 'City : <select id="City" onchange="selectCity(this.value);" ><option value="" > -- Select a City -- </option></select>';
echo 'Location : <span id="Location" ></span>'; 

/*
  foreach ($result_tab as $k => $v) {
    // convertir les dates en timestamps
    $result_tab[$k][0] = strtotime($result_tab[$k][0]) * 1000;

    // Conversion de la valeur ("on/off ...") en "numérique" puis en float
    $float_value = $result_tab[$k][1];
    if ($float_value == "on") $float_value = 1;
    else if ($float_value == "off") $float_value = 0;
    else if ($float_value == "up") $float_value = 1;
    else if ($float_value == "stop") $float_value = 0;
    else if ($float_value == "down") $float_value = -1;
    $result_tab[$k][1] = floatval(str_replace(",", ".", $float_value));
  }
*/
/*
switch ($_GET['output']) 
{
  case 'json':
    header('Content-Type: application/json');
    print(json_encode($result_tab));
    break;
  case 'html':
    header("Content-type: text/plain; charset=utf-8");
    print($result);
    break;
  default:
    header("Content-type: text/html; charset=utf-8");
    print($result);
}
*/

?>