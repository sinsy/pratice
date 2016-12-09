//灼华游戏
//2015-04-13
//cAop!ng
//游戏主入口
ZhGame=function(){
	this.isDebug=false;			//是否调试模式
	this.status='init';			//当前运行状态
	this.width=720;				//内定的宽度
	this.height=480;			//内定的高度
	this.offsetTop=0;
	this.levelName='level_'+'0';	//关卡名称
	this.reSizeList=[];				//关注尺寸改变对象列表
    this.weixin=false;              //不是微信关联游戏
	if(typeof(arguments[0]) == 'object'){//使用传递过来的参数定义对象
		for(var key in arguments[0]){
			this[key]=arguments[0][key];
		}
	}
	this.wh=this.width/this.height;		//内定宽高比
	this.init();
}
//初始化程序
ZhGame.prototype.init=function(){
    //if(this.weixin){
    //    if(typeof(localStorage.h5g_weixin_openid)=='undefined') {
    //        alert('此游戏运行在微信公众号内,请关注后在内部执行.');
    //        return;
    //    }
    //}
	this.setWindow();				//设置window的一些定义和属性
	this.createCanvas();			//建立系统画板,建立后将会调用checkSetting更新系统设置
	this.textList=[];				//输出文本对象列表
	this.eventBind();				//事件绑定
	this.createLogo();				//建立logo对象
	this.res=new Res({ZG:this,levelName:this.levelName});
	this.status='readying';
}
//游戏开始
ZhGame.prototype.run=function(){
	//删除logo定时事件
	clearTimeout(this.logo.InterValId);
	this.ctx.clearRect(0,0,this.width,this.height);
	//建立工作线程,工作线程将会根据关卡名称载入关卡后台代码
	this.worker=new Worker('js/worker.js');
	this.level=new Level({ZG:this,'width':this.width,'height':this.height});		//这里加载的将是关卡文件自定义的level对象
	this.postMessage({'type':'level','data':this.levelName});
	this.status='isRun';
}

//window全局事件,全局对象
ZhGame.prototype.setWindow=function(){
	var _this=this;
	//响应窗口大小改变事件
	window.onresize=function(){
		_this.reSet.call(_this);
	}
	//响应窗口旋转事件
	window.onorientationchange=function(){
		_this.reSet.call(_this);
	}
	//定义系统动画函数
	window.requestAnimFrame = 	window.requestAnimationFrame ||
					            window.webkitRequestAnimationFrame ||
					            window.mozRequestAnimationFrame ||
					            window.oRequestAnimationFrame ||
					            window.msRequestAnimationFrame;
	window.cancelAnimationFrame = window.cancelAnimationFrame ||
					            window.cancelRequestAnimationFrame ||
					            window.msCancelRequestAnimationFrame ||
					            window.mozCancelRequestAnimationFrame ||
					            window.oCancelRequestAnimationFrame ||
					            window.webkitCancelRequestAnimationFrame ||
					            window.msCancelAnimationFrame ||
					            window.mozCancelAnimationFrame ||
					            window.webkitCancelAnimationFrame ||
					            window.oCancelAnimationFrame;
	window.onblur=function(){
		_this.onblur(_this);
	}
	window.onfocus=function(){
		_this.onfocus(_this);
	}
	window.click=new Click();
    var _body=document.getElementsByTagName('body');
    _body[0].style['margin']='0';

}
//浏览器失去焦点处理
ZhGame.prototype.onblur=function(_this){
	this.pause();
}
//浏览器获得焦点处理
ZhGame.prototype.onfocus=function(_this){
	this.restart();
}
//游戏暂停
ZhGame.prototype.pause=function(){
	this.ctx.save();
	this.ctx.textAlign="center";
	// 创建渐变
	var gradient=this.ctx.createLinearGradient(0,0,300,0);
	gradient.addColorStop("0","magenta");
	gradient.addColorStop("0.5","blue");
	gradient.addColorStop("1.0","red");
	// 用渐变填色
	this.ctx.fillStyle=gradient;
	this.ctx.font='32px Georgia bold';
	this.ctx.fillText('游戏暂停',this.width/2,this.height/2);
	this.ctx.restore();
	this.postMessage({'type':'gamePause','data':''});	
}
//游戏重新开始
ZhGame.prototype.restart=function(){
	this.ctx.clearRect(0,0,this.width,this.height);
	this.postMessage({'type':'gameRestart','data':''});
}
//游戏结束
ZhGame.prototype.gameOver=function(){
	window.onfocus=null;
	this.pause();
	setInterval(function(){
						action.run();
							},60);
}
//建立系统画板
//系统画板将负责初始提示信息,重要系统信息,进入画面展示,事件捕获
//系统画板将处于所有画板的最前面,现在z-index=99
ZhGame.prototype.createCanvas=function(){
	this.canvas=document.createElement('canvas');
	this.canvas.width=this.width;
	this.canvas.height=this.height;
	this.canvas.id='system';
	this.canvas.style.position='absolute';
	this.canvas.style['z-index']='99';			//系统canvas将处于最高层,用来获取事件
    //this.canvas.style['box-shadow']='0 0 4px #000';
    this.canvas.className='canvasCenter';
	document.body.appendChild(this.canvas);
	FastClick.attach(this.canvas);
	this.ctx=this.canvas.getContext('2d');
	this.reSet();
	this.reSet();
}
//检测环境设定
ZhGame.prototype.checkSetting=function(){
	//获取宽度和高度
	var e = window,
        a = 'inner'; 
    if (!('innerWidth' in window )){
        a = 'client';
        e = document.documentElement || document.body;
    }
 	this.innerWidth=e[ a+'Width' ];						//获取宽度
 	this.innerHeight=e[ a+'Height' ];					//获取高度
 	this.scale=this.innerHeight/this.height;			//获取变化后的高度比
	this.innerWH=this.innerWidth/this.innerHeight;			//屏幕宽高比
}
//重新设置数值
//这里将建立一个对象列表,对于关注参数改变的对象,将发送给其属性改变信息.
ZhGame.prototype.reSet=function(){
	this.checkSetting();			//重新获取系统设置
	this.offsetTop=null;
	this.offsetWidth=null;
	this.offsetLeft=null;
	if(this.innerWH>this.wh){//屏幕宽高比跟场景宽高比对比,进行样式适配
		this.canvas.style['height']	=	'100%';
		this.canvas.style['width']	=	'auto';
		this.canvas.style['top']	=	'0px';
	}else{
		this.canvas.style['height']	=	'auto';
		this.canvas.style['width']	=	this.innerWidth+'px';
		if(this.offsetTop==null){
			this.offsetTop=(this.innerHeight-this.canvas.offsetHeight)/2|0;	
		}
		this.canvas.style['top']	=	this.offsetTop+'px';
	}
	this.offsetWidth=this.canvas.offsetWidth;
	this.offsetHeight=this.canvas.offsetHeight;
	this.offsetLeft=(this.innerWidth-this.offsetWidth)/2|0;
	this.canvas.style['left']=this.offsetLeft+'px';
	
	this.offsetTop=(this.innerHeight-this.canvas.offsetHeight)/2|0;
	var _l=this.reSizeList.length;
	while(_l--){
		this.reSizeList[_l].reSize();
	}
	try{
		if(this.innerWH>this.wh){
			this.scale=this.canvas.offsetHeight/this.height;
		}else{
			this.scale=this.canvas.offsetWidth/this.width;			
		}
		this.scaleX=this.canvas.offsetWidth/this.width;
		this.scaleY=this.canvas.offsetHeight/this.height;
		var _boxList=document.getElementsByClassName('box');
		for(var i=0;i<_boxList.length;i++){	
			_boxList[i].style['width']=this.offsetWidth+'px';
			_boxList[i].style['left']=this.offsetLeft+'px';
		}
	}catch(e){
		}
}
//功能代码
//ajax读取
//改进型ajax读取
ZhGame.ajax=function(){
	if(typeof(arguments[0]['url'])=='undefined'){
		console.log('空URL错误');
		return false;
	}
	var _success=typeof(arguments[0]['success'])!='undefined'?arguments[0]['success']:function(){};	
	var _executor=typeof(arguments[0]['executor'])!='undefined'?arguments[0]['executor']:this;
	var _ajax=new (window.XMLHttpRequest || window.ActiveXObject);
	var _data=typeof(arguments[0]['data'])!='undefined'?arguments[0]['data']:false;
	
	_ajax.onreadystatechange=function(){
		if (this.readyState == 4 && this.status ==200){ //此时数据可用
			_success.call(_executor,this.responseText);
		}		
	}
	if(_data){
		_ajax.open('POST',arguments[0]['url'],true);
		_ajax.setRequestHeader("X_REQUESTED_WITH", "ZhGame");
		//_ajax.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
		_ajax.send(_data);	//
	}else{
		_ajax.open('get',arguments[0]['url']);
		_ajax.setRequestHeader("X_REQUESTED_WITH", "ZhGame");
		_ajax.send();
	}
	
}
//给工作线程传递数据
ZhGame.prototype.postMessage=function(d){
	if(typeof(this.worker)!='undefined'){
		this.worker.postMessage(JSON.stringify(d));
	}	
}
//信息中心,这里将集中处理发送给此对象的信息.
ZhGame.prototype.message=function(m){
		if(typeof(m)=="string"){
		m=JSON.parse(m);
		}
		switch(m.type){
			case	'loadProgress':
				if(m.loadProgress!=100){
					this.addText({name:'loadProgress',text:'读取: '+m.name+' ',x:this.width/2|0,y:this.height/4*3|0,algin:'center'});
					
				}else{
					//指示显示游戏
					this.addText({name:'loadProgress',text:'',x:this.width/2|0,y:this.height/4*3|0,algin:'center'});
					this.status='canPlay';
					this.showStartMenu();
				}
				this.logo.arcRadian=360*(m.loadProgress/100) * (Math.PI / 180);
			break;
			
			case	'run':
				this.run();
			break;
		}
}
//给对象发送信息
ZhGame.prototype.send=function(){
	if(typeof(arguments[0]['to'])!='object')return;
	arguments[0]['to'].message(arguments[0]['message']);
}
//初始对象
//建立logo
var action=new Action();
ZhGame.prototype.createLogo=function(){
	var _this=this;
	this.logo={};
	this.logo.width=512;
	this.logo.height=512;
	this.logo.x=(this.width-this.logo.width)/2|0;
	this.logo.y=(this.height-this.logo.height)/4|0;
	this.logo.rotate=-90*Math.PI/180;
	this.logo.img=new Image();
	//action.add(this.logo,{'type':'Move',TT:'Sine',TM:'easeInOut',time:2,'loop':true,'data':{y:this.logo.y-20}});
	
	this.status='readying';
	this.logo.img.onload=function(){
		_this.logo.InterValId=setInterval(function(){
								action.run();
								_this.draw(_this);
							},60);
	}
	this.logo.img.src='img/logo.png';
}

//系统准备好
ZhGame.prototype.draw=function(_this){
	_this.ctx.clearRect(0,0,this.width,this.height);
	//如果游戏处于准备中,则绘制白色背景和LOGO
	if(_this.status=='readying' || _this.status=='canPlay'){
		_this.ctx.save();
		_this.ctx.fillStyle="#fff";
		_this.ctx.fillRect(0,0,_this.width,_this.height);	
		_this.ctx.lineWidth = 10; 
		_this.ctx.strokeStyle = 'rgba(0,0,0,0.1)';
		_this.ctx.fillText(_this.res.loadProgress,0,100);
		_this.ctx.save();
		var _j=_this.ctx.createRadialGradient(0,0,100,0,0,250);
		_j.addColorStop(0,"rgba(0,0,0,1)");
		_j.addColorStop(0.2,"rgba(0,0,0,.5)");
		_j.addColorStop(.2,"rgba(0,0,0,.4)");
		_j.addColorStop(1,"rgba(0,0,0,0)");
		_this.ctx.fillStyle=_j;
		
		_this.ctx.translate(_this.logo.x+256,_this.logo.y+256);
		_this.ctx.rotate(this.logo.rotate);
		_this.ctx.beginPath();
		_this.ctx.moveTo(0,0);
		_this.ctx.arc(0,0,250,0,this.logo.arcRadian);
		_this.ctx.closePath(); // 结束路径
		//_this.ctx.stroke(); // 让线条显示出来
		_this.ctx.fill();
		_this.ctx.restore();
		//_this.ctx.fillRect(_this.logo.x+2,_this.logo.y+2,_this.logo.width,_this.logo.height);
		_this.ctx.drawImage(_this.logo.img,_this.logo.x,_this.logo.y);
		if(typeof(_this.ui)!='undefined'){
			Ui.draw.call(_this.ui,_this.ctx,_this.res);
		}
		_this.ctx.restore();	
	}
	//绘制文本
	_this.drawText(_this);
}
//绘制文本
ZhGame.prototype.drawText=function(_this){
	try{
		var _l=_this.textList.length;
		for(var i=0;i<_l;i++){
			_this.ctx.save();
			_this.ctx.fillStyle=_this.textList[i].color;
			_this.ctx.textAlign=_this.textList[i].algin;
			_this.ctx.font=_this.textList[i].font;
			_this.ctx.fillText(_this.textList[i].text,_this.textList[i].x,_this.textList[i].y);
			_this.ctx.restore();	
		}	
	}catch(e){
		this.debug(e);
	}
	
}
//添加文本到显示列表
ZhGame.prototype.addText=function(){
	//默认文本属性
	var _text={name:'','text':'',x:0,y:0,align:'left',size:14,color:'#555',font:'28px Georgia'};
	if(typeof(arguments[0]) == 'object'){
		//根据传递的参数数据替换默认属性
		for(var key in arguments[0]){
			_text[key]=arguments[0][key];
		}
	}
	for(var i=0;i<this.textList.length;i++){
		//如果有相同名称的文本数据,则替换后退出
		if(this.textList[i].name==_text.name){
			this.textList[i].text=_text.text;
			return;
		}
	}
	//添加新的文本数据
	this.textList.push(_text);
}
//从列表中删除文本,如果参数为空,则为删除全部文本
ZhGame.prototype.delText=function(name){
	if(typeof(name)=='undefined'){
		this.textList=[];
	}else{
		for(var i=0;i<this.textList.length;i++){
			if(this.textList.name==name){
				this.textList.splice(i,1);
				return;
			}
		}
	}
}

//事件绑定
ZhGame.prototype.eventBind=function(){
	var _this=this;
	if(typeof(window.event)!='undefined' && typeof(window.event.touches)!='undefined'){
		this.canvas.addEventListener('touchstart',function(e){
			if(_this.status=='canPlay'){
				var _point=_this.getTouch(e);
				click.check(_point);
				return;
			}	
		});
	}else{
		
		this.canvas.addEventListener('click',function(e){
			if(_this.status=='canPlay'){
				var _point=_this.getMouse(e);
				click.check(_point);
				return;
			}	
		});
	}
}
//鼠标坐标获取
ZhGame.prototype.getMouse=function(e){
	var point = {x:0,y:0};
	if(typeof window.pageYOffset != 'undefined') {
		point.x = window.pageXOffset;
		point.y = window.pageYOffset;
	}
	else if(typeof document.compatMode != 'undefined' && document.compatMode != 'BackCompat') {
		point.x = document.documentElement.scrollLeft;
		point.y = document.documentElement.scrollTop;
	}
	else if(typeof document.body != 'undefined') {
		point.x = document.body.scrollLeft;
		point.y = document.body.scrollTop;
	}
	//point.x += e.clientX-(this.innerWidth/2-this.offsetLeft)|0;
	//point.y += e.clientY-this.offsetTop;
	point.x += e.offsetX || e.layerX;
	point.y += e.offsetY || e.layerY;
	point.x=point.x/this.scaleX|0;
	point.y=point.y/this.scaleY|0;
	return point;	
}
//点击事件坐标获取
ZhGame.prototype.getTouch=function(e){
	var point = {x:0,y:0};
	if(typeof window.pageYOffset != 'undefined') {
		point.x = window.pageXOffset;
		point.y = window.pageYOffset;
	}
	else if(typeof document.compatMode != 'undefined' && document.compatMode != 'BackCompat') {
		point.x = document.documentElement.scrollLeft;
		point.y = document.documentElement.scrollTop;
	}
	else if(typeof document.body != 'undefined') {
		point.x = document.body.scrollLeft;
		point.y = document.body.scrollTop;
	}
//	point.x += e.offsetX;
//	point.y += e.offsetY;
	point.x += e.touches[0].clientX;
	point.y += e.touches[0].clientY;
//	console.log('x=%s,y=%s',e.touches[0].clientX,e.touches[0].clientY);
	point.x=point.x/this.scaleX|0;
	point.y=point.y/this.scaleY|0;
	return point;
}


//串行化
ZhGame.prototype.serialize=function(){
	
}

//显示开始菜单
ZhGame.prototype.showStartMenu=function(){
    this.message({'type':'run'});
}

//fastClick
;(function(){'use strict';function FastClick(layer,options){var oldOnClick;options=options||{};this.trackingClick=false;this.trackingClickStart=0;this.targetElement=null;this.touchStartX=0;this.touchStartY=0;this.lastTouchIdentifier=0;this.touchBoundary=options.touchBoundary||10;this.layer=layer;this.tapDelay=options.tapDelay||200;this.tapTimeout=options.tapTimeout||700;if(FastClick.notNeeded(layer)){return;}function bind(method,context){return function(){return method.apply(context,arguments);};}var methods=['onMouse','onClick','onTouchStart','onTouchMove','onTouchEnd','onTouchCancel'];var context=this;for(var i=0,l=methods.length;i<l;i++){context[methods[i]]=bind(context[methods[i]],context);}if(deviceIsAndroid){layer.addEventListener('mouseover',this.onMouse,true);layer.addEventListener('mousedown',this.onMouse,true);layer.addEventListener('mouseup',this.onMouse,true);}layer.addEventListener('click',this.onClick,true);layer.addEventListener('touchstart',this.onTouchStart,false);layer.addEventListener('touchmove',this.onTouchMove,false);layer.addEventListener('touchend',this.onTouchEnd,false);layer.addEventListener('touchcancel',this.onTouchCancel,false);if(!Event.prototype.stopImmediatePropagation){layer.removeEventListener=function(type,callback,capture){var rmv=Node.prototype.removeEventListener;if(type==='click'){rmv.call(layer,type,callback.hijacked||callback,capture);}else{rmv.call(layer,type,callback,capture);}};layer.addEventListener=function(type,callback,capture){var adv=Node.prototype.addEventListener;if(type==='click'){adv.call(layer,type,callback.hijacked||(callback.hijacked=function(event){if(!event.propagationStopped){callback(event);}}),capture);}else{adv.call(layer,type,callback,capture);}};}if(typeof layer.onclick==='function'){oldOnClick=layer.onclick;layer.addEventListener('click',function(event){oldOnClick(event);},false);layer.onclick=null;}}var deviceIsWindowsPhone=navigator.userAgent.indexOf("Windows Phone")>=0;var deviceIsAndroid=navigator.userAgent.indexOf('Android')>0&&!deviceIsWindowsPhone;var deviceIsIOS=/iP(ad|hone|od)/.test(navigator.userAgent)&&!deviceIsWindowsPhone;var deviceIsIOS4=deviceIsIOS&&(/OS 4_\d(_\d)?/).test(navigator.userAgent);var deviceIsIOSWithBadTarget=deviceIsIOS&&(/OS [6-7]_\d/).test(navigator.userAgent);var deviceIsBlackBerry10=navigator.userAgent.indexOf('BB10')>0;FastClick.prototype.needsClick=function(target){switch(target.nodeName.toLowerCase()){case'button':case'select':case'textarea':if(target.disabled){return true;}break;case'input':if((deviceIsIOS&&target.type==='file')||target.disabled){return true;}break;case'label':case'iframe':case'video':return true;}return(/\bneedsclick\b/).test(target.className);};FastClick.prototype.needsFocus=function(target){switch(target.nodeName.toLowerCase()){case'textarea':return true;case'select':return!deviceIsAndroid;case'input':switch(target.type){case'button':case'checkbox':case'file':case'image':case'radio':case'submit':return false;}return!target.disabled&&!target.readOnly;default:return(/\bneedsfocus\b/).test(target.className);}};FastClick.prototype.sendClick=function(targetElement,event){var clickEvent,touch;if(document.activeElement&&document.activeElement!==targetElement){document.activeElement.blur();}touch=event.changedTouches[0];clickEvent=document.createEvent('MouseEvents');clickEvent.initMouseEvent(this.determineEventType(targetElement),true,true,window,1,touch.screenX,touch.screenY,touch.clientX,touch.clientY,false,false,false,false,0,null);clickEvent.forwardedTouchEvent=true;targetElement.dispatchEvent(clickEvent);};FastClick.prototype.determineEventType=function(targetElement){if(deviceIsAndroid&&targetElement.tagName.toLowerCase()==='select'){return'mousedown';}return'click';};FastClick.prototype.focus=function(targetElement){var length;if(deviceIsIOS&&targetElement.setSelectionRange&&targetElement.type.indexOf('date')!==0&&targetElement.type!=='time'&&targetElement.type!=='month'){length=targetElement.value.length;targetElement.setSelectionRange(length,length);}else{targetElement.focus();}};FastClick.prototype.updateScrollParent=function(targetElement){var scrollParent,parentElement;scrollParent=targetElement.fastClickScrollParent;if(!scrollParent||!scrollParent.contains(targetElement)){parentElement=targetElement;do{if(parentElement.scrollHeight>parentElement.offsetHeight){scrollParent=parentElement;targetElement.fastClickScrollParent=parentElement;break;}parentElement=parentElement.parentElement;}while(parentElement);}if(scrollParent){scrollParent.fastClickLastScrollTop=scrollParent.scrollTop;}};FastClick.prototype.getTargetElementFromEventTarget=function(eventTarget){if(eventTarget.nodeType===Node.TEXT_NODE){return eventTarget.parentNode;}return eventTarget;};FastClick.prototype.onTouchStart=function(event){var targetElement,touch,selection;if(event.targetTouches.length>1){return true;}targetElement=this.getTargetElementFromEventTarget(event.target);touch=event.targetTouches[0];if(deviceIsIOS){selection=window.getSelection();if(selection.rangeCount&&!selection.isCollapsed){return true;}if(!deviceIsIOS4){if(touch.identifier&&touch.identifier===this.lastTouchIdentifier){event.preventDefault();return false;}this.lastTouchIdentifier=touch.identifier;this.updateScrollParent(targetElement);}}this.trackingClick=true;this.trackingClickStart=event.timeStamp;this.targetElement=targetElement;this.touchStartX=touch.pageX;this.touchStartY=touch.pageY;if((event.timeStamp-this.lastClickTime)<this.tapDelay){event.preventDefault();}return true;};FastClick.prototype.touchHasMoved=function(event){var touch=event.changedTouches[0],boundary=this.touchBoundary;if(Math.abs(touch.pageX-this.touchStartX)>boundary||Math.abs(touch.pageY-this.touchStartY)>boundary){return true;}return false;};FastClick.prototype.onTouchMove=function(event){if(!this.trackingClick){return true;}if(this.targetElement!==this.getTargetElementFromEventTarget(event.target)||this.touchHasMoved(event)){this.trackingClick=false;this.targetElement=null;}return true;};FastClick.prototype.findControl=function(labelElement){if(labelElement.control!==undefined){return labelElement.control;}if(labelElement.htmlFor){return document.getElementById(labelElement.htmlFor);}return labelElement.querySelector('button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea');};FastClick.prototype.onTouchEnd=function(event){var forElement,trackingClickStart,targetTagName,scrollParent,touch,targetElement=this.targetElement;if(!this.trackingClick){return true;}if((event.timeStamp-this.lastClickTime)<this.tapDelay){this.cancelNextClick=true;return true;}if((event.timeStamp-this.trackingClickStart)>this.tapTimeout){return true;}this.cancelNextClick=false;this.lastClickTime=event.timeStamp;trackingClickStart=this.trackingClickStart;this.trackingClick=false;this.trackingClickStart=0;if(deviceIsIOSWithBadTarget){touch=event.changedTouches[0];targetElement=document.elementFromPoint(touch.pageX-window.pageXOffset,touch.pageY-window.pageYOffset)||targetElement;targetElement.fastClickScrollParent=this.targetElement.fastClickScrollParent;}targetTagName=targetElement.tagName.toLowerCase();if(targetTagName==='label'){forElement=this.findControl(targetElement);if(forElement){this.focus(targetElement);if(deviceIsAndroid){return false;}targetElement=forElement;}}else if(this.needsFocus(targetElement)){if((event.timeStamp-trackingClickStart)>100||(deviceIsIOS&&window.top!==window&&targetTagName==='input')){this.targetElement=null;return false;}this.focus(targetElement);this.sendClick(targetElement,event);if(!deviceIsIOS||targetTagName!=='select'){this.targetElement=null;event.preventDefault();}return false;}if(deviceIsIOS&&!deviceIsIOS4){scrollParent=targetElement.fastClickScrollParent;if(scrollParent&&scrollParent.fastClickLastScrollTop!==scrollParent.scrollTop){return true;}}if(!this.needsClick(targetElement)){event.preventDefault();this.sendClick(targetElement,event);}return false;};FastClick.prototype.onTouchCancel=function(){this.trackingClick=false;this.targetElement=null;};FastClick.prototype.onMouse=function(event){if(!this.targetElement){return true;}if(event.forwardedTouchEvent){return true;}if(!event.cancelable){return true;}if(!this.needsClick(this.targetElement)||this.cancelNextClick){if(event.stopImmediatePropagation){event.stopImmediatePropagation();}else{event.propagationStopped=true;}event.stopPropagation();event.preventDefault();return false;}return true;};FastClick.prototype.onClick=function(event){var permitted;if(this.trackingClick){this.targetElement=null;this.trackingClick=false;return true;}if(event.target.type==='submit'&&event.detail===0){return true;}permitted=this.onMouse(event);if(!permitted){this.targetElement=null;}return permitted;};FastClick.prototype.destroy=function(){var layer=this.layer;if(deviceIsAndroid){layer.removeEventListener('mouseover',this.onMouse,true);layer.removeEventListener('mousedown',this.onMouse,true);layer.removeEventListener('mouseup',this.onMouse,true);}layer.removeEventListener('click',this.onClick,true);layer.removeEventListener('touchstart',this.onTouchStart,false);layer.removeEventListener('touchmove',this.onTouchMove,false);layer.removeEventListener('touchend',this.onTouchEnd,false);layer.removeEventListener('touchcancel',this.onTouchCancel,false);};FastClick.notNeeded=function(layer){var metaViewport;var chromeVersion;var blackberryVersion;var firefoxVersion;if(typeof window.ontouchstart==='undefined'){return true;}chromeVersion=+(/Chrome\/([0-9]+)/.exec(navigator.userAgent)||[,0])[1];if(chromeVersion){if(deviceIsAndroid){metaViewport=document.querySelector('meta[name=viewport]');if(metaViewport){if(metaViewport.content.indexOf('user-scalable=no')!==-1){return true;}if(chromeVersion>31&&document.documentElement.scrollWidth<=window.outerWidth){return true;}}}else{return true;}}if(deviceIsBlackBerry10){blackberryVersion=navigator.userAgent.match(/Version\/([0-9]*)\.([0-9]*)/);if(blackberryVersion[1]>=10&&blackberryVersion[2]>=3){metaViewport=document.querySelector('meta[name=viewport]');if(metaViewport){if(metaViewport.content.indexOf('user-scalable=no')!==-1){return true;}if(document.documentElement.scrollWidth<=window.outerWidth){return true;}}}}if(layer.style.msTouchAction==='none'||layer.style.touchAction==='manipulation'){return true;}firefoxVersion=+(/Firefox\/([0-9]+)/.exec(navigator.userAgent)||[,0])[1];if(firefoxVersion>=27){metaViewport=document.querySelector('meta[name=viewport]');if(metaViewport&&(metaViewport.content.indexOf('user-scalable=no')!==-1||document.documentElement.scrollWidth<=window.outerWidth)){return true;}}if(layer.style.touchAction==='none'||layer.style.touchAction==='manipulation'){return true;}return false;};FastClick.attach=function(layer,options){return new FastClick(layer,options);};if(typeof define==='function'&&typeof define.amd==='object'&&define.amd){define(function(){return FastClick;});}else if(typeof module!=='undefined'&&module.exports){module.exports=FastClick.attach;module.exports.FastClick=FastClick;}else{window.FastClick=FastClick;}}());