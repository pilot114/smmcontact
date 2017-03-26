// global
states = {
    'user'            : null,
    'cache_loaded'    : false,

    'client_expand'    : true,
    'order_expand'     : true,
    'reminders_state'  : null,

    // for caching
    'clients'       : null,
    'phrases'       : null,
    'products'      : null,
    'tags'          : null,

    'clientTags'    : [],
    'orderProducts' : [],

    'order'         : false,
    'currentAuto'   : false,
    'addDays'       : null,
    'replaces' : {
        '[Name]': 'default',
        '[ExternalOrderNumber]': 0,
        '[SumFromClient]': 0,
    },
    'vk_client': null,

    "priceF"   : false,
    "clientsF" : false,
    "ordersF"  : false,
    "phrasesF" : false,
    "tagsF"    : false,

    "window_height" : 0,
};

preload = function(user, sel) {
    console.log("**preload**");

    if (sel) {
        chrome.runtime.sendMessage({api:"orders", user:user, client_id:sel, onlyLast:true}, function(r) {
            $('#order_item').remove();
            order = null;
            if (r.result) {
                order = r.result[0];
            }

            if (order) {
                states.order = clone(order);
            } else {
                // for clear change client
                states.order = null;
            }
            ordersF = true;
        });
    }

    chrome.runtime.sendMessage({api:"clients", user:user}, function(r) {
        clients = r.result;
        states.clients = clone(clients) || [];
        states.clientsF = true;
    });
    chrome.runtime.sendMessage({api:"price", user:user}, function(r) {
        products = r.result;
        states.products = clone(products) || [];
        states.priceF = true;
    });
    chrome.runtime.sendMessage({api:"phrases", user:user}, function(r) {
        phrases = r.result;
        $.each(phrases, function(index, value) {
            var v = phrases[index].text;
            // v = v.replace(/<br>/g, "\r\n");
            phrases[index].text = v;
        });

        states.phrases = clone(phrases) || [];
        states.phrasesF = true;
    });
    chrome.runtime.sendMessage({api:"tags", user:user}, function(r) {
        tags = r.result;
        states.tags = clone(tags) || [];
        states.tagsF = true;
    });
}