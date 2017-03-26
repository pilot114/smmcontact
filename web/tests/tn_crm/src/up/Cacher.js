function Cacher() {

	this.saveToken = function(data){
		window.deb.log("CACHER: try save token in cache");
		chrome.storage.local.set({'token': data}, function() {});
	}

	this.loadToken = function(){
		var pToken = new Promise(function(resolve, reject) {

			chrome.storage.local.get('token', function(d) {
			    if (d.token) {
			    	resolve(d.token);
			    }
			});
		});
		return pToken;
	}

	this.saveState = function(data){
		window.deb.log("CACHER: try save state in cache");
		chrome.storage.local.set({'state': data}, function() {});
	}

	this.loadState = function(){
		var pState = new Promise(function(resolve, reject) {

			chrome.storage.local.get('state', function(d) {
			    if (d.state) {
			    	resolve(d.state);
			    }
			});
		});
		return pState;
	}


	this.loadStateAndToken = function(){
		window.deb.log("CACHER: try load state and token from cache");

		var pState = this.loadState();
		var pToken = this.loadToken();

		var both = new Promise(function(resolve, reject) {

			Promise.all([pState, pToken]).then(results => {
				resolve(results);
			});
		});
		
		return both;
	}

	// update cache from server
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

        // get update from server
        if (request.states) {
            window.deb.log("update from popup");
            window.deb.log(request.states);
            // states = request.states;
            // cacher.saveState();
            // todo: safe reload page?
            // this.l.reload(true);
        }
	});
};