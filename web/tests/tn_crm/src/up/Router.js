function Router() {
    this.createQuery = function() {
        var vars = this.l.search.substring(1).split('&');
        query = {};
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split('=');
            var k = decodeURIComponent(pair[0]);
            var v = decodeURIComponent(pair[1]);
            query[k] = v;
        }
        return query;
    }

    // href = protocol + // + host + pathname + search + hash
    this.l = window.location;
    this.routes = [];

    // cbs on route groups
    this.all = null;
    this.tracked = null;
    this.untracked = null;

    this.routeFinded = false;

    this.startBind = function() {
        if (typeof this.all == 'function') {
            window.deb.log("ROUTER: all fire");
            window.route.all();
        }
    }

    this.endBind = function() {
        if (route.routeFinded == false && typeof route.untracked == 'function') {
            window.deb.log("ROUTER: untracked fire");
            window.route.untracked();
        }
    }

    this.bind = function(route, cb) {
        this.routes.push({"route": route, "cb": cb});

        if (route == this.l.pathname) {
            if (typeof window.route.tracked == 'function') {
                window.deb.log("ROUTER: tracked fire");
                window.route.tracked();
            }

            window.route.routeFinded = true;
            window.deb.log("ROUTER: " + this.l.href);
            cb(this.createQuery(), this.l.hash);
        }
    };

    // live update route
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        // app id
        // console.log(sender);

        if (request.url) {
            var route = window.route;

            window.deb.log("ROUTER: change url -");
            window.deb.log(route.l.href);

            // http://stackoverflow.com/a/15979390
            var parser = document.createElement('a');
            parser.href = request.url;

            // running cbs

            if (typeof route.all == 'function') {
                window.deb.log("ROUTER: all fire");
                route.all();
            }

            route.routeFinded = false;
            for (var i = 0; i < route.routes.length; i++) {
                if (route.routes[i].route == parser.pathname) {
                    if (typeof route.tracked == 'function') {
                        window.deb.log("ROUTER: tracked fire");
                        window.route.tracked();
                    }

                    route.routeFinded = true;
                    window.deb.log("ROUTER: " + parser.pathname);
                    route.routes[i].cb(route.createQuery(), route.l.hash);
                }
            }

            if (route.routeFinded == false && typeof route.untracked == 'function') {
                window.deb.log("ROUTER: untracked fire");
                route.untracked();
            }
        }
    });
}