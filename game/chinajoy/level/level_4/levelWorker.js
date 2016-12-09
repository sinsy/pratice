//console.log('level_0 levelWorker.js');
importScripts('../js/ZGCore.js');	//读取核心函数
importScripts('../level/level_4/res.js');	//读取资源设定
importScripts('../js/action.js');	//读取动作设定
importScripts('../js/ui.js');	//读取通用UI
importScripts('../level/level_4/actor.js');	//读取演员
var intervalId=null;				//循环事件ID
var flushData=true;					//要求更新数据
var width=480;						//宽度
var height=720;						//高度
var res=new Res();					//资源信息
var config={};					//配置信息
var isChange=false;					//数据是否更新,如果有,将会传回数据

var click=new Click();		//点击检查列表
var ui=new Ui();			//ui对象
var ui2=new Ui();			//ui对象
var am=new ActorManage();   //演员管理器
var action=new Action();	//动作对象
var turntable={};           //转盘
var saveData=null;          //进度数据
function init(){
	postMessage('{"type":"getInfo","data":""}');	//要求发送配置信息
}

init();
function gameStart(){
	if(intervalId==null){
		action.restore();
		intervalId=setInterval(loop,33);
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
	var _r=JSON.parse(e.data);
/*    try{
        var _data=JSON.parse(_r.data);
    }catch(err){
        console.log(err);
    }*/

	switch(_r.type){
		case	'flushData':
			flushData=true;
		break;
		case	'event':
			eventRount(_r.data);
		break;
		case	'info':
			setInfo(_r.data);
		break;
		case	'gamePause':
			gamePause();
		break;
		case	'gameRestart':
			gameStart();
		break;

        case	'shareOk':
            shareOk();
        break;
        case	'shareNo':
            shareNo();
        break;

        case	'sendSaveData':
            getSaveData(_r.data);
        break;
	}
};
//传递回去的演员数据,将会预格式化,避免放到主线程中去计算.
function formatData(){
    ui.update();
    var data;
    data = {
        'ui': ui
        ,'ui2':ui2
        ,'am':am
    };
	return data;
}

//关卡循环函数
function loop(){
	action.run();
	//如果后台数据更新了,并前端要求数据刷新为真,则传递回数据
	if(flushData){
		flushData=false;
		var data=formatData();
		postMessage('{"type":"changeData","data":'+JSON.stringify(data)+'}');
	}
}
//事件路由
function eventRount(e){
    e=JSON.parse(e);
	switch(e.event){
		case	'keydown':
			flushData=true;
		break;
		case	'click':
			if(!click.check(e.point)){
			}
		break;
	}
}

function setInfo(data){
    data=JSON.parse(data);
	res.list=data.resList;
	for(var i in res.list[0].config.config){
		config[res.list[0].config.config[i].attr]=res.list[0].config.config[i].value;
	}
    for(var i in res.list[0].config){
        config[i]=res.list[0].config[i];
    }
    config['localStorage']=data.localStorage;
	width=data.width;
	height=data.height;
	initUi();
    turntable=new Turntable({x:width/2|0,y:height *.6|0,scaleX:1,scaleY:1});
    //am.add(_turntable);
    //action.add(turntable,{'type':'Move',time:10,'data':{angle:360},TT:'Quint',TM:'easeInOut'});
	gameStart();
}

//初始化UI
function initUi(){
	ui.eId=res.getResIdByName('ui','animation');
	ui.make({
		'type':'static'
        ,index:'lottery'
		,x:width/2|0
		,y:height-100
        ,width:300
        ,height:100
        ,offsetX:-115
        ,offsetY:-35
		,fPoint:'button1'
        ,f:function(){
            var _t=0.15;
            action.add(this,[{'type':'Move',data:{scaleX:1.3},time:_t,TT:'Quint'},{'type':'Move',data:{scaleX:1},time:_t -.1}]);
            action.add(this,[{'type':'Move',data:{scaleY:1.3},time:_t,TT:'Quint'},{'type':'Move',data:{scaleY:1},time:_t -.1}]);
            getTurntable()
        }
	});
    ui.make({
        'type':'static'
        ,index:'point'
        ,x:width/2|0
        ,y:height *.6|0
        ,offsetX:-350
        ,offsetY:-350
        ,scaleX:1,scaleY:1
        ,fPoint:'point'
    });
    ui2.eId=res.getResIdByName('ui','animation');
}

//远程获取抽奖数据
function getTurntable(){
    if(typeof(config.localStorage.h5g_weixin_uid)=='undefined'){
        var data={};
        data.msg=('此页面需要在盗墓OL微信公众号内访问,请勿在外部浏览器访问,谢谢.');
        postMessage('{"type":"alert","data":'+JSON.stringify(data)+'}');
        throw('远程获取抽奖数据出错,无微信登录数据.');
        return;
    }
    ZGC.ajax({
        url:'/center/getTurntable/'+config.id+'/'+config.localStorage.h5g_weixin_uid
        ,success:function(data){
            try{
                saveData=JSON.parse(data);
                saveData.attr=JSON.parse(saveData.attr);
            }catch(e){
                var data={};
                data.msg=('抽奖返回数据格式错误!');
                postMessage('{"type":"alert","data":'+JSON.stringify(data)+'}');
            }
            postMessage('{"type":"saveData","data":'+data+'}');
            postMessage('{"type":"wxSet","data":'+JSON.stringify(saveData)+'}');
            var point=parseInt(saveData.attr.a);
            turntable.run(point);
        }
    });

}

//设定和弹出
function rotateDone(){
    var _popGroup=ui2.make({
        'type':'static'
        ,index:'img'
        ,x:0
        ,y:height
        ,offsetX:0
        ,offsetY:0
        ,t:[{text:saveData.name,x:400,y:860|0,textAlign:'left',fillStyle:'#d23305',font:'bold 48px 宋体,Arial'}]
        ,fPoint:'img'
    });
    action.add(_popGroup,{'type':'Move'
        ,time:.5
        ,'data':{y:0}
        ,TT:'Back'
        ,TM:'easeOut'
    });
    postMessage('{"type":"popWindow","data":""}');
}

//分享成功
function shareOk(){

    var _shareText=ui2.make({
        'type':'static'
        ,index:'shareText'
        ,x:(width-40)/2|0
        ,y:height
        ,'width':width-40
        ,'height':80
        ,offsetX:10
        ,offsetY:20
        ,t:[{text:'您已分享成功!快来找我们领奖吧!',x:(width-40)/2|0,y:960|0,textAlign:'center',fillStyle:'#f5ef76',font:'bold 45px 宋体,Arial'}]
    });
    action.add(_shareText,{'type':'Move'
        ,time:.5
        ,'data':{y:height-400}
        ,TT:'Back'
        ,TM:'easeOut'
    });
}
//分享失败
function shareNo(){
    var _shareText=ui2.make({
        'type':'static'
        ,index:'shareText'
        ,x:(width-40)/2|0
        ,y:height
        ,'width':width-40
        ,'height':80
        ,offsetX:10
        ,offsetY:20
        ,t:[{text:'您要分享我们到朋友圈,才能领奖哦!',x:(width-40)/2|0,y:960,textAlign:'center',fillStyle:'#f5ef76',font:'bold 45px 宋体,Arial'}]
    });
    action.add(_shareText,{'type':'Move'
        ,time:.5
        ,'data':{y:height-400}
        ,TT:'Back'
        ,TM:'easeOut'
    });
}

//接收发送来的存盘数据
function getSaveData(data){
    try{
        saveData=JSON.parse(data);
        saveData.attr=JSON.parse(saveData.attr);
        ui.del('lottery');
    }catch(e){}

}

