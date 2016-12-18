<?php

namespace MainBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

use MainBundle\Document\Client;
use MainBundle\Document\Order;
use MainBundle\Document\Phrase;
use MongoDB\BSON\UTCDateTime;

/*
db.clients.drop()
db.orders.drop()
db.counters.drop()

db.phrases.drop()
db.tags.drop()

db.users.drop()
*/

/*
db.clients.count()
db.orders.count()
db.counters.find().pretty()
*/


class DataGenCommand extends ContainerAwareCommand
{
    private $t = [
        'fio' => [
            'Вася Петров',
            'Ржавый',
            'Ди Каприо',
            'просто Арнольд',
            'Василий Палыч',
            'Настоящий гангстер',
            'Пётр Ковалёв',
            'Георгий Жданов',
            'Пчёлко Майя',
            'Анна Шмаль',
            'Неибадзе Ахмет',
            'Альберт Энштейн',
            'Владимир Владимирович',
            'Фродо Сумкинс',
            'Скотт Хансельман',
            'Тим Бернерс-Ли',
            'Funny Caplan',
            'Лийа Фамилийа',
        ],
        'vk_id' => [
            '916',
            '1566',
            '1691',
        ],
        'photo' => [
            'http://image.blingee.com/images14/content/output/2007/10/26/258894317_9e73f4ee.gif',
            'http://s00.yaplakal.com/pics/pics_original/1/0/4/5421401.jpg',
            'http://cs407527.vk.me/v407527875/a9b6/HOOeeZlXK6E.jpg',
            'http://www.spletnik.ru/img/2016/02/rita/20160229-di-5.jpg',
            'http://kinomod.ru/wp-content/uploads/2013/07/Arnold-Schwarzenegger-910375-w-800-500x375-300x225.jpg',
            'http://zhukvesti.ru/upload/iblock/ac9/ac961959d6c7dd6807233302e30929d4.jpg',
            'https://pp.vk.me/c389/u5809888/a_b87d1efd.jpg',
            'https://pp.vk.me/c533508/u156046345/video/l_58ae7e17.jpg',
            'http://s.pikabu.ru/post_img/big/2013/02/05/8/1360064294_570255511.jpg',
            'http://67.media.tumblr.com/52f79446a7921d6c85a9a570a34809be/tumblr_muuwepOE501qjj0j1o1_500.jpg',
            'http://www.securitylab.ru/upload/iblock/650/650371056b3a4cc4a6deb5006f0148a7.jpg',
            'https://sec.ch9.ms/ch9/1a71/f5153a91-d331-4327-b9c3-cc0f046b1a71/TechDaysweb202_en_1024_960.jpg',
            'http://cs416420.vk.me/v416420577/655d/TRRoZSzDrc0.jpg',
            'http://www.omg-mozg.ru/image/velikie/putin.jpg',
            'https://vk.vkfaces.com/617128/v617128560/10043/oWK5Or5xthI.jpg',
            'https://i.viewy.ru/data/photo/ec/a7/eca72392c2TJIHVXA_46885_987c241002.jpg',
        ],
        'city' => [
            // generated
        ],
        'country' => [
            'Россия',
            'Украина',
            'Беларусь',
            'Казахстан',
        ],
        'crm_status' => [1,2,3,4,5,6,7,8,9,10],
        'status' => [1,2,3,4,5,6],
        'comment' => ['', 'lol', 'kek', 'Запилил дверь', 'Хохол', 'Подозрительно бородат'],
        'source' => [1, 2],
    ];


    // type => [name, text]
    // [Name] (имя человека)
    // [ExternalOrderEdit] (гиперссылка на форму заказа для заполнения клиентом)
    // [ExternalOrderNumber] (номер заказа)
    // [SumFromClient] (cумма к оплате при получении заказа)
    private $defaultPhrases = [
        'Основные фразы' => [
            ['Здравствуйте, [Name]!', 'Здравствуйте, [Name]!'],
            ['Спасибо, [Name]!', 'Спасибо, [Name]! :)'],
        ],
        'Заказ' => [
            ['Этот товар есть в наличии', 'Этот товар есть в наличии :)'],
            ['Сумма Вашего заказа', '[Name], сумма Вашего заказа: [SumFromClient]'],
        ],
        'Оплата' => [
            ['Qiwi: номер кошелька', "[Name], пожалуйста, сделайте перевод на наш кошелек Qiwi:\n\n
            +7 (916) 123 ****\n\n
            Как только произведете оплату, пожалуйста, пришлите мне скриншот или фото чека об оплате :)"]
        ],
    ];

    protected function rand($tname)
    {
        $randkey = mt_rand(0, count($this->t[$tname])-1);
        return $this->t[$tname][$randkey];
    }

    protected function configure()
    {
        $this
            ->setName('dataGen')
            ->setDescription('Generate Client and 0-5 Orders for him')
            ->addArgument('id', InputArgument::REQUIRED, 'User ID')
            ->addArgument('count', InputArgument::REQUIRED, 'Count Clients')
        ;
    }

    protected function createClient($user)
    {
        $msec = floor(microtime(true) * 1000);
        $time = new UTCDateTime($msec);

        return new Client([
            'user_id' => $user->_id,
            'fio' => $this->rand('fio'),
            'vk_id' => $this->rand('vk_id'),
            'photo' => $this->rand('photo'),
            'country' => $this->rand('country'),
            'city' => $this->rand('city'),
            'crm_status' => $this->rand('crm_status'),
            'tags' => [],
            'comment' => $this->rand('comment'),
            'orders' => [],
            'first_contact' => $time,
            'last_contact' => $time,
            'source' => $this->rand('source'),
        ]);
    }
    protected function createOrder($user, $client)
    {
        return new Order([
            'client_id' => $client->_id,
            'client_fio' => $client->fio,
            'client_vk_id' => $client->vk_id,
            'user_id' => $user->_id,
            'number' => $this->getContainer()->get('mongo')->getCount('orders')+1,
            'status' => $this->rand('status'),
            'price' => rand(10, 1000),
            'comment' => $this->rand('comment'),
        ]);
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $mongo = $this->getContainer()->get('mongo');
        foreach ($mongo->getRussianSities() as $city) {
            $this->t['city'][] = $city['name'];
        }

        $id = $input->getArgument('id');
        $count = $input->getArgument('count');
        $countOrderAll = 0;

        $user = $mongo->findUserById($id);
        if ($user) {
            // for ($i=0; $i < $count; $i++) {
            //     $client = $this->createClient($user);

            //     $mongo->saveClient($client);

            //     $countOrder = rand(0,5);
            //     for ($j=0; $j < $countOrder; $j++) {
            //         $order = $this->createOrder($user, $client);
            //         $mongo->saveOrder($order);
            //         $mongo->addOrderToClient($client, $order);

            //         $countOrderAll++;
            //     }
            // }
            // $output->writeln('Added clients: ' . $count);
            // $output->writeln('Added orders: '  . $countOrderAll);

            // $ps = [];
            // foreach($this->defaultPhrases as $type => $phrases) {
            //     foreach ($phrases as $key => $phrase) {
            //         $ps[] = new Phrase([
            //             'user_id' => $user->_id,
            //             'name'    => $phrase[0],
            //             'type'    => $type,
            //             'text'    => $phrase[1],
            //         ]);
            //     }
            // }
            // $mongo->insertMany('phrases', $ps);
            // $output->writeln('Added default phrases.');

            $output->writeln('fucky lucky');

        } else {
            $output->writeln('Not found user with ID: ' . $id);
        }
    }
}
