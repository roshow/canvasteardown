'use strict';
/*globals CCjsAnimate, Crossfader*/

var CCMove = (function(){

    function halfDiff(a, b){
        return (a - b)/2;
    }

    function bounceBackPanels(data, cnv, ctx, cb) {
        var image1X = halfDiff(cnv.width, data[0].img.width),
            image1Y = halfDiff(cnv.height, data[0].img.height),
            image2X = halfDiff(cnv.width, data[1].img.width),
            image2Y = halfDiff(cnv.height, data[1].img.height);
        
        CCjsAnimate.animation({
            target: [data[0].img, data[1].img],
            from: [
                { x: image1X, y: image1Y },
                { x: image2X + (data.direction * cnv.width), y: image2Y }
            ],
            to: [
                { x: image1X - (data.direction * cnv.width), y: image1Y },
                { x: image2X, y: image2Y }
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
        var img = ctx.getImageData(0,0,800,450);
        console.log(img);
        new Crossfader(cnv, img, data.img).start(cb);
    }
    function animatePopUp(popup, cnv, ctx){
        popup.x = popup.x || 0;
        popup.y = popup.y || 0;
        popup.dur = popup.dur || 100;
        popup.totalFrames = popup.totalFrames || 10;
        var _int = popup.dur/popup.totalFrames,
            _bkgPartial = ctx.getImageData(popup.x, popup.y, popup.img.width, popup.img.height),
            _frame = 0;

        switch (popup.transition || 'scaleIn') {
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
                if (_scale === 100){
                    clearInterval(_scaleIn);
                }
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
            data[0].img = ctx.getImageData(0, 0, cnv.width, cnv.height);
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