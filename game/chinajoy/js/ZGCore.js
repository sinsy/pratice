//灼华引擎前置核心功能


var ZGC={};
//自定义ajax对象
ZGC.ajax=function(){
	if(typeof(arguments[0]['url'])=='undefined'){
		console.log('空URL错误');
		return false;
	}

    //成功获取回调函数
	var _success=typeof(arguments[0]['success'])!='undefined'?arguments[0]['success']:function(){};	
	//执行者对象,有时候需要定义回调函数里的对象.
    var _executor=typeof(arguments[0]['executor'])!='undefined'?arguments[0]['executor']:this;
	var _ajax=new (XMLHttpRequest || ActiveXObject);
	var _data=typeof(arguments[0]['data'])!='undefined'?arguments[0]['data']:false;
	
	_ajax.onreadystatechange=function(){
		if (this.readyState == 4 && this.status ==200){ //此时数据可用
			_success.call(_executor,this.responseText);
		}		
	}
	if(_data){
		_ajax.open('POST',arguments[0]['url'],true);
		_ajax.setRequestHeader("X_REQUESTED_WITH", "ZhGame");
		_ajax.send(_data);	//
	}else{
		_ajax.open('get',arguments[0]['url']);
		_ajax.setRequestHeader("X_REQUESTED_WITH", "ZhGame");
		_ajax.send();
	}
}
//自定义错误报告
onerror=function(msg,url,line,col,error){
	var _data=new FormData();
	_data.append('msg',msg);
	_data.append('url',url);
	_data.append('line',line);
	_data.append('col',col);
	if(typeof(localStorage.h5g_did)!='undefined'){
		_data.append('did',localStorage.h5g_did);
	}
	ZGC.ajax({url:'/center/reportErr',data:_data
		,success:function(data){
				//console.log(data);
			}
			});	
	return false;
}

ZGC.loadJs=function(url){
    if(typeof(importScripts)=='undefined'){
        document.write("<script src=\""+url+"\"></script>");
    }else{
        importScripts('level/level_4/'+url);
    }
}

ZGC.weixin=function(){
}

ZGC.weixinPlayer=function(){
    var _this=this;
	this.canvas=document.createElement('canvas');
	this.ctx=this.canvas.getContext('2d');
	this.width=200;
	this.height=80;
	this.x=0;
	this.y=0;
	this.canvas.width=this.width;
	this.canvas.height=this.height;
	this.callback=null;

	this.draw=function(ctx){
	    ctx.drawImage(this.canvas,this.x,this.y);
	}
    this.flushCanvas=function(){
        if(typeof(localStorage['h5g_weixin_headImage'])=='undefined')return;
        var img=new Image();

        img.onload=function(){
            _this.ctx.clearRect(0,0,this.width,this.height);
            _this.ctx.save();
            _this.ctx.fillStyle='rgba(255,255,255,.6)';
            _this.ctx.fillRect(0,0,this.width,this.height);
            _this.ctx.fillStyle='#fff';
            _this.ctx.font="24px Arial";
            _this.ctx.fillText(localStorage['h5g_weixin_nickname'],85,50);
            _this.ctx.translate(this.x+40,this.y+40);
            //this.ctx.rotate();
            _this.ctx.beginPath();
            _this.ctx.moveTo(0,0);
            _this.ctx.arc(0,0,30,0,360);
            _this.ctx.closePath(); // 结束路径
            //_this.ctx.stroke(); // 让线条显示出来
            _this.ctx.fillStyle='#555';
            _this.ctx.clip();
            _this.ctx.fill();
            _this.ctx.drawImage(img,-40,-40,80,80);
            _this.ctx.restore();
        }
        img.src=localStorage['h5g_weixin_headImage'];
    }
    this.flushCanvas();
    //建立微信登录
    this.login=function(){
        new ZGC.ajax({
            'url':'/center/weixinLogin'
            ,'executor':this
            ,'success':function(data){
                _this.loginShowHtml(data);
            }
        })
    }
    this.loginShowHtml=function(data){
        var _box=document.createElement('section');
        _box.setAttribute('id','weixinLogin');
        _box.className='weixin';
        _box.innerHTML=data;
        document.body.appendChild(_box);
        var _sc=document.getElementById('system');
        var _width=_sc.offsetWidth;
        _box['style']['width']=_width+'px';
        var _windowsWidth=document.getElementsByTagName('body')[0].offsetWidth;
        var _offsetLeft=(_windowsWidth-_width)/2|0;
        _box['style']['left']=_offsetLeft+'px';
        var _qr=document.getElementById('qrCodeImage');
        var _eventId=_qr.getAttribute('data-id');
        this.checkEvent(_eventId);
    }
    this.checkEvent=function(eventId){
        new ZGC.ajax({
            'url':'/center/weixinLoginCheck/'+eventId
            ,'executor':this
            ,'success':function(data){
                if(data==''){
                    setTimeout(function(){
                        _this.checkEvent(eventId);
                        console.log('check:'+eventId);
                    },1000);
                }else{
                    console.log(data);
                    var _user=JSON.parse(data);
                    localStorage['h5g_weixin_headImage']=_user.headImage;
                    localStorage['h5g_weixin_nickname']=_user.nickname;
                    localStorage['h5g_weixin_openid']=_user.openId;
                    localStorage['h5g_weixin_uid']=_user.userId;
                    var _section=document.getElementById('weixinLogin');
                    document.body.removeChild(_section);
                    if(this.callBack)this.callBack();
                }
            }
        })
    }
}
//var weixinPlayer=new ZGC.weixinPlayer();
