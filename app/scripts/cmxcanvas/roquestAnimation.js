/*globals performance, requestAnimationFrame, Q*/
/*exported roquestAnim*/

'use strict';

var roquestAnim = function (animFunc, lenAnim){
    var deferred = new Q.defer(),
        animStartTime,
        rAF;

    function animLoop(){
        var animReturnVal = animFunc(animStartTime);
        if (animReturnVal === false) {
            deferred.resolve();
        } else {
            rAF = requestAnimationFrame(animLoop);
        }
    }

    function timeBasedLoop(){
        var timePassed = performance.now() - animStartTime;

        animFunc(timePassed);

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