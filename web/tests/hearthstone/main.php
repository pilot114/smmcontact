<?php

// images url
$imageUrl = "http://wow.zamimg.com/images/hearthstone/cards/enus/original/"; 

$file = file_get_contents('./cards.json');

$res = [];

foreach (json_decode($file) as $i => $card) {
	if ($i == 0) {
		continue;
	} else {
		$card->image = $imageUrl . $card->id . ".png";
		$img = file_get_contents($card->image);
		file_put_contents('./img/' . $card->id . '.png', $img);

		$res[] = $card;
	}
}
echo 123;


// echo json_encode($res, true);