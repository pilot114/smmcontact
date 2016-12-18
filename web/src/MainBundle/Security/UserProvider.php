<?php

namespace MainBundle\Security;

use Symfony\Component\Security\Core\User\UserProviderInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\Exception\UnsupportedUserException;

use MainBundle\Document\User;

class UserProvider implements UserProviderInterface
{
    private $db;

    public function __construct($db)
    {
        $this->db = $db;
    }

    public function loadUserByUsername($username)
    {
        return $this->db->findUserByUsername($username);
    }

    public function refreshUser(UserInterface $user)
    {
        if (!$user instanceof User) {
            throw new UnsupportedUserException(
                sprintf('Instances of "%s" are not supported.', get_class($user))
            );
        }
        return $this->loadUserByUsername($user->getUsername());
    }

    public function supportsClass($class)
    {
        return $class === 'MainBundle\Document\User';
    }
}
