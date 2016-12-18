<?php

namespace MainBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

use MainBundle\Document\Token;
use MainBundle\Document\Product;
use MainBundle\Document\Tag;
use MainBundle\Document\Phrase;

class ProfileController extends Controller
{
    public function indexAction()
    {
        $clients = $this->get('mongo')->findAllUserClients($this->getUser(), 3);
        $clientsCount = $this->get('mongo')->findAllUserClientsCount($this->getUser());
        $orders = $this->get('mongo')->findAllUserOrders($this->getUser(), 3);
        $ordersCount = $this->get('mongo')->findAllUserOrdersCount($this->getUser());

        return $this->render('MainBundle:Profile:index.html.twig', [
            'clients'       => $clients,
            'clients_count' => $clientsCount,
            'orders'        => $orders,
            'orders_count'  => $ordersCount,
        ]);
    }

    public function clientsAction()
    {
        $clients = $this->get('mongo')->findAllUserClients($this->getUser());

        $min = new \DateTime();
        $max = new \DateTime();
        foreach ($clients as $i => $client) {
            if ($client->first_contact) {
                $cur = $client->first_contact->toDateTime();
                $min = min($min, $cur);
                $max = max($max, $cur);
            }
        }

        return $this->render('MainBundle:Profile:clients.html.twig', [
            'clients' => $clients,
            'min_fc' => $min,
            'max_fc' => $max,
        ]);
    }

    public function clientAction($id)
    {
        try {
            $client = $this->get('mongo')->findClientById($id);
        } catch (\Exception $e) {
            echo 'wrong client id';
            die();            
        }
        $clients = is_null($client) ? [] : [$client];

        return $this->render('MainBundle:Profile:client.html.twig', [
            'clients' => $clients,
        ]);
    }

    public function ordersAction()
    {
        $orders = $this->get('mongo')->findAllUserOrders($this->getUser());

        return $this->render('MainBundle:Profile:orders.html.twig', [
            'orders' => $orders,
        ]);
    }

    public function orderAction($id)
    {
        try {
            $order = $this->get('mongo')->findOrderById($id);
        } catch (\Exception $e) {
            echo 'wrong order id';
            die();            
        }
        $orders = is_null($order) ? [] : [$order];

        return $this->render('MainBundle:Profile:order.html.twig', [
            'orders' => $orders,
        ]);
    }

    public function reportsAction()
    {
        $content = 'выручка и конверсия/ по источникам/ предоплаты/ продажи по продуктам => выбор по периодам, группировка
        по дням/неделям и т.д.';

        return $this->render('MainBundle:Profile:reports.html.twig', [
            'content' => $content,
        ]);
    }


    public function phrasesAction()
    {
        $phrases = $this->get('mongo')->findAllUserPhrases($this->getUser());

        return $this->render('MainBundle:Profile:phrases.html.twig', [
            'phrases' => $phrases,
        ]);
    }

    public function tagsAction()
    {
        $tags = $this->get('mongo')->findAllTags();

        return $this->render('MainBundle:Profile:tags.html.twig', [
            'tags' => $tags,
        ]);
    }

    public function productsAction()
    {
        $products = $this->get('mongo')->findAllProducts();

        return $this->render('MainBundle:Profile:products.html.twig', [
            'products' => $products,
        ]);
    }

    public function settingsAction()
    {
        return $this->render('MainBundle:Profile:settings.html.twig', [
        ]);
    }




    // add actions
    public function addTokenAction(Request $request)
    {
        $params = $request->request->all();
        $tokenText = bin2hex(openssl_random_pseudo_bytes(8));
        $token = new Token([
            'owner'  => $params['owner'],
            'filter' => $params['filter'],
            'text'   => $tokenText
        ]);
        $user = $this->getUser();
        $user->tokens[] = $token;
        $this->get('mongo')->saveUser($user);
        return $this->redirectToRoute('profile_settings');
    }
    public function addProductAction(Request $request)
    {
        $user = $this->getUser();
        $params = $request->request->all();
        $product = new Product([
            'user_id'  => $user->_id,
            'type'     => $params['type'],
            'article'  => $params['article'],
            'text'     => $params['text'],
            'price'    => $params['price'],
        ]);
        $this->get('mongo')->saveProduct($product);
        return $this->redirectToRoute('profile_products');
    }
    public function addTagAction(Request $request)
    {
        $user = $this->getUser();
        $params = $request->request->all();
        $tag = new Tag([
            'user_id'  => $user->_id,
            'text'  => $params['text'],
            'color' => $params['color'],
        ]);
        $this->get('mongo')->saveTag($tag);
        return $this->redirectToRoute('profile_tags');
    }
    public function addPhraseAction(Request $request)
    {
        $user = $this->getUser();
        $params = $request->request->all();
        $phrase = new Phrase([
            'user_id' => $user->_id,
            'name'    => $params['name'],
            'type'    => $params['type'],
            'text'    => $params['text'],
        ]);
        $this->get('mongo')->savePhrase($phrase);
        return $this->redirectToRoute('profile_phrases');
    }
}
