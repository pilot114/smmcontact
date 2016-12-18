<?php

namespace MainBundle\Document;

// EMBED! saved only in User

class Token extends Document
{
    public $text;
    public $owner;
    public $filter;

    public function __construct($data)
    {
        parent::__construct($data);
    }
}
