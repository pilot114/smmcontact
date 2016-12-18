<?php

namespace MainBundle\Document;

class Phrase extends Document
{
    public $user_id;
    public $name;
    public $type;
    public $text;

    public function __construct($data)
    {
        parent::__construct($data);
    }
}
