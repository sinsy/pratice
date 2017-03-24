var Tween= {
    Linear: {
        easeIn: function (t, b, c, d) {
            return c * t / d + b;
        }
    }, Quad: {
        easeIn: function (t, b, c, d) {
            return c * (t /= d) * t + b;
        }, easeOut: function (t, b, c, d) {
            return -c * (t /= d) * (t - 2) + b;
        }, easeInOut: function (t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t + b;
            return -c / 2 * ((--t) * (t - 2) - 1) + b;
        }
    }, Cubic: {
        easeIn: function (t, b, c, d) {
            return c * (t /= d) * t * t + b;
        }, easeOut: function (t, b, c, d) {
            return c * ((t = t / d - 1) * t * t + 1) + b;
        }, easeInOut: function (t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
            return c / 2 * ((t -= 2) * t * t + 2) + b;
        }
    }, Quart: {
        easeIn: function (t, b, c, d) {
            return c * (t /= d) * t * t * t + b;
        }, easeOut: function (t, b, c, d) {
            return -c * ((t = t / d - 1) * t * t * t - 1) + b;
        }, easeInOut: function (t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
            return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
        }
    }, Quint: {
        easeIn: function (t, b, c, d) {
            return c * (t /= d) * t * t * t * t + b;
        }, easeOut: function (t, b, c, d) {
            return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
        }, easeInOut: function (t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
            return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
        }
    }, Sine: {
        easeIn: function (t, b, c, d) {
            return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
        }, easeOut: function (t, b, c, d) {
            return c * Math.sin(t / d * (Math.PI / 2)) + b;
        }, easeInOut: function (t, b, c, d) {
            return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
        }
    }, Expo: {
        easeIn: function (t, b, c, d) {
            return (t == 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
        }, easeOut: function (t, b, c, d) {
            return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
        }, easeInOut: function (t, b, c, d) {
            if (t == 0) return b;
            if (t == d) return b + c;
            if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
            return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
        }
    }, Circ: {
        easeIn: function (t, b, c, d) {
            return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
        }, easeOut: function (t, b, c, d) {
            return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
        }, easeInOut: function (t, b, c, d) {
            if ((t /= d / 2) < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
            return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
        }
    }, Elastic: {
        easeIn: function (t, b, c, d, a, p) {
            if (t == 0) return b;
            if ((t /= d) == 1) return b + c;
            if (!p) p = d * .3;
            if (!a || a < Math.abs(c)) {
                a = c;
                var s = p / 4;
            } else var s = p / (2 * Math.PI) * Math.asin(c / a);
            return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
        }, easeOut: function (t, b, c, d, a, p) {
            if (t == 0) return b;
            if ((t /= d) == 1) return b + c;
            if (!p) p = d * .3;
            if (!a || a < Math.abs(c)) {
                a = c;
                var s = p / 4;
            } else var s = p / (2 * Math.PI) * Math.asin(c / a);
            return (a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b);
        }, easeInOut: function (t, b, c, d, a, p) {
            if (t == 0) return b;
            if ((t /= d / 2) == 2) return b + c;
            if (!p) p = d * (.3 * 1.5);
            if (!a || a < Math.abs(c)) {
                a = c;
                var s = p / 4;
            } else var s = p / (2 * Math.PI) * Math.asin(c / a);
            if (t < 1) return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
            return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b;
        }
    }, Back: {
        easeIn: function (t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            return c * (t /= d) * t * ((s + 1) * t - s) + b;
        }, easeOut: function (t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
        }, easeInOut: function (t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
            return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
        }
    }, Bounce: {
        easeIn: function (t, b, c, d) {
            return c - Tween.Bounce.easeOut(d - t, 0, c, d) + b;
        }, easeOut: function (t, b, c, d) {
            if ((t /= d) < (1 / 2.75)) {
                return c * (7.5625 * t * t) + b;
            } else if (t < (2 / 2.75)) {
                return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
            } else if (t < (2.5 / 2.75)) {
                return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
            } else {
                return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
            }
        }, easeInOut: function (t, b, c, d) {
            if (t < d / 2) return Tween.Bounce.easeIn(t * 2, 0, c, d) * .5 + b; else return Tween.Bounce.easeOut(t * 2 - d, 0, c, d) * .5 + c * .5 + b;
        }
    }
};

var viewSize = (function(){

    var pageWidth = window.innerWidth,
        pageHeight = window.innerHeight;

    if (typeof pageWidth != 'number') {
        if (document.compatMode == 'CSS1Compat') {
            pageHeight = document.documentElement.clientHeight;
            pageWidth = document.documentElement.clientWidth;
        } else {
            pageHeight = document.body.clientHeight;
            pageWidth = document.body.clientWidth;
        }
    };
    if(pageWidth >= pageHeight){
        pageWidth = pageHeight * 360 / 640;
    }
    // pageWidth = pageWidth >  414 ? 414 : pageWidth;
    // pageHeight = pageHeight > 736 ? 736 : pageHeight;

    return {
        width: pageWidth,
        height: pageHeight
    };

})();

var GM = {
	w: viewSize.width,
	h: viewSize.height,
	ctx: null,
	canvas: null,
	timer: null,
	init: function() {
		var _this = this;
		_this.canvas = document.getElementById('game');
		_this.canvas.width = _this.w;
		_this.canvas.height = _this.h;
		_this.ctx = _this.canvas.getContext('2d');
		_this.image = new Image();
		_this.food = new Food();
		_this.image.onload = function(){
			_this.run();
		}
		_this.image.src = 'static/food1.png';
	},
	run: function(){
		var _this = GM;
		_this.ctx.clearRect(0,0,_this.w,_this.h);
		// _this.food.cx = Math.ceil(Tween.Linear.easeIn(_this.food.time, 0, 100, 200));
		_this.food.scale =  Tween.Linear.easeIn(_this.food.time, .5, 2, 200);
		if(_this.food.time>200){
			_this.food.time=0;
			// cancelAnimationFrame(_this.timer);

		}else{

		}
			_this.food.draw();
			_this.timer = requestAnimationFrame(_this.run);
	}
}
function Food(){
	this.ow = 50;
	this.oh = 50;
	this.w = 50;
	this.h = 50;
	this.cx = viewSize.width/2;
	this.cy = viewSize.height/2;
	this.x = this.cx-this.w/2;
	this.y =  this.cy-this.h/2;
	this.scale = 1;
	this.arrList = [];
	this.time = 0;
}
Food.prototype.draw = function() {
	if(this.scale!=1){
		this.w = this.ow*this.scale;
		this.h = this.oh*this.scale;
	}
	this.x = this.cx - this.w/2;
	this.y = this.cy - this.w/2;
	GM.ctx.drawImage(GM.image,this.x, this.y, this.w, this.h);
	this.time++;
};
GM.init();