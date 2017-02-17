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

/**
 * 地板类
 */
function Ground(){
    this.imgX = 0;
    this.imgY = 600;
    this.imgH = 112;
    this.imgW = 600;
    this.canH = Math.ceil(112 * GM.k);
    this.canW = Math.ceil(800 * GM.k);
    this.canX = 0;
    this.canY = viewSize.height - this.canH;
}
Ground.prototype.draw = function() {
    if(this.imgX > 24) this.imgX = 0;
    GM.ctx.drawImage(GM.img, this.imgX, this.imgY, this.imgW, this.imgH, this.canX,this.canY,this.canW,this.canH)
    this.imgX += 2;
};

/**
 * 小鸟类
 */
function Bird() {
    this.imgX = [170, 222, 275];
    this.imgY = [750, 750, 750];
    this.imgW = [34, 34, 34];
    this.imgH = [24, 24, 24];
    this.index = 2;
    this.count = 0;
    this.step = 1;
    var canX = Math.ceil(110 / 450 * GM.w);
    this.canX = [canX, canX, canX];
    var canY = Math.ceil(380 / 800 * GM.h);
    this.canY = [canY, canY, canY];
    var canW = Math.ceil(34 * GM.k);
    this.canW = [canW, canW, canW];
    var canH = Math.ceil(24 * GM.k);
    this.canH = [canH, canH, canH];
    this.t = 0;
    this.y = [canY, canY, canY];

}
Bird.prototype.draw = function() {
    var index = this.index;
    //翅膀拍动
    this.count++;
    if(this.count == 6){
        this.index += this.step;
        this.count = 0;
    }
    if((this.index == 2 && this.step == 1) || this.index == 0 && this.step == -1){
        this.step = - this.step;
    }
    //计算垂直位移，使用公式 y = a * t * (t - c)
    var c = 0.7 * 60;
    var minY = -85*GM.h/800;
    var a = -minY*4/(c*c);
    var dy = a*this.t * (this.t - c);
    if(this.y[0] + dy < 0){
        GM.canClick = false;
    }else{
        GM.canClick = true;
    }
    for(var i=0; i<3; i++){
        this.canY[i] = this.y[i] + Math.ceil(dy);
    }
    this.t ++;
    GM.ctx.drawImage(GM.img, this.imgX[index], this.imgY[index], this.imgW[index], this.imgH[index], this.canX[index], this.canY[index], this.canW[index], this.canH[index]);
};
function Pie(){}
/**
 * 分数类
 */
function Score(){
    this.imgX = 900;
    this.imgY = 400;
    this.imgW = 36;
    this.imgH = 54;
    this.canW = Math.ceil(36 * GM.k);
    this.canH = Math.ceil(54 * GM.k);
    this.canY = Math.ceil(50 / 800 * viewSize.height);
    this.canX = Math.ceil(viewSize.width / 2 - this.canW / 2);
    this.score = 0;
}
Score.prototype.draw = function() {
    var aScore = (''+this.score).split('');
    var len = aScore.length;
    this.canX = 0.5 * (GM.w-(this.canW+10)*len +10);
    for(var i=0; i<len; i++){
        var num = parseInt(aScore[i]);
        if(num < 5){
            var imgX = this.imgX + num * 40;
            var imgY = 400;
        }else{
            var imgX = this.imgX + (num - 5) * 40;
            var imgY = 460; 
        }
        var canX = this.canX + i*(this.canW+2);
        GM.ctx.drawImage(GM.img, imgX, imgY, this.imgW, this.imgH, canX, this.canY, this.canW, this.canH);
    }
};
var GM = {
    w: viewSize.width,
    h: viewSize.height,
    k: viewSize.height / 600,
    canClick : true,
    gameover : false,
    canCount : true,
    isStarted : false,
    timer : null,
    ground : null,
    bird : null,
    score : null,
    pies : [],
    ctx : null,
    canvas : null,
    eventType : {
        start : 'touchstart',
        move : 'touchmove',
        end : 'touchend'
    },
    img : new Image(),
    init : function(){
        var _this = this;
        _this.canvas = document.getElementById('canvas');
        _this.canvas.width = viewSize.width;
        _this.canvas.height = viewSize.height;
        _this.ctx = canvas.getContext('2d');
        _this.ground = new Ground();
        _this.bird = new Bird();
        _this.score = new Score();

        _this.img.onload = _this.initListener();
        _this.img.src = './img.png';

    },
    initListener : function(){
        var _this = this;
        var body = $(document.body);
        $(document).on(GM.eventType.move, function(event){
            event.preventDefault();
        });

        $(document).on(GM.eventType.start, function(e){
            if(GM.gameover)return;
            if(GM.isStarted){
                if(_this.canClick){

                }
            }else{
                GM.isStarted = true;
            }
        });
        body.on(GM.eventType.start, '#restart', function(){
            _this.init();
            _this.timer = requestAnimationFrame(GM.run);
        });
        _this.timer = requestAnimationFrame(_this.run);
    },
    run : function(){
        var _this = GM;
        if(_this.gameover){

        }else{
            _this.ctx.clearRect(0,0,_this.w,_this.h);
            _this.ctx.drawImage(_this.img, 0, 0, 800, 600, 0, 0, Math.ceil(_this.k * 800), viewSize.height);
            if(_this.isStarted){
                _this.bird.draw();
            }else{
                _this.bird.draw();
                //画ready
                _this.ctx.drawImage(_this.img, 170, 900, 300, 90, Math.ceil(viewSize.width * 0.5 - _this.k * 277 * 0.5), Math.ceil(200 / 800 * viewSize.height), 277 * _this.k, 75 * _this.k)
                _this.ctx.drawImage(_this.img, 170, 1150, 230, 150, Math.ceil(viewSize.width * 0.5 - _this.k * 200 * 0.5), Math.ceil(400 / 800 * viewSize.height), 200 * _this.k, 150 * _this.k)
            }
            //画分数
            _this.score.draw();
            // //画地板
            _this.ground.draw();
            // //设置定时器
            _this.timer = requestAnimationFrame(_this.run);
        }
    },
    check: function(){},
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

if(!GM.isMobile()){
    GM.eventType.start = 'mousedown';
    GM.eventType.move = 'mousemove';
    GM.eventType.end = 'mouseup';
}
GM.init();