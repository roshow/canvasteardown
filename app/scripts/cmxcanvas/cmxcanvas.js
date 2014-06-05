/*globals CCLoader, CCMove, CCPanelSet, performance*/
/*exported CmxCanvas*/

'use strict';


var CmxCanvas = function(initData, el){

    var panelset, canvas, context,
        isMoving = false,
        wasLast = false,
        cmxcanvas = {};
        
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
            context.fillRect(0, 0, canvas.width, canvas.height);
        }
        var x = storyimg.x || (canvas.width - storyimg.img.width) / 2,
            y = storyimg.y || (canvas.height - storyimg.img.height) / 2;
        context.drawImage(storyimg.img, x, y);
    }

    cmxcanvas.prev = function(){
        wasLast = false;
        loadAndUpdatePanels(panelset.prev().panel).then(function(){
            draw(panelset.currentView);
        });
        return this;
    };
    
    cmxcanvas.next = function(){
        if (!isMoving){
           // loadAndUpdatePanels(panelset.next().panel).then(function(loc){
            panelset.next();
            if (!wasLast){
                isMoving = true;
                if (panelset.currentIndex[0] === panelset.last[0] && panelset.currentIndex[1] === panelset.last[1]){
                    wasLast = true;
                }
                if (panelset.currentView.type === 'popup'){
                    CCMove.popup(panelset.currentView, canvas, context)
                        .then(function(){
                            isMoving = false;
                            // console.log('popup upped');
                        });
                }
                else {
                    CCMove.panels(panelset.currentView, canvas, context)
                        .then(function(){
                            isMoving = false;
                            // console.log('panel inned');
                        });
                }
            }
            // });
        }
        else {
            // console.log('is already moving');
        }
        return this;
    };

    cmxcanvas.goTo = function(panel, popup){
        draw(panelset.goTo(panel,popup));
    };

    cmxcanvas.load = function(rawpanels, canvasId){

        var that = this;

        /** Add all the fun stuff to the collection of panels and popups **/
        panelset = new CCPanelSet(rawpanels);
        panelset.onchange = function(){
            that.currentView = panelset.currentView;
        };
        
        /** Get Canvases and Contexts and Drawing load image **/
        canvas = document.getElementById(canvasId);
        context = canvas.getContext('2d');
        context.fillStyle = '#fff';
        drawLoadingImg();

        /** Load initial panels and draw **/
        loadAndUpdatePanels(0,5).then(function(){
            draw(panelset.currentView);
            
            /** Batch preload the rest **/
            // var startPreload = performance.now();
            loadAndUpdatePanels(6,(panelset.length - 1)).then(function(){
                // console.log('all loaded');
                // console.log((performance.now()-startPreload)/1000);
            });
        });

        

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