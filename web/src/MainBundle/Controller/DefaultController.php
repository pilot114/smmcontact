<?php

namespace MainBundle\Controller;

use MainBundle\Document\User;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Security\Core\Authentication\Token\UsernamePasswordToken;

use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Response;

use MainBundle\Document\Phrase;

class DefaultController extends Controller
{
    private function zip($source, $destination)
    {
        if (!extension_loaded('zip') || !file_exists($source)) {
            return false;
        }
        $zip = new \ZipArchive();
        if (!$zip->open($destination, \ZIPARCHIVE::CREATE)) {
            return false;
        }
        $source = str_replace('\\', '/', realpath($source));

        if (is_dir($source) === true) {
            $files = new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($source), \RecursiveIteratorIterator::SELF_FIRST);
            foreach ($files as $file){
                $file = str_replace('\\', '/', $file);
                // Ignore "." and ".." folders
                if( in_array(substr($file, strrpos($file, '/')+1), array('.', '..')) ) {
                    continue;
                }
                $file = realpath($file);
                if (is_dir($file) === true) {
                    $zip->addEmptyDir(str_replace($source . '/', '', $file . '/'));
                } else if (is_file($file) === true) {
                    $zip->addFromString(str_replace($source . '/', '', $file), file_get_contents($file));
                }
            }
        } else if (is_file($source) === true) {
            $zip->addFromString(basename($source), file_get_contents($source));
        }
        return $zip->close();
    }

    public function createZipAction()
    {
        if (!$this->getUser()) {
            return new Response("no");
        }

        $dir = './../tests/tn_crm';
        $zipname = "./tn_crm.zip";

        // need permission
        $result = $this->zip($dir, $zipname);
        if ($result) {
            return new BinaryFileResponse($zipname);
        }
        return new Response("no");
    }

    public function indexAction()
    {
        $content = 'main text';

        return $this->render('MainBundle:Default:index.html.twig', [
            'content' =>$content,
        ]);
    }

    public function aboutAction()
    {
        $content = 'about text';

        return $this->render('MainBundle:Default:about.html.twig', [
            'content' =>$content,
        ]);
    }

    public function tariffsAction()
    {
        $content = 'tariffs text';

        return $this->render('MainBundle:Default:tariffs.html.twig', [
            'content' =>$content,
        ]);
    }

    public function contactsAction()
    {
        $content = 'contacts text';

        return $this->render('MainBundle:Default:contacts.html.twig', [
            'content' =>$content,
        ]);
    }

    public function loginAction()
    {
        $authenticationUtils = $this->get('security.authentication_utils');
        $error = $authenticationUtils->getLastAuthenticationError();
        $lastUsername = $authenticationUtils->getLastUsername();

        return $this->render('MainBundle:Default:login.html.twig', [
            'last_username' => $lastUsername,
            'error'         => $error,
        ]);
    }

    public function registerAction()
    {
        $message = '';
        if (!empty($_POST)) {

            $email = $_POST['email'];
            // check email
            if (filter_var($email, FILTER_VALIDATE_EMAIL)) {

                $db = $this->get('mongo');
                // check exist user
                if ($db->findUserByEmail($email)) {

                    $message = 'Этот email уже используется';
                } else {
                    $g = $this->get('gen_string');
                    $pass = $g->gen(8);
                    // default login
                    $login = $email;

                    $user = new User([
                        'roles'     => ['ROLE_USER'],
                        'email'     => $email,
                        'login'     => $login,
                    ]);
                    $password = $this->get('security.password_encoder')->encodePassword($user, $pass);
                    $user->password = $password;
                    $db->saveUser($user);

                    // send email with login/pass
                    $this->get('my_mailer')->sendWelcomeEmail($email, $login, $pass);
        
                    // auth
                    $token = new UsernamePasswordToken(
                        $user,
                        $password,
                        'main',
                        ["ROLE_USER"]
                    );
                    $this->get('security.token_storage')->setToken($token);

                    // redirect to profile
                    return $this->redirectToRoute('profile');
                }
                
            } else {
                $message = 'Неправильный email';
            }
        }
        
        return $this->render('MainBundle:Default:register.html.twig', [
            'message' => $message,
        ]);
    }
}
