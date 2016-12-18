// chrome.tabs.onCreated.addListener(function(tab) {
// 	console.log('CREATE');
// 	console.log(tab);
// });
// chrome.tabs.onActivated.addListener(function(activeInfo) {
// 	console.log('ACTIVATE');
// 	console.log(activeInfo);
// })


// detect url update
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	if (changeInfo.url !== undefined) {
		var changeInfo = {
			"tabId": tabId,
			"url"  : changeInfo.url
		}
		console.log('BG: detect change url. Send info:');
		console.log(changeInfo);

		// send only to current open window
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, changeInfo, function(response) {});
		});
	}
});

var deb = new Debugger();
var http = new Http(settings.domain);
var cache = new Cacher();
cache.loadToken().then( token => {
	http.setToken(token);
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

	// Proxy for content script http request. Reason:
	// "This request has been blocked; the content must be served over HTTPS"
	if (request.type == "http") {
		console.log("BG: onMessage -");
		console.log(request);
		var pHttp = http[request.method].apply(null, request.args);

		pHttp.then( result => {
			sendResponse(result);
		}, error => {
			sendResponse(error);
		});
		return true;
	}
});