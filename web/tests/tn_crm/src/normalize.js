function dateForInput(milliseconds) {
    if (milliseconds) {
        // convert string to integer
        var d = new Date(+milliseconds);
    } else {
        var d = new Date();
    }

    var day = ("0" + d.getDate()).slice(-2);
    var month = ("0" + (d.getMonth() + 1)).slice(-2);
    return d.getFullYear()+"-"+(month)+"-"+(day);
}

// TODO: normalize convert "null or "undefined" to ""

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
            "comment" : (client.comment) ? client.comment : '',
            "mobile"  : (client.mobile) ? client.mobile : '',
            "email"   : (client.email) ? client.email : '',
            'tags'    : (client.tags) ? client.tags : '',
            'next_contact': nc,
            'last_contact': lc,
        }
    }

    return client;
}
function orderNormalize(order) {

    var cr = dateForInput(order.created.milliseconds);

    order = {
        'number'      : order.number,
        'status'      : order.status,
        'created'     : cr,
        'products'    : order.products,
        'price'       : (order.price) ? order.price : '',
        'comment'     : (order.comment) ? order.comment : '',
    }
    return order;
}