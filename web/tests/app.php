<?php

/*
?api_url=https://api.vk.com/api.php 
&api_settings=0 
&viewer_id=123456 
&group_id=654321 
&is_app_user=0 
&api_result= результат инит запроса к апи (JSON-объект)
&sign= подпись запроса

например для получения фото юзера
method=users.get&user_ids={viewer_id}&format=json&fields=photo_200&v=5.60 
*/

$sign = ""; 
foreach ($_GET as $key => $param) {
    if ($key == 'hash' || $key == 'sign') continue;
    $sign .= $param;
} 

$appID = '5723160';
$secret = 'zzxylLkGqvgrHft3Gei5';

$sig = hash_hmac('sha256', $sign, $secret);

echo $sig;


// in app

<script src="https://vk.com/js/api/xd_connection.js?2" type="text/javascript"></script>
<script type="text/javascript">
	VK.init(function() {

		// client api - получение запрос прав от пользователя
		VK.callMethod("showSettingsBox", 8214);

		// api - создает пост на стене
		VK.api("wall.post", {"message": "Hello!"}, function (data) {
			alert("Post ID:" + data.response.post_id);
		});

	}, function() {
	// API initialization failed
	}, '5.60');
</script>
