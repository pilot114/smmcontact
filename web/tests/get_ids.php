<?php

function get200ids($offset, $hash, $cookie)
{
	$data = [
		'act'    => 'a_run_method',
		'al'     => '1',
		'hash'   => $hash,
		'method' => 'messages.getDialogs',
		'param_count'  => "200",
		'param_offset' => $offset,
		'param_unread' => "0",
		'param_v'	   => "5.53"
	];
	$myCurl = curl_init();
	curl_setopt_array($myCurl, [
	    CURLOPT_URL => 'https://vk.com/dev',
	    CURLOPT_RETURNTRANSFER => true,
	    CURLOPT_POST => true,
	    CURLOPT_POSTFIELDS => http_build_query($data),
	    CURLOPT_COOKIE => $cookie,
	]);
	$response = curl_exec($myCurl);
	curl_close($myCurl);

	// clearing
	$pos = strpos($response, '{'); 
	$r   = substr($response, $pos);

	$r = iconv('UTF-8', 'UTF-8//IGNORE', utf8_encode($r));
	$arr = json_decode($r, true);

	$user_ids = [];
	if (count($arr['response']['items']) == 0) {
		return $user_ids;
	}
	foreach ($arr['response']['items'] as $key => $item) {
		$user_ids[] = $item['message']['user_id'];
	}
	return $user_ids;
}


$file = 'pavel_dial.txt';
$hash = '1477560911:2436ecebaf616592be';
$cookie = 'remixlang=0; remixdt=14400; remixseenads=1; _ym_uid=1477559579868336057; _ym_isad=2; remixstid=554773139_e31a1de3a31458b40e; remixrefkey=59276755b32f0005ab; remixlhk=9df2c04247fb8119f8; remixsid=7f27dbd0fc34bd26757ed51dfd29cb66caa11f357fe56b80d963a; remixsslsid=1; remixflash=23.0.0; remixscreen_depth=24';

for ($i=0; $i < 1000; $i++) {
	$offet = $i * 200;
	$user_ids = get200ids($offet, $hash, $cookie);
	if (count($user_ids) > 0) {
		foreach ($user_ids as $key => $id) {
			file_put_contents($file, $id . "\n", FILE_APPEND | LOCK_EX);
		}
		echo "added " . count($user_ids) . "\n";
	} else {
		echo "end\n";
		die();
	}
	sleep(1);
}