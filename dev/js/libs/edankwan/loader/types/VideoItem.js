define([
        './Abstract'
    ], function(Abstract){

        var undef;

        function VideoItem(url, cfg){
            if(!url) return;
            var self = this;
            this.loadThrough = !cfg || cfg.loadThrough === undef ? true : cfg.loadThrough;
            _super.constructor.apply(this, arguments);
            this.boundOnLoad = function () { self.onLoad();};
            try {
                this.content = new Video();
            }catch(e){
                this.content = document.createElement('video');
            }
        }

        VideoItem.type = 'video';
        VideoItem.extensions = ['mp4', 'webm', 'ogv'];

        VideoItem.retrieve = function(target){
            //TODO add dom videos support
            return [target];
        };

        var _super = Abstract.prototype;
        var _p = VideoItem.prototype = new Abstract();
        _p.constructor = VideoItem;

        function load(callback){
            _super.load.apply(this, arguments);
            var video = this.content;
            video.preload = 'auto';
            video.src = this.url;
            if(this.loadThrough) {
                video.addEventListener('canplaythrough', this.boundOnLoad, false);
            } else {
                video.addEventListener('canplay', this.boundOnLoad, false);
            }
            video.load();
        }

        function onLoad(data){
            this.content.removeEventListener('canplaythrough', this.boundOnLoad);
            this.content.removeEventListener('canplay', this.boundOnLoad);
            if(this.isLoaded) return;
            _super.onLoad.call(this);
        }

        _p.load = load;
        _p.onLoad = onLoad;

        return VideoItem;

    }
);
