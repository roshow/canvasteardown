'use strict';
/*globals requestAnimationFrame, performance, CCjsAnimate, Crossfader*/
var roquestAnim = function(func, wait){
    var that = {},
        rAF,
        finalCallback;

    function animLoop(time){
        var animReturnVal = (typeof func === 'function') ? func.call(that, time) : false;
        if (animReturnVal === false) {
            that.stop();
        } else {
            rAF = requestAnimationFrame(animLoop);
        }
    }

    that.stop = function(){
        if (typeof finalCallback === 'function'){
            finalCallback();
        }
        return that;
    };

    that.start = function(){
        that.animStartTime = performance.now();
        rAF = requestAnimationFrame(animLoop);
        return that;
    };

    that.then = function(fn){
        if (typeof fn === 'function') { finalCallback = fn; }
        return that;
    };

    if (!wait) { that.start(); }
    return that;
};

function panelSlide(data, cnv, ctx, cb){

    var addons = arguments;

    ctx.fillRect(0, 0, cnv.width, cnv.height);
    ctx.drawImage(data[1], (cnv.width-data[1].width)/2, (cnv.height-data[1].height)/2);
    data[1] = ctx.getImageData(0, 0, cnv.width, cnv.height);
    ctx.fillRect(0, 0, cnv.width, cnv.height);
    ctx.putImageData (data[0], 0, 0);

    var lenAnim = 300,
        distance = cnv.width,
        distancePerLenAnim = Math.PI/lenAnim;

    function drawSlideAF(time){
        var timePassed = (time - this.animStartTime);
        var sinPart = Math.sin(timePassed*distancePerLenAnim/2);
        var deltaX =  sinPart < 0 ? 0 : sinPart * distance;
        
        ctx.clearRect(0,0,800,450);
        ctx.putImageData(data[0], 0 - deltaX, 0);
        ctx.putImageData(data[1], 800 - deltaX, 0);
        if( timePassed >= lenAnim) {
            return false;
        } else {
            return true;
        }
    }

    return roquestAnim(drawSlideAF);
}
var CCMove = (function(){



    function halfDiff(a, b){
        return (a - b)/2;
    }

    
    function crossfadePanels(data, cnv, ctx, cb){
        new Crossfader(cnv, data[0], data[1]).start(cb);
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