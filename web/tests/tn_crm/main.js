createClient = function(e) {

    console.log('create!');

    user = e.data.user;

    // from vk
    getClientInfo(sel, function(r){

        client = clientNormalize(r.result, true);
        if (client) {
            client.vk_id = sel;

            $('#client_item').remove();
            clientRender(client, user);

            // api call for save client data
            chrome.runtime.sendMessage({api:"create_client", user:user, client:client}, function(r) {
                console.log(r);
            });
        }
    })
}
createOrder = function(e) {
    user = e.data.user;

    $('#order_item').remove();
    emptyOrder = {};
    emptyOrder.vk_id = sel;
    // api call for create default order data
    chrome.runtime.sendMessage({api:"create_order", user:user, order:emptyOrder}, function(r) {
        // caching order for update
        states.order = r.result;
        if (typeof r.result === 'object') {
            order = orderNormalize(r.result);
            orderRender(order, user);
        } else {
            console.log(r.result);
        }
    });
}

renderInit = function(url, user){

    // fixes vk css
    $('.placeholder').empty();
    $('.ui_rmenu_slider').hide();

    $('.im-right-menu.ui_rmenu').css('width', '310px').css('max-width', '310px');

    sel = getQueryVariable(url, 'sel');

    $('.crm_panel').remove();
    console.log('crm_left_panel remove: ' + $('.crm_left_panel').length);
    $('.crm_left_panel').remove();


    if (sel) {

        getClientInfo(sel, function(r){
            states.vk_client = r.result;
        });


        $('.ui_rmenu[role=list]')
        .prepend("<div class='_im_ui_peers_list crm_panel'><div id='client'></div><div id='order'></div></div>");
        $('#page_layout')
        .prepend('<div class="crm_left_panel"><div id="reminders"></div><div id="phrases"></div></div>');

        var priceF   = false;
        var clientsF = false;
        var ordersF  = false;
        var phrasesF = false;
        var tagsF    = false;

        // PRELOAD
        chrome.runtime.sendMessage({api:"price", user:user}, function(r) {
            products = r.result;
            states.products = products;
            priceF = true;
        });
        chrome.runtime.sendMessage({api:"clients", user:user}, function(r) {
            clients = r.result;
            states.clients = clients;
            clientsF = true;
        });
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
        chrome.runtime.sendMessage({api:"phrases", user:user}, function(r) {
            phrases = r.result;
            $.each(phrases, function(index, value) {
                var v = phrases[index].text;
                // v = v.replace(/<br>/g, "\r\n");
                phrases[index].text = v;
            });

            states.phrases = clone(phrases);
            phrasesF = true;
        });
        chrome.runtime.sendMessage({api:"tags", user:user}, function(r) {
            tags = r.result;
            states.tags = clone(tags);
            tagsF = true;
        });

        // after preload
        var check = function() {
            console.log('try check');
            var flags =  priceF && clientsF && ordersF && phrasesF && tagsF;
            if (flags) {
                console.log('check yeep, cache refresh');
                window.clearInterval(intervalID);

                states.clientTags = [];
                states.orderProducts = [];

                findClient = null;
                if (states.clients) {
                    for (var i = 0; i < states.clients.length; i++) {
                        if (states.clients[i].vk_id == sel) {
                            findClient = states.clients[i];
                        }
                    }
                }
                if (findClient) {
                    findClient = clientNormalize(findClient, false);
                    clientRender(findClient, user);
                } else {

                    getClientInfo(sel, function(r){

                        client = clientNormalize(r.result, true);
                        if (client) {
                            client.vk_id = sel;

                            $('#client_item').remove();
                            clientRender(client, user);

                            // api call for save client data
                            chrome.runtime.sendMessage({api:"create_client", user:user, client:client}, function(r) {
                                console.log(r);
                            });
                        }
                    });
                }
                if (states.clients) {
                    remindersRender(states.clients);
                }

                var order = null;
                if (states.order) {
                    order = orderNormalize(states.order);
                }
                orderRender(order, user);
                $('#new_order').click( {"user":user}, createOrder );

                if (states.phrases) {
                    phrasesClone = clone(states.phrases);
                    phrasesRender( groupBy(phrasesClone, 'type') );
                }
            }
        }
        var intervalID = window.setInterval(check, 200);

    } else {
        // all dialogs
        var dials = $("#im_dialogs li");
        $('.dial-info').remove();
        
        chrome.runtime.sendMessage({api:"clients", user:user}, function(r) {
            clients = r.result;

            if (!clients) {
                return;
            }
            $('#page_layout').prepend('<div class="crm_left_panel"><div id="debug"></div><div id="reminders"></div></div>');
            remindersRender(clients);

            for (var i = 0; i < clients.length; i++) {
                for (var j = 0; j < dials.length; j++) {
                    d = $(dials[j]);
                    if( d.attr('data-list-id') == clients[i].vk_id ){
                        client = clients[i];

                        statuses = {
                            '0':'Другое',
                            '1':'Поинтересовался',
                            '2':'Планирует купить',
                            '3':'Ожидаем предоплату',
                            '4':'Оплачен',
                            '5':'Таймер',
                            '6':'Опубликован',
                            '7':'Отменён',
                        };
                        status = '';
                        $.each(statuses, function(index, value) {
                            if (index == client.crm_status) {
                                status = value;
                            }
                        });
                        var tagsView = "";
                        if ( $.isEmptyObject(client.tags) == false ) {
                            tagsView += "<div class='placeholder'></div>";
                        }
                        $.each(client.tags, function(index, tag) {
                            tagsView += "<span class='label-big' style='background-color:"+tag.color+";'>"+tag.text+"</span>";
                        });

                        d.css("height", "110px");
                        d.find('.nim-dialog--cw')
                        .prepend('<span class="dial-info">\
                            <span class="label label-default">'+client.city+'</span>\
                            <span class="label label-default">'+status+'</span>\
                            '+tagsView+'\
                            </span>');
                    }
                }
            }
            debugRender();
        });
    }
}

$('.im_editable').on('keydown', function(e) {
    var editElem = $(e.target);
    var text = editElem.text();

    // backspace
    if (e.which == 8) {
        text = text.substring(0, text.length - 1);
    }
    // letters, numbers, russian keys
    if ( (e.which <= 90 && e.which >= 48)
        || e.which == 186
        || e.which == 188
        || e.which == 190
        || e.which == 219
        || e.which == 221
        || e.which == 222
    ) {
        text += e.key;
    }
    var searched = searchPhrases(text);

    renderAutocompleteIM(editElem, searched);

    var selectCb = function(sa) {
        $('.im_editable').removeAttr('contenteditable');
        $('.im_editable').text(sa);
        setTimeout(function() {
            $('.im_editable').attr('contenteditable', 'true');
        }, 10);
    }
    // up, down and enter key handling
    selectAutocomplete(e, selectCb);
});

function init(user) {
    console.log('init');

    url = window.location.href;

    renderInit(url, user);

    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        // when switch user in dialogs
        renderInit(request.url, user);
        sendResponse({result: "ok"});
    });
}

// global
var states = {
    'client_expand'    : true,
    'order_expand'     : true,
    'reminders_state' : null,
    'phrases'       : null,
    'clients'       : null,
    'products'      : null,
    'tags'          : null,
    'clientTags'    : [],
    'orderProducts' : [],
    'currentAuto'   : false,
    'order'         : false,
    'addDays'       : null,
    'replaces' : {
        '[Name]': 'default',
        '[ExternalOrderNumber]': 0,
        '[SumFromClient]': 0,
    },
    'vk_client': null,
};

chrome.storage.sync.get('token', function(d) {
    if (d.token) {
        var user = {
            'token': d.token
        };
        init(user);
    }
});





