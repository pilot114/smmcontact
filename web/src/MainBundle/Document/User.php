<?php

namespace MainBundle\Document;

use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\EquatableInterface;

use MongoDB\BSON\UTCDateTime;
use MainBundle\Document\Token;

class User extends Document implements UserInterface, EquatableInterface
{
    // user fields
    public $roles = [];
    public $email;
    public $login;
    public $password;
    public $salt;
    public $name;
    public $lastLogin;

    public $tokens = [];

    public function __construct($data)
    {
        parent::__construct($data);

        $bytes = openssl_random_pseudo_bytes(8);
        $this->salt = bin2hex($bytes);

        $adminToken = bin2hex(openssl_random_pseudo_bytes(8));
        $token = new Token([
            'text'  => $adminToken,
            'owner' => '',
            'filter' => '',
        ]);
        $this->tokens[] = $token;

        $msec = floor(microtime(true) * 1000);
        $this->lastLogin = new UTCDateTime($msec);
    }
    

    // UserInterface, EquatableInterface
    public function getRoles()
    {
        return is_object($this->roles) ? $this->roles->bsonSerialize() : $this->roles;
    }

    public function getPassword()
    {
        return $this->password;
    }

    public function getSalt()
    {
        return $this->salt;
    }

    public function getUsername()
    {
        return $this->login;
    }

    public function eraseCredentials()
    {
    }

    public function isEqualTo(UserInterface $user)
    {
        if (!$user instanceof User) {
            return false;
        }

        if ($this->password !== $user->getPassword()) {
            return false;
        }

        if ($this->salt !== $user->getSalt()) {
            return false;
        }

        if ($this->login !== $user->getUsername()) {
            return false;
        }
        return true;
    }
}
