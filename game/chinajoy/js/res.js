Res=function(){
	if(typeof(arguments[0]) == 'object'){
		for(var key in arguments[0]){
			this[key]=arguments[0][key];
		}
	}
	var _resThis=this;
	this.list=new Array();
	this.eList=new Array();
	this.cache=new Res.Cache();
	this.loadList('level/'+this.levelName+'/res.json');
}
Res.prototype.loadList=function(_url){
	var _resThis=this;
	this.loadProgress=0;
    ZGC.ajax({url:_url,success:function(data){
		var _inList=JSON.parse(data);
		for(i in _inList){
			_resThis.list.push(_inList[i]);
		}
		for(i in _resThis.list){
			_resThis.list[i].extension=_resThis.getExtension(_resThis.list[i].url);
			_resThis.list[i].name=_resThis.getName(_resThis.list[i].url);
		}
		_resThis.load();
	}});
	this.status='none';
}
Res.prototype.load=function(i){
	if(typeof(i)=='undefined')i=0;
	if(i>=this.list.length || i<0){
		this.loadProgress=100;
		this.status='complete';
		this.ZG.message({'type':'loadProgress','loadProgress':100});
		return;
	}
	this.loadProgress=i*(100/this.list.length)|0;
	this.ZG.message({'type':'loadProgress','loadProgress':this.loadProgress,'name':this.list[i].url});
	var _this=this;
	//console.log(this.list[i].url);
	switch(this.list[i].extension){
		case	'jpg':
		case	'png':
			this.loadImg(i);
		break;
		case	'mp3':
		case	'aac':
		case	'ogg':
			this.loadAudio(i);
		break;	
		case	'js':
			this.loadJs(i);
		break;
		case	'ani':
			this.loadAni(i);
		break;
		case	'spine':
			this.loadSpine(i);
		break;
		case	'config':
			this.loadConfig(i);
		break;
		default:
			this.list[i].status='err';
			this.load(i+1);
	}		
}
Res.prototype.loadImg=function(i){
	var _this=this;
	this.list[i].type='img';
	var _element=new Image();
	_element.onload=function(){
		_this.eList.push(this);
		_this.list[i].status='complete';		
		_this.list[i].eId=_this.eList.length-1;
		_this.load(i+1);
		}
	_element.onerror=function(){
		throw('读取图片错误,url:'+_element.src);
	}
	_element.src='level/'+this.levelName+'/res/img/'+this.list[i].url;	
}
Res.prototype.loadAudio=function(i){
	var _this=this;
	this.list[i].type='audio';
	var _element=document.createElement("audio");
	_element.volume=this.list[i].volume?this.list[i].volume:.5;
	_element.loop=this.list[i].loop?this.list[i].loop:false;
	_element.autoplay=this.list[i].autoplay?this.list[i].autoplay:false;
//	var _audio=new CpzAudio();
	function checkLoad(_this){
		if(_element.networkState==1){
			_this.eList.push(_element);
			_this.list[i].status='complete';		
			_this.list[i].eId=_this.eList.length-1;
			if(_this.list[i].name=='bg'){//如果是背景音乐
				//_this.ZG.bgAudio.audio.src='level/'+_this.levelName+'/res/audio/'+_this.list[i].url;
			}else{//否则是效果音乐
				_this.ZG.audio.audio.src='level/'+_this.levelName+'/res/audio/'+_this.list[i].url;
				for(var a in _this.list[i].list){
					_this.ZG.audio.list[_this.list[i].list[a].name]=_this.list[i].list[a];
				}
				_this.list[i].list=_this.ZG.audio.list;//反向设定资源列表为对象
			}
			_this.load(i+1);
		}else{
			//console.log(_this.list[i].url+' 长度: '+_this.list[i].audio.webkitAudioDecodedByteCount);
			setTimeout(function(){
				checkLoad(_this);
			},300);
			}
		}
	_element.src='level/'+this.levelName+'/res/audio/'+this.list[i].url;	
	checkLoad(_this);
}
Res.prototype.loadAni=function(i){
	var resThis=this;
	resThis.list[i].type='animation';

    ZGC.ajax({url:'level/'+this.levelName+'/res/animation/'+this.list[i].name+'.json',success:function(data){
		resThis.list[i].aniData=JSON.parse(data);
		var _element=new Image();
		_element.onload=function(){
			resThis.eList.push(_element);
			resThis.list[i].status='complete';		
			resThis.list[i].eId=resThis.eList.length-1;
			resThis.load(i+1);
		}
		_element.onerror=function(){
			throw('读取动画图片错误,url:'+_element.src);
		}
		_element.src='level/'+resThis.levelName+'/res/animation/'+resThis.list[i].aniData.meta.image;
	}});
	
}
Res.prototype.loadSpine=function(i){
	this.list[i].type='spine';
	this.ZG.zhSpine.load(i,this);
}

Res.prototype.loadConfig=function(i){
	this.list[i].type='config';
    ZGC.ajax({executor:this,url:'/center/getInfo/'+this.list[i].gameId,success:function(data){
		this.list[i].config=JSON.parse(data);
		this.load(i+1);
	}});	
}

Res.prototype.getExtension=function(url){
	return url.substring(url.lastIndexOf('.')+1,url.length)
}
Res.prototype.getName=function(url){
	var _start=url.lastIndexOf('/');
	_start=_start!=-1?_start+1:0;
	return url.substring(_start,url.lastIndexOf('.')-_start)
}
Res.prototype.getResIdByName=function(name,type){
	type=type?type:'img';
	for(var i=0;i<this.list.length;i++){
		if(this.list[i].name==name && this.list[i].type==type)return this.list[i].eId;
	}
	return -1;
}
Res.prototype.getInfoIdByName=function(name,type){
	for(var i=0;i<this.list.length;i++){
		if(this.list[i].name==name)return i;
	}
}
Res.prototype.loadJs=function(i){
	var _resThis=this;
    ZGC.ajax({url:'level/'+this.levelName+'/'+this.list[i].url,success:function(data){
		var _js=document.createElement('script');
		_js.appendChild(document.createTextNode(data));
		//document.body.appendChild(_js);
		_resThis.list[i].status='complete';
		_resThis.load(i+1);
	}});
	
}
Res.prototype.getInfo=function(param,type){
	if(isNaN(param)){
		var _type=type?type:'img';
		param=this.getInfoIdByName(param,_type);	
	}
	return this.list[param];
}
Res.prototype.get=function(param,type){	
	//如果传入的参数不是数字,则为名称字符串,查找对应eId,否则是资源id,直接获得
	if(isNaN(param)){
		var _type=type?type:'img';
		param=this.getResIdByName(param,_type);	
	}
	return this.eList[param];
}
Res.prototype.getFrame=function(elName,frName){
	var _id=this.getInfoIdByName(elName,'animation');
	var _info=this.getInfo(_id,'animation');
	return _info.aniData.frames[frName+'.png'];
	
}
//缓存资源
Res.Cache=function(){
	this.list={};
	
}
Res.Cache.prototype={
	add:function(data){
		var _str=''+data.number;
		var _index='_'+_str;
		_index=data.index?data.index:_index;
		if(typeof(data.cover)!='undefined' && data.cover==true){
			return this.cover(data);
		}
		if(this.get(_index))return _index;	//如果已经有相同数字的缓存,则直接返回索引
		var _aniFun=new Res.aniFun();
		_aniFun.resData=game.res.getInfo('number','animation');
		_aniFun.el=game.res.get('number','animation');
		var _cacheData=_aniFun.make(data);
		
		this.list[_index]=_cacheData;
		return _index;
	}
	,get:function(index){
		if(typeof(this.list[index])!='undefined'){
			return this.list[index];
		}
		return false;
	}
	,del:function(index){
		
	}
	,cover:function(data){
		var _str=''+data.number;
		var _index='_'+_str;
		var _aniFun=new Res.aniFun();
		_aniFun.resData=game.res.getInfo('number','animation');
		_aniFun.el=game.res.get('number','animation');
		return _aniFun.cover(data,this.get(data.index));
	}
}

//精灵图片的功能
Res.aniFun=function(){
	this.resData=null;
	this.el=null;
	this.get=function(index,type){
		type=typeof(type)=='undefined'?'img':type;
		
	}
	
}
Res.aniFun.prototype={
	make:function(){
		var _data=arguments[0];
		switch(_data.type){
			case	'number':
				return this.makeNumber(_data);
			break;
		}
	}
	,makeNumber:function(data){
		var _number=data.number.toString();
		var _l=_number.length;		//字符长度
		for(var i in this.resData.aniData.frames)
		{
			var _frames=this.resData.aniData.frames[i];
			break;
		}
		var _orgW=_frames.sourceSize.w;
		var _orgH=_frames.sourceSize.h;
		var _width=_orgW*_l;
		var canvas=document.createElement('canvas');
		canvas.width=_width;
		canvas.height=_orgH;
		var ctx=canvas.getContext('2d');
		for(var i in _number){
			this.drawChild(_number[i],i,_orgW,ctx,data,canvas);
		}
		if(typeof(data.color)!='undefined'){
			ctx.globalCompositeOperation='source-in';
			ctx.fillStyle=data.color;
			ctx.fillRect(0,0,canvas.width,canvas.height);
		}
		return canvas;
		//game.ctx.drawImage(canvas,10,100);
	}
	,drawChild:function(n,i,w,ctx,data,canvas){
		var _x=w*i;
		var _frames=this.resData.aniData.frames[n+'.png'];
		ctx.save();	
		ctx.fillStyle="#fff";
		ctx.drawImage(
			this.el
			,_frames.frame.x
			,_frames.frame.y
			,_frames.frame.w
			,_frames.frame.h
			,_x
			,0
			,_frames.sourceSize.w
			,_frames.sourceSize.h
		)	
		ctx.restore();
	}
	,cover:function(data,canvas){
		var _str=''+data.number;
		var _index='_'+_str;
		var ctx=canvas.getContext('2d');
		var _number=data.number.toString();
		var _l=_number.length;		//字符长度
		for(var i in this.resData.aniData.frames)
		{
			var _frames=this.resData.aniData.frames[i];
			break;
		}
		var _orgW=_frames.sourceSize.w;
		var _orgH=_frames.sourceSize.h;
		var _width=_orgW*_l;
		canvas.width=_width;
		canvas.height=_orgH;
		for(var i in _number){
			this.drawChild(_number[i],i,_orgW,ctx,data,canvas);
		}
		if(typeof(data.color)!='undefined'){
			ctx.globalCompositeOperation='source-in';
			ctx.fillStyle=data.color;
			ctx.fillRect(0,0,canvas.width,canvas.height);
		}
		return canvas;
	}
}
