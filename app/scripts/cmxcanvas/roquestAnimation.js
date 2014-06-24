/*globals requestAnimationFrame, webkitRequestAnimationFrame, Q*/
/*exported roquestAnim*/

'use strict';

var roquestAnim = (function(){
    // var requestAnimFrame = requestAnimationFrame || webkitRequestAnimationFrame;

    
    window.requestAnimFrame = (function(){
      return  window.requestAnimationFrame       ||
              window.webkitRequestAnimationFrame ||
              window.mozRequestAnimationFrame    ||
              function( callback ){
                window.setTimeout(callback, 1000 / 60);
              };
    })();
    var performance = window.performance || {};
    performance.now = (function() {
        return performance.now    ||
        performance.webkitNow     ||
        performance.msNow         ||
        performance.oNow          ||
        performance.mozNow        ||
        function() { return new Date().getTime(); };
    })();

    // var now = (function() {
     
    //   // Returns the number of milliseconds elapsed since either the browser navigationStart event or 
    //   // the UNIX epoch, depending on availability.
    //   // Where the browser supports 'performance' we use that as it is more accurate (microsoeconds
    //   // will be returned in the fractional part) and more reliable as it does not rely on the system time. 
    //   // Where 'performance' is not available, we will fall back to Date().getTime().
     
    //   // jsFiddle: http://jsfiddle.net/davidwaterston/xCXvJ
     
     
        
              
    //     return performance.now();     
     
    // });

    function roquest(animFunc, lenAnim){
        var deferred = new Q.defer(),
            animStartTime,
            rAF;

        function animLoop(){
            var animReturnVal = animFunc(animStartTime);
            if (animReturnVal === false) {
                deferred.resolve();
            } else {
                rAF = requestAnimFrame(animLoop);
            }
        }

        function timeBasedLoop(){
            var timePassed = performance.now() - animStartTime;
            if (timePassed >= lenAnim) {
                animFunc(lenAnim);
                deferred.resolve();
            } else {
                animFunc(timePassed);
                rAF = requestAnimFrame(timeBasedLoop);
            }

        }

        animStartTime = performance.now();
        rAF = lenAnim ? requestAnimFrame(timeBasedLoop) : requestAnimFrame(animLoop);

        return deferred.promise;
    }

    return roquest;

}());
