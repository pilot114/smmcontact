var deb = new Debugger();
var cache = new Cacher();
var http = new Http(settings.domain);




$(function() {
	var input = $('#input');

	cache.loadToken().then( t => {
		input.val(t);
	});

	input.on('input', function(){
		var token = this.value;
		cache.saveToken(token);
		$('#status').html('Token update!');
		// maybe TODO: clear cache if token changed
	});

	$('#update').click(function(){
		$('#update_result').empty();
		http.setToken( input.val() );

		$('#update_result').append('<img id="preloader" src="/images/loader.gif">');
		http.preload().then( data => {
			cache.saveState(data);
			$('#update_result').empty().append('<div>Сделано!</div>');
			// MAYBE TODO: send update command to main window
		});
	});

});
