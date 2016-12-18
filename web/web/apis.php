<?php

$dealerToken = "419.cafbd27b0d35814451e3a92fa2fe04f725f546e799c40ff3fc15d462147fe88d";
$officeId = "550";
$sourceId = "1141";

$apiCallCrm = "https://api.ramexcrm.ru/treatment/create?token=" . $dealerToken;

if (in_array($_REQUEST['event'], array('lead','pay'))) {

$client = $_REQUEST['data']['client'];
$order = [
"firstname" => $client['name'],
"phone"     => $client['phone'],
"email"     => $client['email'],
"office_id" => intval($officeId),
"source_id" => intval($sourceId)
];

$myCurl = curl_init();
curl_setopt_array($myCurl, [
    CURLOPT_URL => $apiCallCrm,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => http_build_query($order)
]);
$response = curl_exec($myCurl);
curl_close($myCurl);

// debug
/*
file_put_contents("/usr/share/nginx/tn_crm/web/url.txt", print_r($apiCallCrm, true) );
file_put_contents("/usr/share/nginx/tn_crm/web/post.txt", print_r($order, true) );
file_put_contents("/usr/share/nginx/tn_crm/web/test.txt", print_r($response, true) );
*/
}
