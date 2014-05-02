'use strict';

var roquestAnim = function(animFunc, lenAnim){
    var deferred = new Q.defer(),
        animStartTime,
        rAF;

    function animLoop(){
        var animReturnVal = animFunc.call(undefined, animStartTime);
        if (animReturnVal === false) {
            deferred.resolve();
        } else {
            rAF = requestAnimationFrame(animLoop);
        }
    }

    function timeBasedLoop(){
        var timePassed = performance.now() - animStartTime;

        animFunc.call(undefined, timePassed);

        if (timePassed >= lenAnim) {
            deferred.resolve();
        } else {
            rAF = requestAnimationFrame(timeBasedLoop);
        }

    }

    animStartTime = performance.now();
    rAF = lenAnim ? requestAnimationFrame(timeBasedLoop) : requestAnimationFrame(animLoop);

    return deferred.promise;
};