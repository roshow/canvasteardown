'use strict';
/*globals CCLoader, panelset*/

var cmxcanvas = {};
var panelset, canvas, context;

var CmxCanvas = function(initData, el){

    function halfDiff(a, b){
        return (a - b)/2;
    }

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
                panelset[panelImg.panel].loadedImg = panelImg;
                for (var ii = 0, ll = imgs[i].length; ii < ll; ii++){
                    panelset[panelImg.panel].popups[ii].loadedImg = imgs[i][ii];
                }
            }
            return [first, last];
        });
    }

    function draw(storyimg){
        if (storyimg.type === 'panel'){
            context.clearRect(0, 0, canvas.width, canvas.height);
        }
        var x = storyimg.x || halfDiff(canvas.width, storyimg.loadedImg.width),
            y = storyimg.y || halfDiff(canvas.height, storyimg.loadedImg.height);
        context.drawImage(storyimg.loadedImg, x, y);
    }

    cmxcanvas.prev = function(){
        loadAndUpdatePanels(panelset.prev().panel).then(function(loc){
            draw(panelset.current);
        });
        return this;
    };

    cmxcanvas.next = function(){
        loadAndUpdatePanels(panelset.next().panel).then(function(loc){
            draw(panelset.current);
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
            draw(panelset.current);
        });
        /* warm up the local browser's cache  */
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