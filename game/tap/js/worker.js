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

onerror	=	function(msg,url,line,col,error){
	//console.dir(arguments);
	var _data={
		'msg':msg
		,'url':url
		,'line':line
		,'col':col
	};
	postMessage('{"type":"workError","data":'+JSON.stringify(_data)+'}');	
	return true;
}
