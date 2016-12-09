//UI对象
Ui=function(){
	this.list={};
	this.dList=[];
	this.eId=null;
}
Ui.prototype={
	make:function(){
		var _el=new Ui[arguments[0]['type']](arguments[0]);
		if(typeof(arguments[0]['index'])=='undefined'){
			_index=_el.tag;
		}else{
			_index=arguments[0]['index'];
		}
		if(_el.t!=null){
			var _arr=_el.t;
			_el.t={};
			var _l=_arr.length;
			while(_l){
				_l--;
				var _text=new Ui.text(_arr[_l]);
				_el.t[_text.tag]=_text;
			}
		}
		_el.eId=this.eId;
		this.list[_index]=_el;
		this.flushDrawList();
		return _el;
	}
	,del:function(index){
        this.list[index].delClick();
        delete this.list[index];
        for(var i in this.dList){
            if(this.dList[i]==index){

                this.dList.splice(i,1);
                return;
            }
        }
    }
	,flushDrawList:function(){//按照绘制顺序排序
		this.dList=[];
		for(var i in this.list){
			this.dList.push(i);
		}
		var _this=this;
		this.dList.sort(function(a,b){
			return _this.list[b].z-_this.list[a].z;
		});
	}
	,update:function(){
		var _l=this.dList.length;
		while(_l){
			_l--;
			var _el=this.list[this.dList[_l]];
			if(typeof(_el.upData)!='undefined')_el.upData();
			
		}
	}
}
Ui.draw=function(ctx,res){
		var _l=this.dList.length;
		while(_l){
			_l--;
			var _el=this.list[this.dList[_l]];
			if(!_el.active)continue;
			try{
				if(typeof(_el.draw)!='undefined'){
					_el.draw(ctx,res);
				}else{
					Ui[_el.type].draw.call(_el,ctx,res);
				}
			}catch(e){
				console.log('UI绘制错误,索引:%s',this.dList[_l]);
			}
			
		}
	}
Ui.base=function(){	
	this.x=0;
	this.y=0;
	this.offsetX=0;
	this.offsetY=0;
	this.width=0;
	this.height=0;
    this.scaleX=1;
    this.scaleY=1;
	this.z=0;
	this.text='';
	this.t=null;		
	this.textAlign='left';
	this.textX=0;
	this.textY=0;
	this.font='24px Georgia';
	this.active=true;
	this.isLock=false;		//锁定
	this.isReady=true;		//技能准备好
	this.bColor='';
	this.fColor='';
	this.drawType='';
	this.change=true;
    this.fpoint=-1;
	var _n1=Math.random()*100|0;
	var _n2=Math.random()*100|0;
	this.tag=+new Date();
	this.tag='_'+this.tag+'_'+_n1+'_'+_n2;
	if(typeof(arguments[0]) == 'object'){//使用传递过来的参数定义对象
		for(var key in arguments[0]){
			this[key]=arguments[0][key];
		}
	}
	
	this.bindClick=function(){
		click.add({'el':this});
	}
    this.delClick=function(){
        click.del({'el':this});
    }
	if(typeof(this.f)!='undefined')this.bindClick();
	this.checkClick=function(point){
		if(this.active==false || this.width==0 || this.height==0)return false;
        var _x=this.x+this.offsetX;
        var _y=this.y+this.offsetY;
		if(point.x>_x
			&& point.y>_y
			&& point.x<(_x+this.width)
			&& point.y<(_y+this.height)){
			this.funRout();
			return true;
		}
		return false;		
	}
	this.set=function(){
		if(typeof(arguments[0]) == 'object'){//使用传递过来的参数定义对象
			for(var key in arguments[0]){
				this[key]=arguments[0][key];
			}
		}
		this.change=true;
	}
	this.funRout=function(){
		//console.log('事件路由进入');
		if(this.isLock==true){
			Ui.base.unlock.call(this);
			return;
		}
		if(this.isReady==true && typeof(this.f)!='undefined'){
				this.f.call(this);
				return;
			}
	}
    this.getMeta=function(name){
        if(typeof(name)=='undefined')name=this.aniName;
        if(name=='')return;
        this.rId	=	res.getInfoIdByName(name,'animation');	//explosion1
        this.frames	=	res.list[this.rId].aniData.frames;
        this.meta		=	res.list[this.rId].aniData.meta;
        this.eId		=	res.list[this.rId].eId;
        this.fPoint		=	this.fPoint?this.fPoint:0;
    }
    this.setDrawData=function(){//重新设置绘制的精灵坐标
        if(this.passedPoint==this.fPoint  )return;
        this.passedPoint=this.fPoint;
        this.frame=this.frames[(this.fPoint)+'.png'];
        if(typeof(this.frame)=='undefined')return;
        this.frameOffsetX=this.meta.offsetX?parseInt(this.meta.offsetX):0;
        this.frameOffsetY=this.meta.offsetY?parseInt(this.meta.offsetY):0;
        this.sx=this.frame.frame.x;
        this.sy=this.frame.frame.y;
        this.sw=this.frame.frame.w;
        this.sh=this.frame.frame.h;
        this.dx=(this.frame.spriteSourceSize.x+this.frameOffsetX+this.offsetX)*this.meta.scale|0;
        this.dy=(this.frame.spriteSourceSize.y+this.frameOffsetY+this.offsetY)*this.meta.scale|0;
        this.dw=this.sw*this.meta.scale|0;
        this.dh=this.sh*this.meta.scale|0;
    }
    this.setFrame=function(loopTime,loop){
        loop=typeof(loop)=='undefined'?true:loop;
        if(loop){
            action.add(this,{'type':'Frame',time:loopTime,'loop':loop});
        }else{
            action.add(this,{'type':'Frame',time:loopTime,'loop':loop,f:function(){
                this.delSelf();
            }});
        }

    }
    this.setFpoint=function(f){
        this.fPoint=f;
    }
}
Ui.base.unlock=function(){
	if(!isNaN(this.unlockGold)){
		if(hero.gold<this.unlockGold)return;
		hero.gold-=this.unlockGold;
	}
	this.isLock=false;
	//this.isReady=false;
	Ui.base.coolDown.call(this);
}
Ui.base.coolDown=function(){
	action.add(this,{'type':'CoolDown'
		,time:this.coolDownTime
		,data:{value:0}
		,f:function(){
			this.isReady=true;
			console.log('按钮倒计时完毕!');
		}})
}
Ui.text=function(){
	this.x=0;
	this.y=0;
	this.text='';
	this.width=0;
	this.height=0;
	this.textAlign='left';
	this.fillStyle='#000';
	this.font='14px';
	this.strokeStyle='';
	var _n1=Math.random()*100|0;
	var _n2=Math.random()*100|0;
	this.tag=+new Date();
	this.tag='_'+this.tag+'_'+_n1+'_'+_n2;
	if(typeof(arguments[0]) == 'object'){//使用传递过来的参数定义对象
		for(var key in arguments[0]){
			this[key]=arguments[0][key];
		}
	}
	
}
Ui.text.draw=function(ctx){	
	ctx.save();
	ctx.translate(this.x,this.y);
	for(var i in this.t){
		var _t=this.t[i];
		ctx.save();
		ctx.textAlign=_t.textAlign;
		ctx.fillStyle=_t.fillStyle;
		ctx.font=_t.font;
		ctx.fillText(_t.text,_t.x,_t.y);		
		ctx.restore();		
	}
	ctx.restore();
}
Ui.text.prototype={
	addTo:function(el){
		el.t[this.tag]=this;
	}
}
Ui.base.draw=function(ctx,res){
			ctx.save();			
			var _width=this.width;
			var _height=this.height;
			ctx.translate(this.x,this.y);
			if(this.bColor!=''){
				ctx.fillStyle=this.bColor;
				ctx.fillRect(0,0,_width,_height);	
			}
			if(this.fColor!=''){
				ctx.fillStyle=this.fColor;
				ctx.fillRect(0,0,_width*this.ratio|0,_height);
			}
			if(this.text!=''){
				if(this.textAlign=='center'){
					this.textX=this.width/2|0;	
				}
				this.textY=(this.height-24)/2+24|0;
				ctx.textAlign=this.textAlign;
				ctx.fillStyle=this.color;
				ctx.font=this.font;
				ctx.fillText(this.text,this.textX,this.textY);
			}
			if(this.index=='hpBar'){
				ctx.textAlign='right';
				ctx.fillText(this.value+'/'+this.valueMax,this.width-10,28);		
			}
			if(typeof(this.frames)!='undefined'){
				ctx.drawImage(res.eList[this.eId]
					,this.frames.frame.x
					,this.frames.frame.y
					,this.frames.frame.w
					,this.frames.frame.h
					,0,0
					,this.frames.sourceSize.w
					,this.frames.sourceSize.h
				)
			}
			if(typeof(this.cId)!='undefined' && this.cId!=-1){		
				ctx.save();
				//ctx.globalAlpha = _el.alpha;
				ctx.translate(this.x,this.y|0);
				ctx.scale(this.scaleX,this.scaleY);
				var _canvas=this.cId;
				ctx.drawImage(_canvas,0,0);
				ctx.restore();	
			}
		ctx.restore();	
	}
Ui.base.drawText=function(ctx,res){
	
}
Ui.bar=function(){
	this.valueMax=0;
	this.value=0;
	this.height=32;

	this.color='#fff';
	Ui.base.call(this,arguments[0]);
	this.upData();
	
	return this;
}
Ui.bar.draw=function(ctx,res){
		switch(this.drawType){
			case	'double':
				Ui.bar.double.call(this,ctx,res);
			break;
			default:
				Ui.bar.drawDefault.call(this,ctx,res);
			break;
		}
		Ui.text.draw.call(this,ctx);
	}
Ui.bar.drawDefault=function(ctx,res){
		ctx.save();			
		var _width=this.width;
		var _height=this.height;
		ctx.translate(this.x,this.y);
		if(this.bColor!=''){
			ctx.fillStyle=this.bColor;
			ctx.fillRect(0,0,_width,_height);	
		}
		if(this.fColor!=''){
			ctx.fillStyle=this.fColor;
			ctx.fillRect(0,0,_width*this.ratio|0,_height);
		}
		ctx.restore();
	}
Ui.bar.double=function(ctx,res){	//绘制双层bar
		ctx.save();			
		var _width=this.width;
		var _height=this.height;
		ctx.translate(this.x,this.y);
		if(this.bColor!=''){
			ctx.fillStyle=this.bColor;
			ctx.fillRect(0,0,_width,_height);	
		}
		if(this.fColor!=''){
			ctx.fillStyle=this.fColor;
			ctx.fillRect(0,0,_width*this.ratio|0,_height);
		}

		ctx.restore();	
	}
Ui.bar.prototype={
	
}
//静态ui
Ui.static=function(){
    this.aniName='ui';
	Ui.base.call(this,arguments[0]);
    if(this.fPoint!=-1){
        this.getMeta();
        this.setFpoint(this.fPoint);
        this.setDrawData();
    }

}

Ui.static.draw=function(ctx,res){
		switch(this.drawType){
			case	'coolDown':
				Ui.static.coolDown.call(this,ctx,res);
			break;
			default:
				Ui.static.drawDefault.call(this,ctx,res);
			break;
		}	
		//Ui.text.draw.call(this,ctx);
	}
Ui.static.coolDown=function(ctx,res){
	ctx.save();
	ctx.translate(this.x,this.y);
	ctx.fillStyle='rgba(255,255,255,.6)';
	var _arcRadian=360*1* (Math.PI / 180)
	ctx.beginPath();
	ctx.moveTo(0,0);
	ctx.arc(this.width/2|0,this.height/2|0,this.width/2|0,0,_arcRadian);
	ctx.closePath(); // 结束路径
	ctx.clip();
	ctx.fill();
	if(typeof(this.frames)!='undefined'){
			ctx.drawImage(res.eList[this.eId]
				,this.frames.frame.x
				,this.frames.frame.y
				,this.frames.frame.w
				,this.frames.frame.h
				,0,0
				,this.frames.sourceSize.w
				,this.frames.sourceSize.h
			)
		}
	if(typeof(this.cId)!='undefined' && this.cId!=-1){		
			ctx.save();
			//ctx.globalAlpha = _el.alpha;
			//ctx.translate(this.x,this.y|0);
			ctx.scale(this.scaleX,this.scaleY);
			var _canvas=this.cId;
			ctx.drawImage(_canvas,0,0);
			ctx.restore();	
		}
	ctx.fillStyle='rgba(0,0,0,.6)';
	ctx.translate(this.width/2|0,this.height/2|0);
	var _arcRadian=360*(1-this.ratio)* (Math.PI / 180);
	ctx.rotate(-90*Math.PI/180);
	ctx.beginPath();
	ctx.moveTo(0,0);
	ctx.arc(0,0,this.width/2|0,_arcRadian,0,false);
	ctx.closePath(); // 结束路径
	ctx.fill();
	ctx.restore();
}
Ui.static.drawDefault=function(ctx,res){
    var obj=this;
    ctx.save();
    ctx.translate(obj.x,obj.y);
    ctx.scale(obj.scaleX,obj.scaleY);
    ctx.rotate(obj.angle);
    ctx.globalAlpha = obj.alpha;
    ctx.drawImage(res.get(obj.eId),obj.sx,obj.sy,obj.sw,obj.sh,obj.dx,obj.dy,obj.dw,obj.dh);
    ctx.restore();
    for(var i in this.t){
        var _t=this.t[i];
        ctx.save();
        ctx.translate(_t.x,_t.y);
        ctx.textAlign=_t.textAlign;
        ctx.fillStyle=_t.fillStyle;
        ctx.font=_t.font;
        ctx.fillText(_t.text,0,0);
        ctx.restore();
    }
}
Ui.static.drawLock=function(ctx,res){
	ctx.save();
	ctx.translate(this.x,this.y|0);
	//ctx.fillText('锁定',20,20);
	if(typeof(this.frameLock)!='undefined'){
			ctx.drawImage(res.eList[this.eId]
				,this.frameLock.frame.x
				,this.frameLock.frame.y
				,this.frameLock.frame.w
				,this.frameLock.frame.h
				,0,0
				,this.frameLock.sourceSize.w
				,this.frameLock.sourceSize.h
			)
		}
	ctx.fillStyle='rgba(215, 215, 8, .9)';
	ctx.font='24px Georgia';
	ctx.fillText('G:'+this.unlockGold,0,this.height+24);
	ctx.restore();	
}
//ui组
Ui.group=function(){
	Ui.base.call(this,arguments[0]);
	this.child=[];
	this.isChange=false;
	
}
Ui.group.draw=function(ctx,res){
		ctx.save();			
		var _width=this.width;
		var _height=this.height;
		ctx.translate(this.x,this.y);
		if(this.bColor!=''){
			ctx.fillStyle=this.bColor;
			ctx.fillRect(0,0,_width,_height);	
		}
		if(this.fColor!=''){
			ctx.fillStyle=this.fColor;
			ctx.fillRect(0,0,_width*this.ratio|0,_height);
		}
		if(this.text!=''){
			if(this.textAlign=='center'){
				this.textX=this.width/2|0;	
			}
			this.textY=(this.height-24)/2+24|0;
			ctx.textAlign=this.textAlign;
			ctx.fillStyle=this.color;
			ctx.font=this.font;
			ctx.fillText(this.text,this.textX,this.textY);
		}
		if(this.index=='hpBar'){
			ctx.textAlign='right';
			ctx.fillText(this.value+'/'+this.valueMax,this.width-10,28);		
		}
		ctx.restore();			
		Ui.text.draw.call(this,ctx);
	}
Ui.group.prototype={
	add:function(el){
		this.child.push(el);
		this.isChange=true;
		this.upData();
	}
	,upData:function(){
		if(!this.isChange)return;
		var _l=this.child.length;
		while(_l){
			_l--;
			var _el=this.child[_l];
			_el.x=this.x+_el.offsetX;
			_el.y=this.y+_el.offsetY;
			_el.active=this.active;
		}
		this.isChange=false;
	}
	,toggle:function(){
		this.isChange=true;
		if(this.active){
			this.hidden();			
		}else{
			this.show();
		}
	}
	,show:function(){
		this.active=true;
		this.upData();
	}
	,hidden:function(){
		this.active=false;
		this.upData();
	}
	
}
