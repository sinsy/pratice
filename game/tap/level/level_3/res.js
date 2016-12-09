//关卡的资源管理
Res=function(){
	this.list=new Array(); 	//资源信息列表
}
Res.prototype.getResIdByName=function(name,type){
	type=type?type:'img';
	for(var i=0;i<this.list.length;i++){
		//if(this.list[i].name==name && this.list[i].type==type)return i;
		if(this.list[i].name==name && this.list[i].type==type)return this.list[i].eId;
	}
	return -1;
}
Res.prototype.getInfoIdByName=function(name,type){
	type=type?type:'img';
	for(var i=0;i<this.list.length;i++){
		//if(this.list[i].name==name && this.list[i].type==type)return i;
		if(this.list[i].name==name && this.list[i].type==type)return i;
	}
}
Res.prototype.getInfo=function(id,type){
	type=type?type:'img';
	if(isNaN(id)){
		for(var i=0;i<this.list.length;i++){
		//if(this.list[i].name==name && this.list[i].type==type)return i;
		if(this.list[i].name==id && this.list[i].type==type)return this.list[i];
		}
	}else{
		return this.list[id];
	}
	return false;
}
Res.prototype.getFrame=function(elName,frName){
	var _id=this.getInfoIdByName(elName,'animation');
	var _info=this.getInfo(_id,'animation');
	return _info.aniData.frames[frName+'.png'];
	
}
