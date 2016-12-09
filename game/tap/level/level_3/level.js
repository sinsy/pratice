//关卡类
//console.log('level.js');
document.write("<script src=\"level/level_3/actor.js\"></script>");   //读取演员
document.write("<script src=\"level/level_3/view.js\"></script>");    //读取显示舞台
document.write("<script src=\"level/level_3/systemView.js\"></script>");    //读取系统显示
document.write("<script src=\"level/level_3/bg.js\"></script>");    //读取背景舞台
//
Level=function(){
	if(typeof(arguments[0]) == 'object'){//使用传递过来的参数定义对象
		for(var key in arguments[0]){
			this[key]=arguments[0][key];
		}
	}
	this.init();
};

//接收worker传递回来的信息
Level.prototype.onMessage=function(e){
	var _this=this;
    try{
        var _r=JSON.parse(e.data);
    }catch(e){
        return;
    }
		switch(_r.type){
			case	'changeData':
				_this.viewFront.score=_r.data.score;
				_this.viewFront.aniList=_r.data.aniList;
				//this.formatActor();
				this.viewFront.monster=_r.data.monster;
				this.viewFront.hero=_r.data.hero;
                _this.sv.ui.data=_r.data.uiData;
				_this.sv.ui.data.list.goldNumber.cId=this.ZG.res.cache.cover({index:'goldNumber','number':this.viewFront.hero.gold,'type':'number',color:'#fbdc82'});
				_this.formatActor();
			break;
			case	'makeDamage':
				_this.makeDamage(_r.data);
			break;
			case	'delDamage':
				this.delDamage(_r.data);
			break;
			case	'playAudio':
				_this.playAudio(_r);
			break;
			case	'gameOver':
				_this.gameOver();
			break;
			case	'getInfo':
				_this.sendInfo();
			break;
			case	'gameStart':
				_this.gameStart();
			break;
			case	'gamePause':
				_this.gamePause();
			break;
			case	'flushBg':
				_this.viewBg.draw(_this.viewBg);
			break;
			case	'onHit':
				_this.onHit();
			break;
			case	'makeSpine':
				_this.makeSpine(_r.data);
			break;
			case	'delSpine':
				this.delSpine(_r.data);
			break;
            case    'setSpine':
                this.setSpine(_r.data);
            break;
			case	'setSpineAnimation':
				_this.setSpineAnimation(_r.data);
			break;
			case	'serialize':
				this.serialize(_r.data);
			break;
			case	'unserialize':
				this.unserialize();
			break;
			case	'bgShock':
				this.viewBg.shock(3,2);
			break;
			case	'changeBg':
				this.viewBg.changeBg();
			break;
			case	'synchronous':
				this.ZG.synchronous();
			break;
            case    'popWindow':
                this.popWindow();
                break;
			//必须处理的保留部分,考虑主引擎建立收尾机制
			case 'workError':
				onerror(_r.data.msg,_r.data.url,_r.data.line,_r.data.col);
			break;
            case    'alert':
                this.popAlert(_r.data);
            break;
		}	
}

Level.prototype.formatActor=function(){
	var _list=this.viewFront.aniList;
	for(var i in _list){
		if(_list[i].spineId!=-1){
			this.setSpineAttr(this.ZG.zhSpine.list[_list[i].spineId],_list[i]);
		}
	}
}
Level.prototype.setSpineAttr=function(spine,obj){
	if(typeof(spine)=='undefined')return;
	spine.x=obj.x;
	spine.y=obj.y;
}
Level.prototype.init=function(){
	var levelThis=this;
    this.viewFront=new View({ZG:this.ZG,'width':this.width,'height':this.height});
    this.viewBg=new BackView({ZG:this.ZG,'width':this.ZG.innerWidth,'height':this.ZG.innerHeight});
    this.sv=new systemView({ZG:this.ZG,'width':this.width,'height':this.height,canvas:this.ZG.canvas,fps:200,zIndex:99});
    this.sv.ui=Ui();
    this.sv.add(this.sv.ui);
    this.sv.add(weixinPlayer);
	this.ZG.reSet();
	this.ZG.worker.onmessage=function(e){	
		levelThis.onMessage.call(levelThis,e);
	};
	//覆盖默认点击事件
    var eventName=typeof(window.event)!='undefined' && typeof(window.event.touches)!='undefined'?'touchstart':'click';
    levelThis.ZG.canvas.removeEventListener(eventName,bindFun);
	levelThis.ZG.canvas.addEventListener(eventName,function(e){
        levelThis.playAudio({"data":"swing1","level":"1"});
		var _point=levelThis.ZG.getMouse(e);
		data={'event':'click',point:_point};
		levelThis.ZG.postMessage({'type':'event','data':JSON.stringify(data)});	
	});
	this.ZG.res.cache.add({'index':'goldNumber','number':0,'type':'number',color:'rgba(200,100,0,1)'});
	this.ZG.serialize=this.serialize;

};
Level.prototype.sendInfo=function(){
	//传递给后台线程配置信息.
	var _data={};
	_data.width=this.width;
	_data.height=this.height;
	_data.resList=this.ZG.res.list;
	this.ZG.postMessage({'type':'info','data':JSON.stringify(_data)});
};
Level.prototype.playAudio=function(r){
		level=r.level?r.level:0;
		this.ZG.audio.play(r.data,level);
};
Level.prototype.gameStart=function(){
	this.viewFront.start();
	this.viewBg.start();
    this.sv.start();
};
Level.prototype.gameOver=function(){
    //window.onfocus=null;    //删去系统响应事件
    //this.gamePause();
    this.viewFront.stop();
    this.viewBg.stop();
    this.sv.fps=30;
    //this.sv.start();
    this.popWindow();
};
Level.prototype.gamePause=function(){
	this.viewFront.stop();
	this.viewBg.stop();
    this.sv.stop();
};
//自定义信息处理
Level.prototype.message=function(){
	var m=arguments[0];
	switch(m.type){
		case	'reSize':
			this.ZG.send({to:this.viewBg,message:{'type':'reSize'}});
		break;
	}	
};

//建立spine对象
Level.prototype.makeSpine=function(data){
	var _id=null;
    var _active=typeof(data.active)!="undefined"?data.active:true;
	_id=this.ZG.zhSpine.make({'name':data.name
        ,'infoName':data.spine
        ,action:data.action
        ,scale:data.scale
        ,active:_active});
    var spine=this.ZG.zhSpine.list[_id];
    if(typeof(data.skins)!="undefined" && data.spine!=data.skins){
        spine.eId=this.ZG.res.getResIdByName(data.skins);
    }
	var _r={};
	_r.tag=data.tag;
	_r.spineId=_id;
    _r.id=data.id;
	this.ZG.postMessage({'type':'bindSpine','data':JSON.stringify(_r)});
};
//设置spine对象动作
Level.prototype.setSpineAnimation=function(data){
	var _f='setAnimationByName';
	var _l=0;
	
	for(var i in data.list){
		if(_l==0){
			this.ZG.zhSpine.list[data.spineId].state.setAnimationByName(0, data.list[i].action,data.list[i].loop);
		}else{
			this.ZG.zhSpine.list[data.spineId].state.addAnimationByName(0, data.list[i].action, data.list[i].loop,0);
		}		
		_f='addAnimationByName';
		_l++;
	}
};
Level.prototype.setSpine=function(data){
    var _spine=this.ZG.zhSpine.list[data.spineId];
    for(var i in data.attr){
        _spine[i]=data.attr[i];
    }
};
//建立伤害对象
Level.prototype.makeDamage=function(data){
	var _r={};
	_r.cId=this.ZG.res.cache.add({'number':data.damage,'type':'number',color:'rgba(250,0,0,1)'});
	_r.isViolent=data.isViolent;
	if(_r.isViolent){
		this.viewBg.shock(3,4);
	}
	this.ZG.postMessage({'type':'bindDamage','data':JSON.stringify(_r)});	
};
//删除伤害对象
Level.prototype.delDamage=function(data){
	delete this.viewFront.damageList[data.id];	
};
//删除spine对象
Level.prototype.delSpine=function(data){
	this.ZG.zhSpine.del(data.spineId);
};

//关卡定义串行化
Level.prototype.serialize=function(data){
	if(typeof(data)=='undefined'){
		this.ZG.postMessage({'type':'serialize','data':''});
		return;
	}
    wxData={};
    wxData.title='我在<点击盗墓>中获得了'+data.hero.gold+'分,击败了'+data.score.monsterCount+'个怪物,共点击'+data.score.clickCount+'下,来比比吧!';
    wxData.url=document.href;
    wxData.imageUrl='http://www.daomuol.com/storage/game/tap/ico_114.jpg';
    wx.ready(function () {
        wx.onMenuShareTimeline({
            title: wxData.title, // 分享标题
            link: wxData.url, // 分享链接
            imgUrl: wxData.imageUrl, // 分享图标
            success: function () {
                //alert('已经分享');// 用户确认分享后执行的回调函数
            },
            cancel: function () {
                //alert('取消分享');// 用户取消分享后执行的回调函数
            }
        });
    });

    if(typeof(localStorage['h5g_weixin_uid'])!='undefined')data.uid=localStorage['h5g_weixin_uid'];
    if(typeof(localStorage['h5g_did'])!='undefined')data.uid=localStorage['h5g_did'];
	localStorage['h5g_'+data.gid]=JSON.stringify(data);	
	this.ZG.save();
};
//关卡恢复串行
Level.prototype.unserialize=function(){
	this.ZG.postMessage({'type':'unserialize','data':localStorage['h5g_'+this.ZG.gid]});
};
Level.prototype.popWindow=function(){
    var _mask=document.getElementById('mask');
    _mask.style['display']='block';
    var _weixin=document.getElementById('weixinImg');
    _weixin.style['display']='block';
};
Level.prototype.popAlert=function(data){
    alert(data.msg);
}

Level.prototype.autoClick=function(){
    var _this=this;
    var _point={x:200,y:400};
    data={'event':'click',point:_point};
    _this.ZG.postMessage({'type':'event','data':JSON.stringify(data)});
    setTimeout(function(){
        Level.prototype.autoClick.call(_this);
    },200);
}