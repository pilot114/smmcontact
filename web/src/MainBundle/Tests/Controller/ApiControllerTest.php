<?php

namespace MainBundle\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class ApiControllerTest extends WebTestCase
{
    public function testUserpost()
    {
        $client = static::createClient();

        $crawler = $client->request('GET', '/userPost');
    }

}
