define([
        './Abstract',
        '../../browser/getStyle'
    ], function(Abstract, getStyle){

    var undef;

    function ImageItem(url, cfg){
        if(!url) return;
        _super.constructor.apply(this, arguments);
        this.content = new Image();
    }

    ImageItem.type = 'image';
    ImageItem.extensions = ['jpg', 'gif', 'png'];

    var __bufferList;

    function __isImageURL(url) {
        return url.indexOf('data:') !== 0;
    }

    function __addBackgroundUrl(str, url) {
        __bufferList.push(url);
    }

    ImageItem.retrieve = function(target){
        if(target.nodeType && target.style) {
            __bufferList = [];
            if((target.nodeName.toLowerCase() == 'img') && (target.src.indexOf(';') < 0)) {
                __bufferList.push(target.src);
            }
            getStyle(target).getPropertyValue('background-image').replace(/s?url\(\s*?[\'\"]?([^;]*?)[\'\"]?\s*?\)/g, __addBackgroundUrl);
            if(__bufferList.length > 0) {
                return __bufferList;
            }
            __bufferList = undef;
            return false;
        } else if(typeof target === 'string'){
            return [target];
        } else {
            return false;
        }
    };


    var _super = Abstract.prototype;
    var _p = ImageItem.prototype = new Abstract();
    _p.constructor = ImageItem;

    function load(callback){
        _super.load.apply(this, arguments);
        var self = this;
        var img = self.content;
        img.src = this.url;
        if(img.width) {
            self.onLoad();
        } else {
            img.onload = function(){
                self.onLoad();
            };
        }
    }

    function onLoad(){
        if(this.content) {
            delete this.content.onload;
            this.width = this.content.width;
            this.height = this.content.height;
        }
        _super.onLoad.call(this);
    }

    _p.load = load;
    _p.onLoad = onLoad;

    return ImageItem;

});
