// (function() {
//     var lastTime = 0;
//     var vendors = ['ms', 'moz', 'webkit', 'o'];
//     for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
//         window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
//         window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
//     }
//     if (!window.requestAnimationFrame) window.requestAnimationFrame = function(callback, element) {
//         var currTime = new Date().getTime();
//         var timeToCall = Math.max(0, 16 - (currTime - lastTime));
//         var id = window.setTimeout(function() {
//             callback(currTime + timeToCall);
//         }, timeToCall);
//         lastTime = currTime + timeToCall;
//         return id;
//     };
//     if (!window.cancelAnimationFrame) window.cancelAnimationFrame = function(id) {
//         clearTimeout(id);
//     };
// }());
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
function Ship(ctx){
	gameMonitor.im.loadImage(['static/img/player.png', 'static/img/food1.png', 'static/img/food2.png']);
	this.width = 80;
	this.height = 80;
	this.left = gameMonitor.w/2 - this.width/2;
	this.top = gameMonitor.h - 2*this.height;
	this.player = gameMonitor.im.createImage('static/img/player.png');

	this.paint = function(){
		ctx.drawImage(this.player,this.left, this.top, this.width, this.height);
	}
	this.setPosition = function(event){
		if(gameMonitor.isMobile()){
			var tarL = event.changedTouches[0].clientX;
			var tarT = event.changedTouches[0].clientY;
		}else{
			var tarL = event.offsetX;
			var tarT = event.offsetY;
		}
		this.left = tarL - this.width/2 - 16;
		this.top = tarT - this.height/2;
		if(this.left<0){
			this.left = 0;
		}
		if(this.left>gameMonitor.w-this.width){
			this.left = gameMonitor.w-this.width;
		}
		if(this.top<0){
			this.top = 0;
		}
		if(this.top>gameMonitor.h - this.height){
			this.top = gameMonitor.h - this.height;
		}
		this.paint();
	}
	this.controll = function(){
		var _this = this;
		var stage = $('#gamepanel');
		var currentX = this.left,
			currentY = this.top,
			move = false;
		stage.on(gameMonitor.eventType.start, function(event){
			if(gameMonitor.gameover)return;
			_this.setPosition(event);
			move = true;
		}).on(gameMonitor.eventType.end, function(){
			move = false;
		}).on(gameMonitor.eventType.move, function(event){
			event.preventDefault();
			if(gameMonitor.gameover)return;
			if(move){
				_this.setPosition(event);	
			}
			
		});		
	}
	this.eat = function(foodlist){
		for(var i=foodlist.length-1; i>=0; i--){
			var f = foodlist[i];
			if(f){
				var l1 = this.top + this.height/2 - (f.top+f.height/2);
				var l2 = this.left+this.width/2 - (f.left+f.width/2);
				var l3 = Math.sqrt(l1*l1 + l2*l2);//勾股定理
				if(l3<=this.height/2+f.height/2){
					foodlist[f.id] = null;
					if(f.type == 0){
						gameMonitor.stop();
						$('#gameoverPanel').show();

						setTimeout(function(){
							$('#gameoverPanel').hide();
							$('#resultPanel').show();
							gameMonitor.getScore();
						}, 2000);
					}else{
						$('.heart').removeClass('hearthot').addClass('hearthot');
						$('#score').html(++gameMonitor.score);
						setTimeout(function() {
							$('.heart').removeClass('hearthot')
						}, 200);
					}
				}
			}
		}
	}
}


function Food(type, left, id){
	this.speedUpTime = 300;
	this.id = id;
	this.type = type;
	this.width = 50;
	this.height = 50;
	this.left = left;
	this.top = -50;
	this.speed = 0.04*Math.pow(1.2, Math.floor(gameMonitor.time/this.speedUpTime));
	this.loop = 0;
	this.time = 0;
	var p = this.type == 0 ? 'static/img/food1.png' : 'static/img/food2.png';
	this.pic = gameMonitor.im.createImage(p);
}
Food.prototype.paint = function(ctx) {
	ctx.drawImage(this.pic, this.left, this.top, this.width, this.height);
}
Food.prototype.move = function(ctx) {
	if(gameMonitor.time % this.speedUpTime == 0){
		this.speed *= 1.2;
	}
	this.top += ++this.loop * this.speed;
	this.top = Math.ceil(Tween.Linear.easeIn(this.time, 0, gameMonitor.h, gameMonitor.durationTime));
	this.time ++;
	if(this.top > gameMonitor.h){
		gameMonitor.foodList[this.id] = null;
	}else{
		this.paint(ctx);
	}
};

//图片加载器
function ImageMonitor() {
	var imgArray = [];
	return {
		createImage: function(src){
			return typeof imgArray[src] != 'undefined' ? imgArray[src] : (imgArray[src] = new Image(), imgArray[src].src = src, imgArray[src]);
		},
		loadImage : function(arr, callback){
			for(var i=0,l=arr.length; i<l; i++){
				var img = arr[i];
				imgArray[img] = new Image();
				imgArray[img].onload = function(){
					if(i==l-1 && typeof callback == 'function'){
						callback();
					}
				}
				imgArray[img].src = img;
			}
		}
	}
}
var gameMonitor = {
	w : viewSize.width,
	h : viewSize.height,
	bgWidth : viewSize.width,
	bgHeight : viewSize.height*2,
	bgTime : 0,
	time : 0,
	timmer : null,
	bgSpeed : 2,
	bgloop : 0,
	bgDistance:0,//背景位置
	score:0,
	im : new ImageMonitor(),
	gameover : false,
	durationTime: 200,
	foodList : [],
	eventType : {
		start : 'touchstart',
		move : 'touchmove',
		end : 'touchend'
	},
	init : function(){
		var _this = this;
		var canvas = document.getElementById('stage');
		canvas.width = _this.w;
		canvas.height = _this.h;
		var ctx = canvas.getContext('2d');
		//绘制背景
		var bg = new Image();
		_this.bg = bg;
		bg.onload = function(){
			ctx.drawImage(bg, 0,0,_this.bgWidth, _this.bgHeight);
		}
		bg.src = 'static/img/bg.jpg';

		_this.initListener(ctx);
	},
	initListener : function(ctx){
		var _this = this;
		var body = $(document.body);
		$(document).on(gameMonitor.eventType.move, function(event){
			event.preventDefault();
		});
		body.on(gameMonitor.eventType.start, '#guidePanel', function(){
			$(this).hide();
			_this.ship = new Ship(ctx);
			_this.ship.paint();
      		_this.ship.controll();

			gameMonitor.run(ctx);
		});
		body.on(gameMonitor.eventType.start, '.replay, .playagain', function(){
			$('#resultPanel').hide();
			var canvas = document.getElementById('stage');
			var ctx = canvas.getContext('2d');
			_this.ship = new Ship(ctx);
      		_this.ship.controll();
      		_this.reset();
			_this.run(ctx);
		});
		body.on(gameMonitor.eventType.start, '#frontpage', function(){
			$('#frontpage').css('left', '-100%');
		});

		body.on(gameMonitor.eventType.start, '.share', function(){
			$('.weixin-share').show().on(gameMonitor.eventType.start, function(){
				$(this).hide();
			});
		});
	},
	rollBg : function(ctx){
		if(this.bgDistance >= this.bgHeight){
			this.bgloop = 0;
		}
		this.bgDistance = ++this.bgloop * this.bgSpeed;
		this.bgDistance = Math.ceil(Tween.Linear.easeIn(this.bgTime, 0, gameMonitor.h, gameMonitor.durationTime));
		if(this.bgDistance>=this.bgHeight){this.bgTime=0}
		else{this.bgTime++;}
		ctx.drawImage(this.bg, 0, this.bgDistance-this.bgHeight, this.bgWidth, this.bgHeight);
		ctx.drawImage(this.bg, 0, this.bgDistance, this.bgWidth, this.bgHeight);
	},
	run : function(ctx){
		var _this = gameMonitor;
		ctx.clearRect(0,0,_this.bgWidth,_this.bgHeight);
		_this.rollBg(ctx);

		//绘制飞船
		_this.ship.paint();
		_this.ship.eat(_this.foodList);

		//生产月饼
		_this.genorateFood();

		//绘制月饼
		for(var i=_this.foodList.length-1; i>=0; i--){
			var f = _this.foodList[i];
			if(f){
				f.paint(ctx);
				f.move(ctx);
			}
		}
		_this.timer = requestAnimationFrame(function(){gameMonitor.run(ctx)});
		_this.time++;
		if(_this.time/1000>0 && _this.time%1000==0){
			_this.durationTime -= 10;
			console.log(_this.durationTime)
		}
		if(_this.gameover){
			cancelAnimationFrame(_this.timer);
		}
	},
	stop : function(){
		var _this = this;
		this.gameover = true;
		$('#stage').off(gameMonitor.eventType.start + ' ' +gameMonitor.eventType.move);
	},
	genorateFood : function(){
		var genRate = 50;//产生月饼的频率
		var random = Math.random();
		if(random*genRate > genRate-1){
			var left = Math.random()*(this.w-50);
			var type = Math.floor(left)%2 == 0?0:1;
			var id = this.foodList.length;
			var f = new Food(type, left, id);
			this.foodList.push(f);
		}
	},
	reset : function(){
		this.foodList = [];
		this.bgloop = 0;
		this.score = 0;
		this.timmer = null;
		this.time = 0;
		this.gameover = false;
		$('#score').text(this.score);
	},
	getScore : function(){
		var time = Math.floor(this.time/60);
		var score = this.score;
		var user = 1;
		if(score==0){
			$('#scorecontent').html('真遗憾，您竟然<span class="lighttext">一个</span>月饼都没有抢到！');
			$('.btn1').text('大侠请重新来过').removeClass('share').addClass('playagain');
			$('#fenghao').removeClass('geili yinhen').addClass('yinhen');
			return;
		}
		else if(score<10){
			user = 2;
		}
		else if(score>10 && score<=20){
			user = 10;
		}
		else if(score>20 && score<=40){
			user = 40;
		}
		else if(score>40 && score<=60){
			user = 80;
		}
		else if(score>60 && score<=80){
			user = 92;
		}
		else if(score>80){
			user = 99;
		}
		$('#fenghao').removeClass('geili yinhen').addClass('geili');
		$('#scorecontent').html('您在<span id="stime" class="lighttext">2378</span>秒内抢到了<span id="sscore" class="lighttext">21341</span>个月饼<br>超过了<span id="suser" class="lighttext">31%</span>的用户！');
		$('#stime').text(time);
		$('#sscore').text(score);
		$('#suser').text(user+'%');
		$('.btn1').text('请小伙伴吃月饼').removeClass('playagain').addClass('share');
	},
	isMobile : function(){
		var sUserAgent= navigator.userAgent.toLowerCase(),
		bIsIpad= sUserAgent.match(/ipad/i) == "ipad",
		bIsIphoneOs= sUserAgent.match(/iphone os/i) == "iphone os",
		bIsMidp= sUserAgent.match(/midp/i) == "midp",
		bIsUc7= sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4",
		bIsUc= sUserAgent.match(/ucweb/i) == "ucweb",
		bIsAndroid= sUserAgent.match(/android/i) == "android",
		bIsCE= sUserAgent.match(/windows ce/i) == "windows ce",
		bIsWM= sUserAgent.match(/windows mobile/i) == "windows mobile",
		bIsWebview = sUserAgent.match(/webview/i) == "webview";
		return (bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM);
	}
}
if(!gameMonitor.isMobile()){
	gameMonitor.eventType.start = 'mousedown';
	gameMonitor.eventType.move = 'mousemove';
	gameMonitor.eventType.end = 'mouseup';
}
gameMonitor.init();