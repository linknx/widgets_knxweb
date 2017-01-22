<?php
//error_reporting(0);
/*
cf. http://www.forevergeek.com/2005/10/check_disk_space_in_linux/ ??

Sys. de fich.            Tail. Occ. Disp. %Occ. MontÃ© sur
/dev/sdb5             313G   66G  232G  23% /
udev                  375M  300K  375M   1% /dev
none                  375M  136K  375M   1% /dev/shm
none                  375M  2,3M  373M   1% /var/run
none                  375M     0  375M   0% /var/lock
none                  375M     0  375M   0% /lib/init/rw
none                  313G   66G  232G  23% /var/lib/ureadahead/debugfs
/dev/loop0            166M  166M     0 100% /var/www/linknxweb_livecd/mountiso
*/
$result_tab = array();

//$disc = "rootfs";
$disc = "sdb5";

$taille = `df -h | grep $disc | cut -c23-26`;
$result_tab[1][0] = "taille";
$result_tab[1][1] = str_replace("\n","",$taille);
//echo "taille $taille"; 

$occupe = `df -h | grep $disc | cut -c28-32`;
$result_tab[2][0] = "occupe";
$result_tab[2][1] = str_replace("\n","",$occupe);
//echo "occupe $occupe"; 

$dispo = `df -h | grep $disc | cut -c35-38`; 
$result_tab[3][0] = "dispo";
$result_tab[3][1] = str_replace("\n","",$dispo);
//echo "dispo $dispo";

$pourc_use = `df -h | grep $disc | cut -c40-43`;
$result_tab[4][0] = "pourc_use";
$result_tab[4][1] = str_replace("\n","",$pourc_use);
//echo "pourc_use $pourc_use";  

$i = 5;
for ($idpgm = 1; $idpgm < 7 ; $idpgm++) {
  if (isset($_GET["program$idpgm"]) && $_GET["program$idpgm"] != "") {
    $pgm = $_GET["program$idpgm"];
    //$program=`ps ax | grep $pgm | grep -v grep`;
    $program = exec('ps | grep '.$pgm.' | grep -v grep');
    if ($program=="") {
      $program = exec('ps ax | grep '.$pgm.' | grep -v grep');
    }
    //echo  "$idpgm : $pgm *$program*";
    $result_tab[$i][0] = "program$idpgm";
    if ($program!="") $result_tab[$i][1] = "true"; else $result_tab[$i][1] = "false";
    $i++;
  }
}

/*
// pour le format json on converti les données 
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

header('Content-Type: application/json');
print(json_encode($result_tab));

?>
