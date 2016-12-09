//灼华引擎前置核心功能
(function(){
    isWorker=typeof(window)=='undefined'?true:false;
    window=isWorker?self:window;
    var $g=window.$g=window.zhGame=function(){
        return new $g.fn.init();
    };
    $g.fn=$g.prototype={
        init:function(){
        }
        //自定义ajax对象
        ,ajax:function(){
            if(typeof(arguments[0])==='undefined' || typeof(arguments[0]['url'])==='undefined'){
                console.log('空URL错误');
                return false;
            }
            //成功获取回调函数
            var _success=typeof(arguments[0]['success'])!='undefined'?arguments[0]['success']:function(){};
            //执行者对象,有时候需要定义回调函数里的对象.
            var _executor=typeof(arguments[0]['executor'])!='undefined'?arguments[0]['executor']:this;
            var _executor=typeof(arguments[0]['exe'])!='undefined'?arguments[0]['exe']:_executor;
            var _ajax=new (XMLHttpRequest || ActiveXObject);
            var _data=typeof(arguments[0]['data'])!='undefined'?arguments[0]['data']:false;

            _ajax.onreadystatechange=function(){
                if (this.readyState == 4 && this.status ==200){ //此时数据可用
                    _success.call(_executor,this.responseText);
                }
            }
            if(_data){
                var _fd=new FormData();
                for(var i in _data){
                    _fd.append(i,_data[i]);
                }
                _ajax.open('POST',arguments[0]['url'],true);
                _ajax.setRequestHeader("X_REQUESTED_WITH", "ZhGame");
                _ajax.send(_fd);	//
            }else{
                _ajax.open('get',arguments[0]['url']);
                _ajax.setRequestHeader("X_REQUESTED_WITH", "ZhGame");
                _ajax.send();
            }
        }
    }
    $g.fn.init.prototype = $g.fn;
})();
//文档准备好之后开始运行
$g.fn.ready=function(fn){
    if(isWorker)return;
    if(document.addEventListener){//兼容非IE
        document.addEventListener("DOMContentLoaded",function(){
            document.removeEventListener("DOMContentLoaded",arguments.callee,false);
            fn();
        },false);
    }else if(document.attachEvent){//兼容IE
        IEContentLoaded (window, fn);
    }

    function IEContentLoaded (w, fn) {
        var d = w.document, done = false,
        // only fire once
            init = function () {
                if (!done) {
                    done = true;
                    fn();
                }
            };
        // polling for no errors
        (function () {
            try {
                // throws errors until after ondocumentready
                d.documentElement.doScroll('left');
            } catch (e) {
                setTimeout(arguments.callee, 50);
                return;
            }
            init();
        })();
        // trying to always fire before onload
        d.onreadystatechange = function() {
            if (d.readyState == 'complete') {
                d.onreadystatechange = null;
                init();
            }
        };
    }
};

var ZGC={};
//自定义ajax对象
ZGC.ajax=function(){
    $g().ajax(arguments[0]);
}
//自定义错误报告
window.onerror=function(msg,url,line,col,error){
	var _data=new FormData();
	_data.append('msg',msg);
	_data.append('url',url);
	_data.append('line',line);
	_data.append('col',col);
	if(typeof(localStorage.h5g_did)!='undefined'){
		_data.append('did',localStorage.h5g_did);
	}
	$g().ajax({url:'/center/reportErr',data:_data
		,success:function(data){
				console.log(data);
			}
			});	
	return false;
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

	this.draw=function(){
	    this.ctx.drawImage(this.canvas,this.x,this.y);
	}
    this.flushCanvas=function(){
        if(typeof(localStorage['h5g_weixin_headImage'])=='undefined')return;
        var img=new Image();

        img.onload=function(){
            _this.ctx.clearRect(0,0,this.width,this.height);
            _this.ctx.save();
            _this.ctx.fillStyle='rgba(255,255,255,.6)';
            //_this.ctx.fillRect(0,0,this.width,this.height);
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
        $g().ajax({
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
        $g().ajax({
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
var weixinPlayer=new ZGC.weixinPlayer();

document.write("<script src=\"js/spine.js\"></script>");   //
document.write("<script src=\"js/action.js\"></script>");   //
document.write("<script src=\"js/audio.js\"></script>");   //
document.write("<script src=\"js/res.js\"></script>");   //
document.write("<script src=\"js/ui.js\"></script>");   //
document.write("<script src=\"js/viewBase.js\"></script>");   //
document.write("<script src=\"level/level_3/level.js\"></script>");   //