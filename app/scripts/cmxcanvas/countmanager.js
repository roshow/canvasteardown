var CountManager = (function(){
    function CountManager(data, offset){
        var _curr = offset || 0,
            _length = (data && data.length) ? data.length : 0,
            _next = (_length > _curr + 1) ? _curr + 1 : false;

        var counter = (!_length) ?
            {
                curr: false,
                isLast: true
            } :
            {
                data: data,
                last: _length,
                curr: _curr,
                next: _next,
                prev: false,
                isLast: false,
                isFirst: true,
                onchange: function(){ return this; },
                loadNext: function() {
                    if (this.isLast) return false;
                    else {
                        this.prev = this.curr;
                        this.curr = this.next;
                        this.next = (this.curr + 1 < this.last) ? this.curr + 1 : false;
                        this.isLast = this.next ? false : true;
                        this.isFirst = false;
                        this.onchange(1);
                        return this;
                    }
                },
                loadPrev: function() {
                    if (this.isFirst) return false;
                    else {
                        this.next = this.curr;
                        this.curr = this.prev;
                        this.prev = (this.curr - 1 >= 0) ? this.curr - 1 : false;
                        this.isFirst = (this.curr === 0) ? true : false;
                        this.isLast = false;
                        this.onchange(-1);
                        return this;
                    }
                },
                goTo: function(x) {
                    if(x < this.last && x >= 0) {
                        this.curr = x;
                        this.next = (this.curr + 1 < this.last) ? this.curr + 1 : false;
                        this.isLast = this.next ? false : true;
                        this.prev = (this.curr - 1 >= 0) ? this.curr - 1 : false;
                        this.isFirst = this.prev ? false : true;
                        this.onchange();
                        return this.curr;
                    }
                },
                getData: function(x){
                    switch(x) {
                        case -1:
                           return this.data[this.prev] || null;
                        case 1:
                            return this.data[this.next] || null;
                        case 0:
                        default:
                            return this.data[this.curr] || null;
                    }
                },

                getCurr: function(min, max){
                    var that = this;
                    var _curr = this.curr;
                    var _last = this.last;
                    if (!min && !max) {
                        return _curr;
                    }
                    else {
                        var arr = [];
                        var obj = [];
                        var L = (max - min) + 1;
                        var D = min;
                        for (var i = 0; i < L; i++) {
                            var k = _curr + D + i;
                            if (k >= 0 && k < _last) {
                                arr.push(k);
                            }
                        }
                        return arr;
                    }
                },
                getDataSet: function(min, max){
                    var that = this;
                    var _curr = this.curr;
                    var _last = this.last;
                    if (!min && !max) {
                        return _curr;
                    }
                    else {
                        var arr = [];
                        var obj = [];
                        var L = (max - min) + 1;
                        var D = min;
                        for (var i = 0; i < L; i++) {
                            var k = _curr + D + i;
                            if (k >= 0 && k < _last) {
                                obj[k] = that.data[k];
                            }
                        }
                        return obj;
                        // return obj;
                    }
                }
            };
        return counter;
    }
    return CountManager;
}());