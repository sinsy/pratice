//关卡类
document.write("<script src=\"level/level_4/actor.js\"></script>");   //读取演员
document.write("<script src=\"level/level_4/view.js\"></script>");    //读取显示舞台
document.write("<script src=\"level/level_4/bg.js\"></script>");    //读取背景舞台

Level=function(){
	if(typeof(arguments[0]) == 'object'){//使用传递过来的参数定义对象
		for(var key in arguments[0]){
			this[key]=arguments[0][key];
		}
	}
    this.viewFront=new View({ZG:this.ZG,'width':this.width,'height':this.height});  //前景画板
    this.bv=new BackView({ZG:this.ZG,'width':this.width,'height':this.height}); //背景画板
    this.sv=new View({ZG:this.ZG,'width':this.width,'height':this.height,canvas:this.ZG.canvas,zIndex:999}); //系统画板
	this.init();
}

//接收worker传递回来的信息
Level.prototype.onMessage=function(e){
    var _r=JSON.parse(e.data);
    switch(_r.type){
        case	'changeData':

            this.sv.ui=_r.data.ui2;
            //this.sv.am.list=_r.data.am.list;
            this.viewFront.ui=_r.data.ui;
            this.viewFront.am.list=_r.data.am.list;
        break;
        case	'gameOver':
            this.gameOver();
        break;
        case	'getInfo':
            this.sendInfo();
        break;
        case	'gameStart':
            this.gameStart();
        break;
        case	'gamePause':
            this.gamePause();
        break;
        case    'alert':
            this.popAlert(_r.data);
        break;
        case    'wxSet':
            this.wxSet(_r.data);
        break;
        case    'popWindow':
            this.popWindow();
        break;
        case    'saveData':
            this.saveData(_r.data);
        break;
    }
}

Level.prototype.init=function(){
	var levelThis=this;
	this.ZG.reSet();
	this.ZG.worker.onmessage=function(e){	
		levelThis.onMessage.call(levelThis,e);
	}	
	//覆盖默认点击事件
	levelThis.ZG.canvas.addEventListener('click',function(e){
		var _point=levelThis.ZG.getMouse(e);
		data={'event':'click',point:_point};
		levelThis.ZG.postMessage({'type':'event','data':JSON.stringify(data)});	
	});
    wxData={};
    wxData.title='我参加了盗墓OL的ChinaJoy活动!';
    wxData.url='http://mp.weixin.qq.com/s?__biz=MzA5MjU5MzQyNA==&mid=208268379&idx=1&sn=859f3a0eb3a1b612eb883c98a4cc04f5#rd';
    wxData.imageUrl='http://www.daomuol.com/storage/game/chinajoy/ico_114.png';
    //wxData.imageUrl=this.ZG.res.list[0].config['ico_144'];
    wx.ready(function () {
        wx.onMenuShareTimeline({
            title: wxData.title, // 分享标题
            link: wxData.url, // 分享链接
            imgUrl: wxData.imageUrl, // 分享图标
            success: function () {
                alert('已经分享');// 用户确认分享后执行的回调函数
            },
            cancel: function () {
                alert('取消分享');// 用户取消分享后执行的回调函数
            }
        });
    });

}
Level.prototype.sendInfo=function(){
	//传递给后台线程配置信息.
	var _data={};
	_data.width=this.width;
	_data.height=this.height;
	_data.resList=this.ZG.res.list;
    _data.gid=this.ZG.gid;
    _data.localStorage=localStorage;
	this.ZG.postMessage({'type':'info','data':JSON.stringify(_data)});

}
Level.prototype.gameStart=function(){
    this.checkSave();
	this.viewFront.start();
    this.bv.start();
    this.sv.start();
}
Level.prototype.gameOver=function(){
	this.ZG.gameOver();
}
Level.prototype.gamePause=function(){
	this.viewFront.stop();
    this.bv.stop();
    this.sv.stop();
}
//自定义信息处理
Level.prototype.message=function(){
	var m=arguments[0];
	switch(m.type){
		case	'reSize':
			//this.ZG.send({to:this.viewBg,message:{'type':'reSize'}});
		break;
	}	
}

Level.prototype.popAlert=function(data){
    alert(data.msg);
}
//设置微信数据
Level.prototype.wxSet=function(data){
    var _this=this;
    //wxData.title='恭喜你中了 '+data.name+' ,分享朋友圈之后即可领奖哦!';
    wxData.title='恭喜你中了 '+data.name+'，《盗墓OL》在ChinaJoy，速度来领奖！';
    wx.onMenuShareTimeline({
        title: wxData.title, // 分享标题
        link: wxData.url, // 分享链接
        imgUrl: wxData.imageUrl, // 分享图标
        success: function () {
            _this.ZG.postMessage({'type':'shareOk','data':''});
        },
        cancel: function () {
            _this.ZG.postMessage({'type':'shareNo','data':''});
        }
    });
}

Level.prototype.popWindow=function(){
    var _mask=document.getElementById('mask');
    _mask.style['display']='block';
}

Level.prototype.saveData=function(data){
    var _saveData=JSON.stringify(data);
    localStorage.h5g_4=_saveData;
}

Level.prototype.checkSave=function(){
    if(typeof(localStorage.h5g_4)!='undefined'){
        var _data=JSON.parse(localStorage.h5g_4);
        this.wxSet(_data);
        this.ZG.postMessage({'type':'sendSaveData','data':localStorage.h5g_4});
        alert('您已经摇中 '+_data.name+',请直接找工作人员领奖.');
    }
}