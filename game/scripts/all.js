(function (global) {
	var mapping = {}, cache = {};
	global.startModule = function(m){
		require(m).start();
	};
	global.define = function(id, func){
		mapping[id] = func;
	};
	global.require = function(id){
		if(!/\.js$/.test(id))
			id += '.js';
		if(cache[id]){
			console.log('djkf');
			return cache[id];
		}else{
			console.log
			return cache[id] = mapping[id]({});
		}
	};
}(this));
define('scripts/main.js', function(exports){
	var timeline = require('scripts/timeline');


	exports.start = function(){
		alert('hhhh');
	};
	return exports;
});

define('scripts/lib.ucren.js', function(exports){
	var Ucren;
	
	var blankArray = [];
	var slice = blankArray.slice;
	var join = blankArray.join;
});
startModule("scripts/main");