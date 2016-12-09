//视图类
function View(){
	ViewBase.call(this);
	if(typeof(arguments[0]) == 'object'){
		for(var key in arguments[0]){
			this[key]=arguments[0][key];
		}
	}
	this.fps=30;
	this.isLoop=true;
	this.addClass('canvasCenter');
	this.set();
	this.ZG.reSizeList.push(this);
	this.canvas.id='objCanvas';
	this.damageList=[];

	this.reSize=function(){
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
		//var _start=+new Date();
		this.ctx.clearRect(0,0,this.width,this.height);		
		this.drawSpine();
		var _l=this.aniList.length;
		while(_l){
			_l--;
			if(typeof(this.aniList[_l].spine)!='undefined'){
				var i=null;
			}else if(this.aniList[_l].cId!=null){
				this.drawCache(this.aniList[_l]);
			}else if(this.aniList[_l].fPoint==-1){
				
			}else{
				this.drawObj(this.aniList[_l]);
			}
		}
        var _l=this.drawList.length;
        while(_l){
            _l--;
            this.drawList[_l].draw();
        }
		this.ctx.save();
		//this.threeTime=_start-this.end;	//上次的结束时间减去绘制开始的时间,即为运算差异时间
		//this.end=+new Date();
		//this.drawTime=this.end-_start;	//现在时间减去绘制开始时间,即为此次绘制时间
		//this.ctx.fillStyle='#fff';
		//this.ctx.font='32px Georgia';
        //this.ctx.fillText('绘制时间: '+this.drawTime,10,30);
		//this.ctx.fillText('攻击力: '+this.hero.damage,10,1120);
		//this.ctx.fillText('暴击几率: '+this.hero.violent,10,1160);
		//this.ctx.fillText('绘制时间: '+this.drawTime,10,1200);
		//this.ctx.fillText('运算时间: '+this.threeTime,10,1240);
		//this.ctx.fillText('点击次数: '+this.score.clickCount,this.width/2|0,1120);
		//this.wxp.draw(this.ctx);
		//this.ctx.drawImage(this.wxp.canvas,0,0);
		this.ctx.restore();
        //for(var i in this.drawList){
        //    this.drawList[i].draw(this.ctx);
        //}
        this.ZG.postMessage({'type':'flushData'});
	}
	this.drawObj=function(obj){
		this.ctx.save();
		this.ctx.translate(obj.x,obj.y);
        this.ctx.scale(obj.scaleX,obj.scaleY);
		this.ctx.rotate(obj.angle);
		this.ctx.globalAlpha = obj.alpha;
		this.ctx.drawImage(this.ZG.res.get(obj.eId),obj.sx,obj.sy,obj.sw,obj.sh,obj.dx,obj.dy,obj.dw,obj.dh);
		this.ctx.fillStyle='#fff';
		this.ctx.restore();
		
	}
	this.drawSpine=function(){
		var _list=this.ZG.zhSpine.drawList;
		var _l=_list.length;
		while(_l){
			_l--;
			_list[_l].update();
			_list[_l].render(this.ctx,this.ZG.res);
		}
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
	this.drawDamage=function(){
		this.ctx.save();		
		for(var i in this.damageList){
			var obj=this.damageList[i];
			this.ctx.save();
			this.ctx.globalAlpha = obj.alpha;
			this.ctx.translate(obj.x,obj.y|0);
			this.ctx.scale(obj.scaleX,obj.scaleY);
			var _canvas=this.ZG.res.cache.get(obj.cId);
			this.ctx.drawImage(_canvas,-_canvas.width/2|0,-_canvas.height/2|0);
			this.ctx.restore();
		}
		this.ctx.restore();	
	}
}
