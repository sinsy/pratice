//工作线程
var level='';						//关卡名


//基础工作线程信息相应,将会在关卡工作线程加载后替换掉.
onmessage = function (e) {
	try{
		var _r=JSON.parse(e.data);
	}catch(e){
		return;
	}
	
	switch(_r.type){
		case	'level':
			level=_r.data;
			importScripts('../level/'+level+'/levelWorker.js');	//读取关卡文件
		break;
	}
};

