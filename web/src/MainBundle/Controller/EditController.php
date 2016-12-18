<?php

namespace MainBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

use MainBundle\Document\Product;
use MainBundle\Document\Phrase;
use MainBundle\Document\Tag;
use MongoDB\BSON\ObjectID;

class EditController extends Controller
{
    public function saveAction(Request $request)
    {
        $user = $this->getUser();
        $pd = $request->request->all();

        switch ($pd['entity']) {
            case 'product':
                $p = new Product([
                    '_id'      => new ObjectID($pd['id']),
                    'user_id'  => $user->_id,
                    'type'     => $pd['type'],
                    'article'  => $pd['article'],
                    'text'     => $pd['text'],
                    'price'    => $pd['price'],
                ]);
                $this->get('mongo')->saveProduct($p);
                break;
            case 'tag':
                $t = new Tag([
                    '_id'      => new ObjectID($pd['id']),
                    'user_id'  => $user->_id,
                    'text'  => $pd['text'],
                    'color' => $pd['color'],
                ]);
                $this->get('mongo')->saveTag($t);
                break;
            case 'phrase':
                $p = new Phrase([
                    '_id'      => new ObjectID($pd['id']),
                    'user_id' => $user->_id,
                    'name'    => $pd['name'],
                    'type'    => $pd['type'],
                    'text'    => $pd['text'],
                ]);
                $this->get('mongo')->savePhrase($p);
                break;
            default:
                break;
        }

        return new JsonResponse("ok");
    }

    public function deleteAction(Request $request)
    {
        $user = $this->getUser();
        $pd = $request->request->all();

        switch ($pd['entity']) {
            case 'product':
                $this->get('mongo')->removeProductById($pd['id']);
                break;
            case 'tag':
                $this->get('mongo')->removeTagById($pd['id']);
                break;
            case 'phrase':
                $this->get('mongo')->removePhraseById($pd['id']);
                break;
            default:
                break;
        }

        return new JsonResponse("ok");
    }

}
