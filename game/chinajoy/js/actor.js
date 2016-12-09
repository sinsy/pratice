//演员管理器和演员基础对象
ActorManage=function(){
    this.list=[];		//演员列表
}
ActorManage.prototype={
    add:function(actor){
        this.list.push(actor);
        return this.list.length-1;
    }
    ,del:function(data){
        switch(typeof(data)){
            case	'object':
                return this.delByObj(data);
                break;
            default:
                this.delActorAction(this.list[data]);
                this.list.splice(data,1);
                return true;
        }
    }
    ,delByObj:function(obj){
        var _i=0;
        while(1){
            if(typeof(this.list[_i])=='undefined')break;
            if(this.list[_i].tag==obj.tag){
                this.list.splice(_i,1);
            }else{
                _i++;
            }
        }
        return false;
    }
    ,delActorAction:function(obj){
        action.clear(obj);
    }
    ,upData:function(){
        var _l=this.list.length;
        while(_l){
            _l--;
            this.list[_l].setDrawData();
        }
    }
    ,draw:function(ctx,res){
        var _l=this.list.length;
        while(_l){
            _l--;
            var obj=this.list[_l];
            ctx.save();
            ctx.translate(obj.x,obj.y);
            ctx.scale(obj.scaleX,obj.scaleY);
            ctx.rotate(obj.angle*0.017453292519943295);
            ctx.globalAlpha = obj.alpha;
            ctx.drawImage(res.get(obj.eId),obj.sx,obj.sy,obj.sw,obj.sh,obj.dx,obj.dy,obj.dw,obj.dh);
            ctx.restore();
        }

    }
}

ActorBase=function(){
    this.x=0;
    this.y=0;
    this.width=0;
    this.height=0;
    this.offsetX=0;		//偏移量x
    this.offsetY=0;		//偏移量y
    this.fPoint=-1;		//动画定位
    this.aniName='';	//动画文件名称
    this.scaleX=1;		//横向缩放
    this.scaleY=1;		//竖向缩放
    this.alpha=1;		//透明度
    this.time=0;		//时间
    this.speed=0;		//速度
    this.lookAt=0;		//朝向角度
    this.angle=0;		//角度
    this.radian=0;		//弧度
    this.active=true;	//是否激活
    this.tag=+new Date();	//唯一识别字符串
    this.tag='_'+this.tag+'_'+Math.random()*100+'_'+Math.random()*100;
    this.id=-1;
    this.cId=null;
    for(key in arguments[0]){
        this[key]=arguments[0][key];
    }
    this.id=am.add(this);
    this.getMeta=function(name){
        if(typeof(name)=='undefined')name=this.aniName;
        if(name=='')return;
        this.rId	=	res.getInfoIdByName(name,'animation');	//explosion1
        this.frames	=	res.list[this.rId].aniData.frames;
        this.meta		=	res.list[this.rId].aniData.meta;
        this.eId		=	res.list[this.rId].eId;
        this.fPoint		=	0;
    }
    this.setDrawData=function(){//重新设置绘制的精灵坐标
        if(this.passedPoint==this.fPoint)return;
        this.passedPoint=this.fPoint;
        this.frame=this.frames[(this.fPoint)+'.png'];
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
    this.delSelf=function(){
        //console.log('del :%s',this.tag);
        am.del(this);
    }
    this.checkClick=function(point){
        if(this.width==0 || this.height==0)return false;
        if(point.x>this.x
            && point.y>this.y
            && point.x<(this.x+this.width)
            && point.y<(this.y+this.height)){
            return true;
        }
        return false;
    }
}