<?php

namespace MainBundle\Document;

class Order extends Document
{
    static $status_const = [
        1 => 'O_NEW', 'O_RESERV', 'O_PREORDER', 'O_PRESEND', 'O_DELIVERED', 'O_CANCEL'
    ];

    public $client_id;
    public $client_fio;
    public $client_vk_id;
    public $user_id;

    public $number;
    public $status;
    public $price;
    public $comment;
    public $products = [];

    public function __construct($data)
    {
        parent::__construct($data);
    }
}
