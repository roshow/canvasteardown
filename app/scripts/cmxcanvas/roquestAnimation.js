'use strict';

var roquestAnim = function(func){
    var deferred = new Q.defer(),
        animStartTime,
        rAF;

    function animLoop(time){
        var animReturnVal = (typeof func === 'function') ? func.call(undefined, animStartTime) : false;
        if (animReturnVal === false) {
            deferred.resolve();
        } else {
            rAF = requestAnimationFrame(animLoop);
        }
    }

    animStartTime = performance.now();
    rAF = requestAnimationFrame(animLoop);

    return deferred.promise;
};