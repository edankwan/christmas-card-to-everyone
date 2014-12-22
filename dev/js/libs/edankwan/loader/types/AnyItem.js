define([
        './Abstract'
    ], function(Abstract){

        var undef;

        // This is a univeral load item that can work with other libraries' loader

        // when you work on loadFunc(url, callback) style:
        // quickLoader.add('abc.png', 'any', {
        //     loadContext: awesomeLib,
        //     loadFunc: awesomeLib.load
        // });
        //
        // if the loader is not using this format, you can do something like
        // quickLoader.add('abc.png', 'any', {
        //     loadFunc: function(url, cb) {
        //         awesomeLib.load({url: url}, cb);
        //     }
        // });

        function AnyItem(url, cfg){
            if(!url) return;
            _super.constructor.apply(this, arguments);

            if(!this.loadFunc && console) {
                console[console.error || console.log]('require loadFunc in the config object.');
            }

        }

        AnyItem.type = 'any';
        AnyItem.extensions = [];

        AnyItem.retrieve = function(target){
            return false;
        };

        var _super = Abstract.prototype;
        var _p = AnyItem.prototype = new Abstract();
        _p.constructor = AnyItem;

        function load(callback){
            var self = this;

            this.loadFunc.call(this.loadContext, this.url, function(){
                 self.loadedContext = this;
                 self.content = arguments.length > 1 ? Array.prototype.slice.call(arguments, 0) : arguments[0];
                 callback.apply(self, arguments);
            });

        }

        _p.load = load;

        return AnyItem;

    }
);
