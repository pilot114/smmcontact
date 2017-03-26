function Application() {
	window.util.clearIntervals();

	this.state = {
	    // UI flags
	    'client_expand'    : true,
	    'order_expand'     : true,
		// current reminders tab
	    'reminders_state'  : "late",
	    // for auto rerender labels in dialogs
	    "window_height"    : 0,

	    // for caching
	    'clients'       : null,
	    'orders'        : null,
	    'products'      : null,
	    'phrases'       : null,
	    'tags'          : null,

	    // for temp elements - tags and products in order
	    'clientTags'    : [],
	    'orderProducts' : [],

        'statuses' : {
            '0':'Другое',
            '1':'Поинтересовался',
            '2':'Планирует купить',
            '3':'Ожидаем предоплату',
            '4':'Оплачен',
            '5':'Таймер',
            '6':'Опубликован',
            '7':'Отменён',
        },
        'sources' : {
            '1': 'Узнал от друга',
            '2': 'Нашёл сам',
        },
        'order_statuses' : {
            '1':'Новый',
            '2':'Резерв',
            '3':'Предзаказ',
            '4':'Передан на отправку',
            '5':'Доставлен',
            '6':'Отменён',
        },

	    'currentAuto'   : false,
	    // for clientRender
	    'addDays'       : null,
	    'replaces' : {
	        '[Name]': 'default',
	        '[ExternalOrderNumber]': 0,
	        '[SumFromClient]': 0,
	    },
	    // from open vk api
	    'vkClient': null,
	    // current user
	    'user': {
	    	'token': null 
	    }
	};

	this.getCached = function(){
		return [
			this.state.clients,
			this.state.orders,
			this.state.products,
			this.state.phrases,
			this.state.tags,
		];
	}

	this.setCached = function(data){
		this.state.clients 	= data[0][0];
		this.state.orders   = data[0][1];
		this.state.products = data[0][2];
		this.state.phrases  = data[0][3];
		this.state.tags     = data[0][4];

		this.state.user.token = data[1];
	}

	this.getReminders = function(){
		var reminders = {
	        'late': [],
	        'today': [],
	        'tomorrow': [],
	        'future': []
	    };

	    var withoutNC = [];
	    for (var i = 0; i < this.state.clients.length; i++) {
	        var client = this.state.clients[i];
	        if (client.next_contact) {
	            var nc = new Date(+client.next_contact.milliseconds);
	            var now = new Date();
	            var diffTime = nc.getTime() - now.getTime();
	            var diffDays = Math.ceil( diffTime / (1000 * 3600 * 24));
	            // x<0, 0, 1, x>1
	            if (diffDays<0) {
	                reminders.late.push(client);
	            } if(diffDays==0) {
	                reminders.today.push(client);
	            } if(diffDays==1) {
	                reminders.tomorrow.push(client);
	            } if(diffDays>1) {
	                reminders.future.push(client);
	            }
	        } else {
	            withoutNC.push(client);
	        }
	    }
	    deb.log("APP: detect "+withoutNC.length+" clients without next_contact -");
	    deb.log(withoutNC);
	    
	    return reminders;
	}

	this.updatePhrases = function(phrases, order) {

	    var rs = this.state.replaces;
	    var ord = util.clone(order);

	    if (this.state.vkClient) {
	        rs['[Name]'] = this.state.vkClient.first_name;
	    }
	    if (ord) {
	        var inputs = $('.in_or');
	        if (inputs) {
	            for (var i = 0; i < inputs.length; i++) {
	                var el = $(inputs[i]);
	                var name = el.attr("name");
	                var val  = el.val();
	                ord[name] = val;
	            }
	        }

	        rs['[ExternalOrderNumber]'] = ord.number;
	        rs['[SumFromClient]']       = ord.price;
	    }
	    this.state.replaces = rs;

	    // up phrases
	    for (var i = 0; i < phrases.length; i++) {
	        var type = phrases[i];
	        for (var j = 0; j < type.length; j++) {
	            var phrase = type[j];

	            $.each(rs, function(name, value) {
	                phrase.name = phrase.name.replace(name, value);
	                phrase.text = phrase.text.replace(name, value);
	            });
	        }
	    }

	    return phrases;
	}
}