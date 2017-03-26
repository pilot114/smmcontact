function Http(domain) {

    this.domain = domain;

    // setup token, if needed
    this.setToken = function(token) {
        http.token  = token;
        window.deb.log("HTTP: set token - " + token);
    }

    // TODO: composite
    this.getVKuser = function(sel) {
        return new Promise(function(resolve, reject) {
            var method = "GET";
            var url = "https://api.vk.com/method/users.get?user_ids="+sel+"&v=5.8&fields=country,city,photo_100";
            window.deb.log("HTTP: " + method + " api call to " + url);
            
            $.ajax({
                type: method,
                url: url,
                dataType: 'json',
                success: function(res) {
                    resolve(res);
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    reject(errorThrown);
                },
                data: {}
            });
        });
    }

    this.apiCall = function(method, url, args) {
        var args = args || {};

        return new Promise(function(resolve, reject) {
            if (window.http.token) {
                args.token = window.http.token;
            }
            url = window.http.domain + url;

            window.deb.log("HTTP: " + method + " api call to " + url);

            $.ajax({
                type: method,
                url: url,
                dataType: 'json',
                success: function(res) {
                    resolve(res);
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    reject(errorThrown);
                },
                data: args
            });
        });
    }

    // all methods
    // http.apiCall('POST', '/api/client/create', {'client':client});
    // http.apiCall('POST', '/api/order/create',  {'order':order});
    // http.apiCall('POST', '/api/client/post',   {'client':client});
    // http.apiCall('POST', '/api/order/post',    {'order':order});

    // http.apiCall('GET', '/api/order/get');
    // // or
    // http.apiCall('GET', '/api/order/get', {"vk_id":client_id, "only_last":onlyLast });
    // http.apiCall('GET', '/api/client/get');
    // http.apiCall('GET', '/api/product/get');
    // http.apiCall('GET', '/api/phrase/get');
    // http.apiCall('GET', '/api/tag/get');

    // return promise
    this.preload = function(params) {

        if (params) {
            var orders  = http.apiCall('GET', '/api/order/get', {"vk_id": params.client_id, "only_last": params.onlyLast });
        } else {
            var orders  = http.apiCall('GET', '/api/order/get');
        }
        var clients  = http.apiCall('GET', '/api/client/get');
        var products = http.apiCall('GET', '/api/product/get');
        var phrases  = http.apiCall('GET', '/api/phrase/get');
        var tags     = http.apiCall('GET', '/api/tag/get');

        var preload = new Promise(function(resolve, reject) {
            Promise.all([clients, orders, products, phrases, tags]).then(preload => {
                deb.log("HTTP: preload -");
                deb.log(preload);
                resolve(preload);
            });
        });
        return preload;
    }

    this.postClient = function(client) {
        return http.apiCall('POST', '/api/client/post', {'client':client});
    }
    this.postOrder = function(order) {
        return http.apiCall('POST', '/api/order/post', {'order':order});
    }
}