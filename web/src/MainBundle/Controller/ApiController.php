<?php

namespace MainBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

use MongoDB\BSON\UTCDateTime;

use MainBundle\Document\Client;
use MainBundle\Document\Order;

class ApiController extends Controller
{
    private $m; // mongo
    private $token;

    private function getApiUser($data)
    {
        $this->m = $this->get('mongo');
        if (isset($data['token'])) {
            $user = $this->m->findUserByToken($data['token']);
            foreach ($user->tokens as $token) {
                if ($token->text == $data['token']) {
                    $this->token = $token;
                }
            }
            return $user;
        }
        return null;
    }
    // only for clientGetAction
    private function filterByToken($data)
    {
        // city:Новосибирск
        $filter = $this->token->filter;
        if ($filter) {
            $subfilters = explode(",", $filter);
            $checks = [];
            foreach ($subfilters as $f) {
                list($field, $value) = explode(":", $f);
                $checks[$field] = $value;
            }
            $needChecks = count($subfilters);

            $filtered = [];
            foreach ($data as $client) {
                $checked = 0;
                foreach ($checks as $fi => $va) {
                    // crunch for filter by status
                    if ($fi == 'status') {
                        // TODO TODO TODO!!!!
                    }

                    if ($client->$fi == $va) {
                        $checked++;
                    }                    
                }
                if ($checked == $needChecks) {
                    $filtered[] = $client;
                }
            }
            return $filtered;
        }
        return $data;
    }

    public function clientCreateAction(Request $request)
    {
        // TODO: try-catch for all api
        try {
        
    	$postData = $request->request->all();
        $user = $this->getApiUser($postData);
        if (!$user) {
            return new JsonResponse(['error' => 'user not found']);
        }
        $cd = $postData['client'];

        // case with try create from manager (with filters)
        $client = $this->m->findClientByVkId($user, $cd['vk_id']);
        if ($client) {
            // client already created
            return new JsonResponse($client);
        }

        $msec = floor(microtime(true) * 1000);
        $time = new UTCDateTime($msec);
    	$client =  new Client([
            'user_id' => $user->_id,
            'fio' => $cd['name'],
            'vk_id' => $cd['vk_id'],
            'photo' => $cd['photo'],
            'country' => $cd['country'],
            'city' => $cd['city'],
            'crm_status' => $cd['status'],
            'comment' => $cd['comment'],
            'first_contact' => $time,
            'last_contact' => $time,
            'next_contact' => $time,
            'source' => $cd['source'],

            'mobile' => $cd['mobile'],
            'email' => $cd['email'],
        ]);
    	$this->get('mongo')->saveClient($client);

        } catch (\Exception $e) {
            return new JsonResponse($e->getMessage());
        }

        $res = $client;
    	return new JsonResponse($res);
    }
    public function orderCreateAction(Request $request)
    {
        $postData = $request->request->all();
        $user = $this->getApiUser($postData);
        if (!$user) {
            return new JsonResponse(['error' => 'user not found']);
        }
        $od = $postData['order'];

        // case with try create from manager (with filters)
        $orders = $this->m->findOrdersByVkId($user, $od['vk_id']);
        if ($orders) {
            return new JsonResponse(['error' => 'order already created']);
        }

        $client = $this->m->findClientByVkId($user, $od['vk_id']);
        $order = new Order([
            'client_id' => $client->_id,
            'client_fio' => $client->fio,
            'client_vk_id' => $client->vk_id,
            'user_id' => $user->_id,
            'number' => $this->m->getCount('orders')+1,
            'status' => 1,
            'price' => "0",
            'comment' => "",
        ]);
        
        $order->created = $order->getCreatedAt();

        $this->m->saveOrder($order);
        $this->m->addOrderToClient($client, $order);

        $res = $order;
        return new JsonResponse($res);
    }

    public function clientPostAction(Request $request)
    {
        try {
        $postData = $request->request->all();
        $user = $this->getApiUser($postData);
        if (!$user) {
            return new JsonResponse(['error' => 'user not found']);
        }
        $c = $postData['client'];

        $client = $this->m->findClientByVkId($user, $c['vk_id']);
        $client->city = $c['city'];
        $client->comment = $c['comment'];
        $client->country = $c['country'];
        $client->fio = $c['name'];
        $client->source = $c['source'];
        $client->crm_status = $c['status'];
        if (isset($c['tags'])) {
            $client->tags = $c['tags'];
        } else {
            $client->tags = [];
        }
        $client->vk_id = $c['vk_id'];
        $client->mobile = $c['mobile'];
        $client->email = $c['email'];

        $msec = floor(strtotime($c['next_contact']) * 1000);
        $client->next_contact = new UTCDateTime($msec);
        $msec = floor(strtotime($c['last_contact']) * 1000);
        $client->last_contact = new UTCDateTime($msec);

        $this->m->saveClient($client);

        $res = $client;
        return new JsonResponse($res);

        } catch (\Exception $e) {
            return new JsonResponse([$e->getMessage(), $e->getLine()]);
        }
    }
    public function orderPostAction(Request $request)
    {
        try {
        $postData = $request->request->all();
        $user = $this->getApiUser($postData);
        if (!$user) {
            return new JsonResponse(['error' => 'user not found']);
        }

        $o = $postData['order'];
        $order = $this->m->findOrderById($o['_id']['oid']);
        $order->comment = $o['comment'];
        $order->price = $o['price'];
        if (isset($o['products'])) {
            $order->products = $o['products'];
        } else {
            $order->products = [];
        }
        $order->status = $o['status'];
        $this->m->saveOrder($order);

        $client = $this->m->findClientByVkId($user, $o['client_vk_id']);
        foreach ($client->orders as $i => $ord) {
            if ($ord->id == $order->_id) {
                $client->orders[$i]->price = $order->price;
            }
        }
        $this->m->saveClient($client);

        $res = $order;

        return new JsonResponse($res);
        } catch (\Exception $e) {
            return new JsonResponse([$e->getMessage(), $e->getLine()]);
        }
    }



    public function clientGetAction(Request $request)
    {
        $postData = $request->query->all();
        $user = $this->getApiUser($postData);
        if (!$user) {
            return new JsonResponse(['error' => 'user not found']);
        }

        if (isset($postData['vk_id'])) {
            $clients = [$this->m->findClientByVkId($user, $postData['vk_id'])];
        } else {
            $clients = $this->m->findAllUserClients($user);
        }
        return new JsonResponse($this->filterByToken($clients));
    }

    public function phraseGetAction(Request $request)
    {
        $postData = $request->query->all();
        $user = $this->getApiUser($postData);
        if (!$user) {
            return new JsonResponse(['error' => 'user not found']);
        }

        $phrases = $this->m->findAllUserPhrases($user);
        return new JsonResponse($phrases);
    }

    public function orderGetAction(Request $request)
    {
        $postData = $request->query->all();
        $user = $this->getApiUser($postData);
        if (!$user) {
            return new JsonResponse(['error' => 'user not found']);
        }

        if (isset($postData['vk_id'])) {
            if (isset($postData['only_last'])) {
                $last = $this->m->findLastClientOrder($user, $postData['vk_id']);
                $orders = $last ? [$last] : [];
            } else {
                $orders = $this->m->findOrdersByVkId($user, $postData['vk_id']);
            }
        } else {
            $orders = $this->m->findAllUserOrders($user);
        }

        foreach ($orders as $key => $order) {
            $order->created = $order->getCreatedAt();
        }            
        return new JsonResponse($orders);
    }

    public function productGetAction(Request $request)
    {
        $postData = $request->query->all();
        $user = $this->getApiUser($postData);
        if (!$user) {
            return new JsonResponse(['error' => 'user not found']);
        }

        $products = $this->m->findAllProducts();
        return new JsonResponse($products);
    }

    public function tagGetAction(Request $request)
    {
        $postData = $request->query->all();
        $user = $this->getApiUser($postData);
    
        if (!$user) {
            return new JsonResponse(['error' => 'user not found']);
        }

        $tags = $this->m->findAllTags();
        return new JsonResponse($tags);
    }
}
