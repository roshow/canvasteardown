/*globals CCjsAnimate, Crossfader*/
var CCMove = (function(){

  function halfDiff(a, b){
      return (a - b)/2;
  }

  function bounceBackPanels(data, cnv, ctx, cb) {
    var image1_x = halfDiff(cnv.width, data.image1.width),
        image1_y = halfDiff(cnv.height, data.image1.height),
        image2_x = halfDiff(cnv.width, data.image2.width),
        image2_y = halfDiff(cnv.height, data.image2.height);
        
    CCjsAnimate.animation({
        target: [data.image1, data.image2],
        from: [
          { x: image1_x, y: image1_y },
          { x: image2_x + (data.direction * cnv.width), y: image2_y }
        ],
        to: [
          { x: image1_x - (data.direction * cnv.width), y: image1_y },
          { x: image2_x, y: image2_y }
        ],
        canvas: cnv,
        ctx: ctx,
        duration: 400,
        interval: 25,
        aFunction: CCjsAnimate.makeEaseOut(CCjsAnimate.back),
        onComplete: function() {
          cb();
        }
    });
  }
  function crossfadePanels(data, cnv, ctx, cb){
    Crossfader(cnv, data.image1, data.image2).start(cb);
  }
  function animatePopUp(popup, cnv, ctx){
        popup.dur = popup.dur || 100;
        popup.totalFrames = popup.totalFrames || 10;
        var _int = popup.dur/popup.totalFrames,
          _bkgPartial = ctx.getImageData(popup.x, popup.y, popup.img.width, popup.img.height),
          _frame = 0;

        switch (popup.transition) {
          case 'fadeIn':
            ctx.globalAlpha = 0;
                var _fadeIn = setInterval(function(){

              //increase globalAlpha by 1 / total frames and make it into a normal fraction
              var ga = ctx.globalAlpha + 1/popup.totalFrames;
              ctx.globalAlpha = parseFloat(ga.toFixed(1), 10);

              ctx.clearRect(popup.x, popup.y, popup.img.width, popup.img.height);
              ctx.putImageData(_bkgPartial, popup.x, popup.y);
              ctx.drawImage(popup.img, popup.x, popup.y);

              _frame++;
              if (ctx.globalAlpha === 1) {
                clearInterval(_fadeIn);
              }
              }, _int);
              break;

          case 'scaleIn':
          default:
            var _scale = 0,
                  _scaleIn = setInterval(function(){
              
              _scale += 10;
              
              var _scaledW = popup.img.width*(_scale/100),
                _scaledH = popup.img.height*(_scale/100),
                _dX = popup.x + ((popup.img.width - _scaledW)/2),
                _dY = popup.y + ((popup.img.height - _scaledH)/2);

              ctx.clearRect(popup.x, popup.y, popup.img.width, popup.img.height);
              ctx.putImageData(_bkgPartial, popup.x, popup.y);
              ctx.drawImage(popup.img, _dX, _dY, _scaledW, _scaledH);

              _frame++;
              if (_scale === 100) clearInterval(_scaleIn);
              }, _int);
              break;
          }
  }
  function done(cb){
    if (typeof cb === "function") {
      cb();
    }
  }

  var Animate = {
    panelFunctions: {
      bounceback: bounceBackPanels,
      crossfade: crossfadePanels,
      jumpcut: crossfadePanels
    },
    panels: function(data, cnv, ctx){
      var that = this;
      /** Override image1 with data from the current state of the canvas. **/
      data.image1 = ctx.getImageData(0, 0, cnv.width, cnv.height);
      /** set transition **/
      var transition = data.transition ? data.transition : 'bounceback';
      return {
        start: function(cb){
          that.panelFunctions[transition](data, cnv, ctx, cb);
        }
      };
    },
    popup: animatePopUp
  };

  return  Animate;
}());