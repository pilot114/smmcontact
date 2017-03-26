domain = settings.domain;

function apiCall(method, url, data, cb) {

	console.log("api call to "+url+":");
	console.log(data);

	$.ajax({
        type: method,
        url: url,
        dataType: 'json',
        success: function(data) {
			cb({"result":data});
        },
        error: function(jqXHR, textStatus, errorThrown) {
        	cb({"error":errorThrown});
        },
        data: data
    });
}

function createClient(user, client, cb) {
	url = domain + "/api/client/create";
	return apiCall("POST", url, {'token':user.token, 'client':client}, cb);
}
function createOrder(user, order, cb) {
	url = domain + "/api/order/create";
	return apiCall("POST", url, {'token':user.token, 'order':order}, cb);
}

function postClient(user, client, cb) {
	url = domain + "/api/client/post";
	return apiCall("POST", url, {'token':user.token, 'client':client}, cb);
}
function postOrder(user, order, cb) {
	url = domain + "/api/order/post";
	return apiCall("POST", url, {'token':user.token, 'order':order}, cb);
}



function getClients(user, cb) {
	url = domain + "/api/client/get";
	return apiCall("GET", url, {'token':user.token}, cb);
}

function getPhrases(user, cb) {
	url = domain + "/api/phrase/get";
	return apiCall("GET", url, {'token':user.token}, cb);
}

function getOrders(user, client_id, onlyLast, cb) {
	url = domain + "/api/order/get";
	return apiCall("GET", url, {'token':user.token, "vk_id":client_id, "only_last":onlyLast }, cb);
}

function getPrice(user, cb) {
	url = domain + "/api/product/get";
	return apiCall("GET", url, {'token':user.token }, cb);
}

function getTags(user, cb) {
	url = domain + "/api/tag/get";
	return apiCall("GET", url, {'token':user.token }, cb);
}
