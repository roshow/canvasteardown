'use strict';
/*globals CCMove, CCLoader, CountManager*/

var CmxCanvas = function(){
	var canvas, context, panelCounter, popupCounter,
        _animating = false,
        _loadingHold = false,
        loadedPanels = {
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
            img: loadedPanels[panelCounter.curr].popups[popupCounter.curr],
            x: popup.x || 0,
            y: popup.y || 0,
            transition: popup.transition || 'scaleIn'
        }, canvas, context);
        _animating = false;
    }

	/** The Main Event **/
	var cmxcanvas = {};
	cmxcanvas.goToNext = function(){
        if (!loadedPanels[panelCounter.curr]) {
            _loadingHold = true;
        }
		if (!_animating && !_loadingHold){
            if (!popupCounter.isLast) {
				popupCounter.loadNext();
				popPopup(popupCounter.getData());
			}
			else if (!panelCounter.isLast) {
                panelCounter.loadNext();
                var _target = (loadedPanels[panelCounter.curr] && loadedPanels[panelCounter.curr].img) ? loadedPanels[panelCounter.curr].img : loadedPanels.loading.img;
                movePanels({
                    image1: loadedPanels[panelCounter.prev].img,
                    image2: _target,
                    direction: 1,
                    transition: panelCounter.getData().transition,
                    curr: panelCounter.curr
                });
			}
            return [panelCounter, popupCounter];
		}
        else {
            // console.log('cannot move');
            return false;
        }
	};
	cmxcanvas.goToPrev = function(){
		if(!_animating) {
            if (!panelCounter.isFirst) {
                panelCounter.loadPrev();
                movePanels({
                    image1: loadedPanels[panelCounter.next].img,
                    image2: loadedPanels[panelCounter.curr].img,
                    direction: -1,
                    transition: panelCounter.getData().transition,
                    curr: panelCounter.curr
                });
            }
			else {
				this.goToPanel(0);
			}
            return [panelCounter, popupCounter];
		}
        else {
            return false;
        }
	};
	cmxcanvas.goToPanel = function(panel){
        if (!_animating) {
            panelCounter.goTo(panel);
            var _image = loadedPanels[panelCounter.curr].img || loadedPanels.loading.img;
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
        context.drawImage(loadedPanels.loading.img, halfDiff(canvas.width, loadedPanels.loading.img.width), halfDiff(canvas.height, loadedPanels.loading.img.height));

        /** Overriding panelCounter after this point will BREAK EVERYTHING. **/
        panelCounter = new CountManager(data.cmxJSON);
        panelCounter.onchange = function(){
            popupCounter = new CountManager(panelCounter.getData().popups, -1);
            var dataset = panelCounter.getDataSet(-2, 2);
            var panelsToKeep = {};
            panelsToKeep.loading = loadedPanels.loading;
            for (var key in dataset) {
                if(loadedPanels[key]){
                    delete dataset[key];
                }
                else {
                    loadedPanels[key] = 'loading';
                }
                panelsToKeep[key] = loadedPanels[key];
            }
            loadedPanels = panelsToKeep;
            panelsToKeep = null;
            CCLoader.batchPanels(dataset).then(function(panels){
                for (var i = 0, len = panels.length; i < len; i++){
                    var panel = panels[i].shift();
                    loadedPanels[panel.panel] = {
                        img: panel,
                        id: panel.panel.toString,
                        popups: panels[i]
                    };
                    if (panel.panel === panelCounter.curr){
                        context.clearRect(0, 0, canvas.width, canvas.height);
                        context.drawImage(panel, halfDiff(canvas.width, panel.width), halfDiff(canvas.height, panel.height));
                    }
                }
                _loadingHold = false;
            });
        };
        panelCounter.onchange();

        /* warm up the local browser's cache */
        CCLoader.batchPanels(panelCounter.data.slice(2));
	}

    // return load;
    cmxcanvas.load = load;
    return cmxcanvas;
};