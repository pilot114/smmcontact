

function updatePhrases(phrases) {

    // up replaces
    vk_client = states.vk_client;
    rs = states.replaces;
    order = clone(states.order);

    if (vk_client) {
        rs['[Name]'] = vk_client.first_name;
    }
    if (order) {
        inputs = $('.in_or');
        if (inputs) {
            for (var i = 0; i < inputs.length; i++) {
                el = $(inputs[i]);
                name = el.attr("name");
                val  = el.val();
                order[name] = val;
            }
        }

        rs['[ExternalOrderNumber]'] = order.order_number;
        rs['[SumFromClient]']       = order.price;
    }
    states.replaces = rs;

    // up phrases
    for (var i = 0; i < phrases.length; i++) {
        type = phrases[i];
        for (var j = 0; j < type.length; j++) {
            phrase = type[j];

            $.each(rs, function(name, value) {
                phrase.name = phrase.name.replace(name, value);
                phrase.text = phrase.text.replace(name, value);
            });
        }
    }

    return phrases;
}

function getClientInfo(sel, cb) {
	url = "https://api.vk.com/method/users.get?user_ids="+sel+"&v=5.8&fields=country,city,photo_100";
    $.ajax({
        type: 'GET',
        url: url,
        dataType: 'json',
        success: function(data) {
            cb({"result":data.response[0]});
        },
        error: function(jqXHR, textStatus, errorThrown) {
            cb({"error":errorThrown});
        }
    });
}
