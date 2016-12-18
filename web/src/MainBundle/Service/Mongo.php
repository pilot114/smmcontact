<?php

namespace MainBundle\Service;

use MongoDB\Client;
use MongoDB\BSON\UTCDateTime;
use MongoDB\BSON\ObjectID;

// http://mongodb.github.io/mongo-php-library/
class Mongo extends Client
{
	function __construct($uri)
	{
		parent::__construct($uri);
	}
	// utils
	public function insertMany($col, $docs)
	{
		$this->tn->counters->updateOne(
			['type' => $col],
			['$inc' => ['all' => count($docs)]],
			['upsert' => true]
		);
        return $this->tn->$col->insertMany($docs);
	}
	public function getCount($col)
	{
		$doc = $this->tn->counters->findOne(['type' => $col]);
		if ($doc) {
			return $doc->all;
		}
		return 0;
	}


	/*
			USER
	*/
	public function findUserById($id)
	{
		$user = $this->tn->users->findOne(['_id' => new ObjectID($id)]);
	    if ($user) {
	        return $user;
	    }
	    return null;
	}
	public function saveUser($user)
	{
		$updateResult = $this->tn->users->replaceOne(['_id' => $user->_id], $user, ['upsert' => true]);

		// new user
		if ($updateResult->getMatchedCount() == 0) {
			$this->tn->counters->updateOne(
				['type' => 'users'],
				['$inc' => ['all' => 1]],
				['upsert' => true]
			);
		}
	}
	public function findUserByUsername($login)
	{
	    $user = $this->tn->users->findOne(['login' => $login]);
	    if ($user) {
	        return $user;
	    }
	    return null;
	}
	public function findUserByEmail($email)
	{
	    $user = $this->tn->users->findOne(['email' => $email]);
	    if ($user) {
	        return $user;
	    }
	    return null;
	}
	public function findUserByToken($token)
	{
		$users = $this->tn->users->find(['tokens.text'=> $token]);
	    if ($users) {
	    	$users = $users->toArray();
	    	foreach ($users as $k => $user) {
	            $users[$k] = $user;
	        }
	        return $users[0];
	    }
	    return null;
	}

	/*
			CLIENT
	*/
	public function findClientById($id)
	{
		$client = $this->tn->clients->findOne(['_id' => new ObjectID($id)]);
	    if ($client) {
	        return $client;
	    }
	    return null;
	}
	public function saveClient($client)
	{
		// crunch. add type control for string and numbers
		$client->vk_id = intval($client->vk_id);

		$updateResult = $this->tn->clients->replaceOne(['_id' => $client->_id], $client, ['upsert' => true]);

		// new client
		if ($updateResult->getMatchedCount() == 0) {
			$this->tn->counters->updateOne(
				['type' => 'clients'],
				['$inc' => ['all' => 1]],
				['upsert' => true]
			);
		}
	}
	public function addOrderToClient($client, $order)
	{
		$newOrder = [
			'id'      => $order->_id,
			'number'  => $order->number,
			'price'   => $order->price,
			'created' => $order->getCreatedAt()
		];

		$this->tn->clients->updateOne(
			['_id' => $client->_id],
			['$push' => ['orders' => $newOrder] ]
		);
	}
	public function findAllUserClients($user, $limit = null)
	{
		if ($limit) {
			$clients = $this->tn->clients->find(['user_id' => $user->_id], ['limit' => $limit]);
		} else {
			$clients = $this->tn->clients->find(['user_id' => $user->_id]);
		}
		
	    if ($clients) {
	    	$clients = $clients->toArray();
	    	foreach ($clients as $k => $client) {
	            $clients[$k] = $client;
	        }
	        return $clients;
	    }
	    return null;
	}
	public function findAllUserClientsCount($user)
	{
		return iterator_count($this->tn->clients->find(['user_id' => $user->_id]));
	}
	public function findClientByVkId($user, $id)
	{
		$client = $this->tn->clients->findOne(['user_id' => $user->_id, 'vk_id' => intval($id)]);
	    if ($client) {
	        return $client;
	    }
	    return null;
	}

	/*
			ORDER
	*/
	public function findOrderById($id)
	{
		$order = $this->tn->orders->findOne(['_id' => new ObjectID($id)]);
	    if ($order) {
	        return $order;
	    }
	    return null;
	}
	public function findLastClientOrder($user, $vk_id)
	{
		$order = $this->tn->orders->findOne(['user_id' => $user->_id, 'client_vk_id' => intval($vk_id)], [
			'sort'  => ['_id' => -1]
		]);
	    if ($order) {
	        return $order;
	    }
	    return null;
	}

	public function findAllUserOrders($user, $limit = null)
	{
		if ($limit) {
			$orders = $this->tn->orders->find(['user_id' => $user->_id], ['limit' => $limit]);
		} else {
			$orders = $this->tn->orders->find(['user_id' => $user->_id]);
		}
	    if ($orders) {
	    	$orders = $orders->toArray();
	    	foreach ($orders as $k => $order) {
	            $orders[$k] = $order;
	        }
	        return $orders;
	    }
	    return null;
	}
	public function findAllUserOrdersCount($user)
	{
		return iterator_count($this->tn->orders->find(['user_id' => $user->_id]));
	}
	public function findOrdersByVkId($user, $vk_id)
	{
		$orders = $this->tn->orders->find(['user_id' => $user->_id, 'client_vk_id' => intval($vk_id)]);
	    if ($orders) {
	    	$orders = $orders->toArray();
	    	foreach ($orders as $k => $order) {
	            $orders[$k] = $order;
	        }
	        return $orders;
	    }
	    return null;
	}

	public function saveOrder($order)
	{
		$updateResult = $this->tn->orders->replaceOne(['_id' => $order->_id], $order, ['upsert' => true]);

		// new order
		if ($updateResult->getMatchedCount() == 0) {
			$this->tn->counters->updateOne(
				['type' => 'orders'],
				['$inc' => ['all' => 1]],
				['upsert' => true]
			);
		}
	}


	/*
			CITY
	*/
	public function getRussianSities()
	{
		$country_id = "1";
		$sities = $this->tn->sities->find(['country_id' => $country_id]);
		if ($sities) {
			$sities = $sities->toArray();
	    	foreach ($sities as $k => $sity) {
	            $sities[$k] = $sity;
	        }
	        return $sities;
		}
		return null;
	}


	/*
			PHRASE
	*/
	public function findAllUserPhrases($user, $limit = null)
	{
		if ($limit) {
			$phrases = $this->tn->phrases->find(['user_id' => $user->_id], ['limit' => $limit]);
		} else {
			$phrases = $this->tn->phrases->find(['user_id' => $user->_id]);
		}
	    if ($phrases) {
	    	$phrases = $phrases->toArray();
	    	foreach ($phrases as $k => $phrase) {
	            $phrases[$k] = $phrase;
	        }
	        return $phrases;
	    }
	    return null;
	}
	public function savePhrase($phrase)
	{
		$updateResult = $this->tn->phrases->replaceOne(['_id' => $phrase->_id], $phrase, ['upsert' => true]);

		// new phrase
		if ($updateResult->getMatchedCount() == 0) {
			$this->tn->counters->updateOne(
				['type' => 'phrases'],
				['$inc' => ['all' => 1]],
				['upsert' => true]
			);
		}
	}
	public function removePhraseById($id)
	{
		$this->tn->phrases->deleteOne(['_id' => new ObjectID($id)]);
	}

	/*
			PRODUCTS
	*/
	public function findAllProducts()
	{
		$products = $this->tn->products->find();
	    if ($products) {
	    	$products = $products->toArray();
	    	foreach ($products as $k => $product) {
	            $products[$k] = $product;
	        }
	        return $products;
	    }
	    return null;
	}
	public function saveProduct($product)
	{
		$updateResult = $this->tn->products->replaceOne(['_id' => $product->_id], $product, ['upsert' => true]);

		// new product
		if ($updateResult->getMatchedCount() == 0) {
			$this->tn->counters->updateOne(
				['type' => 'products'],
				['$inc' => ['all' => 1]],
				['upsert' => true]
			);
		}
	}
	public function removeProductById($id)
	{
		$this->tn->products->deleteOne(['_id' => new ObjectID($id)]);
	}

	/*
			TAGS
	*/
	public function findAllTags()
	{
		$tags = $this->tn->tags->find();
	    if ($tags) {
	    	$tags = $tags->toArray();
	    	foreach ($tags as $k => $tag) {
	            $tags[$k] = $tag;
	        }
	        return $tags;
	    }
	    return null;
	}
	public function saveTag($tag)
	{
		$updateResult = $this->tn->tags->replaceOne(['_id' => $tag->_id], $tag, ['upsert' => true]);

		// new tag
		if ($updateResult->getMatchedCount() == 0) {
			$this->tn->counters->updateOne(
				['type' => 'tags'],
				['$inc' => ['all' => 1]],
				['upsert' => true]
			);
		}
	}
	public function removeTagById($id)
	{
		$this->tn->tags->deleteOne(['_id' => new ObjectID($id)]);
	}
}
