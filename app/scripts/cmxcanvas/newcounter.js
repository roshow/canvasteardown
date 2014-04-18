'use strict'

function StoryPanels(cmxjson){
  
    var loc = [0,-1]; 

    cmxjson.setView = function(){
        var view = cmxjson[loc[0]];
        view.type = "panel";
        if (loc[1] !== -1){
            view = view.popups[loc[1]];
            view.popup = loc[1];
            view.type = "popup";
        }
        view.panel = loc[0];
        cmxjson.current = view;
        return view;
    };

    cmxjson.next = function(){
        if (cmxjson[loc[0]].popups && loc[1] + 1 < cmxjson[loc[0]].popups.length){
            loc[1]++;
        }
        else if (loc[0] + 1 < cmxjson.length){
            loc[0]++;
            loc[1] = -1;
        }
        else {
            console.log('NO MAS!');
        }
        return this.setView();
    };

    cmxjson.prev = function(){
        if (loc[0] - 1 >= 0){
            loc[0]--;
            loc[1] = -1;
        }
        else if (loc[0] === 0 && loc[1] !== -1){
            loc[1] = -1;
        }
        else {
            console.log('MUY POCO!');
        }
        return this.setView();
    };

    cmxjson.goTo = function(panel, popup){
        loc[0] = panel || 0;
        loc[1] = popup || -1;
        return this.setView();
    };
  
    cmxjson.last = [cmxjson.length - 1];
    cmxjson.last[1] = cmxjson[cmxjson.last[0]].popups ? cmxjson[cmxjson.last[0]].popups.length - 1 : -1;
    cmxjson.setView(); 

    return cmxjson;
}
