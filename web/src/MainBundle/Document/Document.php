<?php

namespace MainBundle\Document;

use MongoDB\BSON\Persistable;
use MongoDB\BSON\UTCDateTime;
use MongoDB\BSON\ObjectID;
use MongoDB\Model\BSONArray;

class Document implements Persistable
{
    public $_id;

    public function __construct($data)
    {
        // maybe override from data
        $this->_id = new ObjectID();

        foreach ($data as $key => $val) {
          if (property_exists($this, $key) && $val != null) {
              $this->$key = $val;
          }
        }
    }

    public function getCreatedAt()
    {
      $sec = hexdec( substr((string)$this->_id, 0, 8) );
      return (new UTCDateTime($sec * 1000)); // msec
    }


    // for serialize
    public function __sleep()
    {
        $cleared = $this->bsonSerialize();
        foreach ($this as $key => $val) {
            $this->$key = $cleared[$key];
        }
        return array_keys($cleared);
    }

    // object -> db
    public function bsonSerialize()
    {
      $data = [];
      foreach ($this as $key => $val) {
        $data[$key] = $val;
      }
      return $data;
    }

    // db -> object
    public function bsonUnserialize(array $data)
    {
      foreach ($data as $key => $val) {
        if (property_exists($this, $key) && $val != null) {
            $this->$key = $val;
        }
      }
    }
}
