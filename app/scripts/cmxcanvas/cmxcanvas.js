/*globals CCLoader, CCMove, CCPanelSet, performance*/
/*exported CmxCanvas*/

'use strict';


var CmxCanvas = function(initData, el){

    var ccMove,
        viewInfo = initData ? initData.view || {} : {};
    viewInfo.backgroundColor = viewInfo.backgroundColor || '#fff';
    viewInfo.backgroundTextColor = viewInfo.backgroundTextColor || '#000';

    var panelset, canvas, context, loadingImg, 
        doNotMove = false,
        wasLast = false,
        wasFirst = true,
        cmxcanvas = {};
        
    function drawLoadingImg(){
        context.fillStyle = viewInfo.backgroundTextColor;
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.font = '30pt Monaco';
        context.textAlign = 'center';
        context.fillText('LOADING...', canvas.width / 2, canvas.height / 2);
        context.fillStyle = viewInfo.backgroundColor;
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

    function resolveLoadingImgPromise(imgPromise){
        if (imgPromise){
            doNotMove = true;
            imgPromise.then(function (imgs){
                panelset.currentView.img = imgs.shift();
                for (var ii = 0, ll = imgs.length; ii < ll; ii++){
                     panelset.currentView.popups[ii].img = imgs[ii];
                }
                draw(panelset.currentView);
                doNotMove = false;
            });
        }
    }

    function draw(storyimg){
        /** TODO: check this logic. It may be dodgy. Or it may not be. **/
        var imgPromise;
        doNotMove = true;
        if (!storyimg.img){
            storyimg.img = loadingImg;
            imgPromise = CCLoader.onePanel(storyimg);
        }
        if (storyimg.type === 'panel'){
            context.fillRect(0, 0, canvas.width, canvas.height);
        }
        var x = storyimg.x || (canvas.width - storyimg.img.width) / 2,
            y = storyimg.y || (canvas.height - storyimg.img.height) / 2;
        context.drawImage(storyimg.img, x, y);
        doNotMove = false;
        resolveLoadingImgPromise(imgPromise);
        
    }

    cmxcanvas.prev = function(){
        if(!doNotMove){
            wasLast = false;
            panelset.prev();
            if (!wasFirst){
                doNotMove = true;
                wasFirst = (panelset.currentIndex[0] === 0);
                ccMove.panels(panelset.currentView.img, {
                    reverse: true,
                    transition: panelset.currentView.transition
                })
                    .then(function(){
                        doNotMove = false;
                    });
            }
        }
    };
    
    cmxcanvas.next = function(){
        if (!doNotMove){
           // loadAndUpdatePanels(panelset.next().panel).then(function(loc){
            panelset.next();
            wasFirst = false;
            if (!wasLast){
                doNotMove = true;
                if (panelset.currentIndex[0] === panelset.last[0] && panelset.currentIndex[1] === panelset.last[1]){
                    wasLast = true;
                }

                if (panelset.currentView.type === 'popup'){
                    ccMove.popup(panelset.currentView)
                        .then(function(){
                            doNotMove = false;
                            // console.log('popup upped');
                        });
                }
                else {
                    var imgPromise;
                    if (!panelset.currentView.img){
                        panelset.currentView.img = loadingImg;
                        /** this is my favorite use of promises yet because it's the first 
                            time I've grokked their full potential. By making this promise
                            here I can call it later without worrying about whether it's
                            resolve or not -- the promise handles it for me **/
                        imgPromise = CCLoader.onePanel(panelset.currentView);
                    }
                    ccMove.panels(panelset.currentView.img, {
                        transition: panelset.currentView.transition
                    })
                        .then(function(){
                            doNotMove = false;
                            resolveLoadingImgPromise(imgPromise);
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

    cmxcanvas.load = function(initData, canvasId){
        var that = this,
            rawpanels = initData.cmxJSON;

        /** Add all the fun stuff to the collection of panels and popups **/
        panelset = new CCPanelSet(rawpanels);
        panelset.onchange = function(){
            that.currentView = panelset.currentView;
        };
        
        /** Get Canvases and Contexts and Drawing load image **/
        canvas = document.getElementById(canvasId);
        context = canvas.getContext('2d');
        context.fillStyle = viewInfo.backgroundColor;

        var moveoptions = initData.view && initData.view.move ? initData.view.move : {};
        ccMove = new CCMove(context, canvas, moveoptions);

        viewInfo.backgroundColor = initData.view && initData.view.backgroundColor ? initData.view.backgroundColor : viewInfo.backgroundColor;

        /** Draw initial load image and load/save it for later uses on unloaded images **/
        drawLoadingImg();
        CCLoader.oneImage({ src: canvas.toDataURL()}).then(function (img){
            loadingImg = img;
        });

        /** Load initial panels and draw **/
        loadAndUpdatePanels(0,5).then(function(){
            draw(panelset.currentView);

            /** Batch preload the rest **/
            loadAndUpdatePanels(6,(panelset.length - 1));
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