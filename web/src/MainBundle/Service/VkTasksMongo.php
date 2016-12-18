<?php

namespace MainBundle\Service;

use MongoDB\Client;
use MongoDB\BSON\UTCDateTime;
use MongoDB\BSON\ObjectID;
use MongoDB\BSON\Regex;

// http://mongodb.github.io/mongo-php-library/
class VkTasksMongo extends Client
{
	function __construct($uri)
	{
		parent::__construct($uri);
	}

	// utils
	public function findPriorityTask()
	{
		$regex = new Regex("^(finished|paused)$");
		$task = $this->search->tasks->findOne(['status' =>  ['$not' => $regex] ]);

	    if ($task) {
	        return $task;
	    }
	    return null;
	}

	public function findAllTasks()
	{
		return $this->search->tasks->find()->toArray();
	}

	public function findTaskById($id)
	{
		$task = $this->search->tasks->findOne(['_id' => new ObjectID($id)]);
	    if ($task) {
	        return $task;
	    }
	    return null;
	}
	public function saveTask($task)
	{
		$updateResult = $this->search->tasks->replaceOne(['_id' => $task->_id], $task, ['upsert' => true]);
	}
	public function removeTaskById($id)
	{
		$this->search->tasks->deleteOne(['_id' => new ObjectID($id)]);
	}
}
