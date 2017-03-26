function sendUrl(url) {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, {url: url}, function(response) {
			console.log(response);
		});
	});
}

// detect url update
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	if (changeInfo.url !== undefined) {
		console.log('change url');
		sendUrl(changeInfo.url);
	}
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	cb = function(resp){
		sendResponse(resp);
	};

	switch (request.api) {
	  case 'create_client':
  		createClient(request.user, request.client, cb);
	    break;
	  case 'create_order':
  		createOrder(request.user, request.order, cb);
	    break;

	  case 'post_client':
  		postClient(request.user, request.client, cb);
	    break;
	  case 'post_order':
  		postOrder(request.user, request.order, cb);
	    break;

	  case 'clients':
  		getClients(request.user, cb);
	    break;
	  case 'phrases':
  		getPhrases(request.user, cb);
	    break;
	  case 'orders':
		getOrders(request.user, request.client_id, request.onlyLast, cb);
	    break;
	  case 'price':
		getPrice(request.user, cb);
	    break;
	  case 'tags':
		getTags(request.user, cb);
	    break;
	  default:
	    alert( 'undefined api method:' + request.api);
	}
	return true;
});