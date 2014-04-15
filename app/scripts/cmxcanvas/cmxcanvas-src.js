'use strict';
/*globals CCMove, CCLoader, CountManager*/

var CmxCanvas = function(){
	var canvas, context, _panelCounter, _popupCounter,
        _animating = false,
        _loadingHold = false,
        _loadedPanels = {
            loading: (function(){
                var img = new Image();
                img.crossOrigin = 'Anonymous';
                img.src = 'http://roshow.net/public/images/cmxcanvas/sov01/loading.jpg';
                return { img: img };
            }())
        };

    function halfDiff(a, b) {
        return (a - b)/2;
    }

    function movePanels(data) {
        _animating = true;
        CCMove.panels(data, canvas, context).start(function(){
            _animating = false;
        });
    }
    function popPopup(popup) {
        _animating = true;
        CCMove.popup({
            img: _loadedPanels[_panelCounter.curr].popups[_popupCounter.curr],
            x: popup.x || 0,
            y: popup.y || 0,
            transition: popup.transition || 'scaleIn'
        }, canvas, context);
        _animating = false;
    }

	/** The Main Event **/
	var cmxcanvas = {};
	cmxcanvas.goToNext = function(){
        if (!_loadedPanels[_panelCounter.curr]) {
            _loadingHold = true;
        }
		if (!_animating && !_loadingHold){
            if (!_popupCounter.isLast) {
				_popupCounter.loadNext();
				popPopup(_popupCounter.getData());
			}
			else if (!_panelCounter.isLast) {
                _panelCounter.loadNext();
                var _target = (_loadedPanels[_panelCounter.curr] && _loadedPanels[_panelCounter.curr].img) ? _loadedPanels[_panelCounter.curr].img : _loadedPanels.loading.img;
                movePanels({
                    image1: _loadedPanels[_panelCounter.prev].img,
                    image2: _target,
                    direction: 1,
                    transition: _panelCounter.getData().transition,
                    curr: _panelCounter.curr
                });
			}
            return [_panelCounter, _popupCounter];
		}
        else {
            console.log('cannot move');
            return false;
        }
	};
	cmxcanvas.goToPrev = function(){
		if(!_animating) {
            if (!_panelCounter.isFirst) {
                _panelCounter.loadPrev();
                movePanels({
                    image1: _loadedPanels[_panelCounter.next].img,
                    image2: _loadedPanels[_panelCounter.curr].img,
                    direction: -1,
                    transition: _panelCounter.getData().transition,
                    curr: _panelCounter.curr
                });
            }
			else {
				this.goToPanel(0);
			}
            return [_panelCounter, _popupCounter];
		}
        else {
            return false;
        }
	};
	cmxcanvas.goToPanel = function(panel){
        if (!_animating) {
            _panelCounter.goTo(panel);
            var _image = _loadedPanels[_panelCounter.curr].img || _loadedPanels.loading.img;
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(_image, halfDiff(canvas.width, _image.width), halfDiff(canvas.height, _image.height));
        }
	};

	function load(data, cnvId){
		/** Get Canvases and Contexts **/
		canvas = document.getElementById(cnvId);
		context = canvas.getContext('2d');

        /** Loading placeholder **/
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(_loadedPanels.loading.img, halfDiff(canvas.width, _loadedPanels.loading.img.width), halfDiff(canvas.height, _loadedPanels.loading.img.height));

        /** Overriding _panelCounter after this point will BREAK EVERYTHING. **/
        _panelCounter = new CountManager(data.cmxJSON);
        _panelCounter.onchange = function(){
            _popupCounter = new CountManager(_panelCounter.getData().popups, -1);
            var dataset = _panelCounter.getDataSet(-2, 2);
            var panelsToKeep = {};
            panelsToKeep.loading = _loadedPanels.loading;
            for (var key in dataset) {
                if(_loadedPanels[key]){
                    delete dataset[key];
                }
                else {
                    _loadedPanels[key] = 'loading';
                }
                panelsToKeep[key] = _loadedPanels[key];
            }
            _loadedPanels = panelsToKeep;
            panelsToKeep = null;
            CCLoader.batch(dataset, function(imgs){
                for (var key in imgs) {
                    _loadedPanels[key] = imgs[key];
                    if (parseInt(key, 10) === _panelCounter.curr) {
                        context.clearRect(0, 0, canvas.width, canvas.height);
                        context.drawImage(_loadedPanels[key].img, halfDiff(canvas.width, _loadedPanels[key].img.width), halfDiff(canvas.height, _loadedPanels[key].img.height));
                    }
                }
                // console.log(_loadedPanels);
                _loadingHold = false;
            });
        };
        _panelCounter.onchange();

        /* warm up the local browser's cache */
        var start = new Date();
        CCLoader.throttledBatch(_panelCounter.data.slice(2), start);
		// return cmxcanvas;
        CCLoader.throttlePanels(_panelCounter.data.slice(0, 10)).then(function(panels){
            console.log(panels);
        });
	}

    // return load;
    cmxcanvas.load = load;
    return cmxcanvas;
};