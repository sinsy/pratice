//基础视对象
function ViewBase(){
	this.width=0;
	this.height=0;
	this.zIndex=10;		//堆叠层次
	this.fps=33;		//帧率间隔时间
	this.isLoop=false;
	this.isPause=false;
    this.drawList=[];
    this.canvas=null;
	if(typeof(arguments[0]) == 'object'){
		for(var key in arguments[0]){
			this[key]=arguments[0][key];
		}
	}
    if(this.canvas==null){
        this.canvas=document.createElement('canvas');
        document.body.appendChild(this.canvas);
    }
	this.ctx=this.canvas.getContext('2d');
	
	this.set=function(){
		if(typeof(arguments[0]) == 'object'){
			for(var key in arguments[0]){
				this[key]=arguments[0][key];
				}
			}
		this.canvas.width=this.width;
		this.canvas.height=this.height;
		this.wh=this.width/this.height;
		this.canvas.style['z-index']=this.zIndex;
	};
	this.start=function(){
		this.isPause=false;
		this.loop();
	};
	this.stop=function(){
		clearTimeout(this.timeHand);
		this.gray();
		this.isPause=true;
	};
	this.loop=function(){
		var _this=this;
		this.draw();
		if(!this.isPause && this.isLoop ){
			this.timeHand=setTimeout(function(){
								_this.loop.call(_this);
								},this.fps);
		}
	};
	this.draw=function(){
		this.ctx.clearRect(0,0,this.width,this.height);
		this.ctx.save();
		this.ctx.fillStyle='#fff';
		this.ctx.fillRect(0,0,this.width,this.height);		
		this.ctx.restore();		
	};
	this.addClass=function(className){
		this.canvas.className+=(' '+className);
	};
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
	};
	this.gray=function(){
		var _imageData=this.ctx.getImageData(0,0,this.width,this.height);
		var _data=_imageData.data;
		var _l=_data.length;
		for(var i=0;i<_l;i+=4){
			var _gray=(_data[i]+_data[i+1]+_data[i])/3|0;
			_data[i]=_gray;
			_data[i+1]=_gray;
			_data[i+2]=_gray;
		}
		this.ctx.putImageData(_imageData,0,0);
	};
    this.addToDrawList=this.add=function(obj){
        if(typeof(obj)!='undefined'){
            obj.ctx=this.ctx;
            obj.res=this.ZG.res;
         this.drawList.push(obj);
        }
    };
    this.removeToDrawList=function(obj){


    }
	
}
