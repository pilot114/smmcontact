function removeTagListener() {
    $('#tags_view').find('.close').click(function(){
        deb.log('RENDER: click remove tag!');
        var tagText = '';
        $(this).parent().contents().each(function(){
            if(this.localName === 'span'){
                tagText += this.textContent;
            }
        });
        deb.log('RENDER: try remove tag with text -' + tagText);

        $(app.state.clientTags).each(function(){
            if(this.text === tagText){
                app.state.clientTags.splice( $.inArray(this, app.state.clientTags), 1);
            }
        });
        $(this).parent().remove();
    });
}
function removeProductListener() {
    $('#products_view').find('.close').click(function(){
        deb.log('RENDER: click remove product!');
        var articleNode = $(this).parent().find('.article_product')[0];
        var article = $(articleNode).text();

        $(app.state.orderProducts).each(function(){
            if(this.article === article){
                deb.log(app.state.orderProducts);
                app.state.orderProducts.splice( $.inArray(this, app.state.orderProducts), 1);
                deb.log(app.state.orderProducts);

                // change common price
                var op = $('#order_price');
                op.val( (+op.val())-(+this.price) );

                phrasesClone = util.clone(app.state.phrases);
                phrasesRender( util.groupBy(phrasesClone, 'type') );
            }
        });
        $(this).parent().remove();
    });
}

function createLabelView(text, color) {
    var lView = "<div class='my_label'><span class='label-big' style='background-color:"+color+";'>"
    + text
    +"</span>"
    + '<button type="button" class="close" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>';
    return lView;
}

function dialogsRender(){
    deb.log("RENDER: dialogs");
    // all dialogs
    var dials = $("#im_dialogs li");
    $('.dial-info').remove();

    // NEED OPTIMIZATION
    for (var i = 0; i < app.state.clients.length; i++) {
        for (var j = 0; j < dials.length; j++) {
            d = $(dials[j]);
            if( d.attr('data-list-id') == app.state.clients[i].vk_id ){
                var client = app.state.clients[i];

                var status = '';
                $.each(app.state.statuses, function(index, value) {
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

                var height = d.find('.nim-dialog--cw').height();

                d.find('.nim-dialog--cw')
                .prepend('<div class="dial-info">\
                    <span class="label label-default">'+client.city+'</span>\
                    <span class="label label-default">'+status+'</span>\
                    <div class="tags_area">'+tagsView+'</div>\
                    </div>');

                d.height( height + d.find('.tags_area').height() + 30 );
            }
        }
    }
}

function clientRender(client) {
    deb.log("RENDER: client");
    $('#client_item').remove();

    clientView = "";
    tagsView = "";
    viewStatuses = "";
    viewSources = "";

    if(!client){
        clientView = '<a id="crm_client" state="true">КЛИЕНТ <span>▲</span><span style="display: none">▼</span></a>\
        <table><tr><td><a id="new_client";">Новый</a></td></tr></table>';
    } else {
        $.each(app.state.statuses, function(index, value) {
            if (index == client.status) {
                viewStatuses += '<option selected value="'+index+'">'+value+'</option>';
            } else {
                viewStatuses += '<option value="'+index+'">'+value+'</option>';
            }
        });
        $.each(app.state.sources, function(index, value) {
            if (index == client.source) {
                viewSources += '<option selected value="'+index+'">'+value+'</option>';
            } else {
                viewSources += '<option value="'+index+'">'+value+'</option>';
            }
        });

        $.each(client.tags, function(i, t) {
            app.state.clientTags.push(t);
            tagsView += createLabelView(t.text, t.color);
        });

        clientView = '<a id="crm_client" state="true">КЛИЕНТ <span>▲</span><span style="display: none">▼</span></a>\
        <table>\
        <tr><td><b>ФИО       </b></td><td><input   class="in_cl" type="text" name="name" value="'   +client.name+   '"></td></tr>\
        <tr><td><b>Страна    </b></td><td><input   class="in_cl" type="text" name="country" value="'+client.country+'"></td></tr>\
        <tr><td><b>Город     </b></td><td><input   class="in_cl" type="text" name="city" value="'   +client.city+   '"></td></tr>\
        <tr><td><b>Источник  </b></td><td><select  class="in_cl" name="source">' + viewSources + '</select></td></tr>\
        <tr><td><b>CRM статус</b></td><td><select  class="in_cl" name="status">' + viewStatuses + '</select></td></tr>\
\
        <tr><td></td><td id="tags_view">'+tagsView+'<td></tr>\
        <tr><td><b>Добавить тег</b></td><td><input id="addTag"></td></tr>\
\
        <tr><td><b>Пос.контакт</b></td>  <td><input class="in_cl" type="date" name="last_contact" value="'+client.last_contact+'"></td></tr>\
        <tr><td><b>След.контакт</b></td> <td>+<input type="text" style="width:20px;" name="add_days">  <input style="width:140px; class="in_cl" type="date" name="next_contact" value="'+client.next_contact+'"></td></tr>\
\
        <tr><td><b>Телефон</b></td>  <td><input class="in_cl" type="text" name="mobile" value="'+client.mobile+'"></td></tr>\
        <tr><td><b>Email</b></td>  <td><input class="in_cl"   type="text" name="email"  value="'+client.email +'"></td></tr>\
\
        <tr><td><b>Примечание</b></td>   <td><div contentEditable="true" class="in_cl" name="comment">'+client.comment+'</div></td></tr>\
        </table>';
        clientView += '<button style="" class="btn btn-primary" id="sendClient">Обновить</button>';
    }

    var item = '<div id="client_item" style="line-height: 1.154; padding: 0 5px 10px 20px;">' + clientView + '</div>';
    $('#client').append(item);
    removeTagListener();

    $('input[name=add_days]').on('input', function(){
        app.state.addDays = $(this).val();
    });

    $( "#addTag" ).on('keydown', function(e) {
        tagsView = "";
        
        var editElem = $(e.target);
        var text = editElem.val();

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

        var selectCb = function(sa) {
            var tags = $.grep(app.state.tags, function(v) {
                return v.text === sa;
            });

            var tag = tags[0];
            app.state.clientTags.push(tag);

            if (tag) {
                tagsView = createLabelView(tag.text, tag.color);
                $('#tags_view').append(tagsView);
                removeTagListener();
            }
        }

        var searched = searchTag(text);
        if (searched) {
            // up, down and enter key handling
            renderAutocompleteTag(editElem, searched, selectCb);
            selectAutocomplete(e, selectCb);
        }
    });

    $('#sendClient').click(function(){
        inputs = $('.in_cl');
        upClient = {};
        for (var i = 0; i < inputs.length; i++) {
            el = $(inputs[i]);
            // its contentEditable div
            if (el.attr("contentEditable") == "true") {
                val  = el.text();
            } else {
                val  = el.val();
            }
            name = el.attr("name");
            upClient[name] = val;
        }
        upClient.vk_id = query.sel;
        upClient.tags = app.state.clientTags;

        var addDays = Math.round(app.state.addDays);
        if ( !isNaN(addDays) ) {
            var tt = $('input[name=next_contact]').val();
            var date = new Date(tt);
            date.setDate(date.getDate() + addDays);

            var day = ("0" + date.getDate()).slice(-2);
            var month = ("0" + (date.getMonth() + 1)).slice(-2);
            date = date.getFullYear()+"-"+(month)+"-"+(day);

            $('input[name=next_contact]').val(date);
            upClient.next_contact = date;

            // clean addDays
            app.state.addDays = null;
            $('input[name=add_days]').val("");
        }

        bgp.http("apiCall", ["POST", "/api/client/post", {'client':upClient}]).then( upClient => {
            // update clients and rerender reminders
            $.each(app.state.clients, function(i, c) {
                if (c.vk_id == query.sel) {
                    app.state.clients[i] = upClient;
                    $('#crm_reminders').empty();
                    remindersRender(app.getReminders());
                }
            });
            // update client in cache
            cache.saveState( app.getCached() );
        });
    });

    // expand
    clientPanel = $('#crm_client');
    clientPanel.click(function(){
        app.state.client_expand = !app.state.client_expand;
        $(this).find('span').toggle();
        $(this).parent().find('table').toggle();
    });
    if (!app.state.client_expand) {
        clientPanel.find('span').toggle();
        clientPanel.parent().find('table').toggle();
    }
}

function orderRender(order) {
    deb.log("RENDER: order");
    orderView = "";
    productsView = "";

    if(!order){
        orderView = '<a id="crm_order">ЗАКАЗ <span>▲</span><span style="display: none">▼</span></a>\
        <table><tr><td><a id="new_order">Новый</a></td></tr></table>';
    } else {

        var viewStatuses = '';
        $.each(app.state.statuses, function(index, value) {
            if (index == order.status) {
                viewStatuses += '<option selected value="'+index+'">'+value+'</option>';
            } else {
                viewStatuses += '<option value="'+index+'">'+value+'</option>';
            }
        });

        $.each(order.products, function(i, p) {
            app.state.orderProducts.push(p);
            productsView = createLabelView(
                "<b class='article_product'>"+p.article+"</b> "+p.price+" руб.",
                'black'
            );
        });

        orderView = '<a id="crm_order">ЗАКАЗ <span>▲</span><span style="display: none">▼</span></a>\
        <table>\
        <tr><td><b>Номер     </b></td><td><input class="in_or" type="text" name="order_number" value="' +order.number+   '" readonly></td></tr>\
        <tr><td><b>Создан    </b></td><td><input class="in_or" readonly type="date" name="created" value="'      +order.created+        '"></td></tr>\
        <tr><td><b>Статус    </b></td><td><select class="in_or" name="status">' + viewStatuses + '</select></td></tr>\
\
        <tr><td><b>Детали заказа</b></td><td id="products_view">'+productsView+'<td></tr>\
        <tr><td><b>Добавить  </b></td><td><input id="addProduct"></td></tr>\
\
        <tr><td><b>Цена      </b></td><td><input id="order_price" class="in_or" type="text" name="price" value="'        +order.price+          '"></td></tr>\
        <tr><td><b>Примечание</b></td><td><input class="in_or" type="text" name="comment" value="'      +order.comment+        '"></td></tr>\
        </table>';
        orderView += '<button class="btn btn-primary" id="sendOrder">Обновить</button>';
    }

    var item = '<div id="order_item" style="line-height: 1.154; padding: 0 5px 10px 20px;">' + orderView + '</div>';
    $('#order').append(item);
    removeProductListener();

    $('#new_order').click( function(e) {
        deb.log('create order!');

        $('#order_item').remove();
        emptyOrder = {};
        emptyOrder.vk_id = query.sel;
        // api call for create default order data
        bgp.http("apiCall", ["POST", "/api/order/create", {'order':emptyOrder}]).then( r => {

            if (r.error) {
                deb.log(r.error);
            } else {
                app.state.orders.push(r);

                // update client
                bgp.http("apiCall", ["GET", "/api/client/get", {"vk_id":r.client_vk_id}]).then( getClient => {
                    var getClient = getClient[0];
                    $.each(app.state.clients, function(i, c) {
                        if (c.vk_id == r.client_vk_id) {
                            app.state.clients[i] = getClient;
                        }
                    });
                    // update cache
                    cache.saveState( app.getCached() );
                });

                deb.log(r);
                order = orderNormalize(r);
                deb.log(order);
                orderRender(order);
            }
        });
    });

    $( "#addProduct" ).on('keydown', function(e) {
        pView = "";
        
        var editElem = $(e.target);
        var text = editElem.val();

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
        var searched = searchProduct(text);

        var selectCb = function(sa) {
            var products = $.grep(app.state.products, function(v) {
                return v.article === sa;
            });
            var product = products[0];
            app.state.orderProducts.push(product);

            if (product) {
                pView = createLabelView(
                    "<b class='article_product'>"+product.article+"</b> "+product.price+" руб.",
                    'black'
                );
                $('#products_view').append(pView);
                removeProductListener();

                // trick for number typing
                var op = $('#order_price');
                op.val( (+op.val())+(+product.price) );
            }

            phrasesClone = util.clone(app.state.phrases);
            phrasesRender( util.groupBy(phrasesClone, 'type') );
        }
        // up, down and enter key handling
        renderAutocompleteProduct(editElem, searched, selectCb);
        selectAutocomplete(e, selectCb);
    });

    $('#sendOrder').click(function(){
        inputs = $('.in_or');
        order = {};
        for (var i = 0; i < inputs.length; i++) {
            el = $(inputs[i]);
            name = el.attr("name");
            val  = el.val();
            order[name] = val;
        }
        order.client_vk_id = query.sel;

        deb.log(order);
        deb.log("wuu");
        deb.log(app.state.orders);
        // set _id
        $.each(app.state.orders, function(i, o) {
            if (o.order_number == order.order_number) {
                deb.log("RENDER: set _id for update order");
                order._id = o._id;
            }
        });

        order.products = app.state.orderProducts;

        bgp.http("apiCall", ["POST", "/api/order/post", {'order':order}]).then( upOrder => {
            deb.log(upOrder);
            // update order
            $.each(app.state.orders, function(i, o) {
                if (o.order_number == upOrder.order_number) {
                    app.state.orders[i] = upOrder;
                    // update client
                    bgp.http("apiCall", ["GET", "/api/client/get", {"vk_id":order.client_vk_id}]).then( getClient => {
                        var getClient = getClient[0];
                        $.each(app.state.clients, function(i, c) {
                            if (c.vk_id == order.client_vk_id) {
                                app.state.clients[i] = getClient;
                            }
                        });
                        // update cache
                        cache.saveState( app.getCached() );
                    });
                }
            });
        });
    });

    // expand
    orderPanel = $('#crm_order');
    orderPanel.click(function(){
        app.state.order_expand = !app.state.order_expand;
        $(this).find('span').toggle();
        $(this).parent().find('table').toggle();
    });
    if (!app.state.order_expand) {
        orderPanel.find('span').toggle();
        orderPanel.parent().find('table').toggle();
    }
}

function remindersRender(reminders) {
    deb.log("RENDER: reminders");

    remindersView = '<h3>Напоминания</h3>';
    remindersView += '<div id="reminders_header">\
    <a data-text="late">    Прошедшие('+reminders.late.length+')</a>|\
    <a data-text="today">   Сегодня('+reminders.today.length+')</a>|\
    <a data-text="tomorrow">Завтра('+reminders.tomorrow.length+')</a>|\
    <a data-text="future">  Будущие('+reminders.future.length+')</a>\
    </div>';
    remindersView += '<hr>';
    remindersView += '<div id="reminders_list"></div>';
    $('#crm_reminders').append(remindersView);

    $('#reminders_header').find('a').each(function( i ) {

        $( this ).on('click', function(e) {

            var type = $(e.target).attr('data-text');
            app.state.reminders_state = type;
            var rhView = '';
            for (var i = 0; i < reminders[type].length; i++) {
                client = reminders[type][i];

                var options = {
                    month: 'long',
                    day: 'numeric',
                    weekday: 'short'
                };
                var nc = new Date(+client.next_contact.milliseconds);
                var pretty = nc.toLocaleString("ru", options);
                rhView += '<a href="https://vk.com/im?sel='+client.vk_id+'">'+client.fio+'-'+pretty+'</a><br>';
            }
            $('#reminders_list').empty().append(rhView);
        });

        if (app.state.reminders_state) {
            if ( $(this).attr('data-text') == app.state.reminders_state ) {
                $(this).click();        
            }
        }
    });
}

function phrasesRender(phrases) {
    deb.log("RENDER: phrases");
    $('#crm_phrases').empty();

    // find current order
    var orderNumber = $('input[name=order_number]').val();
    var order = null;
    $.each(app.state.orders, function(i, v) {
        if (app.state.orders[i].order_number == orderNumber) {
            order = app.state.orders[i];
        }
    });

    upPhrases = app.updatePhrases(phrases, order);

    phrasesView = '<h3>Фразы</h3>';
    for (var i = 0; i < upPhrases.length; i++) {
        phrasesBlock = upPhrases[i];
        blockName = phrasesBlock[0].type;
        phrasesView += '<div><b>'+blockName+'</b></div>';
        for (var j = 0; j < phrasesBlock.length; j++) {
            phrase = phrasesBlock[j];
            phrasesView += '<a data-text="';
            phrasesView += phrase.text+'">'+phrase.name+'</a><br>';
        }
    }
    $('#crm_phrases').append(phrasesView);

    $('#crm_phrases').find('a').each(function( i ) {
        $( this ).on('click', function(e) {
            var im = $('.im_editable')[0];
            var text = $(this).attr('data-text');
            im.innerHTML = text;
        });
    });
}

function infoRender() {
    deb.log("RENDER: info");
    $('#crm_info').empty();

    var view = '<h3>Инфо</h3>';
    view += '<p>Версия: 0.9 (18 ноября, 2016)</p>';
    view += '<p>По найденным ошибкам а также с предложениями по улучшению сервиса, <a target="_blank" href="https://vk.com/pilot114">пишите мне</a></p>';

    $('#crm_info').append(view);
}
