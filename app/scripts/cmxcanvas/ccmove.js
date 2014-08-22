/*globals roquestAnim, Crossfader*/
/*exported CCMove*/
'use strict';

function CCMove(context, canvas, defaults){

    var ctx = context,
        cnv = canvas;
    defaults = defaults || {};
    defaults.transition = defaults.transition || 'defaultAnim';

    function bounce(data, options){

        var back = options.reverse ;

        ctx.fillRect(0, 0, cnv.width, cnv.height);
        ctx.drawImage(data[1], (cnv.width-data[1].width)/2, (cnv.height-data[1].height)/2);
        data[1] = ctx.getImageData(0, 0, cnv.width, cnv.height);
        ctx.fillRect(0, 0, cnv.width, cnv.height);
        ctx.putImageData (data[0], 0, 0);

        var lenAnim = 400,
            distancePerLenAnim = Math.PI/(2*lenAnim);

        return roquestAnim(function(timePassed){
            //some ideas for bounceback: offset the hook with a larger distance. Some perfect ratio?
            var bouncedistance = cnv.width*(6/5);
            //some ideas for bounceback: PI*3/2 and so on to get a hook.
            var sinPart = Math.sin(timePassed*distancePerLenAnim*(4/3));
            var deltaX =  sinPart < 0 ? 0 : sinPart * bouncedistance;
            
            ctx.clearRect(0,0,cnv.width, cnv.height);
            ctx.putImageData(data[0], 0 - deltaX*back, 0);
            ctx.putImageData(data[1], (cnv.width - deltaX)*back, 0);

        }, lenAnim).then(function(){
            ctx.putImageData(data[1], 0, 0);
        });
    }
    function slide(data, options){

        var back = options.reverse;
        ctx.fillRect(0, 0, cnv.width, cnv.height);
        ctx.drawImage(data[1], (cnv.width-data[1].width)/2, (cnv.height-data[1].height)/2);
        data[1] = ctx.getImageData(0, 0, cnv.width, cnv.height);
        ctx.fillRect(0, 0, cnv.width, cnv.height);
        ctx.putImageData (data[0], 0, 0);

        var lenAnim = 200,
            distance = cnv.width,
            distancePerLenAnim = (Math.PI/2)/lenAnim;

        return roquestAnim(function(timePassed){
            var sinPart = Math.sin(timePassed*distancePerLenAnim);
            var deltaX =  sinPart * distance;

            if (options.fade){
                for ( var i = 0, len = data[0].data.length; i < len; i+= 4 ){
                    data[0].data[i+3] = 255*(1 - sinPart);
                    data[1].data[i+3] = 255*sinPart;
                }
            }

            ctx.clearRect(0,0,cnv.width, cnv.height);
            ctx.putImageData(data[0], back*(0 - deltaX), 0);
            ctx.putImageData(data[1], back*(cnv.width - deltaX), 0);

        }, lenAnim);
    }
    function crossfadePanels(data){
        return new Crossfader(cnv, data[0], data[1]);
    }

    function animatePopUp(popup){
        var lenAnim = 1000;
        popup.x = popup.x || 0;
        popup.y = popup.y || 0;
        var _bkgPartial = ctx.getImageData(popup.x, popup.y, popup.img.width, popup.img.height);

        switch (popup.transition || 'scaleIn') {

        case 'fadeIn':
            lenAnim = 200;
            ctx.globalAlpha = 0;
            return  roquestAnim(function(timePassed){
                var sinPart = Math.sin(timePassed*(Math.PI/2)/lenAnim);
                ctx.globalAlpha = sinPart;

                ctx.clearRect(popup.x, popup.y, popup.img.width, popup.img.height);
                ctx.putImageData(_bkgPartial, popup.x, popup.y);
                ctx.drawImage(popup.img, popup.x, popup.y);

            }, lenAnim).then(function(){

            });

        case 'scaleIn':
            lenAnim = 100;
            return  roquestAnim(function(timePassed){
                var sinPart = Math.sin(timePassed*(Math.PI/2)/lenAnim),
                    scaledW = popup.img.width*sinPart,
                    scaledH = popup.img.height*sinPart,
                    dX = popup.x + ((popup.img.width - scaledW)/2),
                    dY = popup.y + ((popup.img.height - scaledH)/2);

                ctx.clearRect(popup.x, popup.y, popup.img.width, popup.img.height);
                ctx.putImageData(_bkgPartial, popup.x, popup.y);
                ctx.drawImage(popup.img, dX, dY, scaledW, scaledH);
            }, lenAnim);
        }
    }

    var _panelFunctions = {
        crossfade: crossfadePanels,
        jumpcut: crossfadePanels,
        bounce: bounce,
        bounceback: bounce,
        slideAndFade: function(data, options){
            options.fade = true;
            return slide(data, options);
        },
        slide: slide,
        defaultAnim: function(){
            return this.bounceback.apply(this, arguments);
        }
    };

    function addPanelAnim(key, func){
        _panelFunctions[key] = func;
        console.log(_panelFunctions);
    };

    var move = {
        addPanelAnim: addPanelAnim,
        panels: function(imgs, options){
            imgs = Array.isArray(imgs) ? imgs : [null, imgs];
            imgs[0] = imgs[0] || ctx.getImageData(0, 0, cnv.width, cnv.height);
            
            options = options || {};
            if (options.reverse){
                options.reverse = -1;
            }
            else {
                options.reverse = 1;
            }
            options.transition = options.transition && _panelFunctions[options.transition] ? options.transition : defaults.transition;
            // var transition = options.transition && _panelFunctions[options.transition] ? options.transition : defaults.transition;
            return _panelFunctions[options.transition](imgs, options);
        },
        popup: animatePopUp
    };

    return move;
};