/*globals performance, requestAnimFrame, Q*/
/*exported roquestAnim*/

'use strict';

window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        function( callback ){
            window.setTimeout(callback, 1000 / 60);
        };
})();

window.performance = window.performance || {};
performance.now = (function() {
    return performance.now       ||
        performance.mozNow    ||
        performance.msNow     ||
        performance.oNow      ||
        performance.webkitNow ||
        function() {
            return new Date().getTime();
        };
})();

var roquestAnim = (function(){

    function roquest(animFunc, lenAnim){
        var deferred = new Q.defer(),
            animStartTime;

        function animLoop(){
            var animReturnVal = animFunc(animStartTime);
            if (animReturnVal === false) {
                deferred.resolve();
            } else {
                requestAnimFrame(animLoop);
            }
        }

        function timeBasedLoop(){
            var timePassed = performance.now() - animStartTime;
            if (timePassed >= lenAnim) {
                animFunc(lenAnim);
                deferred.resolve();
            } else {
                animFunc(timePassed);
                requestAnimFrame(timeBasedLoop);
            }

        }

        animStartTime = performance.now();
        if (lenAnim){
            requestAnimFrame(timeBasedLoop);
        }
        else {
            requestAnimFrame(animLoop);
        }

        return deferred.promise;
    }

    return roquest;

}());
