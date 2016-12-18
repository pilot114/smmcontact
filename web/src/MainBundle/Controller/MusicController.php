<?php

namespace MainBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

class MusicController extends Controller
{
    // https://vk.com/dev/access_token
    // redirect_uri = https://oauth.vk.com/blank.html
    // Implicit Flow:
    // https://oauth.vk.com/authorize?client_id=5739258&redirect_uri=https://oauth.vk.com/blank.html&scope=134217727&response_type=token&v=5.60
	private function vkApiCall($method, $params)
    {
        $get_params = http_build_query($params);
        return file_get_contents("https://api.vk.com/method/".$method."?".$get_params);
    }

	public function indexAction()
    {
        return $this->render('MainBundle:Music:main.html.twig', [
        ]);
    }

	public function searchAction()
    {
    	$request = Request::createFromGlobals();
        $data = $request->request->all();

        // array Symfony\Component\HttpFoundation\File\UploadedFile
        $idsFile = $request->files->get('ids');
        $uids = file_get_contents($idsFile->getPathname());
        $uids = preg_split('/[\s]+/', $uids);

        $data['uids'] = implode(',', $uids);

        // create task and save
        $t = new ApiTask([
            'data' => [
                'artist'  => $args['artist'],
                'uids'    => $args['uids'],
                'chunk'   => 5,
                'total'   => count($uids),
                // variable
                'offset'  => 0
            ],
            'type'    => 'audios_new',
            // variable
            'percent' => 0,
            'result'  => [],
            'status'  => 'created',
            'captcha' => [
                'sid' => 0,
                'img' => 0,
                'key' => 0
            ],
        ]);
		$m = $this->get('mongo_vk_api');
        $m->saveTask($t);



        $params = [
        	// my
            // 'access_token' => '09ad49c676cea169c0f9f264f4affeedc4b58cbd78b740c87965cec098ee98b7d0a6bd515c9a3a1da43d9',
            // rusya
            'access_token' => '18d3377786117f5b6efc5826ca9fd2c1894fb9965ced02693a6f1df753f57c7771aa14e55e9e8edabdff3',
        ];

        $params = array_filter(array_merge($params, [
        	'owner_id' => '24578375'
    	]));

        $result = $this->vkApiCall('audio.get', $params);

		// $cap = $this->get('captcher');
		// $cap->saveFile('http://vkontakte.ru/captcha.php?sid=9999999999999999&s=1');
        // $result = $cap->resolve();

        return new JsonResponse( json_decode($result) );
    }
}
