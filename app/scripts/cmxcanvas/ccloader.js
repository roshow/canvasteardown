/*globals Q*/
/*exported CCLoader*/

'use strict';

var CCLoader = (function(){

    var loader = {};

    loader.oneImage = function(imgObj){
        var deferred = new Q.defer(),
            img = new Image();
        img.onload = function(){
            deferred.resolve(this);
        };
        img.crossOrigin="anonymous";
        img.panel = imgObj.panel;
        img.src = imgObj.src;
        return deferred.promise;
    };

    loader.onePanel = function(panel){
        // var that = this;
        var imgObjs = [panel],
            promisedImgs = [];
        if (panel.popups && panel.popups.length){
            for (var i = 0, len = panel.popups.length; i < len; i++){
                imgObjs.push(panel.popups[i]);
            }
        }
        for (var j = 0, L = imgObjs.length; j < L; j++){
            promisedImgs.push(this.oneImage(imgObjs[j]));
        }
        return Q.all(promisedImgs);
    };

    loader.batchPanels = function(panels){
        var promisedPanels = [];
        for (var i in panels){
            promisedPanels.push(this.onePanel(panels[i]));
        }
        return Q.all(promisedPanels);
    };
    /** Someday, bring back the throttleLoad method **/
    return loader;
}());