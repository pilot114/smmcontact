// todo: set states to cacher

var cacher = {
	// maybe use
	// "last_up" : null,

	"saveState": function(){
		console.log("save in cache");
		// if (this.last_up == null) {
		// 	console.log("first save!");
		// 	this.last_up = new Date();
			var data = {
				'clients' : states.clients,
				'products': states.products,
				'phrases' : states.phrases,
				'tags'	  : states.tags,
			};
			chrome.storage.local.set({'data': data}, function() {
				console.log("state saved");
			});
		// }
	},
	"loadState": function(){
		chrome.storage.local.get('data', function(d) {
		    if (d.data) {
		    	console.log("data loaded from storage to states");
		    	states.phrases  = d.data.phrases;
		    	states.clients  = d.data.clients;
		    	states.products = d.data.products;
		    	states.tags     = d.data.tags;
		    }
		    // always
	    	states.cache_loaded = true;

		});
	},
	"loadToken": function(){
		chrome.storage.local.get('token', function(d) {
		    if (d.token) {
    			states.user = {
		            'token': d.token
		        };
		    }
		});
	},
};