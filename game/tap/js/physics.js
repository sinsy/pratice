//物理世界
World=function(){
    this.x=0;
    this.y=0;
    this.width=480;
    this.height=640;
    this.fps=0;
    this.fpsCount=0;
    this.fpsStart=0;
    this.gravity=1;
    this.windX=0;
    this.windY=0;
    this.isPause=false;
    this.list=[];
    //this.canvas=document.getElementById('gc');
    //this.ctx=this.canvas.getContext('2d');
    var _this=this;
    if(typeof(arguments[0]) == 'object'){//使用传递过来的参数定义对象
        for(var key in arguments[0]){
            this[key]=arguments[0][key];
        }
    }
    //this.canvas.width=this.width;
    //this.canvas.height=this.height;
}
World.prototype.pause=function(){
    this.isPause=true;
}
World.prototype.restart=function(){
    this.isPause=false;
    for(var i in this.list){
        this.list[i].restart();
    }
    this.draw();
}
World.prototype.draw=function(ctx,res){
    if(this.isPause || typeof(this.list)=='undefined')return;
    //
    //if(this.fpsCount>=100){
    //    var _time=+new Date();
    //    _time=_time-this.fpsStart;
    //    this.fps=this.fpsCount/_time*1000|0;
    //    this.fpsCount=0;
    //    this.fpsStart=+new Date();
    //}
    //this.fpsCount++;
    //this.startTime=+new Date();
    ctx.globalCompositeOperation = "source-over";
    // this.ctx.clearRect(0,0,width,height);
//    ctx.fillStyle='#000';
    //ctx.fillRect(0,0,this.width,this.height);
    var _l=this.list.length;
    while(_l){
        _l--;
        var _pm=this.list[_l];
        //World.PM.Particle[_p.type].update.call(_p,this);
        World.PM.draw.call(_pm,ctx,res);
    }
    //this.endTime=+new Date();
    //this.drawTime=this.endTime-this.startTime;
    //ctx.fillStyle='#fff';
    //ctx.fillText(this.drawTime,0,20);
    //ctx.fillText(this.fps,0,80);
    /*   var _this=this;
    setTimeout(function(){
        _this.draw();
    },15);*/
}
World.prototype.update=function(){
    var _l=this.list.length;
    while(_l){
        _l--;
        this.list[_l].update(this);
    }
}
World.prototype.makePM=function(){
    var _pm=new World.PM(arguments[0]);
    this.list.push(_pm);
}
World.PM=function(){
    this.list=[];
    this.x=300;
    this.y=400;
    this.number=50;
    this.r = Math.round(Math.random()*255)|0;
    this.g = Math.round(Math.random()*255)|0;
    this.b = Math.round(Math.random()*255)|0;
    this.a=1;
    this.type='base';
    this.aSpeed=0;

    this.sendW=10;
    this.sendH=10;
    this.sendX=-this.sendW/2|0;
    this.sendY=-this.sendH/2|0;
    this.outPadding=100;    //生存区空间,逃逸算死亡
    this.lastTime=+new Date();
    this.partTime=1000/15;  //片段时间长度
    this.t=0;   //末尾时间
    this.compositeType="lighter";//lighter,source-over
    this.frame='snow';
    if(typeof(arguments[0]) == 'object'){//使用传递过来的参数定义对象
        for(var key in arguments[0]){
            this[key]=arguments[0][key];
        }
    }
    this.eId=res.getResIdByName('particle','animation');
    this.frames=res.getFrame('particle',this.frame);
    while(this.number){
        this.make(this.type);
        this.number--;
    }
}
/*PM.prototype.add=function(obj){
 this.list.push(obj);
 }*/
World.PM.prototype.pause=function(){

}
World.PM.prototype.restart=function(){
    this.lastTime=+new Date();
}
World.PM.prototype.make=function(type){
    if(typeof(type)=='undefined')type='base';
    var _p=new World.PM.Particle[type]();
    _p.set(this);
    this.list.push(_p);
}
World.PM.draw=function(ctx,res){
    ctx.save();
    ctx.globalCompositeOperation = this.compositeType;
    //ctx.translate(this.x,this.y);
    var _l=this.list.length;
    while(_l){
        _l--;
        var _p=this.list[_l];
        World.PM.Particle[this.type].draw.call(_p,ctx,this,res);
    }
    ctx.restore();
}
World.PM.prototype.update=function(world){
    this.out(); //检查出界粒子
    this.nowTime=+new Date();
    this.deltaTime=this.nowTime-this.lastTime+this.t;
    this.dt=(this.deltaTime)/this.partTime|0;
    this.t=(this.deltaTime)%this.partTime;
    for(var i in this.list){
        this.list[i].update(this.dt,this,world);
    }
    this.lastTime=+new Date();
}
World.PM.prototype.out=function(){
    //var _x=this.x+this.sendX-this.outPadding;
    //var _y=this.y+this.sendY-this.outPadding;
    //var _w=this.x+this.sendX+this.sendW+this.outPadding;
    //var _h=this.y+this.sendY+this.sendH+this.outPadding;
    var _l=this.list.length;
    while(_l){
        _l--;
        var _p=this.list[_l];
        if(_p.x<this.outX || _p.y<this.outY || _p.x>this.outW || _p.y>this.outH)_p.set(this);
    }
}
World.PM.Particle=function(){

}
World.PM.Particle.base=function(){
    this.x=0;
    this.y=0;
    this.width=50;
    this.height=50;
    this.forceX=0;      //加速度
    this.forceY=0;

    this.scaleX=1;
    this.scaleY=1;
    this.rotate=0;
    this.speedX=0;
    this.speedY=0;
    this.maxLife=100;
    this.r=0;
    this.g=0;
    this.b=0;
    this.a=1;
//    this.canvas=document.createElement('canvas');
//    this.ctx=this.canvas.getContext('2d');
    if(typeof(arguments[0]) == 'object'){//使用传递过来的参数定义对象
        for(var key in arguments[0]){
            this[key]=arguments[0][key];
        }
    }
    this.life=this.maxLife;
    this.offsetX=this.width/2|0;
    this.offsetY=this.height/2|0;
//    this.canvas.width=this.width;
//    this.canvas.height=this.height;
//    this.draw=function(ctx){
//
//    }

}
World.PM.Particle.snow=function(){
    World.PM.Particle.base.call(this,arguments[0]);

}
World.PM.Particle.snow.draw=function(ctx,pm,res){
    ctx.save();
    ctx.globalAlpha=this.a;
    ctx.translate(this.x,this.y);
    ctx.rotate(this.rotate);
    ctx.scale(this.scaleX,this.scaleY);
    //ctx.drawImage(this.canvas,this.offsetX, this.offsetY);
    //ctx.fillStyle='#fff';
    //ctx.fillText(this.life,this.offsetX,this.offsetY);
    ctx.drawImage(res.eList[pm.eId]
        ,pm.frames.frame.x
        ,pm.frames.frame.y
        ,pm.frames.frame.w
        ,pm.frames.frame.h
        ,0,0
        ,pm.frames.sourceSize.w
        ,pm.frames.sourceSize.h
    )
    //ctx.fillStyle='rgba(100,255,100,1)';
    //ctx.fillText(this.life,0,0);
    ctx.restore();
}
World.PM.Particle.snow.prototype.update=function(dt,pm,world){
    this.life-=dt;
    if(this.forceX!=0 && Math.abs(this.forceX)>1){
        this.forceX=this.forceX-.5*dt;
    }else{
        this.forceX=0;
    }
    if(this.forceY!=0 && Math.abs(this.forceY)>1){
        this.forceY=this.forceY-.5*dt;
    }else{
        this.forceY=0;
    }
//        this.force.x=Math.abs(this.force.x)>1?this.force.x-1:0;
//        this.force.y=Math.abs(this.force.y)>1?this.force.y-1:0;
    //this.opacity = Math.round(this.death/this.life*100)/100;
    //this.opacity=pm.a;
    //this.rotate=this.rotateSpeed>=0?this.rotate+0.3:this.rotate-0.3;
    //this.scale.x+=0.02;
    //this.scale.y+=0.02;
    var addX=this.forceX + this.speedX+world.windX;
    this.x +=addX*dt|0;
    var addY=this.forceY +this.speedY+world.windY;
    this.y +=addY*dt|0;
    if(this.death<50){
        this.a-=.02;
        if(this.a<0)this.a=0;
    }else if(this.opacity<1 && this.death>50){
        this.opacity+=.02;
    }
    //|| this.checkRange(pm)
    if(this.life < 0 ){
        this.set(pm);
    }
}
/*World.PM.Particle.snow.prototype.draw=function(ctx){
    ctx.save();
    ctx.globalAlpha=this.a;
    ctx.translate(this.x,this.y);
    ctx.rotate(this.rotate);
    ctx.scale(this.scaleX,this.scaleY);
    //ctx.drawImage(this.canvas,this.offsetX, this.offsetY);
    ctx.fillStyle='#fff';
    ctx.fillText(this.life,this.offsetX,this.offsetY);
    //ctx.fillStyle='rgba(100,255,100,1)';
    //ctx.fillText(this.life,0,0);
    ctx.restore();
}*/
World.PM.Particle.snow.prototype.set=function(pm){
    // this.speed = {x: 2+Math.random()*2, y: 2-Math.random()*2};
    this.x=pm.x+pm.sendX+Math.random()*pm.sendW|0;
    this.y=pm.y+pm.sendY+Math.random()*pm.sendH|0;
    this.life = Math.random()*this.maxLife+250|0;
    this.speedX=-2+Math.random()*2;
    this.speedY=2+Math.random()*2;
    this.forceX=1;
    this.forceY=5;
    this.a=1;
//    this.r = pm.r;
//    this.g = pm.g;
//    this.b = pm.b;
//    this.a=pm.a;
//    this.ctx.fillStyle='rgba(255,255,255,.6)';
//    this.ctx.fillRect(0,0,this.width,this.height);
};