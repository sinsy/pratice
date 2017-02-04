/* 封装ajax函数
 * @param {string}opt.type http连接的方式，包括POST和GET两种方式
 * @param {string}opt.url 发送请求的url
 * @param {boolean}opt.async 是否为异步请求，true为异步的，false为同步的
 * @param {object}opt.data 发送的参数，格式为对象类型
 * @param {function}opt.success ajax发送并接收成功调用的回调函数
 */
function ajax(opt) {
    opt = opt || {};
    opt.method = opt.method || 'GET';
    opt.url = opt.url || '';
    opt.async = opt.async || true;
    opt.data = opt.data || null;
    opt.success = opt.success || function() {};
    var xmlHttp = null;
    if (XMLHttpRequest) {
        xmlHttp = new XMLHttpRequest();
    } else {
        xmlHttp = new ActiveXObject('Microsoft.XMLHTTP');
    }
    var params = [];
    for (var key in opt.data) {
        params.push(key + '=' + opt.data[key]);
    }
    var postData = params.join('&');
    if (opt.method.toUpperCase() === 'POST') {
        xmlHttp.open(opt.method, opt.url, opt.async);
        xmlHttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;charset=utf-8');
        xmlHttp.send(postData);
    } else if (opt.method.toUpperCase() === 'GET') {
        xmlHttp.open(opt.method, opt.url + '?' + postData, opt.async);
        xmlHttp.send(null);
    }
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            opt.success(xmlHttp.responseText);
        }
    };
}
var Res = function(data,zhSpine) {
    this.list = new Array();
    this.eList = new Array();
    this.loadList(data);
    this.zhSpine = zhSpine;
}

Res.prototype.loadList = function(arr) {
    var _inList = arr;
    for (i in _inList) {
        this.list.push(_inList[i]);
    }
    for (i in this.list) {
        this.list[i].extension = this.getExtension(this.list[i].url);
        this.list[i].name = this.getName(this.list[i].url);
    }
    this.load();
}
Res.prototype.load = function(i) {
    if (typeof(i) == 'undefined') i = 0;
    if (i >= this.list.length || i < 0) {
        return;
    }
    switch (this.list[i].extension) {
        case 'jpg':
        case 'png':
            this.loadImg(i);
            break;
        case 'mp3':
        case 'aac':
        case 'ogg':
            this.loadAudio(i);
            break;
        case 'js':
            this.loadJs(i);
            break;
        case 'ani':
            this.loadAni(i);
            break;
        case 'spine':
            this.loadSpine(i);
            break;
        case 'config':
            this.loadConfig(i);
            break;
        default:
            this.list[i].status = 'err';
            load(i + 1);
    }
}

Res.prototype.loadImg = function(i) {
    var _this = this;
    this.list[i].type = 'img';
    var _element = new Image();
    _element.onload = function() {
        _this.eList.push(this);
        _this.list[i].status = 'complete';
        _this.list[i].eId = _this.eList.length - 1;
        _this.load(i + 1);
    }
    _element.onerror = function() {
        throw ('读取图片错误,url:' + _element.src);
    }
    if (this.isValidURL(this.list[i].url)) {
        _element.src = this.list[i].url;
    } else {
        _element.src = './' + this.list[i].url;
    }
}

Res.prototype.loadSpine = function(i) {
    this.list[i].type = 'spine';
    this.zhSpine.load(i, this);
}



Res.prototype.isValidURL = function(url) {
    var urlRegExp = /^((https|http|ftp|rtsp|mms)?:\/\/)+[A-Za-z0-9]+\.[A-Za-z0-9]+[\/=\?%\-&_~`@[\]\':+!]*([^<>\"\"])*$/;
    if (urlRegExp.test(url)) {
        return true;
    } else {
        return false;
    }
}
Res.prototype.getExtension = function(url) {
    var name = url.substring(url.lastIndexOf('.') + 1, url.length);
    name = name.indexOf('?')>-1? name.split('?')[0]:name;
    return name;
}

Res.prototype.getName = function(url) {
    url = url.replace(/(.*\/)*([^.]+).*/ig, "$2");
    return url;
}


var ZhSpine = function() {
    this.list = {}; //骨骼动画列表
    this.path = 'http://static.playwx.com/hd/static/abNewYear/data/';
    this.path = '../../data/';
    this.infoList = {}; //建造信息列表
    this.drawList = []; //绘制列表,深度信息
}
ZhSpine.info = function() {
    this.name = '';
    this.path = '';
    this.eId = 0;
    this.atlasText = '';
    this.spineJsonText = '';
    this.z = 0;
}
ZhSpine.prototype.load = function(i, res) {
    var _this = this;
    var _name = res.list[i].name;
    var _info = new ZhSpine.info();
    _info.name = _name;
    _info.path = this.path;
    if (typeof(res.list[i].z) != 'undefined') _info.z = parseInt(res.list[i].z);
    this.infoList[_info.name] = _info;
    var _element = new Image();
    _element.onload = function() {
        res.eList.push(this);
        _info.eId = res.eList.length - 1;
        _this.loadJsonText(_info);
        var time = setInterval(function() {
            if (_info.atlasText != '' && _info.spineJsonText != '') {
                res.list[i].status = 'complete';
                res.load(i + 1);
                clearInterval(time);
            }
        }, 30);
    }
    _element.src = _info.path + _info.name + '.png';
}

ZhSpine.prototype.loadJsonText = function(info) {
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

ZhSpine.prototype.make = function() {
        var name = typeof(arguments[0]['name']) != 'undefined' ? arguments[0]['name'] : '无名';
        var _scale = typeof(arguments[0]['scale']) != 'undefined' ? arguments[0]['scale'] : 1;
        var _active = typeof(arguments[0]['active']) != 'undefined' ? arguments[0]['active'] : true;
        var _action = typeof(arguments[0]['action']) != 'undefined' ? arguments[0]['action'] : '';
        var _x = typeof(arguments[0]['x']) != 'undefined' ? arguments[0]['x'] : -1000;
        var _y = typeof(arguments[0]['y']) != 'undefined' ? arguments[0]['y'] : -1000;
        var _part = typeof(arguments[0]['part']) != 'undefined' ? arguments[0]['part'] : false;
        var _actionEvent = typeof(arguments[0]['actionEvent']) != 'undefined' ? arguments[0]['actionEvent'] : false;
        var _alpha = typeof(arguments[0]['alpha']) != 'undefined' ? arguments[0]['alpha'] : false;
        var data = {
            name: name,
            infoName: name,
            action: _action,
            scale: _scale,
            active: _active,
            x: _x,
            y: _y,
            part: _part,
            actionEvent: _actionEvent,
            startTime: Date.now(),
            alpha: _alpha
        };
        var _spine = new ZhSpine.spine(data).init(this.infoList[arguments[0]['infoName']]);
        _spine.move(_x, _y);
        var _n1 = Math.random() * 100 | 0;
        var _n2 = Math.random() * 100 | 0;
        var _index = +new Date();
        _index = '_' + _index + '_' + _n1 + '_' + _n2;
        _spine.update();
        this.list[_index] = _spine;
        this.flushDrawList();
        return _index;
    }
    //删除spine对象
ZhSpine.prototype.del = function(id) {
        delete this.list[id];
        //this.flushDrawList();
    }
    //刷新绘制深度信息.
ZhSpine.prototype.flushDrawList = function() {
    this.drawList = [];
    for (var i in this.list) {
        this.drawList.push(this.list[i]);
    }
    this.drawList.sort(function(a, b) {
        return b.z - a.z;
    })
}
ZhSpine.spine = function() {
    this.lastTime = Date.now();
    this.name = 'spine';
    for (var key in arguments[0]) {
        this[key] = arguments[0][key];
    }
    return this;
}
ZhSpine.spine.prototype = {
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
        this.state.timeScale = .7;
        this.state.data.defaultMix = 0;

        var _this = this;
        var _action = this.action == '' ? 'idle' : this.action;
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
        if(this.alpha != -1){
            context.globalAlpha = this.alpha;
        }
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
            if (this.part) {
                var obj = null;
                for (var key in this.part) {
                    if (attachment.name == key) {
                        obj = res.eList[this.part[key]];
                        break;
                    }
                }
            }
            if (obj) {
                context.drawImage(res.eList[this.part[key]], -attachment.width / 2, -attachment.height / 2, attachment.width, attachment.height);
            } else {
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


var BoneCanvas = (function() {
    var res ;
    var zhSpine;
    function init(arr) {
        // $('.page[type="pageMake"]').show();
        zhSpine = new ZhSpine();
        res = new Res(arr, zhSpine);
        update();
    }


    function update() {
        var list = res.list;
        var max = res.list.length;
        var n = 0;
        var p;
        for (var i in list) {
            p = list[i];
            // console.log(p.status);
            if ('status' in p) {
                n++;
            }
        }
        r = n / max;

        if (r < 1) {
            setTimeout(update, 50);
        } else {
            // setTimeout(initCanvas, 1000)
            initCanvas();
            setTimeout(function(){
                // $('.page[type="pageMake"]').hide();
            },100)
        }
    }

    function initCanvas() {
        var canvas = document.getElementById('objCanvas');
        var context = canvas.getContext("2d");
        var requestAnimationFrame = window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            function(callback) {
                window.setTimeout(callback, 1000 / 60);
            };
        var pr = 1;
        if (window.devicePixelRatio) {
            pr = window.devicePixelRatio;
        }
        canvas.width = 320 * pr;
        canvas.height = 450 * pr;
        context.clearRect(0, 0, canvas.width, canvas.height);
        var actionArr = ['HappyNewYear', 'ApplePen'];
        var roleData = [{
            name: 'man0',
            infoName: 'people',
            action: actionArr[0],
            actionEvent : [
                {name:actionArr[0], event:[{name: 'appear', duration:0}], timeScale:.8},
                {name:actionArr[1], event:[{name: 'appear', duration:3000}], timeScale:1}
            ],
            scale: .14 * pr,
            active: true,
            x: 60 * pr,
            y: 380 * pr,
            part: {}
        }, {
            name: 'man2',
            infoName: 'people',
            action: actionArr[0],
            actionEvent : [
                {name:actionArr[0], event:[{name: 'appear', duration:0}], timeScale:.8},
                {name:actionArr[1], event:[{name: 'appear', duration:3000}], timeScale:1}
            ],
            scale: .14 * pr,
            active: true,
            x: 250 * pr,
            y: 380 * pr,
            part: {}
        }, {
            name: 'man1',
            infoName: 'people',
            action: actionArr[0],
            actionEvent : [
                {name:actionArr[0], event:[{name: 'appear', duration:0}], timeScale:.8},
                {name:actionArr[1], event:[{name: 'appear', duration:0}], timeScale:1}
            ],
            scale: .17 * pr,
            active: true,
            x: 160 * pr,
            y: 420 * pr,
            part: {}
        }]

        for (var i in roleData) {
            var data = roleData[i];
            for (var j in res.list) {
                var p = res.list[j];
                if ('role' in p) {
                    if (p.role == data.name) {
                        data.part[p.part] = j;
                    }
                }
            }
            var _id = zhSpine.make(data);
            zhSpine.list[_id];
        }
        renderFrame();
        canvas.addEventListener('click', changeAnimation, false);
        var count = 0;
        function changeAnimation(e){
           count++;
           if(count >= actionArr.length){
            count = 0;
           }
            for(var key in zhSpine.list){
                zhSpine.list[key].action = actionArr[count];
                zhSpine.list[key].state.setAnimationByName(0, zhSpine.list[key].action, true, 0);                    
                zhSpine.list[key].startTime=Date.now();
            }
        }

        function renderFrame() {
            context.clearRect(0, 0, canvas.width, canvas.height);
            for (var i in zhSpine.list) {
                setAction(zhSpine.list[i]);
                zhSpine.list[i].update();
                zhSpine.list[i].render(context, res);
            }
            requestAnimationFrame(renderFrame);
        }
        function setAction(obj){
            if(obj.actionEvent){
                var actionEvent = obj.actionEvent;
                var actionEvent_event = [];
                for(var i in actionEvent){
                    if(actionEvent[i].name == obj.action){
                        actionEvent_event = actionEvent[i].event;
                        obj.state.timeScale = actionEvent[i].timeScale;
                        break;
                    }
                }
                for(var i in actionEvent_event){
                    var d=Date.now();
                    var o = actionEvent_event[i]
                    switch(o.name){
                        case 'appear':
                            var p=(d-obj.startTime)/o.duration;
                            if(p>1){
                                obj.alpha = 1;
                            }else{
                                obj.alpha = 0;
                            }
                            break;
                    }
                }
            }
        }
    }
    return {
        init: init,
        initCanvas: initCanvas,
        res: res
    }
})();