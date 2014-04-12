var CmxCanvas = (function(){

	var _cnv, _ctx, _panelCounter, _popupCounter,
        _animating = false,
        _loadingHold = false,
        _loadedPanels = {
            loading: (function(){
                var img = new Image();
                img.crossOrigin = "Anonymous";
                img.src = "http://roshow.net/public/images/cmxcanvas/sov01/loading.jpg";
                return { img: img };
            }())
        };

    function halfDiff(a, b) {
        return (a - b)/2;
    }

    function movePanels(data) {
        _animating = true;
        CCMove.panels(data, _cnv, _ctx).start(function(){
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
        }, _cnv, _ctx);
        _animating = false;
    }

	/** The Main Event **/
	var cmxcanvas = {
		goToNext: function() {
            if (!_loadedPanels[_panelCounter.curr]) {
                _loadingHold = true;
            }
			if(!_animating && !_loadingHold) {
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
                console.log("cannot move");
                return false;
            }
		},
		goToPrev: function() {
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
		},
		goToPanel: function(panel) {
            if (!_animating) {
                _panelCounter.goTo(panel);
                var _image = _loadedPanels[_panelCounter.curr].img || _loadedPanels.loading.img;
                _ctx.clearRect(0, 0, _cnv.width, _cnv.height);
                _ctx.drawImage(_image, halfDiff(_cnv.width, _image.width), halfDiff(_cnv.height, _image.height));
            }
		}
	};

	function __init(data, cnvId) {
		/** Get Canvases and Contexts **/
		_cnv = document.getElementById(cnvId);
		_ctx = _cnv.getContext('2d');

        /** Loading placeholder **/
        _ctx.clearRect(0, 0, _cnv.width, _cnv.height);
        _ctx.drawImage(_loadedPanels.loading.img, halfDiff(_cnv.width, _loadedPanels.loading.img.width), halfDiff(_cnv.height, _loadedPanels.loading.img.height));

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
                } else {
                     _loadedPanels[key] = 'loading';
                 }
                panelsToKeep[key] = _loadedPanels[key];
            }
            _loadedPanels = panelsToKeep;
            panelsToKeep = null;
            CCLoader.batch(dataset, function(imgs){
                for (key in imgs) {
                    _loadedPanels[key] = imgs[key];
                    if (parseInt(key, 10) === _panelCounter.curr) {
                        _ctx.clearRect(0, 0, _cnv.width, _cnv.height);
                        _ctx.drawImage(_loadedPanels[key].img, halfDiff(_cnv.width, _loadedPanels[key].img.width), halfDiff(_cnv.height, _loadedPanels[key].img.height));
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
		return cmxcanvas;
	}

    return __init;
}());