//动作
//基本移动
//console.log('import action.js');
//多处需要的数值
var pi=Math.PI/180;
//缓动算法
var Tween = {
    Linear: {easeIn:function(t,b,c,d){ return c*t/d + b; }},
    Quad: {
        easeIn: function(t,b,c,d){
            return c*(t/=d)*t + b;
        },
        easeOut: function(t,b,c,d){
            return -c *(t/=d)*(t-2) + b;
        },
        easeInOut: function(t,b,c,d){
            if ((t/=d/2) < 1) return c/2*t*t + b;
            return -c/2 * ((--t)*(t-2) - 1) + b;
        }
    },
    Cubic: {
        easeIn: function(t,b,c,d){
            return c*(t/=d)*t*t + b;
        },
        easeOut: function(t,b,c,d){
            return c*((t=t/d-1)*t*t + 1) + b;
        },
        easeInOut: function(t,b,c,d){
            if ((t/=d/2) < 1) return c/2*t*t*t + b;
            return c/2*((t-=2)*t*t + 2) + b;
        }
    },
    Quart: {
        easeIn: function(t,b,c,d){
            return c*(t/=d)*t*t*t + b;
        },
        easeOut: function(t,b,c,d){
            return -c * ((t=t/d-1)*t*t*t - 1) + b;
        },
        easeInOut: function(t,b,c,d){
            if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
            return -c/2 * ((t-=2)*t*t*t - 2) + b;
        }
    },
    Quint: {
        easeIn: function(t,b,c,d){
            return c*(t/=d)*t*t*t*t + b;
        },
        easeOut: function(t,b,c,d){
            return c*((t=t/d-1)*t*t*t*t + 1) + b;
        },
        easeInOut: function(t,b,c,d){
            if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
            return c/2*((t-=2)*t*t*t*t + 2) + b;
        }
    },
    Sine: {
        easeIn: function(t,b,c,d){
            return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
        },
        easeOut: function(t,b,c,d){
            return c * Math.sin(t/d * (Math.PI/2)) + b;
        },
        easeInOut: function(t,b,c,d){
            return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
        }
    },
    Expo: {
        easeIn: function(t,b,c,d){
            return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
        },
        easeOut: function(t,b,c,d){
            return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
        },
        easeInOut: function(t,b,c,d){
            if (t==0) return b;
            if (t==d) return b+c;
            if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
            return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
        }
    },
    Circ: {
        easeIn: function(t,b,c,d){
            return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
        },
        easeOut: function(t,b,c,d){
            return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
        },
        easeInOut: function(t,b,c,d){
            if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
            return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
        }
    },
    Elastic: {
        easeIn: function(t,b,c,d,a,p){
            if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
            if (!a || a < Math.abs(c)) { a=c; var s=p/4; }
            else var s = p/(2*Math.PI) * Math.asin (c/a);
            return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
        },
        easeOut: function(t,b,c,d,a,p){
            if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
            if (!a || a < Math.abs(c)) { a=c; var s=p/4; }
            else var s = p/(2*Math.PI) * Math.asin (c/a);
            return (a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b);
        },
        easeInOut: function(t,b,c,d,a,p){
            if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
            if (!a || a < Math.abs(c)) { a=c; var s=p/4; }
            else var s = p/(2*Math.PI) * Math.asin (c/a);
            if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
            return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
        }
    },
    Back: {
        easeIn: function(t,b,c,d,s){
            if (s == undefined) s = 1.70158;
            return c*(t/=d)*t*((s+1)*t - s) + b;
        },
        easeOut: function(t,b,c,d,s){
            if (s == undefined) s = 1.70158;
            return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
        },
        easeInOut: function(t,b,c,d,s){
            if (s == undefined) s = 1.70158; 
            if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
            return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
        }
    },
    Bounce: {
        easeIn: function(t,b,c,d){
            return c - Tween.Bounce.easeOut(d-t, 0, c, d) + b;
        },
        easeOut: function(t,b,c,d){
            if ((t/=d) < (1/2.75)) {
                return c*(7.5625*t*t) + b;
            } else if (t < (2/2.75)) {
                return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
            } else if (t < (2.5/2.75)) {
                return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
            } else {
                return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
            }
        },
        easeInOut: function(t,b,c,d){
            if (t < d/2) return Tween.Bounce.easeIn(t*2, 0, c, d) * .5 + b;
            else return Tween.Bounce.easeOut(t*2-d, 0, c, d) * .5 + c*.5 + b;
        }
    }
}
//点击事件
Click=function(){
	this.list=[];
}
Click.prototype.add=function(){
	var _el=function(){
		this.zIndex=0;
		this.el=null;
		if(typeof(arguments[0]) == 'object'){//使用传递过来的参数定义对象
				for(var key in arguments[0]){
					this[key]=arguments[0][key];
				}
			}
	}
	this.list.push(new _el(arguments[0]));
}
Click.prototype.check=function(point){
	var _l=this.list.length;
	for(var i=0;i<_l;i++){
		if(this.list[i].el.checkClick(point))return true;
	}
	return false;
}
Click.prototype.del=function(obj){
    this.list=[];
    //var _l=this.list.length;
    //for(var i=0;i<_l;i++){
    //    if(this.list[i].el===obj){
    //        this.list.splice(i,1);
    //        return;
    //    }
    //}
    return;
}
//动作基本对象
ActionBase=function(){
	this.partTime=30;	//片段时间
	this.tStart=0;		//开始动作的时间
	this.tPassed=0;		//上次运算结束时间
	this.tCurrent=0; 	//当前时间
	this.tPool=0;		//此次运算时间池,并保存结束剩余时间
	this.time=0;		//次数
	this.t=0;			//已经运算过的次数
	this.targetX=0;		//目标x
	this.targetY=0;		//目标y
	this.loop=false;	//是否循环
	this.random=false;	//是否随机目标
	this.TT='Linear';
	this.TM='easeIn';
	this.t=0;
	this.obj=null;
	this.attrList=[];		//需要改变的属性列表
	this.saveList=[];		//保存初始属性,预备循环使用
	this.name='ActionBase';
	for(key in arguments[0]){
		this[key]=arguments[0][key];
		}
	this.toString=function(){
		return this.name;
	}
	this.run=function(){
		
	}
	this.once=function(){//第一次运行通用初始化,返回空执行函数.
		try{
			for(var i in this.data){
			var _part=this.data[i]-this.obj[i];
			var _attr={"attr":i,"start":this.obj[i],"part":_part};
			this.attrList.push(_attr);
			var _save={"attr":i,"start":this.data[i],"part":-_part};
			this.saveList.push(_save);
			}
			this.time=this.time*1000/this.partTime+.5|0;
			this.tPassed=+new Date();
		}catch(e){
			//TODO handle the exception
		}
		this.once=function(){};
	}
}
//动作管理程序
Action=function(){
	this.list=[];
}
Action.prototype.run=function(){
	if(this.list.length<=0)return;
	//isChange=true;
	var i=0;
	try{
			while(1){
			if(typeof(this.list[i])=='undefined')return;//如果没有定义,说明越界了,直接退出
			if(this.list[i].length==0 || this.list[i][0].obj.active==false){		//如果动作列表为空,则可删除,并继续循环
				this.list.splice(i,1);
				continue;
			}
			switch(this.list[i][0].run()){
					case	'loop':
						//如果有定义方法,则执行方法
						if(typeof(this.list[i][0].f)!='undefined')this.list[i][0].f.call(this.list[i][0].obj);
						if(this.list[i].length>0)this.list[i].push(this.list[i].shift());
					break;
					case	'end':
						//如果有定义方法,则执行方法
						if(typeof(this.list[i][0].f)!='undefined'){
							this.list[i][0].f.call(this.list[i][0].obj);
						}
						//删除此动作,下次循环将执行下一个动作
						if(typeof(this.list[i])!='undefined' && this.list[i].length>0)this.list[i].splice(0,1);	
					break;
				}
			i++;	//执行下一个动作;
		}
	}catch(e){
		//TODO handle the exception
	}
	
}
//添加动作
Action.prototype.add=function(){
	if(typeof(arguments[0]) == 'object'){
		var _obj=arguments[0];
	}else{return;}
	var _actionList=[];
	if( Object.prototype.toString.call(arguments[1]) === "[object Array]"){		
		for(i in arguments[1]){
			var _action=this[arguments[1][i]['type']](arguments[1][i]);
			_action.obj=_obj;
			_actionList.push(_action);
		}		
	}else if(typeof(arguments[1]) == 'object'){//使用传递过来的参数定义对象
		var _action=this[arguments[1]['type']](arguments[1]);
		_action.obj=_obj;
		_actionList.push(_action);
	}
	this.list.push(_actionList);
}
//清理所有动作
Action.prototype.clear=function(data,name){
	if(typeof(data)=='undefined'){//如果参数为空,则清空所有的动作
		this.list=[];
	}else if(typeof(data)=='object'){//如果参数是对象,则删除该对象的所有动作
		var i=0;
		while(1){
			if(typeof(this.list[i])=='undefined' )break;
			if(this.list[i].length==0){//如果碰到空数组,则循环下一个
				this.list.splice(i,1);
				continue;
			}

			if(this.list[i][0].obj.tag == data.tag){
				
				if(typeof(name)!='undefined'){
		//			console.log('name : %s ,del %s->%s `s action:%s',name,data.tag,this.list[i][0].obj.tag,this.list[i][0].name);
					
					if(this.list[i][0].name==name){
						console.log('name : %s ,del %s->%s `s action:%s',name,data.tag,this.list[i][0].obj.tag,this.list[i][0].name);

						this.list.splice(i,1);
						console.log('action.list.length=%s',this.list.length);
					}else{
						i++;
					}
				}else{
					this.list.splice(i,1);
				}
				
			}else{
				i++;
			}
						
		}
	}else {
		for(var i in this.list){
			if(this.list[i].toString()==data){
				this.list.splice(i,1);
			}
		}
	}	
	return this;
}
//查找动作
Action.prototype.find=function(actionName){
	var _l=[];
	for(var i in this.list){
		for(var a in this.list[i]){
			if(this.list[i][a]==actionName){
			_l.push(this.list[i][a]);
		}
		}		
	}
	return _l
}
//暂停动作,设置当前为暂停状态,恢复的时候,所有的上次结束时间将会被设置为重新启动时间
Action.prototype.pause=function(){
	
}
//恢复动作
Action.prototype.restore=function(){
	for(var i in this.list){
		for(var a in this.list[i]){
			this.list[i][a].tPassed=+new Date();
		}
	}
}
//基本的移动
Action.prototype.Move=function(){
	var Move=function(){
			ActionBase.call(this,arguments[0]);
			this.name='Move';
			this.run=function(obj){
				this.once();
				this.tCurrent=+new Date();	//获取当前时间
				this.tPool+=this.tCurrent-this.tPassed;	//用上次剩的时间加上这次的时间段
				this.tPassed=this.tCurrent;	//保存为上次运算后的时间.
				var isChange=false;
				while(this.tPool>this.partTime){
					this.t++;
					this.tPool-=this.partTime;
					isChange=true;
				}
				if(isChange){
					var _l=this.attrList.length-1;
					while(_l>=0){
						
						this.obj[this.attrList[_l]['attr']]=Tween[this.TT][this.TM](this.t,this.attrList[_l]['start'],this.attrList[_l]['part'],this.time);
						//console.log(this.obj[this.attrList[_l]['attr']]);
						_l--;
					}
					//console.log('Move obj.tag: ',this.obj.tag);
				}		
				if(this.t>=this.time && this.loop==false){
					return 'end';
				}else if(this.t>=this.time && this.loop==true){
					this.t=0;
					if(this.random){//是否随机目标
						this.targetX=parseInt(Math.random()*(480+1));
						this.targetY=parseInt(Math.random()*(720+1));
						this.startX=obj.x;
						this.startY=obj.y;
					}else{			//来回运动
						var _list=this.saveList;
						this.saveList=this.attrList;
						this.attrList=_list;
						_list=null;			
					}
					return 'loop';
				}
				return false;
				}
	};
	return new Move(arguments[0]);
};

//旋转
Rotate=function(){
	this.t=0;
	this.loop=false;
	this.TT='Linear';
	this.TM='easeIn';
	//用传递进来的数据更新参数
	for(key in arguments[0]){
		this[key]=arguments[0][key];
		}
}
Rotate.prototype.run=function(obj){
	if(typeof(this.save)=='undefined'){
		this.start=obj.rotate;
		this.save=obj.rotate;	//保存初始数据,以备循环动作
		this.setp=this.target-this.start;
	}
	this.t++;
	obj.rotate=Tween[this.TT][this.TM](this.t,this.start,this.setp,this.time);
	
	if(this.t==this.time && this.loop==false){
		//if(typeof(this.f)!='undefined')this.f.call(obj);
		return 'end';
	}else if(this.t==this.time && this.loop==true){
		this.t=0;					//翻转参数循环
		if(this.target<360){
			var _now=this.target;
			this.target=this.save;
			this.start=_now;
			this.save=_now;
			this.setp=this.target-this.start;
		}
		return 'loop';
	}
	return false;
}
//帧动画
Action.prototype.Frame=function(){
	var Frame=function(){
		ActionBase.call(this,arguments[0])
		this.name='Frame';
		this.run=function(){
				if(typeof(this.step)=='undefined' || this.step==null){
					this.step=0;
					for(var i in this.obj.frames){
						this.step++;
					}
					this.partTime=this.time*1000/this.step|0;
					this.tPassed=+new Date();
				}
				this.tCurrent=+new Date();	//获取当前时间
				this.tPool+=this.tCurrent-this.tPassed;	//用上次剩的时间加上这次的时间段
				this.tPassed=this.tCurrent;	//保存为上次运算后的时间.
				var isChange=false;
				while(this.tPool>this.partTime){
					this.t++;
					this.tPool-=this.partTime;
					isChange=true;
				}
				if(isChange){
					this.obj.fPoint=this.t;
				}
				if(this.t>=this.step && this.loop==false){
					this.t=0;					//为单次动画对象恢复数据
					this.obj.fPoint=0;
					this.step=null;
					return 'end';
				}else if(this.t==this.step && this.loop==true){
					this.t=0;					//翻转参数循环
					this.obj.fPoint=0;
					return 'loop';
				}
				return false;
			}
	}
	
	return new Frame(arguments[0]);
}
//时间倒计时
Action.prototype.TimeDown=function(){
	var TimeDown=function(){
		this.start=0;
		this.end=0;
		this.now=0;
		this.time=0;
		ActionBase.call(this,arguments[0]);
		this.name='TimeDown';
		this.once=function(){
			if(this.start==0){
				this.start=+new Date();
				this.end=this.start+this.time*1000;
			}	
		}
		this.run=function(){
			this.once();	
			this.now=+new Date();
			if(this.now<this.end){
				this.obj.time=this.end-this.now;
				console.log(this.obj.time);
			}else{
				this.obj.time=0;
				return 'end';
			}
		}
	}
	return new TimeDown(arguments[0]);
}
//缩放
Action.prototype.Scale=function(){
	var	Scale=function(){
			//默认参数
			this.t=0;
			this.scale=0;
			this.time=0;
			this.loop=false;
			this.TT='Linear';
			this.TM='easeIn';
			//用传递进来的数据更新参数
			for(key in arguments[0]){
				this[key]=arguments[0][key];
				}	
	}
	Scale.prototype.run=function(obj){
		if(typeof(this.save)=='undefined'){
			this.start=obj.scale;
			this.save=obj.scale;	//保存初始数据,以备循环动作		
		}
		this.t++;
		obj.scale=Tween[this.TT][this.TM](this.t,this.start,this.scale-this.start,this.time);
		
		if(this.t==this.time && this.loop==false){
			//if(typeof(this.f)!='undefined')this.f.call(obj);
			return 'end';
		}else if(this.t==this.time && this.loop==true){
			this.t=0;					//翻转参数循环
			var _nowScale=this.scale;
			this.scale=this.save;
			this.start=_nowScale;
			this.save=_nowScale;
			return 'loop';
		}
		return false;
	}
	return new Scale(arguments[0]);
}
//属性倒计时
Action.prototype.CoolDown=function(){
	var CoolDown=function(){
			ActionBase.call(this,arguments[0]);
			this.name='CoolDown';
			this.run=function(){
				this.once();
				this.tCurrent=+new Date();	//获取当前时间
				this.tPool+=this.tCurrent-this.tPassed;	//用上次剩的时间加上这次的时间段
				this.tPassed=this.tCurrent;	//保存为上次运算后的时间.
				var isChange=false;
				while(this.tPool>this.partTime){
					this.t++;
					this.tPool-=this.partTime;
					isChange=true;
				}
				if(isChange){
					var _l=this.attrList.length-1;
					while(_l>=0){
						this.obj[this.attrList[_l]['attr']]=Tween[this.TT][this.TM](this.t,this.attrList[_l]['start'],this.attrList[_l]['part'],this.time);
						_l--;
					}
				}		
				if(this.t>=this.time && this.loop==false){
					return 'end';
				}else if(this.t>=this.time && this.loop==true){
					this.t=0;
					var _list=this.saveList;
					this.saveList=this.attrList;
					this.attrList=_list;
					_list=null;
					return 'loop';
				}
				return false;	
			}		
	}
	return new CoolDown(arguments[0]);
}

//自更新
Action.prototype.UpData=function(){
	var UpData=function(){
			ActionBase.call(this,arguments[0]);
			this.name='UpData';
			this.run=function(){
				this.once();
				this.tCurrent=+new Date();	//获取当前时间
				this.tPool+=this.tCurrent-this.tPassed;	//用上次剩的时间加上这次的时间段
				this.tPassed=this.tCurrent;	//保存为上次运算后的时间.
				var isChange=false;
				while(this.tPool>this.partTime){
					this.t++;
					this.tPool-=this.partTime;
					isChange=true;
				}
				if(isChange){
					if(this.obj.upData(this.t)){
						return 'end';
					}
				}
				if(this.t>=this.time && this.loop==false){
					return 'end';
				}else if(this.t>=this.time && this.loop==true){
					this.t=0;
					var _list=this.saveList;
					this.saveList=this.attrList;
					this.attrList=_list;
					_list=null;
					return 'loop';
				}
				return false;	
			}		
	}
	return new UpData(arguments[0]);
}
//自定义spine对象
ZhSpine=function(){
	if(typeof(arguments[0]) == 'object'){//使用传递过来的参数定义对象
		for(var key in arguments[0]){
			this[key]=arguments[0][key];
		}
	}
	this.list={};		//骨骼动画列表
	this.path='level/'+this.levelName+'/res/spine/';
	this.infoList={};	//建造信息列表
	this.drawList=[];		//绘制列表,深度信息
}
ZhSpine.info=function(){
	this.name='';
	this.path='';
	this.eId=0;
	this.atlasText='';
	this.spineJsonText='';
	this.z=0;
}
ZhSpine.prototype.load=function(i,res){
	var _this=this;
	var _name=res.list[i].name;
	var _info=new ZhSpine.info();
	_info.name=_name;
	_info.path=this.path;
	if(typeof(res.list[i].z)!='undefined') _info.z=parseInt(res.list[i].z);
	this.infoList[_info.name]=_info;
	var _element=new Image();
	_element.onload=function(){
		_this.ZG.res.eList.push(this);
		_info.eId=_this.ZG.res.eList.length-1;
		_this.loadJsonText(_info);
		res.list[i].status='complete';
		res.load(i+1);
		}
	_element.src=_info.path+_info.name+'.png';
}
ZhSpine.prototype.loadJsonText=function(info){
	var _url=info.path+info.name;
	new ZhGame.ajax({executor:this,url:_url+'.atlas',success:function(data){
		info.atlasText=data;		
	}});
	new ZhGame.ajax({executor:this,url:_url+'.json',success:function(data){
		info.spineJsonText=data;		
	}});
}
ZhSpine.prototype.make=function(){
	var name=typeof(arguments[0]['name'])!='undefined'?arguments[0]['name']:'无名';	
	var _spine=new ZhSpine.spine({"name":name}).init(this.infoList[arguments[0]['infoName']]);
	_spine.move(arguments[0].x,arguments[0].y);	
	var _n1=Math.random()*100|0;
	var _n2=Math.random()*100|0;
	var _index=+new Date();
	_index='_'+_index+'_'+_n1+'_'+_n2;
	this.list[_index]=_spine;
	this.flushDrawList();
	return _index;
}
//删除spine对象
ZhSpine.prototype.del=function(id){
	delete this.list[id];
	//this.flushDrawList();
}
//刷新绘制深度信息.
ZhSpine.prototype.flushDrawList=function(){
	this.drawList=[];
	for(var i in this.list){
		this.drawList.push(this.list[i]);
	}
	this.drawList.sort(function(a,b){
		return b.z-a.z;
	})
}
ZhSpine.spine=function(){
	this.lastTime = Date.now();
	this.name='spine';
	return this;
}
ZhSpine.spine.prototype={
	skeletonData: null,
	state: null,
	scale: 1,
	skeleton: null,
	atlas:null,
	eId:0,
	active:true,
	x:0,
	y:0,
	init:function(info){
			var textureLoader=function(){
				this.load=function(page,line,obj){};
				this.unload=function(){};
			}
			this.eId=info.eId;
			this.z=info.z;
			this.atlas=new spine.Atlas(info.atlasText,new textureLoader());
			this.atlasLoader=new spine.AtlasAttachmentLoader(this.atlas);
			this.json = new spine.SkeletonJson(this.atlasLoader);
			this.json.atlas=this.scale;
			this.skeletonData = this.json.readSkeletonData(JSON.parse(info.spineJsonText));
			spine.Bone.yDown = true;				
			this.skeleton = new spine.Skeleton(this.skeletonData);
			var stateData = new spine.AnimationStateData(this.skeletonData);
			this.state = new spine.AnimationState(stateData);			
			this.state.timeScale=1;
			this.state.data.defaultMix = .1;
			this.state.data.setMix(this.skeletonData.animations[0],this.skeletonData.animations[1],.1);
			var _this=this;
			this.state.onStart=function(){
				//if(this.data.skeletonData.animations.length>2){
					_this.setToSetupPose();
				//}
			}
			this.state.onEnd=function(){
				//if(this.data.skeletonData.animations.length>2){
					//_this.setToSetupPose();
				//}
			}
			var _action=typeof(info.action)!='undefined'?info.action:'idle';
			this.state.setAnimationByName(0, _action, true);

			return this;
	},
	move:function(x,y){
		if(typeof(x)!='undefined')this.x=x;
		if(typeof(y)!='undefined')this.y=y;
		return this;
	},
	update: function() {
		if(!this.active)return;
		var now = Date.now();
		var delta = (now - this.lastTime) / 1000;
		this.lastTime = now;
		this.skeleton.x = this.x;
		this.skeleton.y = this.y;
		this.state.update(delta);
		this.state.apply(this.skeleton);
		this.skeleton.updateWorldTransform();
	},

	render: function(context,res) {
		context.save();
		var skeleton = this.skeleton, drawOrder = skeleton.drawOrder;
		context.translate(skeleton.x, skeleton.y);

		for (var i = 0, n = drawOrder.length; i < n; i++) {
			var slot = drawOrder[i];
			var attachment = slot.attachment;
			if (!(attachment instanceof spine.RegionAttachment)) continue;
			var bone = slot.bone;

			var x = bone.worldX + attachment.x * bone.m00 + attachment.y * bone.m01;
			var y = bone.worldY + attachment.x * bone.m10 + attachment.y * bone.m11;
			var rotation = -(bone.worldRotation + attachment.rotation) * Math.PI / 180;
			var w = attachment.width, h = attachment.height;
			context.save();
			context.translate(x, y);
			context.rotate(rotation);
			context.scale(bone.worldScaleY,bone.worldScaleX);		
			var _elWidth=attachment.regionWidth;
			var _elHeight=attachment.regionHeight;
			var _dx=-(attachment.width/2)|0;
			var _dy=-(attachment.height/2)|0;
			context.drawImage(res.eList[this.eId],attachment.rendererObject.x,attachment.rendererObject.y,_elWidth,_elHeight,_dx,_dy,attachment.width,attachment.height);		
			context.restore();
		}
		//context.translate(-skeleton.x, -skeleton.y);
		context.restore();
	}
	,setToSetupPose:function(){
		var _this=this;
		setTimeout(function(){
			_this.skeleton.setToSetupPose();
		},200);
	}
}
