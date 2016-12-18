<?php

namespace MainBundle\Document;

class Product extends Document
{
    public $user_id;
    public $type;
    public $article;
    public $text;
    public $price;
    public $photo;

    public function __construct($data)
    {
        parent::__construct($data);
    }
}
