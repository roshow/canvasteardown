/*globals requestAnimationFrame, webkitRequestAnimationFrame, Q*/
/*exported roquestAnim*/

'use strict';

var roquestAnim = (function(){
    var reqAF = requestAnimationFrame || webkitRequestAnimationFrame;

    var now = (function() {
     
      // Returns the number of milliseconds elapsed since either the browser navigationStart event or 
      // the UNIX epoch, depending on availability.
      // Where the browser supports 'performance' we use that as it is more accurate (microsoeconds
      // will be returned in the fractional part) and more reliable as it does not rely on the system time. 
      // Where 'performance' is not available, we will fall back to Date().getTime().
     
      // jsFiddle: http://jsfiddle.net/davidwaterston/xCXvJ
     
     
        var performance = window.performance || {};
        
      performance.now = (function() {
        return performance.now    ||
        performance.webkitNow     ||
        performance.msNow         ||
        performance.oNow          ||
        performance.mozNow        ||
        function() { return new Date().getTime(); };
      })();
              
      return performance.now();     
     
    });

    function roquest(animFunc, lenAnim){
        var deferred = new Q.defer(),
            animStartTime,
            rAF;

        function animLoop(){
            var animReturnVal = animFunc(animStartTime);
            if (animReturnVal === false) {
                deferred.resolve();
            } else {
                rAF = reqAF(animLoop);
            }
        }

        function timeBasedLoop(){
            var timePassed = now() - animStartTime;
            if (timePassed >= lenAnim) {
                animFunc(lenAnim);
                deferred.resolve();
            } else {
                animFunc(timePassed);
                rAF = reqAF(timeBasedLoop);
            }

        }

        animStartTime = now();
        rAF = lenAnim ? reqAF(timeBasedLoop) : reqAF(animLoop);

        return deferred.promise;
    }

    return roquest;

}());
