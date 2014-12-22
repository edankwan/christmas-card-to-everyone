define([
        'exports',
        'settings',
        'edankwan/loader/quickLoader'
    ],
    function(exports, settings, quickLoader) {

        var undef;

        var audios = exports.audios = {};

        function add(id, url, shouldPreload) {
            if(!audios[id]) {
                var audio = quickLoader.addSingle(url, 'audio', {loadThrough: shouldPreload}).content;
                audios[id] = audio;
                audio.addEventListener('ended', _onEnd, false);
            }
            return audios[id];
        }

        function play(id, isLoop, currentTime) {
            var audio = audios[id];
            if(audio) {
                if(currentTime !== undef) audio.currentTime = Math.max(currentTime, 0.1);
                audio._isLoop = !!isLoop;
                audio.play();
            }
            if(settings.DISABLE_SOUND) audio.volume = 0;
            return audio;
        }

        function pause(id, currentTime) {
            var audio = audios[id];
            if(audio) {
                if(currentTime !== undef) audio.currentTime = Math.max(currentTime, 0.1);
                audio.pause();
            }
            return audio;
        }

        function _onEnd() {
            if(this._isLoop) {
                this.currentTime = 0.1;
                this.play();
            }
            if(this._onEnded) {
                this._onEnded.dispatch(this);
            }
        }

        exports.add = add;
        exports.play = play;
        exports.pause = pause;

    }
);
