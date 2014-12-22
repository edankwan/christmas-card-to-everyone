define([
        './Abstract'
    ], function(Abstract){

        var undef;

        function AudioItem(url, cfg){
            if(!url) return;
            var self = this;
            this.loadThrough = !cfg || cfg.loadThrough === undef ? true : cfg.loadThrough;
            _super.constructor.apply(this, arguments);
            this.boundOnLoad = function () { self.onLoad();};
            try {
                this.content = new Audio();
            }catch(e){
                this.content = document.createElement('audio');
            }
        }

        AudioItem.type = 'audio';
        AudioItem.extensions = ['mp3', 'ogg'];

        AudioItem.retrieve = function(target){
            //TODO add dom audios support
            return [target];
        };

        var _super = Abstract.prototype;
        var _p = AudioItem.prototype = new Abstract();
        _p.constructor = AudioItem;

        function load(callback){
            _super.load.apply(this, arguments);
            var self = this;
            var audio = self.content;
            audio.src = this.url;
            if(this.loadThrough) {
                audio.addEventListener('canplaythrough', this.boundOnLoad, false);
            } else {
                audio.addEventListener('canplay', this.boundOnLoad, false);
            }
            audio.load();
        }

        function onLoad(data){
            this.content.removeEventListener('canplaythrough', this.boundOnLoad, false);
            this.content.removeEventListener('canplay', this.boundOnLoad, false);
            if(this.isLoaded) return;
            _super.onLoad.call(this);
        }

        _p.load = load;
        _p.onLoad = onLoad;

        return AudioItem;

    }
);
