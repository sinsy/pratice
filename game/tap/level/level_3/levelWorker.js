//console.log('level_0 levelWorker.js');
//importScripts('../js/ZGCore.js');	//加载核心功能代码
(function(){
    isWorker=typeof(window)=='undefined'?true:false;
    window=isWorker?self:window;
    var $g=window.$g=window.zhGame=function(){
        return new $g.fn.init();
    };
    $g.fn=$g.prototype={
        init:function(){
        }
        //自定义ajax对象
        ,ajax:function(){
            if(typeof(arguments[0])==='undefined' || typeof(arguments[0]['url'])==='undefined'){
                console.log('空URL错误');
                return false;
            }
            //成功获取回调函数
            var _success=typeof(arguments[0]['success'])!='undefined'?arguments[0]['success']:function(){};
            //执行者对象,有时候需要定义回调函数里的对象.
            var _executor=typeof(arguments[0]['executor'])!='undefined'?arguments[0]['executor']:this;
            var _executor=typeof(arguments[0]['exe'])!='undefined'?arguments[0]['exe']:_executor;
            var _ajax=new (XMLHttpRequest || ActiveXObject);
            var _data=typeof(arguments[0]['data'])!='undefined'?arguments[0]['data']:false;

            _ajax.onreadystatechange=function(){
                if (this.readyState == 4 && this.status ==200){ //此时数据可用
                    _success.call(_executor,this.responseText);
                }
            }
            if(_data){
                var _fd=new FormData();
                for(var i in _data){
                    _fd.append(i,_data[i]);
                }
                _ajax.open('POST',arguments[0]['url'],true);
                _ajax.setRequestHeader("X_REQUESTED_WITH", "ZhGame");
                _ajax.send(_fd);	//
            }else{
                _ajax.open('get',arguments[0]['url']);
                _ajax.setRequestHeader("X_REQUESTED_WITH", "ZhGame");
                _ajax.send();
            }
        }
    }
    $g.fn.init.prototype = $g.fn;
})();

//自定义错误报告
onerror=function(msg,url,line,col,error){
    var _data=new FormData();
    _data.append('msg',msg);
    _data.append('url',url);
    _data.append('line',line);
    _data.append('col',col);
    if(typeof(localStorage.h5g_did)!='undefined'){
        _data.append('did',localStorage.h5g_did);
    }
    $g().ajax({url:'/center/reportErr',data:_data
        ,success:function(data){
            console.log(data);
        }
    });
    return false;
}
//importScripts('../js/ZGCore.js');	//读取动作设定
importScripts('../level/'+level+'/res.js');	//读取资源设定
importScripts('../js/action.js');	//读取动作设定
//importScripts('../js/physics.js');	//读取动作设定
importScripts('../js/ui.js');	//读取通用UI
importScripts('../level/'+level+'/actor.js');	//读取角色设定
var intervalId=null;				//循环事件ID
var idleTime=0;						//闲置时间
var flushData=true;					//要求更新数据
var width=480;						//宽度
var height=720;						//高度
var res=new Res();					//资源信息
var config={};					//配置信息
var am=new ActorManage(); //演员管理器
var isChange=false;					//数据是否更新,如果有,将会传回数据
//var animationList=new Array();					//动画对象
//var animationKeepList=new Array();				//保持类动画对象
//var aniList=[];			//
var knifeFpoint=-1;
//var world={list:[]};
//var am=new ActorManage(); //演员管理器
var score={
	'score':0,	//总分
	'scorePool':0,	//积分池
	'hit':0,		//当前连击
	'hitCount':0,	//点击总数
	'hitTop':0,		//最高连击
	'playStartTime':0,	//游戏开始时间
	'playEndTime':0,	//游戏结束时间
	'playTime':0,	//游戏时间
	'gold':0,
	'TC':0			//时间分数比,单位时间内获得的分数
	,'clickCount':0	//点击总数
    ,'monsterCount':0   //击杀怪物数
}
var click=new Click();		//点击检查列表
var ui=new Ui();			//ui对象
//var ui2=new Ui();			//ui对象
var action=new Action();	//动作对象
var monster=null;			//怪物
var hero={};				//英雄
var heroClip=[];		//英雄级别
var damageList=[];			//伤害
var goldPool=0;				//金币池
var monsterClip=[];			//怪物弹夹
var monsterClipUse=[];		//用过的怪物
var monsterIndex=0;			//怪物索引
var bossShadow=null;
function init(){
	postMessage('{"type":"getInfo","data":""}');	//要求发送配置信息
}

init();
function gameStart(){
	if(intervalId==null){
		action.restore();
		intervalId=setTimeout(loop,30);
		postMessage('{"type":"gameStart","data":""}');
	}
}
function gamePause(){
	if(intervalId!=null){
		clearInterval(intervalId);
		intervalId=null;	
		postMessage('{"type":"gamePause","data":""}');
	}
}
//工作线程关卡信息相应,替换掉worker的基本相应函数
onmessage = function (e) {
	try{
		var _r=JSON.parse(e.data);
	}catch(e){
		return;
	}
	var _data={};
	try{
		_data=JSON.parse(_r.data);
	}catch(e){
		//TODO handle the exception
	}
	switch(_r.type){
		case	'flushData':
			flushData=true;
		break;
		case	'event':
			eventRount(_data);
		break;
		case	'bindDamage':
			bindDamage(_data);
		break;
		case	'info':
			setInfo(_data);
		break;
		case	'gamePause':
			gamePause();
		break;
		case	'gameRestart':
			gameStart();
		break;
		case	'skeleton':
			console.log(_data);
		break;
		case	'bindSpine':
            am.bindSpineToActor(_data);
		break;
		case 	'serialize':
			serialize();
		break;
		case	'unserialize':
			unserialize(_data);
		break;
	}
};
//传递回去的演员数据,将会预格式化,避免放到主线程中去计算.
function formatData(){
	try{
		//var _l=aniList.length;
		//while(_l){
		//	aniList[_l-1].setDrawData();
		//	_l--;
		//}
		am.upData();
		ui.upDate();
	}catch(e){
		//TODO handle the exception
	}
    var data;
    data = {
        'score': score,
        'uiData': ui.data,
        'hero': hero,
        'monster': monster,
        'aniList': am.list
    };
	return data;
}

//关卡循环函数
function loop(){
	action.run();
	if(goldPool>0){
		var _step=1;
		if(goldPool>10)_step=5
		if(goldPool>100)_step=50
		if(goldPool>1000)_step=500
		hero.gold+=_step;
		goldPool-=_step;
	}
	if(isChange && flushData){
		flushData=false;
		var data=formatData();		
		postMessage('{"type":"changeData","data":'+JSON.stringify(data)+'}');
	}
    intervalId=setTimeout(loop,30);
}
//事件路由
function eventRount(e){
	switch(e.event){
		case	'keydown':
			//flushData=true;
		break;
		case	'click':
			score.clickCount++;
            new Animation({x:e.point.x-74,y:e.point.y-35,angle:this.angle,aniName:'touch'});
			if(!click.check(e.point)){
				hero.attack();
				monster.hit();
			}
		break;
	}
}

function setInfo(data){
	res.list=data.resList;
    for(var i in res.list[0].config){
        config[i]=res.list[0].config[i];
    }
    for(var i in config['config']){
        config[config['config'][i].attr]=config['config'][i].value;
    }
    delete(config.config);
    //config.model=config.model.split(',');
	width=data.width;
	height=data.height;
    fillMonsterClip();
	hero=new Hero({x:width/2|0,y:-100,levelList:heroClip,attr:heroClip[0]});

	action.add(hero,{'type':'Move',time:1,'data':{x:width/2|0,y:730},TT:'Cubic'});
    initBuddy();
	initUi();
	addMonster();
	flushBg();
	gameStart();
}

//初始化UI
function initUi(){
	ui.data.eId=res.getResIdByName('ui','animation');
	var _bar=ui.make({'type':'bar',index:'hpBar',x:width*.1|0,y:90,'width':width*.8|0,height:32
	,bColor:'rgba(255,255,255,1)'
	,fColor:'#a00'
	,color:'#000'
	,drawType:'double'
	,t:[{offsetX:12,offsetY:24,tag:'name',text:'name',font:'24px Georgia'}
		,{offsetX:width*.8-12|0,offsetY:24,tag:'number',text:'number',font:'24px Georgia',textAlign:'right'}
	]
	,upData:function(){
		if(typeof(this.t.number)!='undefined')this.t.number.text=this.value+'/'+this.valueMax;
		try{
			this.value=monster.hp;
			this.ratio=this.value/this.valueMax;
		}catch(e){
			//console.log('怪物血量获取出错.');
		}	
	}
	});

	var _bar=ui.make({'type':'bar',index:'timeBar'
					,x:width*.1|0
					,y:122
					,'width':width*.8|0
					,height:15
					,bColor:'rgba(0,0,0,.4)'
					,fColor:'#00a'
					,active:false
					,upData:function(){
						this.ratio=this.value/this.valueMax;
					}
	});
	var _goldButton=ui.make({
		'type':'static'
		,x:width/2+10|0
		,y:20
		,frames:res.getFrame('ui','gold')
		
	});
	var _goldNumber=ui.make({
		'type':'static'
		,index:'goldNumber'
		,x:width/2+110|0
		,y:25
		,cId:-1
	});
	var _dareButton=ui.make({
		'type':'static'
		,index:'dare'
		,x:width-120
		,y:20
		,width:100
		,height:50
		,frames:res.getFrame('ui','dare')
		,active:false
		,f:function(){
			dareBoss();
		}
	});
	var _skillGroup=ui.make({
		'type':'group'
		,x:10
		,y:height-130|0
		,'width':width-20
		,'height':100
		,index:'skillGroup'
		,bColor:'rgba(0,0,0,.4)'
		,active:true
		,isChange:true
		,z:100
	});
	var _skillButton=ui.make({
		'type':'static'
		,drawType:'coolDown'
		,index:'skill1'
		,offsetX:0
		,offsetY:0
		,'width':100
		,'height':100
		,frames:res.getFrame('ui','skill1')
		,frameLock:res.getFrame('ui','lock')
		,z:101
		,value:100
		,valueMax:100
		,unlockGold:888
		,isLock:false
		,isReady:true
		,coolDownTime:300
		,f:function(){
			//console.log('技能1');
			//Skill1({x:this.x+50,y:this.y+50});
            wangnima.in();
			this.isReady=false;
			this.value=this.valueMax;
			action.add(this,{'type':'CoolDown',time:this.coolDownTime,data:{value:0},f:function(){
				this.isReady=true;
			}})
		}
		,upData:function(){
			if(this.value==0){
				this.ratio=1;
			}else{
				this.ratio=this.value/this.valueMax;
			}
		}
	});

	_skillGroup.add(_skillButton);
	_skillButton=ui.make({
		'type':'static'
		,index:'skill2'
		,offsetX:210
		,offsetY:0
		,'width':100
		,'height':100
		,frames:res.getFrame('ui','skill2')
		,frameLock:res.getFrame('ui','lock')
		,z:101
        ,value:100
        ,valueMax:100
        ,unlockGold:888
        ,isLock:false
        ,isReady:true
        ,coolDownTime:120
        ,f:function(){
            tangmaru.in();
            this.isReady=false;
            this.value=this.valueMax;
            action.add(this,{'type':'CoolDown',time:this.coolDownTime,data:{value:0},f:function(){
                this.isReady=true;
            }})
        }
        ,upData:function(){
            if(this.value==0){
                this.ratio=1;
            }else{
                this.ratio=this.value/this.valueMax;
            }
        }
	});
	_skillGroup.add(_skillButton);
	_skillButton=ui.make({
		'type':'static'
		,index:'skill3'
		,drawType:'coolDown'
		,offsetX:410
		,offsetY:0
		,'width':100
		,'height':100
		,frames:res.getFrame('ui','skill3')
		,frameLock:res.getFrame('ui','lock')
		,z:101
		,value:100
		,valueMax:100
		,unlockGold:888
		,isLock:false
		,isReady:true
		,coolDownTime:120
		,f:function(){
            zhangquandan.in();
            this.isReady=false;
            this.value=this.valueMax;
            action.add(this,{'type':'CoolDown',time:this.coolDownTime,data:{value:0},f:function(){
                this.isReady=true;
            }})
		}
		,upData:function(){
			if(this.value==0){
				this.ratio=1;
			}else{
				this.ratio=this.value/this.valueMax;
			}
		}
	});

	_skillGroup.add(_skillButton);
	_skillButton=ui.make({
		'type':'static'
		,index:'skill4'
		,offsetX:610
		,offsetY:0
		,'width':100
		,'height':100
		,frames:res.getFrame('ui','skill4')
		,frameLock:res.getFrame('ui','lock')
		,z:101
		,f:function(){
			//console.log('技能4');.0
		}
	});
	_skillGroup.add(_skillButton);


self.BuddyModelList=['banshan','mojinhuoban','faqiuhuoban','banshanhuoban','xielinghuoban'];
	var _buddyGroup=ui.make({
		'type':'group'
		,x:10
		,y:height-230
		,'width':width-20
		,'height':100
		,index:'buddyGroup'
		//,bColor:'rgba(0,0,0,.4)'
		,active:true
		,isChange:true
		,z:100
	});
    var _buddyButton=ui.make({
        'type':'static'
        ,offsetX:610
        ,offsetY:0
        ,'width':100
        ,'height':100
        ,frames:res.getFrame('ui','buddy')
        ,frameLock:res.getFrame('ui','lock')
        ,z:101
        ,value:100
        ,valueMax:100
        ,unlockGold:88
        ,isReady:true
        ,t:[{offsetX:0,offsetY:95,tag:'number',text:'小伙伴: 5',font:'24px Georgia',textAlign:'right',fillStyle:'#fff'}
            ,{offsetX:0,offsetY:60,tag:'price',text:'G: 3000',font:'24px Georgia',textAlign:'right',fillStyle:'#fff'}]
        ,f:function(){
            var _l=0;
            var i='';
            for(i in buddyList){
                if(buddyList[i].active){
                    _l++;
                }else{
                    break;
                }
            }
            var _number='小伙伴: ';
            var _price='G: ';
            if(_l<=4){
                var _g=buddyList[i].gold;
                if(_g<hero.gold){
                    hero.gold=hero.gold-_g;
                    _number+=(4-_l);

                    buddyList[i].run();
                }else{
                    var _data={'msg':"钱不够啦!"};
                    postMessage('{"type":"alert","data":'+JSON.stringify(_data)+'}');
                    return;
                }
            }
            if(_l>=4){
                _number='小伙伴: -';
                _price='G: -';
            }
            _buddyButton.t.number.text=_number;
            for(i in buddyList){
                if(buddyList[i].active){
                    _l++;
                }else{
                    break;
                }
            }
            _buddyButton.t.price.text='G: '+buddyList[i].gold;
        }
    });
    _buddyGroup.add(_buddyButton);

    var _talk=ui.make({
        'type':'static'
        ,index:'talk'
        ,x:120
        ,y:180
        ,width:width-240
        ,height:50
        //,frames:res.getFrame('ui','dare')
        ,active:true
        ,t:[{offsetX:(width-240)/2|0,offsetY:0,tag:'text',text:'要说的文本',font:'32px Georgia',textAlign:'center',fillStyle:'#fff'}]
    });
    wangnima=new NPC({x:660,y:-200});
    tangmaru=new NPC({x:660,y:-200,name:'tangmaru',model:'tangmaru'});
    zhangquandan=new NPC({x:660,y:-200
        ,damage:8
        ,target:{x:width/2-50|0,y:420}
        ,stepTime:3000,name:'zhangquandan',model:'zhangquandan',missile:'B'});
    zhangquandan.attack=NPC.zhangquandanAttack;
}

//刷新绘制背景
function flushBg(){
	var data=formatData();		
	postMessage('{"type":"changeData","data":'+JSON.stringify(data)+'}');
	postMessage('{"type":"flushBg","data":""}');	
}

//建立伤害数值
function makeDamage(damage,isViolent){
	
	var _data={};
	_data.damage=damage;
	_data.isViolent=isViolent;
	postMessage('{"type":"makeDamage","data":'+JSON.stringify(_data)+'}');
}
//绑定伤害对象和动作
function bindDamage(data){
	var _damage=new Damage();
	_damage.cId=data.cId;
	_damage.x=width/2|0;
	_damage.y=height/3|0;
	damageList.push(_damage);
	var _i=damageList.length-1;
	action.add(_damage,{'type':'Move',time:2,'data':{y:height/7|0},TT:'Cubic',TM:'easeOut',f:function(){	
		_damage.life=false;
		var _l=damageList.length;
		for(var i=0;i<damageList.length;i++){
			if(!damageList[i].life){
				delDamage(damageList[i].id);
				damageList.splice(i,1);	
			}
		}
		_damage.end();
	}});
	action.add(_damage,{'type':'Move',time:2,'data':{alpha:0}});
	if(data.isViolent){
		action.add(_damage,{'type':'Move',time:.2,'data':{scaleX:2,scaleY:2},TT:'Cubic'});
	}
	
}
//发送删除显示伤害对象
function delDamage(id){
	var _data={};
	_data.id=id;
	postMessage('{"type":"delDamage","data":'+JSON.stringify(_data)+'}')
}
//填充弹夹
function fillMonsterClip(){
    if(config.gameType=='unLimit'){
        fillMonsterClipNolimit();
        return;
    }
	var _actor=res.list[0].config.actorList;
	for(var i in _actor){
		switch(_actor[i].type){
            case	'monster':
                _actor[i].scale=.8;
                monsterClip.push(_actor[i]);
                break;
			case	'boss':
                _actor[i].scale=1;
				monsterClip.push(_actor[i]);
			break;
			case	'hero':
                _actor[i].scale=1;
				heroClip.push(_actor[i]);
			break;
		}
	}  
}
//填充弹夹
function fillMonsterClipNolimit(){
    //设置英雄的伤害,以伤害计算怪物血量
    if(monsterClip.length)monsterClip=[];
    hero.damage=monsterIndex+1;
    var _damage=hero.damage;
    var _l=monsterIndex;
    var _max=monsterIndex+101;
    while(_l<_max){
        var _m={};
        _l++;
        _damage=monsterIndex+_l;
        var clickCount=Math.random()*5+25|0;//一个怪物大概要点击多少下
        _m.hp=_damage*clickCount-1;//怪物的血量
        _m.name='怪物名称'+_l;
        if(_l%10==0){
            _m.hp=_m.hp*2|0;
            _m.type='boss';//如果10的倍数,则设置为boss;
            _m.mp=7;
            _m.scale=1;
            //_m.damage=_m.hp*1.5/clickCount+1|0;
            _m.damage=monsterIndex+_l;
            //_damage=_m.damage;
        }else{
            _m.type='monster';
            _m.scale=.8;

        }
        _m.gold=_m.hp*.1|0; //血量决定奖励金币
        monsterClip.push(_m);
    }
    heroClip.push({damage:hero.damage,name:'hero',hp:100,spine:'hero',type:'hero',spineDefaultAction:'idle'});
}
//建立新怪物
function addMonster(){
	if(bossShadow!=null){
		loopMonster();
		return;
	}
	if(monster!=null){
		try{
			monster.delSelf();
			serialize();		//每打死一个怪,就保存下数据
		}catch(e){
			//TODO handle the exception
		}
	}else{
		postMessage('{"type":"unserialize","data":""}');
		return;
	}
	if(monsterClip.length==0){
        if(config.gameType='unlimit'){//如果是无限模式,则无限填充怪物数据
            fillMonsterClipNolimit();
        }else{
            gameOver();
        }
	}
	var _m=monsterClip.shift();
	if(_m.type=='boss'){
		bossShadow=_m;
		bossShadow.hpMax=bossShadow.hp;
		bossShadow.mpMax=0;
	}else{
		monsterClipUse.push(_m);
	}
	monster=new Monster(_m);
	monsterIndex++;	
}
//boss战失败后,循环怪物
function loopMonster(){
	if(typeof(monster.spineId)!='undefined'){
		var _data={};
		_data.spineId=monster.spineId;
		postMessage('{"type":"delSpine","data":'+JSON.stringify(_data)+'}');
		monster.delSelf();
	}
	var _l=monsterClipUse.length;
	var _index=Math.random()*_l|0;
	monster=new Monster(monsterClipUse[_index]);
}
//挑战boss
function dareBoss(){
	if(typeof(monster.spineId)!='undefined'){
		var _data={};
		_data.spineId=monster.spineId;
		postMessage('{"type":"delSpine","data":'+JSON.stringify(_data)+'}');
		monster.delSelf();
	}
	if(bossShadow.mpMax<3){
		bossShadow.mpMax+=1;
	}else{
		bossShadow.mpMax=3;
	}
	bossShadow.hp=bossShadow.hpMax*(1-bossShadow.mpMax*.05)|0;
	monster=new Monster(bossShadow);
}
//串行化数据
function serialize(){
	var _data={};
	_data.gid=config.id;
	_data.hero={damage:hero.damage,gold:hero.gold};
	_data.score=score;
    if(typeof(config.gameType)!='undefined')_data.config={gameType:'unLimit'};
	if(goldPool>0){
		_data.hero.gold+=goldPool;
	}
	for(var i in am.list){
		if(am.list[i].aniName=='gold'){
			_data.hero.gold+=	am.list[i].gold;
		}
	}
	_data.monsterIndex=monsterIndex;
	postMessage('{"type":"serialize","data":'+JSON.stringify(_data)+'}');
    //var _score=new FormData();
    if(typeof(config.uid)!='unfined'){
        var _score={};
        _score.gid=config.id;
        _score.uid=config.uid;
        _score.score1=_data.hero.gold;
        _score.score2=score.monsterCount;
        _score.score3=score.clickCount;
        $g().ajax({
            url:'/center/scoreUpdate'
            ,data:_score
            ,success:function(data) {
            }
        });
    }
}
//反串行化
function unserialize(data){
	try{
		if(typeof(data.hero)!='undefined'){
			score=data.score;
			hero.damage=data.hero.damage;
			hero.gold=data.hero.gold;
            if(typeof(data.config)!='undefined' && typeof(data.config.gameType)!='undefined'){
                config.gameType=data.config.gameType;
                monsterIndex=data.monsterIndex;
                fillMonsterClipNolimit();
            }else{
                var _i=data.monsterIndex;
                while(_i){
                    _i--;
                    if(monsterClip[_i].type!='boss'){
                        monsterClipUse.push(monsterClip[_i]);
                    }else{
                        break;
                    }
                }
                monsterClip.splice(0,data.monsterIndex);
                monsterIndex=data.monsterIndex;
            }

		}else{
			monsterIndex=0;
		}
		monster={};
		addMonster();
	}catch(e){
		//TODO handle the exception
	}
}
//初始化小伙伴列表
function initBuddy(){
    self.buddyList={};
    self.buddyList.xielinghuoban=new Buddy({x:110,y:720,missile:'stone',model:'xielinghuoban',damage:.5
        ,attack:Buddy.attackStone
        ,gold:3000
    });

    self.buddyList.mojinhuoban=new Buddy({x:width-120,y:720,damage:.7
        ,model:'mojinhuoban'
        ,attack:Buddy.attackKnife2
        ,gold:20000
    });
    self.buddyList.banshan=new Buddy({x:80,y:525,damage:1
        ,model:'banshan',gold:45000
        ,attack:Buddy.attackLight});

    self.buddyList.faqiuhuoban=new Buddy({x:width-90,y:525,damage:1.3
        ,model:'faqiuhuoban'
        ,attack:Buddy.attackKnife
        ,gold:100000
    });
    self.buddyList.banshanhuoban=new Buddy({x:width-60,y:355,damage:1.5,missile:'paper'
        ,gold:180000,missileAngle:3.14,model:'banshanhuoban'});
}

//设定和弹出
function gameOver(){
    for(var i in ui.data.list){
        ui.data.list[i].active=false;
    }
    var _popGroup=ui.make({
        'type':'static'
        ,index:'gameOver'
        ,x:0
        ,y:height
        ,offsetX:0
        ,offsetY:0
        ,t:[{text:'GAME OVER',offsetX:width/2|0,offsetY:240,textAlign:'center',fillStyle:'#d23305',font:'bold 48px 宋体,Arial'}
            ,{text:'你在<点击盗墓>中获得  '+hero.gold+'  分',offsetX:20,offsetY:285,textAlign:'left',fillStyle:'#fff',font:'bold 32px 宋体,Arial'}
            ,{text:'共点击了  '+score.clickCount+'  下,幸苦幸苦 :)',offsetX:20,offsetY:325,textAlign:'left',fillStyle:'#fff',font:'bold 32px 宋体,Arial'}
            ,{text:'击杀怪物:  '+score.monsterCount+'  个',offsetX:20,offsetY:365,textAlign:'left',fillStyle:'#fff',font:'bold 32px 宋体,Arial'}
        ]
        ,frames:res.getFrame('ui','endImg')
    });
    action.add(_popGroup,{'type':'Move'
        ,time:.5
        ,'data':{y:0}
        ,TT:'Back'
        ,TM:'easeOut'
        ,f:function(){
            if(intervalId!=null){
                clearInterval(intervalId);
                intervalId=null;
            }
        }
    });
    postMessage('{"type":"gameOver","data":""}');
}