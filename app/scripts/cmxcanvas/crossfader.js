/*global Int16Array, roquestAnim */
/*exported Crossfader, Q*/

'use strict';

function Crossfader(canvas, image1, image2) {

    var context = canvas.getContext('2d'),
        width = canvas.width,
        height = canvas.height,
        len = 4 * width * height,
        result = context.createImageData(width, height),
        offset = new Array(len),
        delta = new Array(len),
        frames = 0;

    /** @roshow: Center images on canvas when drawing them. And ALWAYS use data for image1 **/
    var image2X = (width - image2.width)/2,
        image2Y = (height - image2.height)/2;

    function init() {
        var i, source, target;
        
        canvas.style.opacity = 0;

        /** @roshow: added the canvas clearing, so we get 2 distinct images even if they're not 
          the same size. Swapped order so first image is last one loaded. **/
        context.fillRect(0, 0, width, height);
        context.drawImage(image2, image2X, image2Y);
        target = context.getImageData(0, 0, width, height);
        context.fillRect(0, 0, width, height);
        context.putImageData (image1, 0, 0);

        source = image1;
        // }

        result = context.createImageData(width, height);
        for (i = 0; i < len; i += 1) {
            offset[i] = target.data[i];
            delta[i] = source.data[i] - target.data[i];
            result.data[i] = 255;
        }

        canvas.style.opacity = 1;
    }

    function tween(factor) {
        var i, r;
        r = result.data;
        for (i = 0; i < len; i++) {
            r[i] = offset[i] + delta[i] * factor;
        }
        context.putImageData(result, 0, 0);
        frames += 1;
    }

    function start(){
        var lenAnim = 300,
            distancePerLenAnim = Math.PI/(2*lenAnim);

        return roquestAnim(function(timePassed){
            tween(Math.sin(timePassed*distancePerLenAnim + Math.PI/2));
        }, lenAnim);
    }

    if (typeof Int16Array !== 'undefined') {
        offset = new Int16Array(len);
        delta = new Int16Array(len);
    }

    init();

    return start();
}

/*
  This file is part of the Ofi Labs X2 project.

  Copyright (C) 2011 Ariya Hidayat <ariya.hidayat@gmail.com>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of the <organization> nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/