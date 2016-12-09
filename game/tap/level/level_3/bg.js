//背景视图类
function BackView(){
	ViewBase.call(this);
	if(typeof(arguments[0]) == 'object'){
		for(var key in arguments[0]){
			this[key]=arguments[0][key];
		}
	}
	this.zIndex=0;
	this.set();
	this.addClass('canvasBg');
	this.list=new Array('qinwang','cloud','nuhai','penglai','luwang');
	this.bgImg=this.ZG.res.get('qinwang');
	this.hw=this.bgImg.height/this.bgImg.width;
	this.ZG.reSizeList.push(this);
	this.draw=function(){
		this.ctx.clearRect(0,0,this.width,this.height);
		this.ctx.save();
		this.ctx.fillStyle='#555';
		this.ctx.fillRect(0,0,this.width,this.height);
		this.ctx.drawImage(this.bgImg,0,0,this.bgImg.width,this.bgImg.height,-this.offsetLeft,0,this.dw,this.height);
		this.ctx.restore();

	};
	this.reSize=function(){	
		this.width=this.ZG.innerWidth;
		this.height=this.ZG.offsetHeight;
		this.canvas.width=this.width;
		this.canvas.height=this.height;
		this.dh=parseInt(this.height);
		this.dw=this.dh/this.hw;
		this.offsetLeft=(this.dw-this.width)/2|0;
		this.canvas.style['top']	=	this.ZG.offsetTop+'px';
		this.draw();
	}
	this.shock=function(time,x){	//震动
		this.offsetLeft=(this.dw-this.width)/2+x*time|0;
		this.draw();
		time--;
		var _this=this;
		if(time>=0){
			setTimeout(function(){
				_this.shock(time,x);
			},33);			
		}
		
	}
	this.changeBg=function(bgName){
		var bgName=this.list.shift();
		this.bgImg=this.ZG.res.get(bgName);
		this.list.push(bgName);
		this.hw=this.bgImg.height/this.bgImg.width;
		this.draw();
	}
}
