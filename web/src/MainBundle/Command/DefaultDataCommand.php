<?php

namespace MainBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

use MainBundle\Document\Phrase;
use MainBundle\Document\Tag;
use MainBundle\Document\Product;
use MongoDB\BSON\ObjectID;

class DefaultDataCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this
            ->setName('defaultData')
            ->setDescription('add default phrases, tags and products to user')
            ->addArgument('user_id', InputArgument::REQUIRED, 'user_id')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $user_id = $input->getArgument('user_id');
        $db = $this->getContainer()->get('mongo');
        $user_id = new ObjectID($user_id);


        // add default phrases
        $phrasesData = [
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
        $tagsData = [
            ['Оптовик', '#ff0000'],
            ['Продвижение', '#00ff00'],
        ];
        // only main
        $priceData = [
            'новосибирск' => [
                ['NSK_1', 'Типичный Новосибирск',                   '4900'],
                ['NSK_2', 'Типичный Новосибирск - два размещения',  '4500'],
                ['NSK_3', 'Типичный Новосибирск - без ссылки',      '2500'],
            ],
            'екатеринбург' => [
                ['EKB_1', 'Типичный Екатеринбург',                  '4850'],
                ['EKB_2', 'Типичный Екатеринбург - два размещения', '3850'],
                ['EKB_3', 'Типичный Екатеринбург - без ссылки',     '2500'],
            ],
            'пермь' => [
                ['PRM_1', 'Мой город Пермь',               '3900'],
                ['PRM_2', 'Мой город Пермь - без ссылки',  '2500'],
                ['PRM_3', 'Подслушано Пермь',              '2000'],
            ],
            'красноярск' => [
                ['KSK_1', 'Наш город Красноярск',             '1800'],
                ['KSK_2', 'Наш город Красноярск: Объявления', '350'],
            ],
            'челябинск' => [
                ['CHSK_1', 'Типичный Челябинск',      '1500'],
                ['CHSK_2', 'Подслушано в Челябинске', '1000'],
                ['CHSK_3', 'Челябинск Live',          '500'],
                ['CHSK_4', 'Новости Челябинск',       '500'],
            ],
            'нижний новгород' => [
                ['NN_1', 'Типичный Нижний Новгород',   '1500'],
                ['NN_2', 'Афиша Нижний Новгород',      '1200'],
                ['NN_3', 'Интересный Нижний Новгород', '400'],
            ],
            'ростов на дону' => [
                ['RND_1', 'Ростов Главный',      '3000'],
                ['RND_2', 'Мой Ростов',          '700'],
                ['RND_3', 'Ростов Папа',         '600'],
                ['RND_4', 'Интересный Ростов',   '500'],
                ['RND_5', 'Афиша Ростов',        '400'],
                ['RND_6', 'Ростов Главный (мероприятие)', '1000'],
            ],
            'ульяновск' => [
                ['USK_1', 'Ульяновск',                '2000'],
                ['USK_2', 'Подслушано Ульяновск ',    '800'],
                ['USK_3', 'Знакомства в Ульяновске ', '400'],
                ['USK_4', 'Объявления Ульяновск',     '500'],
                ['USK_5', 'Жильё в Ульяновске',       '400'],
                ['USK_6', 'Сейчас в Ульяновске ',     '400'],
                ['USK_7', 'Инцидент Ульяновск',       '400'],
                ['USK_8', 'Аквапарк Ульяновск',       '500'],
                ['USK_9', 'Ульяновск LIKE',           '500'],
            ],
            // what?
            'кемерово' => [
                ['KMV_1', 'Типичный Кемерово',        '1500'],
                ['KMV_2', 'Типичный Кемерово полный', '2500'],
                ['KMV_3', 'FBI Кемерово',             '800'],
                ['KMV_4', 'FBI Кемерово эконом',      '1200'],
                ['KMV_5', 'FBI Кемерово полный',      '2500'],
                ['KMV_6', 'Подслушано ТК',            '800'],
                ['KMV_7', 'Подслушано ТК эконом',     '1200'],
                ['KMV_8', 'Подслушано ТК полный',     '2500'],
            ],
            'самара' => [
                ['SMR_1', 'Самара',                 '700'],
                ['SMR_2', 'Куплю - продам Самара',  '600'],
                ['SMR_3', 'Самара наш город',       '400'],
                ['SMR_4', 'Интересная Самара',      '300'],
            ],
            'краснодар' => [
                ['KSD_1', 'Интересный Краснодар',   '600'],
                ['KSD_2', 'Я ❤ Краснодар',          '500'],
                ['KSD_3', 'Подслушано Краснодар',   '600'],
                ['KSD_4', 'Объявления Краснодара',  '500'],
                ['KSD_5', 'Афиша Краснодара',       '100'],
            ],
            'барнаул' => [
                ['BN_1', 'Типичный Барнаул', '500'],
            ],
            'воронеж' => [
                ['VN_1', 'Куда сходить в Воронеже?', '400'],
            ],
            'тюмень' => [
                ['TMN_1', 'Тюмень',         '2000'],
                ['TMN_2', 'Тюмень (Анонс)', '1000'],
            ],
            'сочи' => [
                ['SOCHI_1', 'Типичный Сочи',        '1000'],
                ['SOCHI_2', 'Подслушано Сочи',      '800'],
                ['SOCHI_3', 'Интересный Сочи',      '500'],
                ['SOCHI_4', 'Объявления в Сочи',    '300'],
                ['SOCHI_5', 'Аренда жилья в Сочи',  '300'],
            ],
            'новороссийск' => [
                ['NRS_1', 'Типичный Новороссийск', '400'],
            ],
            // 'саратов' => [
            //     [''],
            // ],
            'уфа' => [
                ['UFA_1', 'Уфа', '2900'],
            ],
        ];


        $ps = [];
        foreach($phrasesData as $type => $phrases) {
            foreach ($phrases as $key => $phrase) {
                $ps[] = new Phrase([
                    'user_id' => $user_id,
                    'name'    => $phrase[0],
                    'type'    => $type,
                    'text'    => $phrase[1],
                ]);
            }
        }
        $res = $db->insertMany('phrases', $ps);
        if ($res->isAcknowledged()) {
            $output->writeln('phrases inserted: ' . $res->getInsertedCount());
        } else {
            $output->writeln('Error');
        }
        
        $tags = [];
        foreach ($tagsData as $t) {
            $tags[] = new Tag([
                'user_id'  => $user_id,
                'text'  => $t[0],
                'color' => $t[1],
            ]);
        }
        $res = $db->insertMany('tags', $tags);
        if ($res->isAcknowledged()) {
            $output->writeln('tags inserted: ' . $res->getInsertedCount());
        } else {
            $output->writeln('Error');
        }
        
        $products = [];
        foreach ($priceData as $city => $ps) {
            foreach ($ps as $p) {
                $products[] = new Product([
                    'type'    => $city,
                    'article' => $p[0],
                    'text'    => $p[1],
                    'price'   => $p[2],
                ]);
            }
        }
        $res = $db->insertMany('products', $products);
        if ($res->isAcknowledged()) {
            $output->writeln('products inserted: ' . $res->getInsertedCount());
        } else {
            $output->writeln('Error');
        }
    }
}
