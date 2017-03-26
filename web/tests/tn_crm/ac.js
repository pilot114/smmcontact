searchTag = function(text) {

    var searched = [];
    if (text == '') {
        return searched;
    }

    ts = clone(states.tags);

    for (var i = 0; i < ts.length; i++) {
        t = ts[i];
        if (t.text.toLowerCase().indexOf(text.toLowerCase()) === 0) {
            searched.push(t);
        }
    }
    return searched;
}

renderAutocompleteTag = function(target, searched, selectCb) {
    $('.autolist').remove();
    pos = target.position();
    pos.top += 20;
    var view = '<div class="autolist" style="background: #edeef0; padding: 5px 0; border: 1px; border-radius: 2px;\
    position: absolute; top: '+pos.top+'px; left: '+pos.left+'px;">';
    for (var i = 0; i < searched.length; i++) {
        view += '<a data-text="'+searched[i].text+'" class="auto_link">'+searched[i].text+'</a><br>';
    }
    view += '</div>';
    target.after(view);
    
    $('.auto_link').each(function( i ) {
        $( this ).on('click', function(e) {
            sa = $(this).attr('data-text');
            selectCb(sa);
            $('.autolist').remove();
        });
    });
}


searchProduct = function(text) {
    var searched = [];
    if (text == '') {
        return searched;
    }

    ps = clone(states.products);
    
    for (var i = 0; i < ps.length; i++) {
        p = ps[i];
        if (p.type.toLowerCase().indexOf(text.toLowerCase()) === 0) {
            searched.push(p);
        }
    }
    return searched;
}

renderAutocompleteProduct = function(target, searched, selectCb) {
    $('.autolist').remove();
    pos = target.position();
    pos.top += 20;
    var view = '<div class="autolist" style="background: #edeef0; padding: 5px 0; border: 1px; border-radius: 2px;\
    position: absolute; top: '+pos.top+'px; left: '+pos.left+'px;">';
    for (var i = 0; i < searched.length; i++) {
        typeAndPrice = searched[i].type+' '+searched[i].price;
        view += '<a data-text="'+searched[i].article+'" class="auto_link">'+typeAndPrice+'</a><br>';
    }
    view += '</div>';
    target.after(view);
    
    $('.auto_link').each(function( i ) {
        $( this ).on('click', function(e) {
            sa = $(this).attr('data-text');
            selectCb(sa);
            $('.autolist').remove();
        });
    });
}



searchPhrases = function(text) {
    var searched = [];
    if (text == '') {
        return searched;
    }
    
    phs = clone(states.phrases);
    phrases = updatePhrases( groupBy(phs, 'type') );

    for (var i = 0; i < phrases.length; i++) {
        type = phrases[i];
        for (var j = 0; j < type.length; j++) {
            phrase = type[j];
            if (phrase.name.toLowerCase().indexOf(text.toLowerCase()) === 0) {
                searched.push(phrase);
            }
        }
    }
    return searched;
}
renderAutocompleteIM = function(target, searched) {
    $('.autolist').remove();
    pos = target.position();
    pos.top += 20;
    var view = '<div class="autolist" style="background: #edeef0; padding: 5px 0; border: 1px; border-radius: 2px;\
    position: absolute; top: '+pos.top+'px; left: '+pos.left+'px;">';
    for (var i = 0; i < searched.length; i++) {
        view += '<a onclick=document.getElementsByClassName("im_editable")[0].textContent=this.attributes[1].value;\
        data-text="'+searched[i].text+'" class="auto_link"><b>'+searched[i].type+'</b> - '+searched[i].name+'</a><br>';
    }
    view += '</div>';
    target.after(view);
    
    $('.auto_link').each(function( i ) {
        $( this ).on('click', function(e) {
            $('.autolist').remove();
        });
    });
}
selectAutocomplete = function(e, selectCb) {
    list = $('.autolist a');
    len = list.length;
    switch(e.which) {
        // up
        case 38:
            if (states.currentAuto === false) {
                states.currentAuto = len-1;
            } else {
                if (states.currentAuto <= 0) {
                    states.currentAuto = len-1;
                } else {
                    states.currentAuto -= 1;
                }
            }
            $(list[states.currentAuto]).addClass('selected_auto');
        break;
        // down
        case 40:
            if (states.currentAuto === false) {
                states.currentAuto = 0;
            } else {
                if (states.currentAuto >= len-1) {
                    states.currentAuto = 0;
                } else {
                    states.currentAuto += 1;
                }
            }
            $(list[states.currentAuto]).addClass('selected_auto');
        break;
        // enter
        case 13:
            selected_auto = list[states.currentAuto];
            sa = $(selected_auto).attr('data-text');
            if (sa) {
                selectCb(sa);
                $('.autolist').remove();
            }
        break;
    }
}