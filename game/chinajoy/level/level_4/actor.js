//演员类.抽象容器,仅限于数据方便传递
//importScripts('../js/actor.js');	//读取基础对象数据
if(typeof(importScripts)=='undefined'){
    document.write("<script src=\"js/actor.js\"></script>");
}else{
    importScripts('../js/actor.js');
}

//转盘
Turntable=function(){
    ActorBase.call(this,arguments[0]);
    this.aniName='turntable';
    this.getMeta();
    this.setFpoint(this.aniName);
    this.offsetX=-350;
    this.offsetY=-350;
    this.setDrawData();
}
Turntable.prototype.run=function(point){
    action.clear(this);
    this.angle=0;
    action.add(this,{'type':'Move'
        ,time:Math.random()*10+5|0
        ,'data':{angle:this.angle+360*10+point+(-5+Math.random()*5)|0}
        ,TT:'Quint'
        ,TM:'easeOut'
        ,f:function(){
            rotateDone();
        }
    });
}
