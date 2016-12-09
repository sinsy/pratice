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
	this.initDebug();				//初始化调试功能
	this.setWindow();				//设置window的一些定义和属性
	this.createCanvas();			//建立系统画板,建立后将会调用checkSetting更新系统设置
	this.textList=[];				//输出文本对象列表
	this.eventBind();				//事件绑定
	this.createLogo();				//建立logo对象
	//this.checkUser();				//检查是否有定义用户

	this.res=new Res({ZG:this,levelName:this.levelName});

	//this.bgAudio=new ZhAudio();
	this.audio=new ZhAudio();
	this.zhSpine=new ZhSpine({ZG:this,levelName:this.levelName});
	
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
	//定义ajax对象
	this.Ajax = window.XMLHttpRequest || window.ActiveXObject;
	//定义选择器
	//window.select=this.select;
	window.onblur=function(){
		_this.onblur(_this);
	}
	window.onfocus=function(){
		_this.onfocus(_this);
	}
	window.click=new Click();

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
	//this.ctx.fillStyle='#fff';
	this.ctx.font='32px Georgia bold';
	this.ctx.fillText('游戏暂停',this.width/2,this.height/2);
	this.ctx.restore();
	//this.bgAudio.pause();
	this.postMessage({'type':'gamePause','data':''});	
}
//游戏重新开始
ZhGame.prototype.restart=function(){
	this.ctx.clearRect(0,0,this.width,this.height);
	this.postMessage({'type':'gameRestart','data':''});
	//this.bgAudio.play();	
}
//游戏结束
ZhGame.prototype.gameOver=function(){
	//window.onfocus=null;
	//this.pause();
	//setInterval(function(){
	//					action.run();
	//						},60);
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
	//this.canvas.style['box-shadow']='3px 0px 14px';
	this.canvas.className='canvasCenter';
	//this.theBox=document.getElementById('theBox');	//theBox写在网页中用来定位的块
	//this.theBox.appendChild(this.canvas);
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
			//this.debug(e);
		}
}

//给工作线程传递数据
ZhGame.prototype.postMessage=function(d){
	if(typeof(this.worker)!='undefined'){
		this.worker.postMessage(JSON.stringify(d));
	}	
}
//debug功能
ZhGame.prototype.initDebug=function(){
	this.log={};			//日志列表
	//如果调试开关是关闭的,则对传入的数据不处理.
	if(this.isDebug==false){
		this.debug=function(e){
			return;
		};
		return;
	}			
	this.debug=function(e){
		if(typeof(this.log[e.message])!='undefined'){
			this.log[e.message].count++;
			this.log[e.message].time=(new Date()).getTime();
		}else{
			this.log[e.message]={stack:e.stack,count:1,time:(new Date()).getTime()};
		}
		this.flushDebugLog();
	}
}
//刷新调试信息
ZhGame.prototype.flushDebugLog=function(){
	var _el=document.getElementById('debug');
	_el.innerHTML='';
	// arrDemo.sort(function(a,b){return a<b?1:-1});
	var _array=[];
	for(var i in this.log){
		_array.push(this.log[i]);
	}
	_array.sort(function(a,b){return a.time<b.time?1:-1});
	var _l=_array.length;
	for(var i=0;i<_l;i++){
		var _li=document.createElement('li');
		_li.innerHTML='次数:'+_array[i].count+'</br>'+_array[i].stack;
		_el.appendChild(_li);
	}
	if(_l>0)_el.style['display']='block';
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
                //this.addText({name:'loadProgress',text:'点击屏幕开始游戏!',x:this.width/2|0,y:this.height/4*3|0,algin:'center'});
                var _this=this;
                this.getSave(function(){
                    _this.addText({name:'loadProgress',text:'',x:this.width/2|0,y:this.height/4*3|0,algin:'center'});
                    _this.status='canPlay';
                    _this.showStartMenu();
                });                 //获得用户漫游存档,如果有微信用户信息,并有存档的话

            }
            this.logo.arcRadian=360*(m.loadProgress/100) * (Math.PI / 180);
        break;
        case	'run':
            this.run();
        break;
    }
};
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
							},30);
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
			//Ui.draw.call(_this.ui,_this.ctx,_this.res);
            this.ui.upDate();
            this.ui.draw();
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
		//this.debug(e);
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
	_this.keyCodeMap={"38":"Up","37":"Left","39":"Right","40":"Down"}
	//绑定按键事件
	window.addEventListener('keydown',function(e){
		
		switch(_this.keyCodeMap[e.keyCode]){
			case	'Up':
				_this.eventMap.up();
			break;
			case	'Down':
				_this.eventMap.down();
			break;
			case	'Left':
				_this.eventMap.left();
			break;
			case	'Right':
				_this.eventMap.right();
			break;
		}
	});
	//var _e='click';
	if(typeof(window.event)!='undefined' && typeof(window.event.touches)!='undefined'){
		//_e='touchstart';
        window.bindFun=function(e) {
            if (_this.status == 'canPlay') {
                var _point = _this.getMouse(e);
                click.check(_point);
                return;
            }
        }
		this.canvas.addEventListener('touchstart',bindFun);
	}else{
        window.bindFun=function(e){
            if(_this.status=='canPlay'){
                var _point=_this.getMouse(e);
                click.check(_point);
                return;
            }
        };
		this.canvas.addEventListener('click',bindFun);
	}
	

}
//事件映射,将会在不同的游戏中被接管处理
ZhGame.prototype.eventMap={"up":function(){
	console.log('up');
//		data={'event':'keydown',keyIdentifier:'Up'};
//		this.postMessage({'type':'event','data':JSON.stringify(data)});
	},
	down:function(){
		console.log('down');
//		data={'event':'keydown',keyIdentifier:'Down'};
//		this.postMessage({'type':'event','data':JSON.stringify(data)});
	},
	left:function(){
		console.log('left');
//		data={'event':'keydown',keyIdentifier:'Left'};
//		this.postMessage({'type':'event','data':JSON.stringify(data)});
	},
	right:function(){
		console.log('right');
//		data={'event':'keydown',keyIdentifier:'Right'};
//		this.postMessage({'type':'event','data':JSON.stringify(data)});
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
	point.x=point.x/this.scaleX|0;
	point.y=point.y/this.scaleY|0;
	return point;
}


//串行化
ZhGame.prototype.serialize=function(){
	
}
//当微信登录
ZhGame.prototype.checkUser=function(){
    if(typeof(localStorage.h5g_weixin_uid)=='undefined')return;
}
ZhGame.prototype.regUser=function(){
	ZhGame.ajax({executor:this,url:'/center/regUser/'+localStorage.h5g_weixin_uid
	,success:function(data){
		try{
			var _uData=JSON.parse(data);
			for(var i in _uData){
				localStorage['h5g_'+i]=_uData[i];
			}
            this.getSave();
		}catch(e){
			
		}
		
	}
	});
}
ZhGame.prototype.save=function(){
    if(typeof(localStorage.h5g_weixin_uid)=='undefined')return;
    var _data={};
    _data.uid=localStorage.h5g_weixin_uid;
    _data.did=localStorage.h5g_did;
    _data.data=localStorage['h5g_'+this.gid];
    _data.gid=this.gid;
	$g().ajax({executor:this,url:'/center/save'
	,data:_data
	,success:function(data){
		//console.log(data);
	}
	});
}
ZhGame.prototype.getSave=function(fun){
    if(typeof(localStorage.h5g_weixin_uid)=='undefined'){
        fun();
        return;
    }
    this.res.list[0].config.uid=localStorage.h5g_weixin_uid;
	var _data={};
    _data.uid=localStorage.h5g_weixin_uid;
    _data.gid=this.gid;
    $g().ajax({executor:this,url:'/center/getSave'
	,data:_data
	,success:function(data){
		try{
            JSON.parse(data);
            localStorage['h5g_'+this.gid]=data;
        }catch(e){

        }
            fun();

	}
	});
	
}
//获得同步内容,展示同步页面
ZhGame.prototype.synchronous=function(){
	var _box=document.createElement('div');
	_box.style['position']='absolute';
	_box.style['top']='0px';
	_box.style['left']='0px';
	_box.style['width']='100%';
	_box.style['height']='100%';
	_box.style['background-color']='#fff';
	_box.style['z-index']='999';
	$g().ajax({executor:this,url:'/center/bindToUser/'+localStorage['h5g_uid']
	,success:function(data){
		_box.innerHTML=data;
		document.body.appendChild(_box);
		for(var i in _box.childNodes){
			if(_box.childNodes[i].nodeName=='SCRIPT'){
				eval(_box.childNodes[2].innerHTML);
			}
		}
	}
	});		
}
ZhGame.prototype.synchronousClose=function(){
	
}
//显示开始菜单
ZhGame.prototype.showStartMenu=function(){
    $g().ajax({exe:this
        ,url:'level/'+this.levelName+'/ui.json'
        ,success:function(data){
            //console.dir(JSON.parse(data));
            this.ui2=Ui(data);
    }});
	var _this=this;
	this.ui=Ui();
    this.ui.ctx=this.ctx;
    this.ui.res=this.res;
	this.ui.data.eId=this.res.getResIdByName('ui','animation');
	var _ug=this.ui.make({'type':'group'
	,x:0
	,y:this.height/5*3|0
	//,'bColor':'rgba(0,0,0,.4)'
	,'width':this.width
	,'height':30
	,z:10
	});
	var _button=this.ui.make({'type':'static'//开始新游戏
		,index:'startNew'
		,offsetX:this.width/2-100|0
		,offsetY:120
		,width:150
		,height:60
		,frames:this.res.getFrame('ui','newgame')
		,f:function(){
            action.add(_ugNormal,{type:'Move',time:.6,data:{'y':_this.height/3|0},TT:'Back',TM:'easeOut'});
		}
	});
	_ug.add(_button);
    var _buttonKeep = this.ui.make({
        'type': 'static'
        , index: 'keepGame'
        , offsetX: this.width / 2 - 100 | 0
        , offsetY: 10
        , width: 150
        , height: 60
        , active:false
        , frames: this.res.getFrame('ui', 'keep')
        , f: function () {
            _this.audio.play('drum');
            _this.message({'type': 'run'});
        }
    });

    if(typeof(localStorage['h5g_'+this.gid])!='undefined') {
        _ug.add(_buttonKeep);
    }

    var _ugNormal=this.ui.make({'type':'group'
        ,index:'ugNormal'
        ,x:this.width/2-400/2|0
        ,y:this.height+100|0
        ,'bColor':'rgba(0,0,0,.8)'
        ,'width':400
        ,'height':180
        ,z:100
        ,t:[{offsetX:200,offsetY:40,tag:'number'
            ,text:'开启新游戏(普通模式),将会覆盖以前的存档'
            ,font:'18px Georgia',textAlign:'center',fillStyle:'#fff'}
        ]
    });
    var _buttonOk = this.ui.make({
        'type': 'static'
        , index: 'ugNormalOk'
        , offsetX:40
        , offsetY: 100
        , width: 100
        , height: 60
        , active:true
        ,'bColor':'rgba(255,255,255,.8)'
        ,z:110
        ,t:[{offsetX:50,offsetY:35
            ,text:'确定'
            ,font:'18px Georgia',textAlign:'center',fillStyle:'#000'}
        ]
        , f: function () {
            if(typeof(localStorage['h5g_'+_this.gid])!='undefined'){
                localStorage['h5g_'+_this.gid]='';
            }
            _this.audio.play('drum');
            _this.message({'type':'run'});
        }
    });
    _ugNormal.add(_buttonOk);
    var _buttonCancel = this.ui.make({
        'type': 'static'
        , index: 'ugNormalCancel'
        , offsetX:260
        , offsetY: 100
        , width: 100
        , height: 60
        , active:true
        ,'bColor':'rgba(255,255,255,.8)'
        ,z:110
        ,t:[{offsetX:50,offsetY:35
            ,text:'取消'
            ,font:'18px Georgia',textAlign:'center',fillStyle:'#000'}
        ]
        , f: function () {
            action.add(_ugNormal,{type:'Move',time:.6,data:{'y':_this.height+100},TT:'Back',TM:'easeIn'});
        }
    });
    _ugNormal.add(_buttonCancel);

    var _button=this.ui.make({'type':'static'//开始无限模式
        ,index:'startNolimit'
        ,offsetX:this.width/2-100|0
        ,offsetY:220
        ,width:150
        ,height:60
        ,frames:this.res.getFrame('ui','noLimit')
        ,f:function(){
            action.add(_ugUnlimit,{type:'Move',time:.6,data:{'y':_this.height/3|0},TT:'Back',TM:'easeOut'});
        }
    });
    _ug.add(_button);
    var _ugUnlimit=this.ui.make({'type':'group'
        ,index:'ugUnlimit'
        ,x:this.width/2-400/2|0
        ,y:this.height+100|0
        ,'bColor':'rgba(0,0,0,.8)'
        ,'width':400
        ,'height':180
        ,z:100
        ,t:[{offsetX:200,offsetY:40
            ,text:'无限模式,将没有结尾,一直玩下去.'
            ,font:'18px Georgia',textAlign:'center',fillStyle:'#fff'}
            ,{offsetX:200,offsetY:80
                ,text:'会覆盖以前的存档'
                ,font:'18px Georgia',textAlign:'center',fillStyle:'#fff'}
        ]
    });
    var _buttonOk = this.ui.make({
        'type': 'static'
        , index: 'ugUnlimitOk'
        , offsetX:40
        , offsetY: 100
        , width: 100
        , height: 60
        , active:true
        ,'bColor':'rgba(255,255,255,.8)'
        ,z:110
        ,t:[{offsetX:50,offsetY:35
            ,text:'确定'
            ,font:'18px Georgia',textAlign:'center',fillStyle:'#000'}
        ]
        , f: function () {
            _this.res.list[0].config.gameType='unLimit';
            if(typeof(localStorage['h5g_'+_this.gid])!='undefined'){
                localStorage['h5g_'+_this.gid]='';
            }
            _this.audio.play('drum');
            _this.message({'type':'run'});
        }
    });
    _ugUnlimit.add(_buttonOk);
    var _buttonCancel = this.ui.make({
        'type': 'static'
        , index: 'ugUnlimitCancel'
        , offsetX:260
        , offsetY: 100
        , width: 100
        , height: 60
        , active:true
        ,'bColor':'rgba(255,255,255,.8)'
        ,z:110
        ,t:[{offsetX:50,offsetY:35
            ,text:'取消'
            ,font:'18px Georgia',textAlign:'center',fillStyle:'#000'}
        ]
        , f: function () {
            action.add(_ugUnlimit,{type:'Move',time:.6,data:{'y':_this.height+100},TT:'Back',TM:'easeIn'});
        }
    });
    _ugUnlimit.add(_buttonCancel);
}

//fastClick
;(function(){'use strict';function FastClick(layer,options){var oldOnClick;options=options||{};this.trackingClick=false;this.trackingClickStart=0;this.targetElement=null;this.touchStartX=0;this.touchStartY=0;this.lastTouchIdentifier=0;this.touchBoundary=options.touchBoundary||10;this.layer=layer;this.tapDelay=options.tapDelay||200;this.tapTimeout=options.tapTimeout||700;if(FastClick.notNeeded(layer)){return;}function bind(method,context){return function(){return method.apply(context,arguments);};}var methods=['onMouse','onClick','onTouchStart','onTouchMove','onTouchEnd','onTouchCancel'];var context=this;for(var i=0,l=methods.length;i<l;i++){context[methods[i]]=bind(context[methods[i]],context);}if(deviceIsAndroid){layer.addEventListener('mouseover',this.onMouse,true);layer.addEventListener('mousedown',this.onMouse,true);layer.addEventListener('mouseup',this.onMouse,true);}layer.addEventListener('click',this.onClick,true);layer.addEventListener('touchstart',this.onTouchStart,false);layer.addEventListener('touchmove',this.onTouchMove,false);layer.addEventListener('touchend',this.onTouchEnd,false);layer.addEventListener('touchcancel',this.onTouchCancel,false);if(!Event.prototype.stopImmediatePropagation){layer.removeEventListener=function(type,callback,capture){var rmv=Node.prototype.removeEventListener;if(type==='click'){rmv.call(layer,type,callback.hijacked||callback,capture);}else{rmv.call(layer,type,callback,capture);}};layer.addEventListener=function(type,callback,capture){var adv=Node.prototype.addEventListener;if(type==='click'){adv.call(layer,type,callback.hijacked||(callback.hijacked=function(event){if(!event.propagationStopped){callback(event);}}),capture);}else{adv.call(layer,type,callback,capture);}};}if(typeof layer.onclick==='function'){oldOnClick=layer.onclick;layer.addEventListener('click',function(event){oldOnClick(event);},false);layer.onclick=null;}}var deviceIsWindowsPhone=navigator.userAgent.indexOf("Windows Phone")>=0;var deviceIsAndroid=navigator.userAgent.indexOf('Android')>0&&!deviceIsWindowsPhone;var deviceIsIOS=/iP(ad|hone|od)/.test(navigator.userAgent)&&!deviceIsWindowsPhone;var deviceIsIOS4=deviceIsIOS&&(/OS 4_\d(_\d)?/).test(navigator.userAgent);var deviceIsIOSWithBadTarget=deviceIsIOS&&(/OS [6-7]_\d/).test(navigator.userAgent);var deviceIsBlackBerry10=navigator.userAgent.indexOf('BB10')>0;FastClick.prototype.needsClick=function(target){switch(target.nodeName.toLowerCase()){case'button':case'select':case'textarea':if(target.disabled){return true;}break;case'input':if((deviceIsIOS&&target.type==='file')||target.disabled){return true;}break;case'label':case'iframe':case'video':return true;}return(/\bneedsclick\b/).test(target.className);};FastClick.prototype.needsFocus=function(target){switch(target.nodeName.toLowerCase()){case'textarea':return true;case'select':return!deviceIsAndroid;case'input':switch(target.type){case'button':case'checkbox':case'file':case'image':case'radio':case'submit':return false;}return!target.disabled&&!target.readOnly;default:return(/\bneedsfocus\b/).test(target.className);}};FastClick.prototype.sendClick=function(targetElement,event){var clickEvent,touch;if(document.activeElement&&document.activeElement!==targetElement){document.activeElement.blur();}touch=event.changedTouches[0];clickEvent=document.createEvent('MouseEvents');clickEvent.initMouseEvent(this.determineEventType(targetElement),true,true,window,1,touch.screenX,touch.screenY,touch.clientX,touch.clientY,false,false,false,false,0,null);clickEvent.forwardedTouchEvent=true;targetElement.dispatchEvent(clickEvent);};FastClick.prototype.determineEventType=function(targetElement){if(deviceIsAndroid&&targetElement.tagName.toLowerCase()==='select'){return'mousedown';}return'click';};FastClick.prototype.focus=function(targetElement){var length;if(deviceIsIOS&&targetElement.setSelectionRange&&targetElement.type.indexOf('date')!==0&&targetElement.type!=='time'&&targetElement.type!=='month'){length=targetElement.value.length;targetElement.setSelectionRange(length,length);}else{targetElement.focus();}};FastClick.prototype.updateScrollParent=function(targetElement){var scrollParent,parentElement;scrollParent=targetElement.fastClickScrollParent;if(!scrollParent||!scrollParent.contains(targetElement)){parentElement=targetElement;do{if(parentElement.scrollHeight>parentElement.offsetHeight){scrollParent=parentElement;targetElement.fastClickScrollParent=parentElement;break;}parentElement=parentElement.parentElement;}while(parentElement);}if(scrollParent){scrollParent.fastClickLastScrollTop=scrollParent.scrollTop;}};FastClick.prototype.getTargetElementFromEventTarget=function(eventTarget){if(eventTarget.nodeType===Node.TEXT_NODE){return eventTarget.parentNode;}return eventTarget;};FastClick.prototype.onTouchStart=function(event){var targetElement,touch,selection;if(event.targetTouches.length>1){return true;}targetElement=this.getTargetElementFromEventTarget(event.target);touch=event.targetTouches[0];if(deviceIsIOS){selection=window.getSelection();if(selection.rangeCount&&!selection.isCollapsed){return true;}if(!deviceIsIOS4){if(touch.identifier&&touch.identifier===this.lastTouchIdentifier){event.preventDefault();return false;}this.lastTouchIdentifier=touch.identifier;this.updateScrollParent(targetElement);}}this.trackingClick=true;this.trackingClickStart=event.timeStamp;this.targetElement=targetElement;this.touchStartX=touch.pageX;this.touchStartY=touch.pageY;if((event.timeStamp-this.lastClickTime)<this.tapDelay){event.preventDefault();}return true;};FastClick.prototype.touchHasMoved=function(event){var touch=event.changedTouches[0],boundary=this.touchBoundary;if(Math.abs(touch.pageX-this.touchStartX)>boundary||Math.abs(touch.pageY-this.touchStartY)>boundary){return true;}return false;};FastClick.prototype.onTouchMove=function(event){if(!this.trackingClick){return true;}if(this.targetElement!==this.getTargetElementFromEventTarget(event.target)||this.touchHasMoved(event)){this.trackingClick=false;this.targetElement=null;}return true;};FastClick.prototype.findControl=function(labelElement){if(labelElement.control!==undefined){return labelElement.control;}if(labelElement.htmlFor){return document.getElementById(labelElement.htmlFor);}return labelElement.querySelector('button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea');};FastClick.prototype.onTouchEnd=function(event){var forElement,trackingClickStart,targetTagName,scrollParent,touch,targetElement=this.targetElement;if(!this.trackingClick){return true;}if((event.timeStamp-this.lastClickTime)<this.tapDelay){this.cancelNextClick=true;return true;}if((event.timeStamp-this.trackingClickStart)>this.tapTimeout){return true;}this.cancelNextClick=false;this.lastClickTime=event.timeStamp;trackingClickStart=this.trackingClickStart;this.trackingClick=false;this.trackingClickStart=0;if(deviceIsIOSWithBadTarget){touch=event.changedTouches[0];targetElement=document.elementFromPoint(touch.pageX-window.pageXOffset,touch.pageY-window.pageYOffset)||targetElement;targetElement.fastClickScrollParent=this.targetElement.fastClickScrollParent;}targetTagName=targetElement.tagName.toLowerCase();if(targetTagName==='label'){forElement=this.findControl(targetElement);if(forElement){this.focus(targetElement);if(deviceIsAndroid){return false;}targetElement=forElement;}}else if(this.needsFocus(targetElement)){if((event.timeStamp-trackingClickStart)>100||(deviceIsIOS&&window.top!==window&&targetTagName==='input')){this.targetElement=null;return false;}this.focus(targetElement);this.sendClick(targetElement,event);if(!deviceIsIOS||targetTagName!=='select'){this.targetElement=null;event.preventDefault();}return false;}if(deviceIsIOS&&!deviceIsIOS4){scrollParent=targetElement.fastClickScrollParent;if(scrollParent&&scrollParent.fastClickLastScrollTop!==scrollParent.scrollTop){return true;}}if(!this.needsClick(targetElement)){event.preventDefault();this.sendClick(targetElement,event);}return false;};FastClick.prototype.onTouchCancel=function(){this.trackingClick=false;this.targetElement=null;};FastClick.prototype.onMouse=function(event){if(!this.targetElement){return true;}if(event.forwardedTouchEvent){return true;}if(!event.cancelable){return true;}if(!this.needsClick(this.targetElement)||this.cancelNextClick){if(event.stopImmediatePropagation){event.stopImmediatePropagation();}else{event.propagationStopped=true;}event.stopPropagation();event.preventDefault();return false;}return true;};FastClick.prototype.onClick=function(event){var permitted;if(this.trackingClick){this.targetElement=null;this.trackingClick=false;return true;}if(event.target.type==='submit'&&event.detail===0){return true;}permitted=this.onMouse(event);if(!permitted){this.targetElement=null;}return permitted;};FastClick.prototype.destroy=function(){var layer=this.layer;if(deviceIsAndroid){layer.removeEventListener('mouseover',this.onMouse,true);layer.removeEventListener('mousedown',this.onMouse,true);layer.removeEventListener('mouseup',this.onMouse,true);}layer.removeEventListener('click',this.onClick,true);layer.removeEventListener('touchstart',this.onTouchStart,false);layer.removeEventListener('touchmove',this.onTouchMove,false);layer.removeEventListener('touchend',this.onTouchEnd,false);layer.removeEventListener('touchcancel',this.onTouchCancel,false);};FastClick.notNeeded=function(layer){var metaViewport;var chromeVersion;var blackberryVersion;var firefoxVersion;if(typeof window.ontouchstart==='undefined'){return true;}chromeVersion=+(/Chrome\/([0-9]+)/.exec(navigator.userAgent)||[,0])[1];if(chromeVersion){if(deviceIsAndroid){metaViewport=document.querySelector('meta[name=viewport]');if(metaViewport){if(metaViewport.content.indexOf('user-scalable=no')!==-1){return true;}if(chromeVersion>31&&document.documentElement.scrollWidth<=window.outerWidth){return true;}}}else{return true;}}if(deviceIsBlackBerry10){blackberryVersion=navigator.userAgent.match(/Version\/([0-9]*)\.([0-9]*)/);if(blackberryVersion[1]>=10&&blackberryVersion[2]>=3){metaViewport=document.querySelector('meta[name=viewport]');if(metaViewport){if(metaViewport.content.indexOf('user-scalable=no')!==-1){return true;}if(document.documentElement.scrollWidth<=window.outerWidth){return true;}}}}if(layer.style.msTouchAction==='none'||layer.style.touchAction==='manipulation'){return true;}firefoxVersion=+(/Firefox\/([0-9]+)/.exec(navigator.userAgent)||[,0])[1];if(firefoxVersion>=27){metaViewport=document.querySelector('meta[name=viewport]');if(metaViewport&&(metaViewport.content.indexOf('user-scalable=no')!==-1||document.documentElement.scrollWidth<=window.outerWidth)){return true;}}if(layer.style.touchAction==='none'||layer.style.touchAction==='manipulation'){return true;}return false;};FastClick.attach=function(layer,options){return new FastClick(layer,options);};if(typeof define==='function'&&typeof define.amd==='object'&&define.amd){define(function(){return FastClick;});}else if(typeof module!=='undefined'&&module.exports){module.exports=FastClick.attach;module.exports.FastClick=FastClick;}else{window.FastClick=FastClick;}}());