<?php

ini_set('display_errors', 0);
header('Content-Type: application/json');
$servername =  $_POST["servername"];
include_once("Mabbdaco.php");
include_once("timestamp.php");
$Mabbdaco = new Mabbdaco($servername);





$device=$Mabbdaco->post("device");
$code=$Mabbdaco->post("code");
$token=$Mabbdaco->post("token");


if($code!=md5($device."ncase8934f49909")){
    die("Invalid Request");
}


//die("SELECT * FROM `mbd_PurchaseTable` WHERE `UserId`='$token'  and `Status` = 1 ");
$q2=mysqli_query($Mabbdaco->db_conn, "SELECT * FROM `mbd_PurchaseTable` WHERE `UserId`='$token'  and `Status` = 1 ");   
       // die("SELECT * FROM `mbd_PurchaseTable` WHERE `TimeStamp`='$timestamp' and `UserId` ='$token' limit 1  ");
        while($row=mysqli_fetch_array($q2)){
            
            $myOrders[] = array(
                 "ID" =>  $row["ID"],
                 "orderNumber" =>  $row["orderNumber"],
                 "date" => str_replace("&nbsp;","", justdate($row ["TimeStamp"] - 16200)) ,
                 "price" => $row["TotalPrice"],
                 "address" => $row["UserAddress"],
                 "fullname" => $row["fullnameRC"],
                 "phone" => $row["phoneRC"],
                 "Rdate" => str_replace("&nbsp;","", justdate($row ["recieveTimestamp"])) ,
                 "day" => $row["deliveryID"],
               
             );
             //die("INSERT INTO `mbd_Order_Product` (`Id`,`OrderId`,`ProductId`,`quantity`) VALUES (null, $orderID,$proid, $pronum)");
              
             
          
           
           
        }

  $query = "SELECT `mbd_products0`.ID, `mbd_products0`.title,`mbd_products0`.PriceNow   FROM `mbd_products0` INNER JOIN  `mbd_wishlist` on `mbd_wishlist`.ProductID = `mbd_products0`.ID  WHERE `mbd_wishlist`.UserToken = '$token'";

 $q7=mysqli_query($Mabbdaco->db_conn,$query );
              while($row8=mysqli_fetch_array($q7)){
                       
                        $coimagetitle = "placeholder.jpg";
                        $productidforimage = $row8["ID"];
                        $q0 = mysqli_query($Mabbdaco->db_conn,
                            "SELECT title FROM `mbd_images` WHERE `productID`= $productidforimage limit 1 ");
                        while ($row2 = mysqli_fetch_array($q0)) {
                    
                            $coimagetitle = $row2["title"];
                        }
                        $wishList[]=array(
                
                                "ID" => $row8["ID"],
                                "title" => $row8["title"],
                                "price" => $row8["PriceNow"],
                                "desc" => $row8["desc"],
                                "image" => $coimagetitle,
                
                        );
                        
               }
                

                
           

$data["wishList"] = $wishList;
$data["myOrder"]=$myOrders;

echo json_encode($data);




?>
  
  

