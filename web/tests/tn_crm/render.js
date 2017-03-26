function removeTagListener() {
    $('#tags_view').find('.close').click(function(){
        var tagText = '';
        $(this).parent().contents().each(function(){
            if(this.nodeType === 3){
                tagText += this.wholeText;
            }
        });
        $(states.clientTags).each(function(){
            if(this.text === tagText){
                states.clientTags.splice( $.inArray(this, states.clientTags), 1);
                console.log('remove tag!');
            }
        });
        $(this).parent().remove();
    });
}
function removeProductListener() {
    $('#products_view').find('.close').click(function(){
        var articleNode = $(this).parent().find('.article_product')[0];
        var article = $(articleNode).text();

        $(states.orderProducts).each(function(){
            if(this.article === article){
                states.orderProducts.splice( $.inArray(this, states.orderProducts), 1);

                // change common price
                var op = $('#order_price');
                op.val( (+op.val())-(+this.price) );

                console.log('remove product!');
            }
        });
        $(this).parent().remove();
    });
}

function clientRender(client, user) {

    clientView = "";
    tagsView = "";
    viewStatuses = "";
    viewSources = "";



    if(!client){
        clientView = '<a id="crm_client" state="true">КЛИЕНТ <span>▲</span><span style="display: none">▼</span></a>\
        <table><tr><td><a id="new_client";">Новый</a></td></tr></table>';
    } else {
        // MAYBE TODO: remove hardcode
        sources = {
            '1': 'Узнал от друга',
            '2': 'Нашёл сам',
        };
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
        $.each(statuses, function(index, value) {
            if (index == client.status) {
                viewStatuses += '<option selected value="'+index+'">'+value+'</option>';
            } else {
                viewStatuses += '<option value="'+index+'">'+value+'</option>';
            }
        });
        $.each(sources, function(index, value) {
            if (index == client.source) {
                viewSources += '<option selected value="'+index+'">'+value+'</option>';
            } else {
                viewSources += '<option value="'+index+'">'+value+'</option>';
            }
        });

        $.each(client.tags, function(i, t) {
            states.clientTags.push(t);
            tagsView += "<div class='label-big' style='background-color:"+t.color+";'>"+t.text+
            '<button type="button" class="close" aria-label="Close"><span aria-hidden="true">&times;</span></button>'
            +"</div>";
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
        <tr><td><b>Пос.контакт</b></td>  <td><input class="in_cl" readonly type="date" name="last_contact" value="'+client.last_contact+'"></td></tr>\
        <tr><td><b>След.контакт</b></td> <td>+<input type="text" style="width:20px;" name="add_days">  <input style="width:140px; class="in_cl" type="date" name="next_contact" value="'+client.next_contact+'"></td></tr>\
\
        <tr><td><b>Телефон</b></td>  <td><input class="in_cl" type="text" name="mobile" value="'+client.mobile+'"></td></tr>\
        <tr><td><b>Email</b></td>  <td><input class="in_cl"   type="text" name="email"  value="'+client.email +'"></td></tr>\
\
        <tr><td><b>Примечание</b></td>   <td><input class="in_cl" type="text" name="comment" value="'+client.comment+'"></td></tr>\
        </table>';
        clientView += '<button style="" class="btn btn-primary" id="sendClient">Сохранить</button>';
    }

    var item = '<div id="client_item" style="line-height: 1.154; padding: 0 5px 10px 20px;">' + clientView + '</div>';
    $('#client').append(item);
    removeTagListener();

    $('input[name=add_days]').on('input', function(){
        states.addDays = $(this).val();
    });

    clientPanel = $('#crm_client');

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
            var tags = $.grep(states.tags, function(v) {
                return v.text === sa;
            });
            console.log("tag push!");
            console.log(states.clientTags);

            var tag = tags[0];
            states.clientTags.push(tag);

            if (tag) {
                tagsView = "<div class='label-big' style='background-color:"+tag.color+";'>"+tag.text+
                '<button type="button" class="close" aria-label="Close"><span aria-hidden="true">&times;</span></button>'
                +"</div>";
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
        clientUp = {};
        for (var i = 0; i < inputs.length; i++) {
            el = $(inputs[i]);
            name = el.attr("name");
            val  = el.val();
            clientUp[name] = val;
        }
        clientUp.vk_id = sel;

        clientUp.tags = states.clientTags;

        var addDays = Math.round(states.addDays);

        if ( !isNaN(addDays) ) {
            var tt = $('input[name=next_contact]').val();
            var date = new Date(tt);
            date.setDate(date.getDate() + addDays);
            date = dateForInputFromObj(date);

            $('input[name=next_contact]').val(date);
            clientUp.next_contact = date;

            // clean addDays
            states.addDays = null;
            $('input[name=add_days]').val("");
        }

        console.log(user);

        chrome.runtime.sendMessage({api:"post_client", user:user, client:clientUp}, function(r) {
            upClient = r.result;
            //update clients and rerender reminders
            $.each(states.clients, function(i, c) {
                if (c.vk_id == sel) {
                    states.clients[i] = upClient;
                    $('#reminders').empty();
                    remindersRender(states.clients);
                }
            });
        });

    });

    clientPanel.click(function(){
        states.client_expand = !states.client_expand;
        $(this).find('span').toggle();
        $(this).parent().find('table').toggle();
    });
    if (!states.client_expand) {
        clientPanel.find('span').toggle();
        clientPanel.parent().find('table').toggle();
    }
}

function orderRender(order, user) {
    orderView = "";
    productsView = "";

    if(!order){
        orderView = '<a id="crm_order">ЗАКАЗ <span>▲</span><span style="display: none">▼</span></a>\
        <table><tr><td><a id="new_order">Новый</a></td></tr></table>';
    } else {

        statuses = {
            '1':'Новый',
            '2':'Резерв',
            '3':'Предзаказ',
            '4':'Передан на отправку',
            '5':'Доставлен',
            '6':'Отменён',
        };
        var viewStatuses = '';
        $.each(statuses, function(index, value) {
            if (index == order.status) {
                viewStatuses += '<option selected value="'+index+'">'+value+'</option>';
            } else {
                viewStatuses += '<option value="'+index+'">'+value+'</option>';
            }
        });

        $.each(order.products, function(i, p) {
            states.orderProducts.push(p);
            productsView += "<div class='label-big' style='background-color:black;'>"+
            "<b class='article_product'>"+p.article+"</b> "+p.price+" руб."
            +'<button type="button" class="close" aria-label="Close"><span aria-hidden="true">&times;</span></button>'
            +"</div>";
        });

        orderView = '<a id="crm_order">ЗАКАЗ <span>▲</span><span style="display: none">▼</span></a>\
        <table>\
        <tr><td><b>Номер     </b></td><td><input class="in_or" type="text" name="order_number" value="' +order.order_number+   '" readonly></td></tr>\
        <tr><td><b>Создан    </b></td><td><input class="in_or" readonly type="date" name="created" value="'      +order.created+        '"></td></tr>\
        <tr><td><b>Статус    </b></td><td><select class="in_or" name="status">' + viewStatuses + '</select></td></tr>\
\
        <tr><td><b>Детали заказа</b></td><td id="products_view">'+productsView+'<td></tr>\
        <tr><td><b>Добавить  </b></td><td><input id="addProduct"></td></tr>\
\
        <tr><td><b>Цена      </b></td><td><input id="order_price" class="in_or" type="text" name="price" value="'        +order.price+          '"></td></tr>\
        <tr><td><b>Примечание</b></td><td><input class="in_or" type="text" name="comment" value="'      +order.comment+        '"></td></tr>\
        </table>';
        orderView += '<button class="btn btn-primary" id="sendOrder">Сохранить</button>';
    }

    var item = '<div id="order_item" style="line-height: 1.154; padding: 0 5px 10px 20px;">' + orderView + '</div>';
    $('#order').append(item);
    removeProductListener();

    orderPanel = $('#crm_order');

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
            var products = $.grep(states.products, function(v) {
                return v.article === sa;
            });
            var product = products[0];
            states.orderProducts.push(product);

            if (product) {
                pView = "<div class='label-big' style='background-color:black;'>"+
                "<b class='article_product'>"+product.article+"</b> "+product.price+" руб."
                +'<button type="button" class="close" aria-label="Close"><span aria-hidden="true">&times;</span></button>'
                +"</div>";
                $('#products_view').append(pView);
                removeProductListener();

                // trick for number typing
                var op = $('#order_price');
                op.val( (+op.val())+(+product.price) );
            }

            phrasesClone = clone(states.phrases);
            phrasesRender( groupBy(phrasesClone, 'type') );
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
        order.client_vk_id = sel;
        order._id = states.order._id;
        order.products = states.orderProducts;

        chrome.runtime.sendMessage({api:"post_order", user:user, order:order}, function(r) {
            console.log(r);
        });
    });

    orderPanel.click(function(){
        states.order_expand = !states.order_expand;
        $(this).find('span').toggle();
        $(this).parent().find('table').toggle();
    });
    if (!states.order_expand) {
        orderPanel.find('span').toggle();
        orderPanel.parent().find('table').toggle();
    }
}

function remindersRender(clients) {
    view = "";
    reminders = {
        'late': [],
        'today': [],
        'tomorrow': [],
        'future': []
    };
    for (var i = 0; i < clients.length; i++) {
        client = clients[i];
        if (client.next_contact) {
            var nc = new Date(+client.next_contact.milliseconds);
            var now = new Date();
            var diffTime = nc.getTime() - now.getTime();
            var diffDays = Math.ceil( diffTime / (1000 * 3600 * 24));
            // x<0, 0, 1, x>1
            if (diffDays<0) {
                reminders.late.push(client);
            } if(diffDays==0) {
                reminders.today.push(client);
            } if(diffDays==1) {
                reminders.tomorrow.push(client);
            } if(diffDays>1) {
                reminders.future.push(client);
            }
        }
    }

    view = '<h3>Напоминания</h3>';
    view += '<div id="reminders_header">\
    <a data-text="late">    Прошедшие('+reminders.late.length+')</a>|\
    <a data-text="today">   Сегодня('+reminders.today.length+')</a>|\
    <a data-text="tomorrow">Завтра('+reminders.tomorrow.length+')</a>|\
    <a data-text="future">  Будущие('+reminders.future.length+')</a>\
    </div>';
    view += '<hr>';
    view += '<div id="reminders_list"></div>';
    $('#reminders').append(view);


    $('#reminders_header').find('a').each(function( i ) {

        $( this ).on('click', function(e) {
            type =  $(e.target).attr('data-text');

            states.reminders_state = type;

            view = '';
            for (var i = 0; i < reminders[type].length; i++) {
                client = reminders[type][i];

                var options = {
                    month: 'long',
                    day: 'numeric',
                    weekday: 'short'
                };
                var nc = new Date(+client.next_contact.milliseconds);
                var pretty = nc.toLocaleString("ru", options);
                view += '<a href="https://vk.com/im?sel='+client.vk_id+'">'+client.fio+'-'+pretty+'</a><br>';
            }
            $('#reminders_list')
                .empty()
                .append(view);
        });

        if (states.reminders_state) {
            type = states.reminders_state;
            if ( $(this).attr('data-text') == type ) {
                $(this).click();        
            }
        }

    });
}

function phrasesRender(phrases) {
    view = "";
    $('#phrases').empty();

    upPhrases = updatePhrases(phrases);

    view = '<h3>Фразы</h3>';
    for (var i = 0; i < upPhrases.length; i++) {
        phrasesBlock = upPhrases[i];
        blockName = phrasesBlock[0].type;
        view += '<div><b>'+blockName+'</b></div>';
        for (var j = 0; j < phrasesBlock.length; j++) {
            phrase = phrasesBlock[j];
            view += '<a data-text="';
            view += phrase.text+'">'+phrase.name+'</a><br>';
        }
    }
    $('#phrases').append(view);

    $('#phrases').find('a').each(function( i ) {
        $( this ).on('click', function(e) {
            var im = $('.im_editable')[0];
            var text = $(this).attr('data-text');
            console.log(text);
            im.innerHTML = text;
        });
    });
}


function debugRender() {
    view = "";
    console.log('debugRender');
    $('#debug').empty();

    if (window.location.href  == "https://vk.com/pilot114") {
        view = '<img src="https://media0.giphy.com/labs/images/giphy-to-syphon.gif">';
    } else {
        view = '<h3>Инфо</h3>';
        view += '<p>Версия: 0.3 (12 окт.2016)</p>';
        view += '<p>По найденным ошибкам а также с предложениями по улучшению сервиса, <a target="_blank" href="https://vk.com/pilot114">пишите мне</a></p>';
    }

    $('#debug').append(view);
}