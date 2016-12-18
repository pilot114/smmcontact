<?php

namespace MainBundle\Document;

class ApiTask extends Document
{
    public $code;
    public $data;
    public $type;
    public $name;
    public $percent;
    public $result;
    public $captcha;
    /*
    created
    proccessed
    finished
    paused
    */
    public $status;

    public function __construct($data)
    {
        parent::__construct($data);
    }
}
