//视图类
function systemView(){
	ViewBase.call(this,arguments[0]);
	if(typeof(arguments[0]) == 'object'){
		for(var key in arguments[0]){
			this[key]=arguments[0][key];
		}
	}
	this.isLoop=true;
	this.addClass('canvasCenter');
	this.set();
	this.ZG.reSizeList.push(this);
	this.reSize=function(){
		if(this.ZG.innerWH>this.wh){//屏幕宽高比跟场景宽高比对比,进行样式适配
			this.canvas.style['height']	=	'100%';
			this.canvas.style['width']	=	'auto';
			this.canvas.style['top']	=	'0px';
		}else{
			this.canvas.style['height']	=	'auto';
			this.canvas.style['width']	=	this.ZG.innerWidth+'px';
			this.canvas.style['top']	=	this.ZG.offsetTop+'px';
		}
		this.offsetWidth=parseInt(this.canvas.offsetWidth);
		this.offsetHeight=parseInt(this.canvas.offsetHeight);
		this.offsetLeft=(this.ZG.innerWidth-this.offsetWidth)/2|0;
		this.canvas.style['left']=this.offsetLeft+'px';		
	}
	this.draw=function(){
		this.ctx.clearRect(0,0,this.width,this.height);
        var _l=this.drawList.length;
        while(_l){
            _l--;
            this.drawList[_l].draw();
        }

        this.ZG.postMessage({'type':'flushData'});
	}
}
