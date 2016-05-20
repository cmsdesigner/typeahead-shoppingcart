<?  
  /******
  //This is the server output :
  [
     {
     "part_number":"762",
     "name":"Ratatouille",
     "cost":"6.950000"
     }, ...
  ]

  ******/
  if(!defined('sugarEntry'))define('sugarEntry', true);
  require_once('include/entryPoint.php');

  $q=str_replace("&#039;","%",$_GET["q"]);
  
  $sql="select part_number,name, cost from aos_products where deleted!='1' and name like '%$q%' limit 100 ;";
   
  if(class_exists('DBManagerFactory')) {   
     $db = DBManagerFactory::getInstance();   
     header("Access-Control-Allow-Origin: *");
     echo "[\n"; 
     $rs = $db->query($sql);
     $n=$rs->num_rows;
     $i=0;
     
     while ($row = $db->fetchByAssoc($rs)) {
       $row["name"]=str_replace("&#039;","'",$row["name"]);
       //echo $row["name"]; 
       $i++;
       echo json_encode($row);
       if($i<$n) {  
        echo ", \n";
       } 
         
     }   
    
     echo "]\n";
  } else {
    echo "db connection error.";
  }
  sugar_cleanup(false);
?>
