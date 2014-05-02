'use strict';
/*globals Crossfader*/

var CCMove = (function(){

    function bounce(data, cnv, ctx){

        ctx.fillRect(0, 0, cnv.width, cnv.height);
        ctx.drawImage(data[1], (cnv.width-data[1].width)/2, (cnv.height-data[1].height)/2);
        data[1] = ctx.getImageData(0, 0, cnv.width, cnv.height);
        ctx.fillRect(0, 0, cnv.width, cnv.height);
        ctx.putImageData (data[0], 0, 0);

        var lenAnim = 300,
            distance = cnv.width,
            distancePerLenAnim = Math.PI/(2*lenAnim);

        return roquestAnim(function(timePassed, startTime){
            //some ideas for bounceback: offset the hook with a larger distance. Some perfect ratio?
            var bouncedistance = cnv.width*(6/5);
            //some ideas for bounceback: PI*3/2 and so on to get a hook.
            var sinPart = Math.sin(timePassed*distancePerLenAnim*(4/3));
            // var sinPart = Math.sin(timePassed*distancePerLenAnim);
            var deltaX =  sinPart < 0 ? 0 : sinPart * bouncedistance;
            
            ctx.clearRect(0,0,800,450);
            ctx.putImageData(data[0], 0 - deltaX, 0);
            ctx.putImageData(data[1], 800 - deltaX, 0);
        }, lenAnim).then(function(){
            ctx.clearRect(0,0,800,450);
            ctx.putImageData(data[1],0, 0);
        });
    }
    function slide(data, cnv, ctx){

        ctx.fillRect(0, 0, cnv.width, cnv.height);
        ctx.drawImage(data[1], (cnv.width-data[1].width)/2, (cnv.height-data[1].height)/2);
        data[1] = ctx.getImageData(0, 0, cnv.width, cnv.height);
        ctx.fillRect(0, 0, cnv.width, cnv.height);
        ctx.putImageData (data[0], 0, 0);

        var lenAnim = 300,
            distance = cnv.width,
            distancePerLenAnim = Math.PI/(2*lenAnim);

        return roquestAnim(function(startTime){
            var timePassed = (performance.now() - startTime);
            var sinPart = Math.sin(timePassed*distancePerLenAnim);
            var deltaX =  sinPart < 0 ? 0 : sinPart * distance;
            
            ctx.clearRect(0,0,800,450);
            ctx.putImageData(data[0], 0 - deltaX, 0);
            ctx.putImageData(data[1], 800 - deltaX, 0);
            if (timePassed >= lenAnim){
                return false;
            } else {
                return true;
            }
        });
    }
    function crossfadePanels(data, cnv, ctx){
        return Crossfader(cnv, data[0], data[1]);
    }

    function animatePopUp(popup, cnv, ctx){
        var deferred = Q.defer();
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
                    deferred.resolve();
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
                    deferred.resolve();
                    clearInterval(_scaleIn);
                }
            }, _int);
            break;
        }

        return deferred.promise;
    }

    return {
        panelFunctions: {
            crossfade: crossfadePanels,
            jumpcut: crossfadePanels,
            bounce: bounce,
            bounceback: bounce,
            slide: slide
        },
        panels: function(data, cnv, ctx){
            var that = this;
            /** Override image1 with data from the current state of the canvas. **/
            var imgZero = ctx.getImageData(0, 0, cnv.width, cnv.height);
            /** set transition **/
            var transition = data.transition && that.panelFunctions[data.transition]? data.transition
                : 'bounce';
            return that.panelFunctions[transition]([imgZero, data.img], cnv, ctx);
        },
        popup: animatePopUp
    };
}());

console.log('animation startTime');