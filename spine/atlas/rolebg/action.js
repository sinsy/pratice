var ZhSpine = (function() {
    var list = {}; //骨骼动画列表
    var path = '../data/';
    var infoList = {}; //建造信息列表
    var drawList = []; //绘制列表,深度信息
    var info = function() {
        this.name = '';
        this.path = '';
        this.eId = 0;
        this.atlasText = '';
        this.spineJsonText = '';
        this.z = 0;
    }

    function load(i) {
        var _name = Res.list[i].name;
        var _info = new ZhSpine.info();
        _info.name = _name;
        _info.path = path;
        if (typeof(Res.list[i].z) != 'undefined') _info.z = parseInt(Res.list[i].z);
        infoList[_info.name] = _info;
        var _element = new Image();
        _element.onload = function() {
            Res.eList.push(this);
            _info.eId = Res.eList.length - 1;
            loadJsonText(_info);
            Res.list[i].status = 'complete';
            Res.load(i + 1);
        }
        _element.src = _info.path + _info.name + '.png';
    }

    function loadJsonText(info) {
        var _url = info.path + info.name;
        ajax({
            executor: this,
            url: _url + '.atlas',
            success: function(data) {
                info.atlasText = data;
            }
        });
        ajax({
            executor: this,
            url: _url + '.json',
            success: function(data) {
                info.spineJsonText = data;
            }
        });
    }

    function make() {
        var name = typeof(arguments[0]['name']) != 'undefined' ? arguments[0]['name'] : '无名';
        var _scale = typeof(arguments[0]['scale']) != 'undefined' ? arguments[0]['scale'] : 1;
        var _active = typeof(arguments[0]['active']) != 'undefined' ? arguments[0]['active'] : true;
        var _action = typeof(arguments[0]['action']) != 'undefined' ? arguments[0]['action'] : '';
        var _x = typeof(arguments[0]['x']) != 'undefined' ? arguments[0]['x'] : -1000;
        var _y = typeof(arguments[0]['y']) != 'undefined' ? arguments[0]['y'] : -1000;
        var part = typeof(arguments[0]['part']) != 'undefined' ? arguments[0]['part'] : false;
        var _spine = new ZhSpine.spineRole({name:name
        ,infoName:name
        ,action:_action
        ,scale:_scale
        ,active:_active,x:_x,y:_y,
        part:part}).init(infoList[arguments[0]['infoName']]);
        _spine.move(_x, _y);
        var _n1 = Math.random() * 100 | 0;
        var _n2 = Math.random() * 100 | 0;
        var _index = +new Date();
        _index = '_' + _index + '_' + _n1 + '_' + _n2;
        _spine.update();
        list[_index] = _spine;
        flushDrawList();
        return _index;
    }
    //删除spine对象
    function del(id) {
        delete this.list[id];
        //this.flushDrawList();
    }
    //刷新绘制深度信息.
    function flushDrawList() {
        this.drawList = [];
        for (var i in this.list) {
            this.drawList.push(this.list[i]);
        }
        this.drawList.sort(function(a, b) {
            return b.z - a.z;
        })
    }
var spineRole = function() {
    this.lastTime = Date.now();
    this.name = 'spine';
    for (var key in arguments[0]) {
        this[key] = arguments[0][key];
    }
 console.log(this)
    return this;
}
spineRole.prototype = {
    skeletonData: null,
    state: null,
    scale: 1,
    skeleton: null,
    atlas: null,
    eId: 0,
    active: true,
    x: 0,
    y: 0,
    init: function(info) {
        var textureLoader = function() {
            this.load = function(page, line, obj) {};
            this.unload = function() {};
        }
        this.eId = info.eId;
        this.z = info.z;
        this.atlas = new spine.Atlas(info.atlasText, new textureLoader());
        this.atlasLoader = new spine.AtlasAttachmentLoader(this.atlas);
        this.json = new spine.SkeletonJson(this.atlasLoader);
        this.json.scale = this.scale;
        this.skeletonData = this.json.readSkeletonData(JSON.parse(info.spineJsonText));
        spine.Bone.yDown = true;
        this.skeleton = new spine.Skeleton(this.skeletonData);

        var stateData = new spine.AnimationStateData(this.skeletonData);
        this.state = new spine.AnimationState(stateData);
        this.state.timeScale = 1;
        this.state.data.defaultMix = 0;

        //this.state.data.setMix(this.skeletonData.animations[0],this.skeletonData.animations[1],.1);
        var _this = this;
        this.state.onStart = function() {
            //if(this.data.skeletonData.animations.length>2){
            _this.setToSetupPose();
            //}
        }
        this.state.onEnd = function() {
            //if(this.data.skeletonData.animations.length>2){
            //_this.setToSetupPose();
            //}
        }
        console.log(this)
        var _action = this.action=='' ? 'idle' : this.action;
        this.state.setAnimationByName(0, _action, true);
        return this;
    },
    move: function(x, y) {
        if (typeof(x) != 'undefined') this.x = x;
        if (typeof(y) != 'undefined') this.y = y;
        return this;
    },
    update: function() {
        if (!this.active || this.eId == -1) return;
        var now = Date.now();
        var delta = (now - this.lastTime) / 1000;
        this.lastTime = now;
        this.skeleton.x = this.x;
        this.skeleton.y = this.y;
        this.state.update(delta);
        this.state.apply(this.skeleton);
        this.skeleton.updateWorldTransform();
    },

    render: function(context, res) {
        if (!this.active) return;
        context.save();
        var skeleton = this.skeleton,
            drawOrder = skeleton.drawOrder;
        context.translate(skeleton.x, skeleton.y);

        for (var i = 0, n = drawOrder.length; i < n; i++) {
            var slot = drawOrder[i];
            var attachment = slot.attachment;
            if (!(attachment instanceof spine.RegionAttachment)) continue;
            var bone = slot.bone;

            var x = bone.worldX + attachment.x * bone.m00 + attachment.y * bone.m01;
            var y = bone.worldY + attachment.x * bone.m10 + attachment.y * bone.m11;
            var rotation = -(bone.worldRotation + attachment.rotation) * Math.PI / 180;
            var w = attachment.width,
                h = attachment.height;
            context.save();
            context.translate(x, y);
            context.rotate(rotation);
            context.scale(bone.worldScaleY, bone.worldScaleX);
            var _elWidth = attachment.regionWidth;
            var _elHeight = attachment.regionHeight;
            var _dx = -(attachment.width / 2) | 0;
            var _dy = -(attachment.height / 2) | 0;
            var obj = null;
            if(this.part){
            	var obj = null;
	            for(var key in this.part){
	            	if(attachment.name == key){
	            		obj = res.eList[this.part[key]];
	            		break;
	            	}
	            }
            }
            if(obj){
            	context.drawImage(res.eList[this.part[key]],-attachment.width/2,-attachment.height/2,attachment.width,attachment.height);
            }else{
	    		context.drawImage(res.eList[this.eId], attachment.rendererObject.x, attachment.rendererObject.y, _elWidth, _elHeight, _dx, _dy, attachment.width, attachment.height);
            }

            context.restore();
        }
        //context.translate(-skeleton.x, -skeleton.y);
        context.restore();
    },
    setToSetupPose: function() {
        var _this = this;
        setTimeout(function() {
            _this.skeleton.setToSetupPose();
        }, 200);
    }

}
return {
	load: load,
	info: info,
	infoList: infoList,
	make: make,
	spineRole:spineRole,
	list: list
}
})();