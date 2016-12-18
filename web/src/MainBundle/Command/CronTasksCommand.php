<?php

namespace MainBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

use MainBundle\Document\ApiTask;

class CronTasksCommand extends ContainerAwareCommand
{
    private $mongo;
    private $vk_response;

    protected function configure()
    {
        $this
            ->setName('cron:tasks')
            ->setDescription('find and run task')
        ;
    }

    /*
        params = params for api call
        task   = db document
    */
    private function getAudios($params, $task)
    {
        // task data
        $td = $task->data;
        /*
        phrases
        uids
        type_search
        accord
        duration_min
        duration_max
        matches
        chunk
        total
        offset
        */

        // create chunk uids
        $ex_uids = explode(',', $td->uids);
        $chunk_uids = array_slice($ex_uids, $td->offset, $td->chunk);
        $chunk_uids = implode(',', $chunk_uids);
        
        $code = str_replace("UIDS", $chunk_uids, $task->code);

        // call
        $params = array_filter(array_merge($params, ['code' => $code]));
        $this->vk_response = json_decode( $this->vkApiCall("execute", $params), true );
        // further-postproccessing


        // response el empty count == execute_errors count == access denied
        $usersData = $this->vk_response['response'];
        // array success counters
        $result = [];

        foreach ($usersData as $iu => $userData) {
            list($uid, $artists, $titles, $durations) = $userData;

            // vk bug?
            if (count($artists) == 1) {
                if ($artists[0] == NULL) {
                    $usersData[$iu] = ["uid" => $uid, "errors" => ["access to users audio is denied"]];
                    continue;
                }
            }
            if (empty($artists)) {
                $usersData[$iu] = ["uid" => $uid, "errors" => ["access to users audio is denied"]];
                continue;
            }

            $phrases = explode("\n", $td->phrases);
            // non-strong matching
            if ($td->accord !== "on") {
                foreach ($phrases as $i => $phrase) {
                    $phrases[$i] = strtolower($phrases[$i]);
                }
            }

            // search phrase with specified parameters
            $result[$uid] = 0;
            foreach ($artists as $i => $a) {
                // vk bug?
                if ($artists[$i] == NULL) {
                    continue;
                }

                // non-strong matching
                if ($td->accord !== "on") {
                    $artist = strtolower($artists[$i]);
                    $title  = strtolower($titles[$i]);
                } else {
                    $artist = $artists[$i];
                    $title  = $titles[$i];
                }
                $duration = $durations[$i];

                // by artist
                if ($td->type_search == "1") {
                    $checkField = $artist;
                // by title
                } else {
                    $checkField = $title;
                }

                // filter by duration
                if ($td->duration_min || $td->duration_max) {
                    if (intval($td->duration_min) > $duration || intval($td->duration_max) < $duration) {
                        continue;
                    }
                }

                // check match
                foreach ($phrases as $phrase) {
                    if (strpos($checkField, $phrase) !== false) {
                        $result[$uid]++;
                    }
                }
            }
            if ($result[$uid] == 0) {
                unset($result[$uid]);
            }
        }
        var_dump($userData);
        die();

        // convert to [] from emtpy or object
        $prev_result = is_null($task->result) ? [] :
        (is_array($task->result)) ? $task->result : $task->result->getArrayCopy();

        $task->result = $prev_result + $result;
        $task->data->offset = $td->offset + $td->chunk;

        // round up
        $task->percent = ceil($task->data->offset/( count($ex_uids)/100));
        if ($task->percent >= 100) {
            $task->percent = 100;
            $task->status = 'finished';
        } else {
            $task->status = 'proccessed';
        }
        $this->mongo->saveTask($task);
        $this->mongo->saveVkUsers($usersData);
    }


    private function vkApiCall($method, $params)
    {
        $get_params = http_build_query($params);
        return file_get_contents("https://api.vk.com/method/".$method."?".$get_params);
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $this->mongo = $this->getContainer()->get('mongo_vk_api');
        $task = $this->mongo->findPriorityTask();

        $params = [
            'access_token' => 'f5b377f06583fa82643c449cf5d93882a0e24cf79a121d90dcd35915c1fbbe1acb8c2271562a2e18a2aec',
        ];

        if (!$task) {
            echo "-";
            die();
        }

        // check captcha solve
        if ($task->captcha) {
            if ($task->captcha->key) {
                $params['captcha_sid'] = $task->captcha->sid;
                $params['captcha_key'] = $task->captcha->key;
                $output->writeln("added captcha");
                // clear captcha
                $task->captcha = 0;
            } else {
                $output->writeln("need captcha solve!");
                die();
            }
        }

        try {
        
        if ($task->type == "audios") {
            // many calls in minute
            $i = 0;
            $countInMinute = 6;
            while ($i <= $countInMinute) {
                $output->writeln(date('h:m:s') . ' getAudios' . $i);
                $this->getAudios($params, $task);
                $i++;
                sleep(60/$countInMinute);
            }

        } else {
            $output->writeln('Unsupport type');
            die();
        }
        $output->writeln('Success');

        } catch (\Exception $e) {

            // if has vk response
            if ($this->vk_response) {
                // has vk captcha error
                if (isset($this->vk_response['error']) && $this->vk_response['error']['error_code'] == 14 ) {
                    $err = $this->vk_response['error'];
                    $captcha = [
                        'sid' => $err['captcha_sid'],
                        'img' => $err['captcha_img'],
                        'key' => 0
                    ];
                    $task->captcha = $captcha;
                }
                var_dump($this->vk_response);
            }

            $task->status = 'paused';
            $this->mongo->saveTask($task);
            $output->writeln('Error, line #' . $e->getLine() . ":" . $e->getMessage());
        }
    }

}
