
var deb = new Debugger();
var route = new Router();
var cache = new Cacher();
var util = new Util();
var app = new Application();
var bgp = new BGProxy();

cache.loadStateAndToken().then( data => {
    app.setCached(data);

    deb.log("App loaded with token: " + app.state.user.token);
    deb.time("app_load");
    if (app.state.clients) {
        deb.group("App cache state", [
            "Clients: "  + app.state.clients.length,
            "Orders: "   + app.state.orders.length,
            "Products: " + app.state.products.length,
            "Phrases: "  + app.state.phrases.length,
            "Tags: "     + app.state.tags.length
        ], true);

        deb.group("Enity examples", [
            app.state.clients[0],
            app.state.orders[0],
            app.state.products[0],
            app.state.phrases[0],
            app.state.tags[0]
        ], true);
    } else {
        deb.log("Clients not found in cache!");
    }

    var whi = null;

    route.tracked = function(){
        window.clearInterval(whi);
        $('.crm_panel').remove();
        $('.crm_left_panel').remove();
    };

    route.startBind();
    route.bind("/pilot114", function(query, hash){
        $('#page_layout').prepend(
            '<div class="crm_left_panel">\
                <div id="crm_info">\
                    <img src="https://media0.giphy.com/labs/images/giphy-to-syphon.gif">\
                </div>\
            </div>');
    });
    route.bind("/im", function(query, hash){

        // all dialogs
        if (query.sel == undefined) {

            $('#page_layout').prepend(
                '<div class="crm_left_panel">\
                    <div id="crm_info"></div>\
                    <div id="crm_reminders"></div>\
                </div>');
            infoRender();
            remindersRender(app.getReminders());
            if (app.state.clients) {

                // with potential labels height
                app.state.window_height = 6000;
                dialogsRender();

                // check height window
                util.setInterval(function(){

                    var wh = $("html").height();

                    if (app.state.window_height < wh) {
                        app.state.window_height = wh;
                        deb.log( 'render dialogs label!' );
                        if (app.state.clients) {
                            dialogsRender();
                        }
                    }
                }, 500);
            }
        // single dialog
        } else {
            // fixes vk css
            $('.placeholder').empty();
            $('.ui_rmenu_slider').hide();
            $('.im-right-menu.ui_rmenu').css('width', '310px').css('max-width', '310px');

            // proxy for
            bgp.http("getVKuser", [query.sel]).then( vkData => {
                // deb.log("getVKuser getted:");
                // deb.log(vkData);

                app.state.vkClient = vkData.response[0];

                $('.ui_rmenu[role=list]').prepend(
                    "<div class='_im_ui_peers_list crm_panel'>\
                        <div id='client'></div>\
                        <div id='order'></div>\
                    </div>");
                $('#page_layout').prepend(
                    '<div class="crm_left_panel">\
                        <div id="crm_reminders"></div>\
                        <div id="crm_phrases"></div>\
                    </div>');

                app.state.clientTags = [];
                app.state.orderProducts = [];

                var findClient = null;
                if (app.state.clients) {
                    for (var i = 0; i < app.state.clients.length; i++) {
                        if (app.state.clients[i].vk_id == query.sel) {
                            findClient = app.state.clients[i];
                        }
                    }
                }

                if (findClient) {
                    deb.log("Current vk user finded in cache");
                    findClientNorm = clientNormalize(findClient, false);
                    clientRender(findClientNorm);

                    var order = null;
                    // convert object to array order objects for check length
                    var c_orders = $.map(findClient.orders, function(value, index) {
                        return [value];
                    });

                    // get last order
                    if (c_orders.length !== 0) {
                        deb.log("Order exist!");
                        order = c_orders[c_orders.length-1];
                        order = orderNormalize(order);
                    }
                    orderRender(order);
                } else {
                    console.log("vk_client not found in states. new client!");
                    // new client
                    normClient = clientNormalize(app.state.vkClient, true);
                    normClient.vk_id = query.sel;
                    clientRender(normClient);

                    bgp.http("apiCall", ["POST", "/api/client/create", {'client':normClient}]).then( newClient => {
                        // save new client to cache and states
                        if (newClient._id) {
                            app.state.clients.push(newClient);
                            cache.saveState( app.getCached() );
                        } else {
                            alert("create_client error");
                        }
                    });
                }
                if (app.state.clients) {
                    remindersRender(app.getReminders());
                }

                if (app.state.phrases) {
                    phrasesClone = util.clone(app.state.phrases);
                    phrasesRender( util.groupBy(phrasesClone, 'type') );
                }
            });
        }
    });
    route.endBind();
});
