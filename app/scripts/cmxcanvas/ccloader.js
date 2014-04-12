var CCLoader = (function(){

    function loadpanelimgs(arg, id, fn){
            var popupimgs;
            var popupL = (arg.popups && arg.popups.length > 0) ? arg.popups.length : 0;
            var loading = 1 + popupL;
            
            var panelimg = new Image();
            panelimg.crossOrigin = "Anonymous";
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
    }

    function loadAll(imgs2load, fn) {
        var keys = Object.keys(imgs2load);
        var L = keys.length;
        var loadingAll = L;
        var loadedImgs = [];
        for (var i = 0; i < L; i++) {
            loadpanelimgs(imgs2load[keys[i]], keys[i], function(imgs){
                loadedImgs[imgs.id] = imgs;
                if (!--loadingAll) {
                    fn && fn(loadedImgs);
                }
            });
        }
    }

    /** crazy recursive function to load images staggered-like in the background **/
    
    function throttledLoadArray(imgs2load){
        loadAll(imgs2load.splice(0,10), function(imgs) {
            imgs = null;
            if (imgs2load.length > 0) {
                throttledLoadArray(imgs2load);
            }
            else {
                return false;
            }
        });
    }
    
    return {
        single: loadpanelimgs,
        batch: loadAll,
        throttledBatch: throttledLoadArray
    };
}());