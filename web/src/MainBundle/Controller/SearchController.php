<?php

namespace MainBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

use MainBundle\Document\ApiTask;

class SearchController extends Controller
{
    private function getFields($fieldsStr)
    {
        $fields = explode(",", $fieldsStr);
        foreach ($fields as $key => $field) {
            $fields[$key] = trim($field);
        }
        return array_reverse($fields);
    }

    private function vkApiCall($method, $params)
    {
        $get_params = http_build_query($params);
        return file_get_contents("https://api.vk.com/method/".$method."?".$get_params);
    }



    public function indexAction()
    {
        return $this->render('MainBundle:Search:main.html.twig', [
        ]);
    }

    public function simpleAction()
    {
        // for standart vk api calls
        // var pn = $$('.dev_param_name')
        // var names = "";
        // for (var i = pn.length - 1; i >= 0; i--) {
        //     names += pn[i].innerText + ',';
        // }
        // names = names.substring(0, names.length - 1);
        // console.log(names);

        $fields_dialogs = $this->getFields("user_id,unanswered,important,unread,preview_length,start_message_id,count,offset");
        $fields_messages = $this->getFields("last_message_id,preview_length,filters,time_offset,count,offset,out");
        $fields_search = $this->getFields("from_list,group_id,position,company,interests,religion,school_year,school,school_class,school_city,school_country,has_photo,
        online,birth_year,birth_month,birth_day,age_to,age_from,status,sex,university_chair,university_faculty,university_year,university,
        university_country,hometown,country,city,fields,count,offset,sort,q");
        $fields_audio = $this->getFields("count,offset,need_user,audio_ids,album_id,owner_id");

        $fields_poll_info = $this->getFields("owner_id,is_board,poll_id");
        $fields_votes = $this->getFields("owner_id,poll_id,answer_ids,is_board,friends_only,offset,count,fields,name_case");

        $fields_wall = $this->getFields("fields,copy_history_depth,extended,posts");

        return $this->render('MainBundle:Search:simple.html.twig', [
            "fields_dialogs"  => $fields_dialogs,
            "fields_messages" => $fields_messages,
            "fields_search"   => $fields_search,
            "fields_audio"    => $fields_audio,
            "poll_info"       => $fields_poll_info,
            "poll_votes"      => $fields_votes,
            "fields_wall"     => $fields_wall,
        ]);
    }

	public function simplePostAction()
    {
        $request = Request::createFromGlobals();
        $data = $request->request->all();

        $params = [
            'access_token' => 'f5b377f06583fa82643c449cf5d93882a0e24cf79a121d90dcd35915c1fbbe1acb8c2271562a2e18a2aec',
        ];
        $method = '';

        $methods = [
            'messages_getDialogs', 'messages_get', 'users_search', 'audio_get', 'polls_getById', 'polls_getVoters', 'wall_getById'
        ];

        if (in_array($data['method'], $methods)) {
            $params = array_filter(array_merge($params, $data['args']));
            $method = str_replace('_', '.', $data['method']);
        } else {
            return new JsonResponse("undefined method");
        }

        return new JsonResponse( $this->vkApiCall($method, $params) );


    	// получение токена
    	// https://oauth.vk.com/authorize?client_id=5665802&redirect_uri=https://oauth.vk.com/blank.html&display=page&scope=134217727&response_type=token&v=5.57&state=123456
    }




    public function extendAction()
    {
        return $this->render('MainBundle:Search:extend.html.twig', [
        ]);
    }

    /*
            method - type action
            args   - action arguments
            files  - optional file arguments
    */
    public function extendPostAction()
    {
        $request = Request::createFromGlobals();
        $m = $this->get('mongo_vk_api');

        $method = $request->request->get('method');
        $args = json_decode($request->request->get('args'), true);
        // array Symfony\Component\HttpFoundation\File\UploadedFile
        $files = $request->files->all();

        $params = [
            'access_token' => 'f5b377f06583fa82643c449cf5d93882a0e24cf79a121d90dcd35915c1fbbe1acb8c2271562a2e18a2aec',
        ];

        $errors = [];

        switch ($method) {
            case 'execute_1':
                // check
                if (!isset($files['uids'])) {
                    $errors[] = "Укажите UIDS";
                    break;
                }

                $code = '
                var uids = [UIDS];
                var res = [];

                var i = uids.length;
                while (i != 0) {
                    i=i-1;
                    var uid = uids[i];
                    var data = API.audio.get({"owner_id": uid, "count":300});
                    var artists   = data@.artist;
                    var titles    = data@.title;
                    var durations = data@.duration;
                    res.push([ uid, artists, titles, durations ]);
                };
                return res;
                ';

                // what ???
                // if ($err = $files['uids']->getErrorMessage()) {
                //     return new JsonResponse( $err );
                // }

                $uids = file_get_contents($files['uids']->getPathname());
                $uids = preg_split('/[\s]+/', $uids);
                $args['uids'] = implode(',', $uids);

                // create task and save
                $t = new ApiTask([
                    // optional parameter for exec-based tasks
                    'code' => $code,

                    // specific task data
                    'data' => [
                        'phrases'  => $args['phrases'],
                        'uids'    => $args['uids'],
                        'type_search' => $args['type_search'],
                        'accord'  => $args['accord'],
                        'duration_min' => $args['duration_min'],
                        'duration_max' => $args['duration_max'],
                        'matches' => $args['matches'],
                        'chunk'   => 5,
                        'total'   => count($uids),
                        // variable
                        'offset'  => 0
                    ],

                    //  task type and name
                    'type'     => 'audios',
                    'name'     => $args['task_name'],

                    // variable
                    'percent'  => 0,
                    'result'   => [],
                    // 'captcha'  => [
                    //     'sid' => 0,
                    //     'img' => 0,
                    //     'key' => 0
                    // ],
                    'status'   => 'created',
                ]);
                $m->saveTask($t);
                break;
            case 'execute_2':
                $code = '
                var post_id = "POST";
                var post=API.wall.getById({"posts":post_id});
                var poll_id = post[0].attachments@.poll@.poll_id.slice(1)[0];
                var owner_id = post_id.split("_")[0];
                var poll = API.polls.getById({"poll_id":poll_id, "owner_id":owner_id});
                var answers_ids = poll.answers@.id;

                var i = answers_ids.length;
                var ai_str = "";
                while (i != 0) {
                    i=i-1;
                    ai_str = ai_str + answers_ids[i];
                    if (i != 0) {
                        ai_str = ai_str + ",";
                    }
                };
                var voters = API.polls.getVoters({"poll_id":poll_id, "owner_id":owner_id, "answer_ids":ai_str});

                return [poll, voters];
                ';
                break;
            default:
                return new JsonResponse("undefined method");
                break;
        }

        if ($errors) {
            return new JsonResponse($errors);
        }

        if (isset($args['task'])) {
            return new JsonResponse("Задача создана!");
        } else {
            // replaces
            foreach ($args as $key => $arg) {
                $key = strtoupper($key);
                $code = str_replace($key, $arg, $code);
            }
            $params = array_filter(array_merge($params, ['code' => $code]));
            return new JsonResponse( $this->vkApiCall("execute", $params) );
        }
    }


    public function tasksAction()
    {
        $m = $this->get('mongo_vk_api');

        return $this->render('MainBundle:Search:tasks.html.twig', [
            'tasks' => $m->findAllTasks(),
        ]);
    }
}
