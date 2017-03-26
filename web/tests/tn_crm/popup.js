function saveChanges() {

	chrome.storage.sync.get('token', function(d) {
		if (d.token) {
			console.log("token loaded: " + d.token);
			input.value = d.token;
		}
	});

	var input = document.getElementById('input');
	input.oninput = function() {
		var token = input.value;
		chrome.storage.sync.set({'token': token}, function() {
			console.log("token saved");
		});
		document.getElementById('status').innerHTML = 'Token update!';
	};

}

document.addEventListener('DOMContentLoaded', function() {
	saveChanges();
});
