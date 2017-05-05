/**
opt {
	container: '#container',//容器div  -----必填
	file: '#file',//点击按钮 -----必填
	ok: '#ok',//完成按钮  -----必填
	output: { //图片输出尺寸
		width: 200,
    	height: 200
	},
	size : { //容器尺寸
    	width: 200,
    	height: 200
    },
	imagesArr:[{//选填
    	url:'',//图片链接------必填
    	pos:{x:0,y:0},//图片位置-------选填：{x:0,y:0}
    	zIndex: 0, //图片图层 -------选填：0
    	widthRatio: 1, //宽度比例0-1 -------选填：默认1	 
    	select: false //true为可移动， false为不可移动 -----选填：默认false
    }],
    textArr: [ //选填
    {
		text: '', //必填
		pos:{x:0,y:0},//文字位置-------选填：{x:0,y:0}
		fs: '14px',//文字大小-------选填
		fc: '#333333',//文字颜色-------选填
		fw: 'nomal',
		zIndex:100
	}
    ],
    loadStart : function(){},
    loadComplete : function(){},
    done : function(){},
    fail : function(){}
}
*/
var PhotoClip = function(opt){
    this.touchstart = 'touchstart';
    this.touchmove = 'touchmove';
    this.touchend = 'touchend';
    this.imagesOpt = {
    	url:'',//图片链接------必填
    	pos:{x:0,y:0},//图片位置-------选填：{x:0,y:0}
    	zIndex: 0, //图片图层 -------选填：0,不要超过100
    	widthRatio: 1, //宽度比例0-1 -------选填：默认1	 
    	select: false //true为可移动， false为不可移动 -----选填：默认false
    };
    this.textOpt = {
		text: '', //必填
		pos:{x:0,y:0},//文字位置-------选填：{x:0,y:0}
		fs: 14,//文字大小-------选填
		fc: '#333333',//文字颜色-------选填
		fw: 'normal',
		zIndex:100
	};
    this.images = [];//存放加载完的图片
    this.imagesArrOrigin = [];//存放原始的图片数组
    this.activeImage;//可移动的图片
    this.startRotation = 0;
	/*opt中的属性*/
    this.$container;//容器div  -----必填
    this.$file; //点击按钮 -----必填
    this.$ok; //完成按钮  -----必填
    this.output = { //输出图片宽高
    	width: 200,
    	height: 200
    };
    this.size = { //容器尺寸
    	width: 200,
    	height: 200
    }
    this.imagesArr = [];  //存放初始化的图片
    this.textArr = [];
    this.loadStart = function(){};
    this.loadComplete = function(){};
    this.done = function(){};
    this.fail = function(){}

    this.init(opt);
}

PhotoClip.prototype.init = function(opt) {
	/*初始化属性*/
	var _this = this;
	_this.touchInit();
	_this.$container = document.querySelector(opt.container);
    _this.$file = document.querySelector(opt.file);
    _this.$ok = document.querySelector(opt.ok);
    _this.output = opt.output ? opt.output:_this.output;
    _this.size = opt.size ? opt.size:_this.size;
    _this.loadStart = opt.loadStart ? opt.loadStart:_this.loadStart;
    _this.loadComplete = opt.loadComplete ? opt.loadComplete:_this.loadComplete;
    _this.done = opt.done ? opt.done : _this.done;
    _this.fail = opt.fail ? opt.fail:_this.fail;
    if(opt.imagesArr){//初始化图片列表,赋值
    	for(var i in opt.imagesArr){
    		for(var key in _this.imagesOpt){
    			opt.imagesArr[i][key] = opt.imagesArr[i][key] ? opt.imagesArr[i][key]:_this.imagesOpt[key];
    		}
    	}
    	_this.imagesArrOrigin = opt.imagesArr;  //存放原始的图片数组
	    _this.imagesArr = opt.imagesArr;
    }
    if(opt.textArr){//初始化文字列表
    	for(var i in opt.textArr){
    		for(var key in _this.textOpt){
    			opt.textArr[i][key] = opt.textArr[i][key] ? opt.textArr[i][key]:_this.textOpt[key];
    			var obj = opt.textArr[i];
    			opt.textArr[i]['font']=obj.fw+' '+obj.fs*window.innerWidth/320+'px/1 '+_this.getFontFamily();
    		}
    		_this.textArr = opt.textArr;
    	}
    }
  	_this.initBtnEvent();
};
/**
按钮事件初始化
*/
PhotoClip.prototype.initBtnEvent = function() {
	/**
    初始化事件
    */
    var _this = this;
    _this.$ok.addEventListener(_this.touchstart, function(){
    	_this.mergeImage();
    	_this.done();
    });
    _this.$file.addEventListener(_this.touchstart, function(){
    	_this.restore();
    	//测试代码
        _this.imagesArr.push({
	    	url:'images/1.jpg',
	    	pos:{x:0,y:0},//图片位置-------选填：{x:0,y:0}
	    	zIndex: 0, //图片图层 -------选填：0
	    	widthRatio: 1, //宽度比例0-1 -------选填：默认1	 
	    	select: true //true为可移动， false为不可移动 -----选填：默认false
	    });
		_this.uploadSuccess();

		/*
		wx.chooseImage({
			count: 1,
			success : function(res) {
				images.localIds = res.localIds;
				_this.loadStart(); 
				upload(images.localIds);
			}
		});
		function upload(localIds){
			wx.uploadImage({
				localId : localIds[0],
				isShowProgressTips: 1, // 默认为1，显示进度提示
				success : function(res) {
					// 上传成功
					var serverId = res.serverId; // 返回图片的服务器端ID
		            uploadMedia(serverId,function(data){
		            	if(data.errcode == 0){//上传成功
		            		var base64 = data.base64;
		            		var strbase = "data:image/png;base64,"+base64;
		            		_this.imagesArr.push({
						    	url:strbase,//图片链接------必填
						    	pos:{x:0,y:0},//图片位置-------选填：{x:0,y:0}
						    	zIndex: 0, //图片图层 -------选填：0
						    	widthRatio: 1, //宽度比例0-1 -------选填：默认1	 
						    	select: true //true为可移动， false为不可移动 -----选填：默认false
						    });
		            		_this.uploadSuccess();
		            	}else{
		            		alert(data.errmsg);
		            	}
		            });
				},
				fail : function(res) {
					alert(JSON.stringify(res));
				}
			});
		}*/
    });
};


PhotoClip.prototype.restore = function() {
	var _this = this;
	_this.$container.innerHTML = '';//容器清空
    _this.imagesArr = [];//存放初始化的图片
	for(var i in _this.imagesArrOrigin){
    	_this.imagesArr.push(_this.imagesArrOrigin[i]);
	}
    _this.images = [];//存放加载完的图片
};

/**
从微信端获取图片并上传成功后的处理
*/
PhotoClip.prototype.uploadSuccess = function() {
	var _this = this;
	//初始化容器
    _this.$container.style.width = _this.size.width+'px';
    _this.$container.style.height = _this.size.height+'px';
    //初始化图片
    _this.imagesArr.forEach(function(obj){
        _this.addImage(obj);
    });
    
    //循环资源是否加载成功
    _this.imagesIsAllLoad(function(){
    	_this.textArr.forEach(function(obj){
    		_this.addText(obj);
    	});
	    _this.hammerEvent();
	    _this.loadComplete();    	
    });

};
/**
图片资源是否都加载完成
*/
PhotoClip.prototype.imagesIsAllLoad = function(func) {
	var _this = this;
	var list = _this.images;
    var max = _this.imagesArr.length;
    var n = 0;
    var p;

    for (var i in list) {
        p = list[i];
        // console.log(p.status);
        if ('status' in p) {
            n++;
        }
    }
    r = n / max;
    if (r < 1) {
        setTimeout(function(){
        	_this.imagesIsAllLoad(func);
        }, 50);
    } else {
        console.log('资源加载完毕');
        func();
    }
};
/**
加载图片资源, 容器添加img
*/
PhotoClip.prototype.addImage = function(obj) {
	var _this = this;
	var url = obj.url;
	var x = obj.pos.x;
	var y = obj.pos.y;
	var zIndex = obj.zIndex; 
	var img = new Image();
	img.src = url;
	img.onload = function(){
		var a = x?x:0;
		var b = y?y:0;
		var image = {
			img: img,
			natural:{
				width: img.naturalWidth,
				height: img.naturalHeight
			},
			transform: {
                translate: {x: a, y: b},
                rotation: 0,
                scale: 1
            },
            containerWidth: _this.$container.offsetWidth,
            containerHeight: _this.$container.offsetHeight,
            width: _this.$container.offsetWidth*obj.widthRatio,
            height: _this.$container.offsetWidth*obj.widthRatio*img.height/img.width
		}
		img.style.zIndex = zIndex;
		img.width = image.width;
		img.height = image.height;
		image.centerPoint = {
			x: img.width/2+a,//图片中心点的位置X
			y: img.height/2+b//图片中心点的位置Y 
		}
		image.status = 'complete';
		_this.updateElementTransform(image);
		_this.$container.appendChild(img);
		if(obj.select){
			_this.activeImage = image;
			_this.images.unshift(image);//放在头部
		}else{
	    	_this.images.push(image);
		}
	}
	img.onerror = function() {
		var image = {
			status:'fail',
            img: img
		}
		_this.images.push(image);
        throw ('读取图片错误,url:' + img.src);
    }
};

/**
生成文字标签，容器添加text
*/
PhotoClip.prototype.addText = function(obj) {
	var _this = this;
	var div = document.createElement('div');
	div.style.zIndex = obj.zIndex;
	div.style.font = obj.font;
	div.style.color = obj.fc;
	div.style.position = 'absolute';
	div.style.left = obj.pos.x+'px';
	div.style.top = obj.pos.y+'px';
	div.innerHTML = obj.text;
	_this.$container.appendChild(div);
};

/**
初始化容器手势动作
*/
PhotoClip.prototype.hammerEvent = function(first_argument) {
	var _this = this;
	var mc = new Hammer.Manager(_this.$container);
	mc.add(new Hammer.Pan({ threshold: 0, pointers: 0 }));
    mc.add(new Hammer.Rotate({ threshold: 0 })).set({ enable: true }).recognizeWith(mc.get('pan'));
	mc.add(new Hammer.Pinch({ threshold: 0 })).set({ enable: true }).recognizeWith([mc.get('pan'), mc.get('rotate')]);
	mc.on("panstart panmove panend", _this.onPan.bind(_this));
	mc.on("rotatestart rotatemove", _this.onRotate.bind(this));
	mc.on("pinchstart pinchmove", _this.onPinch.bind(_this));
};

PhotoClip.prototype.onRotate = function(e) {
	e.preventDefault();
    var _this = this;
    var activeImage = _this.activeImage;
	if(e.type == 'rotatestart'){
      _this.startRotation = activeImage.transform.rotation;
	}
    activeImage.transform.rotation = _this.startRotation + e.rotation;
    // activeImage.transform.rotation +=  90;
    _this.updateElementTransform(activeImage);

};
PhotoClip.prototype.onPan = function(e) {
	if(e.rotation)
    e.preventDefault(); //取消事件的默认动画
    var _this = this;
    var activeImage = _this.activeImage;
    if(e.type == 'panstart') {
      startPan = {
        x: activeImage.transform.translate.x,
        y: activeImage.transform.translate.y
      };

      startCenterPoint = {
        x: activeImage.centerPoint.x,
        y: activeImage.centerPoint.y
      };
    }
    activeImage.transform.translate = {
      x: startPan.x + e.deltaX,
      y: startPan.y + e.deltaY
    };

    activeImage.centerPoint = {
      x: startCenterPoint.x + e.deltaX,
      y: startCenterPoint.y + e.deltaY
    };
    _this.updateElementTransform(activeImage);
};
PhotoClip.prototype.onPinch = function(e) {
    e.preventDefault();
    var _this = this;
    var activeImage = _this.activeImage;
    if(e.type == 'pinchstart') {
        initScale = activeImage.transform.scale || 1;
    }

    scale = initScale * e.scale;
    if(scale < 0.2)
      activeImage.transform.scale = 0.2;
    else if(scale > 5)
      activeImage.transform.scale = 5;
    else
        activeImage.transform.scale = scale;
    _this.updateElementTransform(activeImage);
};
/**
图片样式转换
*/
PhotoClip.prototype.updateElementTransform = function(el) {
			var transform = el.transform;
	    var value = [
	        'translate3d(' + transform.translate.x + 'px, ' + transform.translate.y + 'px, 0)',
	        'scale(' + transform.scale + ', ' + transform.scale + ')',
	        'rotate('+ transform.rotation + 'deg)'
	    ];

	    value = value.join(" ");
	    el.img.style.webkitTransform = value;
	    el.img.style.mozTransform = value;
	    el.img.style.transform = value;
};

PhotoClip.prototype.mergeImage = function() {
	var _this = this;
	var canvas = document.createElement('canvas');
    canvas.width = _this.output.width;//CSS中定义了画布是580
    canvas.height = _this.output.height;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFF';//绘制背景色
    ctx.fillRect(0,0,canvas.width,canvas.height);

    _this.images.forEach(function(obj){
    	_this.drawImage(obj,ctx);
    });
    _this.textArr.forEach(function(obj){
    	_this.drawText(obj, ctx);
    });
    var base64 = canvas.toDataURL('image/jpeg');
    //合成的图片
    document.querySelector('#show').innerHTML = '<img src="'+base64+'">'
};
PhotoClip.prototype.drawText = function(obj, ctx) {
	var _this = this;
	var params = {
		w: _this.output.width/_this.$container.offsetWidth,
		h: _this.output.height/_this.$container.offsetHeight
	}
	console.log(params.h+'   '+obj.pos.y*params.h)
	ctx.save();
	ctx.textBaseline="top"; 
	var fontArr = obj.font.split(' ');
	var fontSize = 0;
	for(var i in fontArr){
		if(fontArr[i].indexOf('px')>-1){
			fontSize = params.w * parseFloat(fontArr[i].split('px')[0]);
			fontArr[i] = fontSize+'px';
		}
	}
	ctx.font= fontArr.join(' ');
	ctx.fillStyle=obj.fc;
	ctx.fillText(obj.text,obj.pos.x*params.w, obj.pos.y*params.h);
	console.log(obj.pos.y+fontSize)
};
PhotoClip.prototype.drawImage = function(image,ctx) {
	var _this = this;
	var transform = image.transform;
	var params = {
		w: _this.output.width/image.containerWidth,
		h: _this.output.height/image.containerHeight
	}
	ctx.save();
	ctx.translate(image.centerPoint.x, image.centerPoint.y);
	ctx.rotate(Math.PI * image.transform.rotation/180)
	ctx.translate(-image.centerPoint.x, -image.centerPoint.y);
	ctx.scale(transform.scale, transform.scale);
	//根据canvas的大小进行等比放大  
	//参数获取公式 ：Wpic/Wframe = Wout/Wcanvas ----提取params.w = Wcanvas/Wframe
	ctx.drawImage(image.img,
        (image.centerPoint.x - image.width * transform.scale / 2) / transform.scale*params.w,
        (image.centerPoint.y - image.height * transform.scale / 2) / transform.scale*params.h,
        image.width*params.w,
        image.height*params.h
    );
	ctx.restore();
};
/**
手势初始化
*/
PhotoClip.prototype.touchInit = function(){
    if(!this.isMobile()){
        this.touchstart= 'mousedown';
        this.touchmove = 'mousemove';
        this.touchend = 'mouseup';
    }
}
/**
判断是否为手机
*/
PhotoClip.prototype.isMobile = function(){
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
/**
判断是苹果手机还是安卓机
*/
PhotoClip.prototype.isIOS = function() {
	var u = navigator.userAgent.toLowerCase();
	var isAndroid = u.indexOf('android') > -1 || u.indexOf('adr') > -1; //android终端
	var isIOS = !!u.match(/\(i[^;]+;( u;)? cpu.+mac os x/); //ios终端
	return isIOS;
};
/**
设置系统字体
*/
PhotoClip.prototype.getFontFamily = function() {
	var _this = this;
	if(_this.isMobile()){
		if(_this.isIOS()){
			return 'Heiti SC';
		}else{
			return 'Droid Sans';
		}
	}else{
		return 'Microsoft Yahei';
	}
};
