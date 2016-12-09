//演员类.抽象容器,仅限于数据方便传递
//console.log('import actor.js');


//演员管理器
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
            obj.active=false;
			var _i=0;
			while(1){
				if(typeof(this.list[_i])=='undefined')break;
				if(this.list[_i].tag==obj.tag || this.list[_i].active==false){
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
        var now=+new Date();
		while(_l){
			_l--;
            var a=this.list[_l];
            a.setDrawData();
            if(a.loopTime!=0 && a.loop==false && now-a.rawTime>a.loopTime){

                a.delSelf();
            }
		}
	}
    ,bindSpineToActor:function(data){
        var _l=this.list.length;
        while(_l){
            _l--;
            if(this.list[_l].tag == data.tag){
                this.list[_l].spineId=data.spineId;
            }
        }
    }

};

ActorBase=function(){
	this.x=this.x?this.x:0;
	this.y=this.y?this.y:0;
	this.width=this.width?this.width:0;
	this.height=this.height?this.height:0;
	this.offsetX=this.offsetX?this.offsetX:0;		//偏移量x
	this.offsetY=this.offsetY?this.offsetY:0;		//偏移量y
	this.fPoint=this.fPoint?this.fPoint:-1;		//动画定位
	this.aniName=this.aniName?this.aniName:'';	//动画文件名称
	this.scaleX=this.scaleX?this.scaleX:1;		//横向缩放
	this.scaleY=this.scaleY?this.scaleY:1;		//竖向缩放
	this.alpha=this.alpha?this.alpha:1;		//透明度
	this.time=this.time?this.time:0;		//时间
	this.speed=this.speed?this.speed:0;		//速度
	this.lookAt=this.lookAt?this.lookAt:0;		//朝向角度
	this.angle=this.angle?this.angle:0;		//角度
	this.radian=this.radian?this.radian:0;		//弧度
	this.active=typeof(this.active)!='undefined'?this.active:true;	//是否激活
    this.loopTime=this.loopTime?this.loopTime:0;
    this.loop=typeof(this.loop)!='undefined'?this.loop:false;
    this.rawTime=+new Date();
    var _r1=Math.random()*100+10|0;
    var _r2=Math.random()*100+10|0;
    this.tag='_'+this.rawTime+'_'+_r1+'_'+_r1;//唯一识别字符串
	this.id=-1;
	this.cId=null;
    this.spineId=false;
	for(var key in arguments[0]){
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
		this.dx=(this.frame.spriteSourceSize.x+this.frameOffsetX-this.offsetX)*this.meta.scale|0;
		this.dy=(this.frame.spriteSourceSize.y+this.frameOffsetY-this.offsetY)*this.meta.scale|0;
		this.dw=this.sw*this.meta.scale|0;
		this.dh=this.sh*this.meta.scale|0;
	};
	this.setFrame=function(loopTime,loop){
        this.loopTime=loopTime;
		this.loop=typeof(loop)=='undefined'?true:loop;
		if(this.loop){
			action.add(this,{'type':'Frame',time:loopTime,'loop':this.loop});
		}else{
			action.add(this,{'type':'Frame',time:loopTime,'loop':this.loop,f:function(){
				this.delSelf();
			}});
		}
        this.loopTime=this.loopTime*1000;//用来做循环检测到期的时间,避免循环乘法.
	};
	this.setFpoint=function(f){
		this.fPoint=f;		
	};
	this.delSelf=function(){
        if(this.spineId){//如果有动画ID,则发送删除spine数据.
            var _data={};
            _data.spineId=monster.spineId;
            postMessage('{"type":"delSpine","data":'+JSON.stringify(_data)+'}');
        }
		am.del(this);
	};
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
    this.makeSpine=function(info){
        postMessage('{"type":"makeSpine","data":'+JSON.stringify(info)+'}');
    }
    this.setSpineAnimation=function(data){
        postMessage('{"type":"setSpineAnimation","data":'+JSON.stringify(data)+'}')
    }
}
//金币对象
Gold=function(){
	this.gold=0;
	ActorBase.call(this,arguments[0]);	
	this.aniName=typeof(arguments[0]['aniName'])!='undefined'?arguments[0]['aniName']:'gold';
	this.getMeta();
	this.setFrame(.3);
	action.add(this,{'type':'Move',time:.6,data:{x:Math.random()*(width-200)+100|0},TT:'Cubic',TM:'easeOut'});
	action.add(this,{'type':'Move',
					time:.6,
					data:{y:Math.random()*(width-200)+100|0},
					TT:'Cubic',
					TM:'easeOut',
					f:function(){
						this.fly();
					}
	});
	this.add=function(){
		goldPool+=this.gold;
		this.active=false;
	};
	this.fly=function(){
		var _rx=Math.random()*width|0;
		this.angle=Math.atan2(height-this.y,_rx-this.x);
		this.angleSpeed=.2;
		this.speed=20;
		this.life=true;	
		this.target={x:550,y:40};
	
		action.add(this,{'type':'UpData',time:5
			,f:function(){
				this.add();
				this.delSelf();			
			}
			});
	}
	this.upData=function(){
		if(Math.abs(this.x-this.target.x)<20 && Math.abs(this.y-this.target.y)<20){
			return true;
		}
		this.targetAngle=Math.atan2(this.target.y-this.y,this.target.x-this.x);

		if(Math.abs(this.targetAngle-this.angle)>0.2){
			var _a=this.angle-this.targetAngle
			if(_a<0 || _a>3.14){
				this.angle+=this.angleSpeed;
			}else{
				this.angle-=this.angleSpeed;				
			}
			this.angle=this.angle>3.14?-3.14:this.angle;
		}
		//console.log('a=%s,ta=%s,v=%s',this.angle,this.targetAngle,this.angle-this.targetAngle);
		this.x=this.x+this.speed*Math.cos(this.angle);
		this.y=this.y+this.speed*Math.sin(this.angle);
		return false;
	}
}
//怪物对象
//xueshiwang,dajinpo,dufeng,wulianhou,xufu
var model=new Array();

model.push({'name':'大禁婆','model':'dajinpo','skins':['dajinpo','dajinpo1','dajinpo2','dajinpo3','dajinpo4']});
model.push({'name':'血尸王','model':'xueshiwang'});
model.push({'name':'毒蜂','model':'dufeng'});
model.push({'name':'无脸猴','model':'wulianhou'});
model.push({'name':'徐福','model':'xufu'});
//model.push({'name':'','model':''});
Monster=function(){
	this.hp=0;
	this.gold=1049;
    this.scale=.5;
	ActorBase.call(this,arguments[0]);
	this.x=width/2|0;
	this.y=720;
	this.spineId=-1;
	this.hitActive=true;
    if(!this.hp){
        var n=Math.random()*21+18|0;
        this.hp=hero.damage*n;
    }
	this.init();
	return this;
}
Monster.prototype={
	init:function(){
		//this.set();
        if(config.gameType!='unLimit'){
            ui.data.list.talk.t.text.text=this.name;
        }else{
            var _l=config.actorList.length-1;
            var _index=Math.random()*_l|0;
            ui.data.list.talk.t.text.text=config.actorList[_index].name;
        }

        var _m=this.getModel();
        this.name=_m.name;
        this.model=_m.model;
        this.skins=_m.skins;
		var _info={tag:this.tag
            ,spine:_m.model
            ,skins:_m.skins
            ,action:this.spineDefaultAction
            ,scale:this.scale
            ,name:_m.name
            ,id:this.id
        };
		this.makeSpine(_info);
		var _this=this;
		ui.data.list.hpBar.t.name.text=this.name;
		ui.data.list.hpBar.set({valueMax:this.hp,value:this.hp});
		if(this.type=='boss'){
		ui.data.list.timeBar.set({value:this.mp*100,valueMax:this.mp*100,active:true});
		action.add(ui.data.list.timeBar,{'type':'CoolDown'
									,time:this.mp*10
									,data:{'value':0}
									,f:function(){
										//ui.list.timeBar.active=false;
										ui.data.list.timeBar.set({active:false});
										action.clear('CoolDown');
										_this.timeOver();
										}
									});
		}

		return this;
	},
	hit:function(){
		var _data={};
		_data.spineId=this.spineId;
		_data.list=[];
		_data.list.push({'action':'hit','loop':false});
		_data.list.push({'action':'idle','loop':true});
        this.setSpineAnimation(_data);
	},
	die:function(){
		if(this.type=='boss'){
			ui.data.list.timeBar.active=false;
			action.clear(this);
			hero.damage=this.damage;
			monsterClipUse=[];
			bossShadow=null;
			ui.data.list.dare.active=false;
			postMessage('{"type":"changeBg","data":""}');
		}
        //goldPool+=this.gold;
        if(isNaN(score.monsterCount))score.monsterCount=0;
        score.monsterCount++;
		action.add(this,{'type':'Move',time:.3,data:{y:-100},f:function(){
			this.giveGold();
			addMonster();
		}});
	}
	,timeOver:function(){
		ui.data.list.timeBar.active=false;
		action.clear(this);
		ui.data.list.dare.active=true;
		addMonster();		
	}
	,giveGold:function(){
		var _value=this.gold/10|0;
		var _count=11;	//放10个金币;
		while(_count){
			new Gold({gold:_value,x:400,y:400});
			_count--;
		}
		var _y=this.gold%10;	//求余数
		if(_y!=0){
			new Gold({gold:_y,x:400,y:400});
		}
	}
	,onHit:function(damage,noAction){
		if(!this.hitActive)return;
		//if(noAction!=true)this.hit();
		this.hp-=damage;
		if(this.hp<0){
			this.hitActive=false;
			this.hp=0;
			this.die();
		}
	}
    ,getModel:function(){
        var _l=model.length;
        var _index=Math.random()*_l|0;
        var m=model[_index];
        var rm={};
        if(typeof(m.skins)!='undefined'){
            _l= m.skins.length;
            _index=Math.random()*_l|0;
            rm.skins= m.skins[_index];
        }else{
            rm.skins= m.model;
        }
        rm.model= m.model;
        rm.name= m.name;
        return rm;
    }
}
//英雄对象
Hero=function(){
	ActorBase.call(this,arguments[0]);
	this.damage=53;
	this.level=0;
	this.spineId=-1;
	this.violent=.1;
	this.setCount=0;
	this.gold=0;
    this.scale=1;
    this.ati=0;
	this.init();
	return this;
}
var attackList=new Array();
attackList.push('attack1');
attackList.push('attack2');
attackList.push('attack3');
Hero.prototype={
	init:function(){
		this.set();
		var _info={tag:this.tag,spine:'hero',action:this.spineDefaultAction,scale:this.scale,id:this.id};
        this.makeSpine(_info);
		//makeSpine('hero');
		this.setViolent(this.violent);
		return this;
	},
	attack:function(){
		if(monster.hitActive==false)return;
		var _data={};
		_data.spineId=this.spineId;
		_data.list=[];
        this.ati++;
        this.ati=this.ati>=attackList.length?0:this.ati;
        this.attType=attackList[this.ati];
		_data.list.push({'action':this.attType,'loop':false});
		_data.list.push({'action':'idle','loop':true});
        this.setSpineAnimation(_data);
		knifeFpoint=knifeFpoint>2?0:++knifeFpoint;
		var _knife=new Knife({x:width/4|0,y:height/3|0});
		_knife.setFpoint(knifeFpoint+'');
		if(this.vPool.length<=0)this.setViolent(this.violent);
		var _damage=this.damage;
		var _isViolent=false;
		if(this.vPool.shift()==1){
			_damage=this.damage*4;
			_isViolent=true;
		}		
		monster.onHit(_damage);
		makeDamage(_damage,_isViolent);
		//postMessage('{"type":"playAudio","data":"swing1","level":"1"}');
	},
	setViolent:function(value){
		this.violent=value<1?value:1;	//暴击几率不会大于1,等于1就是100%了,避免传递过来的数值错误
		var _v=Math.round(this.violent*100);
		this.vPool=[];
		var _l=99;
		while(_l){
			this.vPool[this.vPool.length]=0;
			_l--;
		}
		while(_v){
			this.setViolentValue();
			_v--;
		}
	},
	setViolentValue:function(){
		var _index=Math.random()*99|0;
		if(this.vPool[_index]==1){
			if(this.setCount>99)return;
			this.setCount++;
			this.setViolentValue();
		}else{
			this.setCount=0;
			this.vPool[_index]=1;
		}
	},
	upLevel:function(){
		if(this.level>this.levelList.length)return;
		this.level++;
		this.attr=this.levelList[this.level];
		this.set();
	},
	set:function(){
		this.damage=this.attr.damage;
		this.name=this.attr.name;
		this.hp=this.attr.hp;
		this.spine=this.attr.spine;
		this.type=this.attr.type;
		this.spineDefaultAction=this.attr.spineDefaultAction
	}
	
}
//伤害对象
Damage=function(){
	ActorBase.call(this,arguments[0]);
	//this.id=-1;
	this.life=true;
}
Damage.prototype.end=function(){
	this.life=false;
	this.delSelf();
}
//刀光
Knife=function(){
    this.aniName='knife';
    this.life=true;
    this.time=.3;
	ActorBase.call(this,arguments[0]);
	this.getMeta();
	action.add(this,{'type':'Move',time:this.time,'data':{alpha:0}
	,f:function(){
		this.life=false;
		this.active=false;
		this.delSelf();
	}
	});
}
//导弹
Missile=function(){
	this.aniName='capsule';
    this.target={x:width/2|0,y:height/3|0};
    this.loop=false;
    this.loopTime=30000;
    this.speed=30;
    this.angleSpeed=.2;
    this.life=true;
	ActorBase.call(this,arguments[0]);
    this.getMeta();
	this.setFpoint(this.aniName);
	if(this.angle==0){
		var _rx=Math.random()*width|0;
		this.angle=Math.atan2(height-this.y,_rx-this.x);
	}
	this.launch();
}
Missile.prototype={
	launch:function(){
		action.add(this,{'type':'UpData',time:5
		,f:function(){
			monster.onHit(this.damage,true);
			makeDamage(this.damage);
			this.explosion();
			this.delSelf();
		}
		});
	}
	,upData:function(t){
		if(Math.abs(this.x-this.target.x)<20 && Math.abs(this.y-this.target.y)<20){
			return true;
		}
		this.targetAngle=Math.atan2(this.target.y-this.y,this.target.x-this.x);

		if(Math.abs(this.targetAngle-this.angle)>0.2){
			var _a=this.angle-this.targetAngle
			if(_a<0 || _a>3.14){
				this.angle+=this.angleSpeed;
			}else{
				this.angle-=this.angleSpeed;
			}
			this.angle=this.angle>3.14?-3.14:this.angle;
		}
		//console.log('a=%s,ta=%s,v=%s',this.angle,this.targetAngle,this.angle-this.targetAngle);
		this.x=this.x+this.speed*Math.cos(this.angle);
		this.y=this.y+this.speed*Math.sin(this.angle);
		return false;
	}
	,explosion:function(){
		var _e=new Animation({x:this.x,y:this.y,angle:this.angle,aniName:'explosion1'});
	}
}
Skill1=function(){
	for(key in arguments[0]){
		this[key]=arguments[0][key];
	}
	var _l=16;
	while(_l){
		_l--;
		//var _speed=Math.random()*10;
		var _m=new Missile({x:this.x,y:this.y,aniName:'capsule'});
	}
		
}
Skill3=function(){
	for(key in arguments[0]){
		this[key]=arguments[0][key];
	}
	var _d=new Duang();
	action.add(this,{'type':'CoolDown',time:0.3,f:function(){
		new Duang();
	}});
	action.add(this,{'type':'CoolDown',time:0.6,f:function(){
		new Duang();
	}});
}
Duang=function(){
	var _e=new Animation({x:width/2-240|0,y:0,aniName:'duang'});
	_e.setFpoint('duang');
	_e.damage=hero.damage*3;
	action.add(_e,
		[{'type':'Move',time:.1,data:{y:600},f:function(){
			postMessage('{"type":"bgShock","data":""}');
			monster.onHit(this.damage);
			makeDamage(this.damage);
		}}
		,{'type':'Move',time:.3,data:{y:590}}
		]);
	
}
//动画对象
Animation=function(){
	this.aniName='explosion1';
	ActorBase.call(this,arguments[0]);
	this.getMeta();
	this.setFrame(.3,false);
}

//伙伴
//英雄对象
Buddy=function(){
	this.missile='hammer';
	this.missileAngle=-1.5;
    this.model='banshan';
    this.attack=Buddy.attack;
	ActorBase.call(this,arguments[0]);
	this.level=0;
	this.spineId=-1;
	this.violent=.1;
	this.setCount=0;
    this.active=false;
	this.init();
	return this;
}
Buddy.prototype={
	init:function(){
		//this.set();
		var _info={name:'小伙伴',tag:this.tag,spine:this.model,action:this.spineDefaultAction,active:false,id:this.id,x:-1000,y:-1000};
        this.makeSpine(_info);
		return this;
	}
    ,run:function(){
        this.active=true;
        new Animation({x:this.x-40,y:this.y-100,aniName:'shadow'});
        action.add(this,{'type':'CoolDown',time:0.2,f:function(){
            var info={spineId:this.spineId,attr:{active:true}};
            postMessage('{"type":"setSpine","data":'+JSON.stringify(info)+'}');
            action.add(this,{'type':'CoolDown',time:3,loop:true
                ,f:function(){
                    this.attack();
                }})
        }});

    }
	,set:function(){
//		this.damage=this.attr.damage;
//		this.name=this.attr.name;
//		this.hp=this.attr.hp;
//		this.spine=this.attr.spine;
//		this.type=this.attr.type;
//		this.spineDefaultAction=this.attr.spineDefaultAction;
	}
    ,actionAttack:function(){//播放攻击动作
        if(monster.hitActive==false)return;
        var _data={};
        _data.spineId=this.spineId;
        _data.list=[];
        _data.list.push({'action':'attack','loop':false});
        _data.list.push({'action':'idle','loop':true});
        this.setSpineAnimation(_data);
    }
	
};
Buddy.attack=function(){
    this.actionAttack();
    var _m=new Missile({x:this.x,y:this.y,angle:this.missileAngle,aniName:this.missile,damage:hero.damage*this.damage|0});
    //var _damage=hero.damage;
    //monster.onHit(_damage);
    //makeDamage(_damage);
};
Buddy.attackStone=function(){
    this.actionAttack();
    new Missile({x:this.x-50,y:this.y-100,angle:this.missileAngle
        ,target:{x:width/2-50|0,y:420}
        ,aniName:this.missile,damage:hero.damage*this.damage|0});
}
Buddy.attackLight=function(){
    var _this=this;
    this.actionAttack();
    new Animation({x:this.x+50,y:this.y-80,angle:.6,aniName:'orangeLight'});

    action.add(this,{'type':'CoolDown',time:.3,f:function(){
        var d=hero.damage*this.damage|0;
        monster.onHit(d);
        makeDamage(d);
    }});
};
Buddy.attackKnife=function(){
    var _this=this;
    this.actionAttack();
    new Animation({x:this.x-200,y:this.y-120,angle:0,aniName:'knife2'});
    action.add(this,{'type':'CoolDown',time:0.3,f:function(){
        var d=hero.damage*this.damage|0;
        monster.onHit(d);
        makeDamage(d);
    }});
};
Buddy.attackKnife2=function(){
    var _this=this;
    this.actionAttack();
    new Knife({x:this.x-100,y:this.y-120,angle:0,aniName:'knife3',time:1});
    action.add(this,{'type':'CoolDown',time:0.3,f:function(){
        var d=hero.damage*this.damage|0;
        monster.onHit(d);
        makeDamage(d);
    }});
};

NPC=function(){
    this.missile='capsule';
    this.missileAngle=3.14;
    this.model='wangnima';
    this.name='王尼玛'
    this.damage=1;
    this.attack=NPC.attack;
    this.stepTime=500;
    this.activeTime=0;
    this.endTime=30000;
    ActorBase.call(this,arguments[0]);
    this.init();
    return this;
};
NPC.prototype={
    init:function(){
        //this.set();
        var _info={name:this.name,tag:this.tag,spine:this.model,action:this.spineDefaultAction,id:this.id};
        this.makeSpine(_info);
        return this;
    }
    ,actionAttack:function(){//播放攻击动作
        if(monster.hitActive==false)return;
        var _data={};
        _data.spineId=this.spineId;
        _data.list=[];
        _data.list.push({'action':'attack','loop':true});
        //_data.list.push({'action':'idle','loop':true});
        this.setSpineAnimation(_data);
    }
    ,casting:function(){
        var now=+new Date();
        var _this=this;
        this.attack();
        if(now-this.activeTime>this.endTime){
            this.out();
            return;
        }
        console.log(this.stepTime);
        setTimeout(function(){
            _this.casting();
        },this.stepTime);
    }
    ,in:function(){
        var _this=this;
        _this.active=true;
        this.activeTime=+new Date();
        action.add(this,{'type':'Move',time:1,'data':{x:666,y:355},TT:'Cubic'
            ,f:function(){
                _this.casting();
            }});
    }
    ,out:function(){
        var _this=this;
        action.add(this,{'type':'Move',time:1,'data':{x:666,y:-200},TT:'Cubic'
            ,f:function(){
                //_this.active=false;
            }});
    }
};
NPC.attack=function() {
    this.actionAttack();
    var _m=new Missile({x:this.x-30,y:this.y-40,angle:this.missileAngle,aniName:this.missile,damage:hero.damage*this.damage|0});
};
NPC.zhangquandanAttack=function(){
    if(monster.hitActive==false)return;
    var _data={};
    _data.spineId=this.spineId;
    _data.list=[];
    //_data.list.push({'action':'saiya','loop':false});
    _data.list.push({'action':'attack','loop':false});
    this.setSpineAnimation(_data);
    var mAngle=Math.atan2(this.target.y-this.y-40,this.target.x-this.x-30);
    var _m=new Missile({x:this.x-30,y:this.y-40
        ,speed:5,angleSpeed:.01
        ,target:this.target
        ,angle:mAngle,aniName:this.missile,damage:hero.damage*this.damage|0});
    action.add(_m,{'type':'Move',time:.3,'data':{scaleX:2,scaleY:2}
        });
};