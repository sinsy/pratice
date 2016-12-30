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
var Res = (function() {
    var list = new Array();
    var eList = new Array();

    function init() {
        loadList();
    }

    function loadList() {
        var _inList = [ {
            "url": "1.png",
            'role': 'man0',
            part: 'face'
        }, {
            "url": "2.png",
            'role': 'man2',
            part: 'face'
        },
        {'url':'skeleton.spine', "z":"100"},
        {'url': 'skeleton.spine'}];
        for (i in _inList) {
            list.push(_inList[i]);
        }
        for (i in list) {
            list[i].extension = getExtension(list[i].url);
            list[i].name = getName(list[i].url);
        }
        load();
    }

    function load(i) {
        if (typeof(i) == 'undefined') i = 0;
		if(i>=list.length || i<0){
			return;
		}
        switch (list[i].extension) {
            case 'jpg':
            case 'png':
                loadImg(i);
                break;
            case 'mp3':
            case 'aac':
            case 'ogg':
                loadAudio(i);
                break;
            case 'js':
                loadJs(i);
                break;
            case 'ani':
                loadAni(i);
                break;
            case 'spine':
                loadSpine(i);
                break;
            case 'config':
                loadConfig(i);
                break;
            default:
                list[i].status = 'err';
                load(i + 1);
        }
    }

    function loadImg(i) {
        list[i].type = 'img';
        var _element = new Image();
        _element.onload = function() {
            eList.push(this);
            list[i].status = 'complete';
            list[i].eId = eList.length - 1;
            load(i + 1);
        }
        _element.onerror = function() {
            throw ('读取图片错误,url:' + _element.src);
        }
        if (isValidURL(list[i].url)) {
            _element.src = list[i].url;
        } else {
            _element.src = './' + list[i].url;
        }
    }

    function loadSpine(i) {
        list[i].type = 'spine';
        ZhSpine.load(i);
    }

    /*以下三个事件未重写*/
    function loadAudio(i) {
        list[i].type = 'audio';
        var _element = document.createElement("audio");
        _element.volume = list[i].volume ? list[i].volume : .5;
        _element.loop = list[i].loop ? list[i].loop : false;
        _element.autoplay = list[i].autoplay ? list[i].autoplay : false;
        //	var _audio=new CpzAudio();
        function checkLoad(_this) {
            if (_element.networkState == 1) {
                _this.eList.push(_element);
                list[i].status = 'complete';
                list[i].eId = _this.eList.length - 1;
                if (list[i].name == 'bg') { //如果是背景音乐
                    //_this.ZG.bgAudio.audio.src='level/'+_this.levelName+'/res/audio/'+list[i].url;
                } else { //否则是效果音乐
                    _this.ZG.audio.audio.src = 'level/' + _this.levelName + '/res/audio/' + list[i].url;
                    for (var a in list[i].list) {
                        _this.ZG.audio.list[list[i].list[a].name] = list[i].list[a];
                    }
                    list[i].list = _this.ZG.audio.list; //反向设定资源列表为对象
                }
                _this.load(i + 1);
            } else {
                //console.log(list[i].url+' 长度: '+list[i].audio.webkitAudioDecodedByteCount);
                setTimeout(function() {
                    checkLoad(_this);
                }, 300);
            }
        }
        _element.src = 'level/' + this.levelName + '/res/audio/' + list[i].url;
        checkLoad(_this);
    }

    function loadAni(i) {
        var resThis = this;
        relist[i].type = 'animation';

        $g().ajax({
            url: 'level/' + this.levelName + '/res/animation/' + list[i].name + '.json',
            success: function(data) {
                relist[i].aniData = JSON.parse(data);
                var _element = new Image();
                _element.onload = function() {
                    resThis.eList.push(_element);
                    relist[i].status = 'complete';
                    relist[i].eId = resThis.eList.length - 1;
                    resThis.load(i + 1);
                }
                _element.onerror = function() {
                    throw ('读取动画图片错误,url:' + _element.src);
                }
                _element.src = 'level/' + resThis.levelName + '/res/animation/' + relist[i].aniData.meta.image;
            }
        });

    }

    function loadConfig(i) {
        list[i].type = 'config';
        ajax({
            executor: this,
            url: '/center/getInfo/' + list[i].gameId,
            success: function(data) {
                list[i].config = JSON.parse(data);
                this.load(i + 1);
            }
        });
    }

    function isValidURL(url) {
        var urlRegExp = /^((https|http|ftp|rtsp|mms)?:\/\/)+[A-Za-z0-9]+\.[A-Za-z0-9]+[\/=\?%\-&_~`@[\]\':+!]*([^<>\"\"])*$/;
        if (urlRegExp.test(url)) {
            return true;
        } else {
            return false;
        }
    }

    function getExtension(url) {
        return url.substring(url.lastIndexOf('.') + 1, url.length)
    }

    function getName(url) {
        url = url.replace(/(.*\/)*([^.]+).*/ig, "$2");
        return url;
    }
    return {
        init: init,
        list: list,
        eList: eList,
        load: load
    }
})();


var View = (function() {})();