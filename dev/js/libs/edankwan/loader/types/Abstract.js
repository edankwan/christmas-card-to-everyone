define([
        '../quickLoader'
    ], function(quickLoader){

    function Abstract(url, cfg){
        if(!url) return;
        this.url = url;
        for(var i in cfg) this[i] = cfg[i];
        quickLoader._added[url] = this;
    }

    Abstract.extensions = [];

    Abstract.test = function(target){
        return false;
    };

    var _p = Abstract.prototype;

    function load(callback){
        this.callback = callback;
    }

    function onLoad(){
        this.isLoaded = true;
        quickLoader._loaded[this.url] = this;
        if(this.callback) this.callback(this);
    }

    function getContent(dispose) {
        //TODO: option to remove the item from the added / loaded
        var content = this.content;
        if(dispose) this.content = null;
        return content;
    }

    _p.load = load;
    _p.onLoad = onLoad;
    _p.getContent = getContent;

    return Abstract;

});
