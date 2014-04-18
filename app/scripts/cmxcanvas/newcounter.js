'use strict'

function StoryPanels(cmxjson){
  
    var loc = [0,-1];

    function getView(){
        var view = cmxjson[loc[0]];
        view.type = 'panel';
        if (loc[1] !== -1){
            view = view.popups[loc[1]];
            view.popup = loc[1];
            view.type = 'popup';
        }
        view.panel = loc[0];
        return view;
    }

    function next(){
        if (cmxjson[loc[0]].popups && loc[1] + 1 < cmxjson[loc[0]].popups.length){
            loc[1]++;
            return getView();
        }
        else if (loc[0] + 1 < cmxjson.length){
            loc[0]++;
            loc[1] = -1;
            return getView();
        }
        else {
            console.log('NO MAS!');
        }
        return loc;
    }

    function prev(){
        if (loc[0] - 1 >= 0){
            loc[0]--;
            loc[1] = -1;
            return getView();
        }
        else if (loc[0] === 0 && loc[1] !== -1){
            loc[1] = -1;
            return getView();
        }
        else {
            console.log('MUY POCO!');
        }
        return loc;
    }

    function goTo(panel, popup){
        loc[0] = panel || 0;
        loc[1] = popup || -1;
        return getView();
    }
  
    cmxjson.next = next;
    cmxjson.prev = prev;
    cmxjson.goTo = goTo;
    cmxjson.getView = getView;
    return cmxjson;
}

// var storypanels;

// $.getJSON('http://cmxcanvasapi.herokuapp.com/cmx/sov01')
    .done(function(data){
      
        storypanels = StoryPanels(data.data[0].cmxJSON);
      
        console.log(storypanels.getView());
        $('#next').on('click', function(){
            console.log(storypanels.next());
        });
        $('#prev').on('click', function(){
            console.log(storypanels.prev());
        });
      
    });
