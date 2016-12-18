<?php

namespace MainBundle\Document;

class Tag extends Document
{
    public $user_id;
    public $text;
    public $color;

    public function __construct($data)
    {
        parent::__construct($data);
    }
}
