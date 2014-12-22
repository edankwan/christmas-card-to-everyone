define([
    'exports',
    './types/ImageItem',
    './types/JSONPItem',
    './types/AudioItem',
    './types/VideoItem',
    './types/AnyItem'
],
    function (exports, ImageItem, JSONPItem, AudioItem, VideoItem, AnyItem) {

        var undef;

        exports.VERSION = '1.0.0';

        exports.isLoading = false;

        // added item.
        exports._added = {};

        // added item.
        exports._loaded = {};

        exports._sum = 0;
        exports._weight = 0;
        exports._onLoading = null;

        var _added = exports._added;
        var _loaded = exports._loaded;
        var _loadList = [];

        var TYPE_LIST = [ ImageItem, JSONPItem, AudioItem, VideoItem, AnyItem];
        var TYPE_LENGTH = TYPE_LIST.length;
        var TYPES = {};

        function _init() {
            for (var i = 0, len = TYPE_LENGTH; i < len; i++) {
                TYPES[TYPE_LIST[i].type] = TYPE_LIST[i];
            }
        }

        function add(target, type, cfg) {
            var i, j, len, len2, tmp;
            var items = retrieveAll(target, type);
            for (i = 0, len = items.length; i < len; i++) {
                tmp = items[i];
                for (j = 0, len2 = tmp.items.length; j < len2; j++) {
                    addSingle(tmp.items[j], tmp.type, cfg);
                }
            }
            return items;
        }

        function retrieveAll(target, type) {
            var i, tmp;
            var len = target.length;
            var items = [];
            if (len && typeof target !== 'string') {
                var i = -1;
                while (++i < len) {
                    tmp = _retrieve(target[i], type);
                    if (tmp) items = items.concat(tmp);
                }
            } else {
                tmp = _retrieve(target, type);
                if (tmp) items = items.concat(tmp);
            }
            return items;
        }

        function _testExtensions(url, typeObj) {
            if (!url) return;
            var extensions = typeObj.extensions;
            var i = extensions.length;
            var len = url.length;
            while (i--) if (url.lastIndexOf('.' + extensions[i]) === len - extensions[i].length - 1) return true;
            return false;
        }

        function _retrieve(target, type) {
            var i, len, items, typeObj;
            if (type) {
                typeObj = TYPES[type];
                items = typeObj.retrieve(target);
            } else {
                for (i = 0, len = TYPE_LENGTH; i < len; i++) {
                    typeObj = TYPE_LIST[i];
                    type = typeObj.type;
                    items = typeObj.retrieve(target);
                    if (items && items.length && typeof items[0] === 'string' && _testExtensions(items[0], typeObj)) break;
                    items = undef;
                }
            }
            if (items) return {type: type, items: items};
            return;
        }

        function addSingle(url, type, cfg) {
            if (!_added[url]) {
                if (!type) {
                    var tmp = _retrieve(url, type);
                    type = tmp.type;
                }
                _createItem(url, type, cfg);
                _loadList.push(_added[url]);
                exports._weight++;
            }
            return _added[url];
        }

        function loadSingle(url, callback, type, cfg) {
            if (!_loaded[url]) {
                if (!type) {
                    var tmp = _retrieve(url, type);
                    type = tmp.type;
                }
                _createItem(url, type, cfg);
                _added[url].load(callback);
            } else {
                callback.call(this, _loaded[url]);
            }
            return _added[url];
        }

        function _createItem(url, type, cfg) {
            _added[url] = new TYPES[type](url, cfg);
        }

        function start(onLoading) {
            var url, img;
            exports._onLoading = onLoading;
            exports.isLoading = true;
            if(exports._weight === 0) {
                _onLoad();
            } else {
                var loadList = _loadList.splice(0, _loadList.length);
                while (loadList[0]) loadList.shift().load(_onLoad);
            }
        }

        function _onLoad(item) {
            exports._sum++;
            var percent = exports._weight === 0 ? 1 : exports._sum / exports._weight;
            if (percent == 1) {
                exports.isLoading = false;
                exports._sum = 0;
                exports._weight = 0;
            }
            if (exports._onLoading) exports._onLoading(percent, item);
        }


        window.__checkLoaderItems = function(){
            var arr =[];
            for(var i in exports._added) {
                if(!exports._loaded[i]) {
                    arr.push(i);
                }
            }
            console.log('added: ', exports._added);
            console.log('unloaded: ', arr);
        };

        _init();

        exports.add = add;
        exports.addSingle = addSingle;
        exports.retrieveAll = retrieveAll;
        exports.loadSingle = loadSingle;
        exports.start = start;

    }

);
