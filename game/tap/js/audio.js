//音频对象
ZhAudio=function(){
	var _audioThis=this;
	this.list={};
	this.currentTime=0;
	this.bgStart=0;
	this.bgEnd=112;
	this.bgCurrentTime=0;
	this.bgPlay=false;
	this.onece=true;
	this.level=0;
	this.audio=document.createElement('audio');
	this.audio.volume=.6;
	this.audio.loop=false;
	this.audio.autoplay=false;
	this.audio.addEventListener('timeupdate',function(){
		_audioThis.timeUpdate(_audioThis);});
	if(typeof(arguments[0]) == 'object'){//使用传递过来的参数定义对象
			for(var key in arguments[0]){
				this[key]=arguments[0][key];
			}
		}	
}
//读取音频配置列表
ZhAudio.prototype.loadList=function(){
	var _This=this;
	this.loadProgress=0;
	this.ZG.ajaxLoad({url:_url,success:function(data){
		var _inList=JSON.parse(data);
		for(i in _inList){
			_This.list.push(_inList[i]);
		}
	}});	
}

ZhAudio.prototype.play=function(sub,level){
	level=level?level:0;
	if(!this.audio.paused && level<=this.level)return;
	if(typeof(sub)=='undefined'){
		//this.audio.currentTime=this.bgCurrentTime;
		this.bgPlay=true;
	}else{
		this.bgCurrentTime=this.bgPlay?this.audio.currentTime:this.bgCurrentTime;
		this.audio.currentTime=this.list[sub].start;
		this.subEnd=this.list[sub].end;
		this.bgPlay=false;
	}
	this.audio.play();
}
//音频线程
ZhAudio.prototype.timeUpdate=function(_audioThis){	
	if(_audioThis.bgPlay){
		if(_audioThis.audio.currentTime>_audioThis.bgEnd){
			_audioThis.audio.play();			
		}

	}else if(_audioThis.audio.currentTime>=_audioThis.subEnd){
		_audioThis.audio.pause();
	}
}
//停止播放
ZhAudio.prototype.pause=function(){
	this.audio.pause();
}
//按时间播放
ZhAudio.prototype.playByTime=function(start,end){
	this.audio.currentTime=start;
	this.subEnd=end;
	this.bgPlay=false;
	this.audio.play();
}
