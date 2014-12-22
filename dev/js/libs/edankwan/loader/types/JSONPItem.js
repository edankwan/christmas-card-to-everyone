define([
        './Abstract'
    ], function(Abstract){

        var undef;

        function __generateFuncName(){
            return '_jsonp' + new Date().getTime() + ~~(Math.random() * 100000000);
        }

        function JSONItem(url, cfg){
            if(!url) return;
            _super.constructor.apply(this, arguments);
        }

        JSONItem.type = 'jsonp';
        JSONItem.extensions = [];

        JSONItem.retrieve = function(target){
            if((typeof target === 'string') && (target.indexOf('=') > -1)){
                return [target];
            }
            return false;
        };

        var _super = Abstract.prototype;
        var _p = JSONItem.prototype = new Abstract();
        _p.constructor = JSONItem;

        function load(callback){
            _super.load.apply(this, arguments);
            var self = this;
            var lastEqualIndex = this.url.lastIndexOf('=') + 1;
            var urlPrefix = this.url.substr(0, lastEqualIndex);
            var funcName = this.url.substr(lastEqualIndex);
            if(funcName.length === 0) {
                funcName = __generateFuncName();
                this.jsonpCallback = callback;
            } else {
                this.jsonpCallback = this.jsonpCallback || window[funcName];
            }

            window[funcName] = function(data) {
                self.content = data;
                self.onLoad(data);
            };
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = urlPrefix + funcName;
            document.getElementsByTagName('head')[0].appendChild(script);
        }

        function onLoad(data){
            if(this.jsonpCallback) this.jsonpCallback(data);
            _super.onLoad.call(this);
        }

        _p.load = load;
        _p.onLoad = onLoad;

        return JSONItem;

    }
);
