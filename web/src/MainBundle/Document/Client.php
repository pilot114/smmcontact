<?php

namespace MainBundle\Document;

use MongoDB\BSON\UTCDateTime;

class Client extends Document
{
    static $crm_status_const = [
        /*
            (8)
            0 => Другое
            поинтересовался
            планирует купить
            ожидаем предоплату
            оплачен
            таймер
            опубликован
            отменён
        */
        // 0        1           2           3           4          5        6           7
        'OTHER', 'INTEREST', 'PLANNING', 'PREPAYMENT', 'ORDER', 'TIMER', 'PUBLISH', 'CANCEL'
    ];
    static $source_const = [
        1 => 'FRIEND', 'SELF'
    ];

    public $user_id;

    public $fio;
    public $vk_id;
    public $photo;
    public $country;
    public $city;
    public $crm_status;
    public $tags = [];
    public $comment;
    public $orders = [];
    public $first_contact;
    public $last_contact;
    public $next_contact;
    public $source;
    public $mobile;
    public $email;
    
    public $imported;

    public function __construct($data)
    {
        // maybe override from data
        $msec = floor(microtime(true) * 1000);
        $this->last_contact = new UTCDateTime($msec);

        parent::__construct($data);
    }
}
