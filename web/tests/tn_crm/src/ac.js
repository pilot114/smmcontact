
$('.im_editable').on('keydown', function(e) {
    var editElem = $(e.target);
    var text = editElem.text();

    // backspace
    if (e.which == 8) {
        text = text.substring(0, text.length - 1);
    }
    // letters, numbers, russian keys
    if ( (e.which <= 90 && e.which >= 48)
        || e.which == 186
        || e.which == 188
        || e.which == 190
        || e.which == 219
        || e.which == 221
        || e.which == 222
    ) {
        text += e.key;
    }
    var searched = searchPhrases(text);

    renderAutocompleteIM(editElem, searched);

    var selectCb = function(sa) {
        $('.im_editable').removeAttr('contenteditable');
        $('.im_editable').text(sa);
        setTimeout(function() {
            $('.im_editable').attr('contenteditable', 'true');
        }, 10);
    }
    // up, down and enter key handling
    selectAutocomplete(e, selectCb);

    deb.log("q"+text);
    deb.log("w"+editElem.text());

});

searchTag = function(text) {

    var searched = [];
    if (text == '') {
        return searched;
    }

    ts = util.clone(app.state.tags);

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

    ps = util.clone(app.state.products);
    
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
    
    phs = util.clone(app.state.phrases);
    phrases = updatePhrases( util.groupBy(phs, 'type') );

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
            if (app.state.currentAuto === false) {
                app.state.currentAuto = len-1;
            } else {
                if (app.state.currentAuto <= 0) {
                    app.state.currentAuto = len-1;
                } else {
                    app.state.currentAuto -= 1;
                }
            }
            $(list[app.state.currentAuto]).addClass('selected_auto');
        break;
        // down
        case 40:
            if (app.state.currentAuto === false) {
                app.state.currentAuto = 0;
            } else {
                if (app.state.currentAuto >= len-1) {
                    app.state.currentAuto = 0;
                } else {
                    app.state.currentAuto += 1;
                }
            }
            $(list[app.state.currentAuto]).addClass('selected_auto');
        break;
        // enter
        case 13:
            selected_auto = list[app.state.currentAuto];
            sa = $(selected_auto).attr('data-text');
            if (sa) {
                selectCb(sa);
                $('.autolist').remove();
            }
        break;
    }
}