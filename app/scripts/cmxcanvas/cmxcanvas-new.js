'use strict';
/*globals CCLoader, panelset*/

var panelset, canvas, context,
    cmxcanvas = {};

var CmxCanvas = function(initData, el){

    function drawLoadingImg(){
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.font = '30pt Monaco';
        context.textAlign = 'center';
        context.fillText('LOADING...', canvas.width / 2, canvas.height / 2);
    }

    function loadAndUpdatePanels(first, last){
        last = last || first + 3;
        return CCLoader.batchPanels(panelset.slice(first,last + 1)).then(function(imgs){
            for (var i = 0, l = imgs.length; i < l; i++){
                var panelImg = imgs[i].shift();
                panelset[panelImg.panel].img = panelImg;
                for (var ii = 0, ll = imgs[i].length; ii < ll; ii++){
                    panelset[panelImg.panel].popups[ii].img = imgs[i][ii];
                }
            }
            return [first, last];
        });
    }

    function draw(storyimg){
        if (storyimg.type === 'panel'){
            context.clearRect(0, 0, canvas.width, canvas.height);
        }
        var x = storyimg.x || (canvas.width - storyimg.img.width) / 2,
            y = storyimg.y || (canvas.height - storyimg.img.height) / 2;
        context.drawImage(storyimg.img, x, y);
    }

    cmxcanvas.prev = function(){
        loadAndUpdatePanels(panelset.prev().panel).then(function(loc){
            draw(panelset.currentView);
        });
        return this;
    };

    cmxcanvas.next = function(){
        loadAndUpdatePanels(panelset.next().panel).then(function(loc){
            if (panelset.currentView.type === 'popup'){
                CCMove.popup(panelset.currentView, canvas, context);
            }
            else {
                draw(panelset.currentView);
            }
        });
        return this;
    };

    cmxcanvas.load = function(rawpanels, canvasId){
        /** Add all the fun stuff to the collection of panels and popups **/
        panelset = new CCPanelSet(rawpanels);
        /** Get Canvases and Contexts and Drawing load image **/
        canvas = document.getElementById(canvasId);
        context = canvas.getContext('2d');
        drawLoadingImg();
        /** Load initial panels and draw **/
        loadAndUpdatePanels(0,5).then(function(loc){
            draw(panelset.currentView);
        });
        /* warm up the local browser's cache  - turned off for now. */
        // CCLoader.batchPanels(panelset.slice(2));
        return this;
    };

    // return load;
    if (initData && el) {
        return cmxcanvas.load(initData, el);
    }
    else {
        return cmxcanvas;
    }
};