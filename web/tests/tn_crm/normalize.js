function clientNormalize(client, from_vk) {
    if (from_vk) {
        var nc = dateForInput();
        var lc = dateForInput();

        client = {
            "name"    : client.first_name+' '+client.last_name,
            "country" : (typeof client.country !== "undefined") ? client.country.title : 'Не указана',
            "city"    : (typeof client.city !== "undefined") ? client.city.title : 'Не указан',
            "photo"   : (typeof client.photo_100 !== "undefined") ? client.photo_100 : 'Не указан',
            "source"  : 2,
            "status"  : 1,
            "comment" : "",
            "mobile" : "",
            "email" : "",
            'next_contact': nc,
            'last_contact': lc,
        }
    } else {

        var nc = dateForInput();
        if (client.next_contact) {
            nc = dateForInput(client.next_contact.milliseconds);
        }
        var lc = dateForInput(client.last_contact.milliseconds);

        client = {
            "name"    : client.fio,
            "country" : client.country,
            "city"    : client.city,
            "source"  : client.source,
            "status"  : client.crm_status,
            "comment" : (client.comment !== null) ? client.comment : '',
            "mobile"  : (client.mobile !== null) ? client.mobile : '',
            "email"   : (client.email !== null) ? client.email : '',
            'tags'    : (client.tags !== null) ? client.tags : '',
            'next_contact': nc,
            'last_contact': lc,
        }
    }

    return client;
}
function orderNormalize(order) {

    var cr = dateForInput(order.created.milliseconds);

    order = {
        'order_number': order.order_number,
        'status'      : order.status,
        'created'     : cr,
        'products'    : order.products,
        'price'       : (order.price !== null) ? order.price : '',
        'comment'     : (order.comment !== null) ? order.comment : '',
    }
    return order;
}