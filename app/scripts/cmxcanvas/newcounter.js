'use strict';
var loc = [0,0],
    cmxjson,
    request = new XMLHttpRequest();
request.open('GET', 'json/sov01Model.json', true);
request.onload = function(){
    // cmxcanvas.load(JSON.parse(this.response), 'thisCanvas');
};
request.send();

function next(){
    if (cmxjson[loc[0]].popups && loc[1] + 1 < cmxjson[loc[0]].popups.length){
        loc[1]++;
        console.log('panel: '+cmxjson[loc[0]].src+', popup: ' + cmxjson[loc[0]].popups[loc[1]].src);
    }
    else if (loc[0] + 1 < cmxjson.length){
        loc[0]++;
        loc[1] = -1;
        console.log('panel: '+cmxjson[loc[0]].src+', popup: -1');
    }
    else {
        console.log('NO MAS!');
    }
    return loc;
};

function prev(){
    if (loc[0] - 1 >= 0){
        loc[0]--;
        loc[1] = -1;
        console.log('panel: '+cmxjson[loc[0]].src+', popup: -1');
    }
    else if (loc[0] === 0 && loc[1] !== -1){
        loc[1] = -1;
        console.log('panel: '+cmxjson[loc[0]].src+', popup: -1');
    }
    else {
        console.log('MUY POCO!');
    }
    return loc;
}

function goTo(panel, popup){
    loc[0] = panel || 0;
    loc[1] = popup || -1;
    return loc;
}
