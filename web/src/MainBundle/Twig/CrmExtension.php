<?php

namespace MainBundle\Twig;

use MainBundle\Document\Client;
use MainBundle\Document\Order;
use MongoDB\Model\BSONArray;

class CrmExtension extends \Twig_Extension
{
    private $map = [
        'OTHER'      => ['Другое', 'default'],
        'INTEREST'   => ['Поинтересовался', 'info'],        // 1
        'PLANNING'   => ['Планирует купить', 'primary'],    // 2
        'PREPAYMENT' => ['Ожидаем предоплату', 'success'],  // 3
        'ORDER'      => ['Оплачен', 'warning'],             // 4
        'TIMER'      => ['Таймер', 'primary'],              // 5
        'PUBLISH'    => ['Опубликован', 'success'],         // 6
        'CANCEL'     => ['Отменён', 'danger'],              // 7

        'FRIEND'     => ['Узнал от друга'],
        'SELF'       => ['Нашёл сам'],

        'O_NEW'       => ['Новый'],                 // 1
        'O_RESERV'    => ['Резерв'],                // 2
        'O_PREORDER'  => ['Предзаказ'],             // 3
        'O_PRESEND'   => ['Передан на отправку'],   // 4
        'O_DELIVERED' => ['Доставлен'],             // 5
        'O_CANCEL'    => ['Отменён']                // 6
    ];

    public function getFilters()
    {
        return [
            new \Twig_SimpleFilter('const', [$this, 'constFilter']),
        ];
    }

    private function renderLabel($options)
    {
        // its boostrap label
        if (isset($options[1])) {
            return '<span class="label-big label-' . $options[1] . '">' . $options[0] . '</span> ';
        } else {
            return '<p>' . $options[0] . '</p> ';
        }
    }

    // client crm_status
    //  example: order, "status"
    public function constFilter($obj, $field)
    {
        $result = '';
        $constField = $field . '_const';

        $constNames = [];
        if (is_array($obj->$field) || $obj->$field instanceof BSONArray) {
            foreach ($obj->$field as $v) {
                $constNames[] = get_class($obj)::$$constField[$v];
            }
        } else {
            // example: Order::status_const[order->status]
            $constNames[] = get_class($obj)::$$constField[$obj->$field];
        }

        foreach ($constNames as $constName) {
            if (isset($constName)) {
                $result .= $this->renderLabel($this->map[$constName]);
            }
        }
        return $result;
    }

    public function getName()
    {
        return 'crm_extension';
    }
}