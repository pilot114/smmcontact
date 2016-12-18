<?php

namespace MainBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

use MongoDB\BSON\UTCDateTime;
use MainBundle\Document\Client;
use MongoDB\BSON\ObjectID;

class ExportCustomersCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this
            ->setName('exportCustomers')
            ->setDescription('export customers')
            ->addArgument('file', InputArgument::REQUIRED, 'csv file')
            ->addArgument('user_id', InputArgument::REQUIRED, 'user_id')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $file = $input->getArgument('file');
        $user_id = $input->getArgument('user_id');
        $mongo = $this->getContainer()->get('mongo');

        $row = 0;
        $limit = 10000;

        $withoutNextContact = 0;
        if (($handle = fopen($file, "r")) !== FALSE) {
            while (($data = fgetcsv($handle, 0, ";")) !== FALSE) {

                if ($limit == 0) {
                    break;
                }
                // skip first row
                if (isset($data[18]) && trim($data[18]) == "Тэги") {
                    continue;
                }
                $limit--;

                $num = count($data);
                $row++;
                for ($c=0; $c < $num; $c++) {
                    // filter fields
                    if ( !in_array($c, [14,15]) ) {
                        continue;
                    }
                    $clearDoc = $this->createClearDoc($data, $user_id);

                }

                // filter
                if (empty($clearDoc['vk_id'])) {
                    continue;
                }

                if (!isset($clearDoc['next_contact'])) {
                    $withoutNextContact++;
                }

                // save
                $client = new Client($clearDoc);
                $mongo->saveClient($client);
            }
            fclose($handle);
        }

        $output->writeln('Без следующего контакта: ' . $withoutNextContact);
        $output->writeln('Записей: ' . $row);
    }

    

    private function createClearDoc($data, $user_id)
    {
        $clearDoc = [];
        $clearDoc['tags'] = [];
        $clearDoc['orders'] = [];

        $clearDoc['user_id'] = new ObjectID($user_id);

        // set data how possible
        $clearDoc['fio'] = $data[0] ?: $data[2];
        $clearDoc['vk_id'] = intval($data[1]);
        $clearDoc['photo'] = '';
        $clearDoc['country'] = $data[5];
        $clearDoc['city'] = $data[6];
        $crmMap = [
            'Не по рекламе' => "0",
            'Сотрудник'  => 111,
            'Постоянный клиент' => 222,
            'Поинтересовался' => 1,
            'Планирует купить' => 2,
            'Ожидаем оплату' => 3,
            'Пост оплачен'  => 4,
            'Пост в таймере' => 5,
            'Пост опубликован' => 6,
            'Отменен' => 7,
            '' => "0"
        ];
        $clearDoc['crm_status'] = $crmMap[$data[17]];

        // set tags from status
        if ($clearDoc['crm_status'] == 111) {
            $clearDoc['crm_status'] = "0";
            $clearDoc['tags'][] = [
                'color' => '#333',
                'text' => 'Сотрудник',
            ];
        }
        if ($clearDoc['crm_status'] == 222) {
            $clearDoc['crm_status'] = "0";
            $clearDoc['tags'][] = [
                'color' => '#333',
                'text' => 'Постоянный клиент',
            ];
        }

        // tags
        if ($data[18]) {
            foreach (explode(", ", $data[18]) as $tag) {
                $clearDoc['tags'][] = [
                    'color' => '#333',
                    'text' => $tag,
                ];
            }
        }
        if ($data[24] && $data[25]) {
            $clearDoc['comment'] = $data[24] . " | " . $data[25];
        } else {
            $clearDoc['comment'] = $data[24] ?: $data[25];
        }
        $clearDoc['source'] = "2";
        $clearDoc['mobile'] = $data[9];
        $clearDoc['email'] = $data[10];

        if ($data[13]) {
            $msec = floor(strtotime($data[13]) * 1000);
            $clearDoc['first_contact'] = new UTCDateTime($msec);
        }
        if ($data[14]) {
            $msec = floor(strtotime($data[14]) * 1000);
            $clearDoc['last_contact'] = new UTCDateTime($msec);
        }
        if ($data[15]) {
            $msec = floor(strtotime($data[15]) * 1000);
            $clearDoc['next_contact'] = new UTCDateTime($msec);
        }

        // imported
        $clearDoc['imported'] = [
            'odnoklassniki' => [$data[3], $data[4]],
            'birthday' => $data[7],
            'sex' => $data[8],
            'add_contacts' => $data[11],
            'address' => $data[12],
            'sum_orders' => $data[19],
            'count_orders' => $data[20],
            'first_order' => $data[21],
            'last_order' => $data[22],
            'manager' => [$data[23], $data[26], $data[27]],
        ];
        return $clearDoc;
    }
}
