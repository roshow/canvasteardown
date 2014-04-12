var CCjsAnimate = (function(){
  var jsAnimate = {
      elastic: function(progress, x) {
        x = x || 1.5;
        return Math.pow(2, 10 * (progress-1)) * Math.cos(20*Math.PI*x/3*progress);
      },
      linear: function(progress){
        return progress;
      },
      quad: function(progress){
        return Math.pow(progress, 2);
      },
      circ: function(progress) {
        return 1 - Math.sin(Math.acos(progress));
      },
      back: function(progress, x) {
        x = x || 1.5;
        return Math.pow(progress, 2) * ((x + 1) * progress - x);
      },
      bounce: function(progress) {
        for(var a = 0, b = 1, result; 1; a += b, b /= 2) {
          if (progress >= (7 - 4 * a) / 11) {
            return -Math.pow((11 - 6 * a - 11 * progress) / 4, 2) + Math.pow(b, 2);
          }
        }
      },
      makeEaseInOut: function(delta) {  
        return function(progress) {
          if (progress < .5)
            return delta(2*progress) / 2;
          else
            return (2 - delta(2*(1-progress))) / 2;
        };
      },  
      makeEaseOut: function(delta) {  
        return function(progress) {
          return 1 - delta(1 - progress);
        };
      },
      animation: function(animObj) {

          var step = function(deltaX, deltaY){
              
              var toX = [
                  (animObj.to[0].x - animObj.from[0].x) * deltaX + animObj.from[0].x,
                  (animObj.to[1].x - animObj.from[1].x) * deltaX + animObj.from[1].x
              ];
              
              var toY = [
                  (animObj.to[0].y - animObj.from[0].y) * deltaY + animObj.from[0].y,
                  (animObj.to[1].y - animObj.from[1].y) * deltaY + animObj.from[1].y
              ];
              
              animObj.ctx.clearRect(0, 0, animObj.canvas.width, animObj.canvas.height);
              animObj.ctx.putImageData(animObj.target[0], toX[0], toY[0]);
              animObj.ctx.drawImage(animObj.target[1], toX[1], toY[1]);
          };
          
          setTimeout(function(){
              var start = new Date();

              var id = setInterval(function(){
                  var timePassed = new Date() - start;
                  var progress = timePassed / animObj.duration;
              
                  if (progress > 1) {progress = 1;}
                  
                  var xFunction = (animObj.aFunction.x) ? animObj.aFunction.x : animObj.aFunction;
                  var deltaX = (animObj.friction) ? xFunction(progress, animObj.friction) : xFunction(progress);
                  
                  var yFunction = (animObj.aFunction.y) ? animObj.aFunction.y : animObj.aFunction;
                  var deltaY = (animObj.friction) ? yFunction(progress, animObj.friction) : yFunction(progress);
                  
                  step(deltaX, deltaY);
                  
                  if (progress === 1) {
                      clearInterval(id);
                      animObj.onComplete && animObj.onComplete();
                  }

                },animObj.interval || 100);


          },animObj.delay);
      }
  };
  return jsAnimate;
}());