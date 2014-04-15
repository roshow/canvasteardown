'use strict';
/*globals Q*/
var CCLoader = (function(){

    var loader = {};

    loader.oneImage = function(url){
        var deferred = new Q.defer(),
            img = new Image();
        img.onload = function(){
            deferred.resolve(this);
        };
        img.src = url;
        return deferred.promise;
    };

    loader.onePanel = function(panel){
        // var that = this;
        var imgUrls = [panel.src],
            promisedImgs = [];
        if (panel.popups && panel.popups.length){
            for (var i = 0, len = panel.popups.length; i < len; i++){
                imgUrls.push(panel.popups[i].src);
            }
        }
        for (var j = 0, L = imgUrls.length; j < L; j++){
            promisedImgs.push(this.oneImage(imgUrls[j]));
        }
        return Q.all(promisedImgs);
    };

    loader.batchPanels = function(panels){
        var promisedPanels = [];
        for (var i = 0, len = panels.length; i < len; i++){
            promisedPanels.push(this.onePanel(panels[i]));
        }
        return Q.all(promisedPanels);
    };

    loader.singlePanel = function(arg, id, fn){
            var popupimgs;
            var popupL = (arg.popups && arg.popups.length > 0) ? arg.popups.length : 0;
            var loading = 1 + popupL;
            
            var panelimg = new Image();
            panelimg.onload = function(){
                /* Remove a loading token and, if none left, run callback */
                if (!--loading) {
                    fn({
                        img: panelimg,
                        id: id || false,
                        popups: popupimgs || false
                    });
                }
            };
            panelimg.src = arg.src;
            
            /* If any popups, load the Images */
            if (popupL) {
                popupimgs = [];
                for (var i = 0; i < popupL; i++) {
                    popupimgs[i] = new Image();
                    popupimgs[i].crossOrigin = "Anonymous";
                    popupimgs[i].onload = function(){
                        /* Remove a loading token and, if none left, run callback */
                        if (!--loading) {
                            fn({
                                img: panelimg,
                                id: id || false,
                                popups: popupimgs || false
                            });
                        }
                    }
                    popupimgs[i].src = arg.popups[i].src;
                }
            }
    };

    loader.batch = function(imgs2load, fn) {
        var keys = Object.keys(imgs2load);
        var L = keys.length;
        var loadingAll = L;
        var loadedImgs = [];
        for (var i = 0; i < L; i++) {
            this.singlePanel(imgs2load[keys[i]], keys[i], function(imgs){
                loadedImgs[imgs.id] = imgs;
                if (!--loadingAll) {
                    fn && fn(loadedImgs);
                }
            });
        }
    };

    /** crazy recursive function to load images staggered-like in the background **/
    
    loader.throttledBatch = function(imgs2load){
        var that = this;
        this.batch(imgs2load.splice(0,10), function(imgs) {
            imgs = null;
            if (imgs2load.length > 0) {
                that.throttledBatch(imgs2load);
            }
            else {
                return false;
            }
        });
    };
    
    return loader;
}());