//视图类
function View(){
	ViewBase.call(this,arguments[0]);
	if(typeof(arguments[0]) == 'object'){
		for(var key in arguments[0]){
			this[key]=arguments[0][key];
		}
	}
	this.fps=30;
	this.isLoop=true;
	this.set();
	this.ZG.reSizeList.push(this);
	///this.canvas.id='objCanvas';
    this.ui=new Ui();
    this.am=new ActorManage();

	this.reSize=function(){
        this.canvas.style['position']='absolute';
		if(this.ZG.innerWH>this.wh){//屏幕宽高比跟场景宽高比对比,进行样式适配
			this.canvas.style['height']	=	'100%';
			this.canvas.style['width']	=	'auto';
			this.canvas.style['top']	=	'0px';
		}else{
			this.canvas.style['height']	=	'auto';
			this.canvas.style['width']	=	this.ZG.innerWidth+'px';
			this.canvas.style['top']	=	this.ZG.offsetTop+'px';
		}
		this.offsetWidth=parseInt(this.canvas.offsetWidth);
		this.offsetHeight=parseInt(this.canvas.offsetHeight);
		this.offsetLeft=(this.ZG.innerWidth-this.offsetWidth)/2|0;
		this.canvas.style['left']=this.offsetLeft+'px';		
	}
	this.draw=function(){
		var _start=+new Date();
		this.ctx.clearRect(0,0,this.width,this.height);
        this.am.draw(this.ctx,this.ZG.res);
		Ui.draw.call(this.ui,this.ctx,this.ZG.res);
		this.ctx.save();
		this.threeTime=_start-this.end;	//上次的结束时间减去绘制开始的时间,即为运算差异时间
		this.end=+new Date();
		this.drawTime=this.end-_start;	//现在时间减去绘制开始时间,即为此次绘制时间
		//this.ctx.fillStyle='#fff';
		//this.ctx.font='32px Georgia';
		//this.ctx.fillText('绘制时间: '+this.drawTime,10,1200);
		//this.ctx.fillText('运算时间: '+this.threeTime,10,1240);
		this.ctx.restore();
        for(var i in this.drawList){
            this.drawList[i].draw(this.ctx);
        }
		this.ZG.postMessage({'type':'flushData','data':''});
	}
	this.drawCache=function(obj){
		this.ctx.save();		
		this.ctx.globalAlpha = obj.alpha;
		this.ctx.translate(obj.x,obj.y|0);
		this.ctx.scale(obj.scaleX,obj.scaleY);
		var _canvas=this.ZG.res.cache.get(obj.cId);
		this.ctx.drawImage(_canvas,-_canvas.width/2|0,-_canvas.height/2|0);
		this.ctx.restore();	
		
	}
}
