<?php

namespace MainBundle\Service;


class Mailer
{
	private $mail;
	private $twig;
	private $adminEmail = 'admin@tn.com';

	function __construct($mail ,$twig)
	{
		$this->mail = $mail;
		$this->twig = $twig;
	}

	public function sendWelcomeEmail($email, $login, $pass)
	{
        $message = \Swift_Message::newInstance()
		    ->setSubject('Welcome')
		    ->setFrom($this->adminEmail)
		    ->setTo($email)
		    ->setBody(
		        $this->twig->render(
		            'Emails/registration.html.twig',
		            [
		            	'login' => $login,
		            	'pass' => $pass,
	            	]
		        ),
		        'text/html'
		    );
	    $this->mail->send($message);
	}

}
