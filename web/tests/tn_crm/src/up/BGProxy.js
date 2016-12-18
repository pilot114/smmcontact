function BGProxy() {
	
	this.http = function(method, args) {

		window.deb.group("BGProxy:http", [
			method, args
		], true);
		return new Promise(function(resolve, reject) {
			chrome.runtime.sendMessage({type:"http", method:method, args:args}, function(r) {
				resolve(r);
	        });
        });
	}
}