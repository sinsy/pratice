/******************************************************************************
 * Spine Runtimes Software License
 * Version 2.3
 * 
 * Copyright (c) 2013-2015, Esoteric Software
 * All rights reserved.
 * 
 * You are granted a perpetual, non-exclusive, non-sublicensable and
 * non-transferable license to use, install, execute and perform the Spine
 * Runtimes Software (the "Software") and derivative works solely for personal
 * or internal use. Without the written permission of Esoteric Software (see
 * Section 2 of the Spine Software License Agreement), you may not (a) modify,
 * translate, adapt or otherwise create derivative works, improvements of the
 * Software or develop new applications using the Software or (b) remove,
 * delete, alter or obscure any trademarks or any copyright, trademark, patent
 * or other intellectual property or proprietary rights notices on or in the
 * Software, including any copy thereof. Redistributions in binary or source
 * form must include this license and terms.
 * 
 * THIS SOFTWARE IS PROVIDED BY ESOTERIC SOFTWARE "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO
 * EVENT SHALL ESOTERIC SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 * OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 * WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
 * OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
 * ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *****************************************************************************/

spine.SkeletonRenderer = function (imagesPath) {
	this.imagesPath = imagesPath;
	this.lastTime = Date.now();
};

spine.SkeletonRenderer.prototype = {
	skeletonData: null,
	state: null,
	scale: 1,
	skeleton: null,
	atlas:null,
	load: function(obj) {
		this.initAtlas(obj);
			
	},

	initAtlas:function(obj){
		var _url='../data/'+obj.name+'.atlas';
		var _self=this;
		ajax({url:_url,success:function(data){
			textureLoader=function(){
				this.load=function(page,line,obj){
					page.el=new Image();
					page.el.src='../data/'+line;
				};
				this.unload=function(){				
					console.log('load');
					console.dir(arguments);
				};
			}
			_self.atlas=new spine.Atlas(data,new textureLoader());
			_self.atlasLoader=new spine.AtlasAttachmentLoader(_self.atlas);
			_self.json = new spine.SkeletonJson(_self.atlasLoader);
			_self.json.atlas=_self.atlas; 
			_self.json.scale = _self.scale;
			_self.initObj(obj);
		}});
	},
	initObj:function(obj){

		var _self=this;
		_url='../data/'+obj.name+'.json';	
		ajax({url:_url,success:function(data){
			_self.skeletonData = _self.json.readSkeletonData(JSON.parse(data));
			spine.Bone.yDown = true;				
			_self.skeleton = new spine.Skeleton(_self.skeletonData);
	
			var stateData = new spine.AnimationStateData(_self.skeletonData);
			_self.state = new spine.AnimationState(stateData);
			_self.state.onEnd=function(){
				console.log('end');
			}

			_self.state.timeScale=1;
			_self.state.data.defaultMix = .4;
			_self.state.data.setMix('idle','idle');
			_self.state.setAnimationByName(0, "animation", true);
			// renderer.state.addAnimationByName(0, "jump", false, 3);
			// renderer.state.addAnimationByName(0, "run", true, 0);
			_self.skeleton.x = obj.x;
			_self.skeleton.y = obj.y;
			_self.status = 'ok';
			obj.callback(_self)
			// _self.animate("objCanvas");
		}});
	},
	update: function() {
		var now = Date.now();
		var delta = (now - this.lastTime) / 1000;
		this.lastTime = now;

		this.state.update(delta);
		this.state.apply(this.skeleton);
		this.skeleton.updateWorldTransform();
	},

	render: function(context) {
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
			if(attachment.name == 'face'){
				context.drawImage(attachment.image,-attachment.width/2,-attachment.height/2,attachment.width,attachment.height);		
			}else{
				context.drawImage(attachment.rendererObject.page.el,attachment.rendererObject.x,attachment.rendererObject.y,_elWidth,_elHeight,-attachment.width/2,-attachment.height/2,attachment.width,attachment.height);		
			}
			context.restore();
		}
		context.translate(-skeleton.x, -skeleton.y);
	},

	animate: function (id) {
		var canvas = document.getElementById(id);
		var context = canvas.getContext("2d");
		var requestAnimationFrame = window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			function (callback) {
				window.setTimeout(callback, 1000 / 60);
			};
		var self = this;
		function renderFrame () {
			context.clearRect(0, 0, canvas.width, canvas.height);
			self.update();
			self.render(context);
			requestAnimationFrame(renderFrame);
		};
		renderFrame();
	}
};
