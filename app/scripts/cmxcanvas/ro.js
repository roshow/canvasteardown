/*globals */
/*exported */
'use strict';

var ro = (function(){

    var _ro = {};

    function multiLog(messages){
        for (var i = 0, len = messages.length; i < len; i++){
            console.log(messages[i]);
        }
    }

    _ro.log = multiLog;

}());