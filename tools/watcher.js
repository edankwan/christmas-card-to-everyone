var fs = require('fs');
var sass = require('node-sass');
var watch = require('node-watch');
var tinylr = require('tiny-lr');
var _deepMixIn = require('mout/object/deepMixIn');

var _server;
var _isLiveReloadReady;

function init(cfg) {
    _deepMixIn(exports, {

        paths: {
            scss: 'scss',
            css: 'dev/css',
            img: 'dev/images',
            html: 'dev',
            js: 'dev/js'
        },
        basePath: '',
        scssFiles: ['app.scss'],

        scssWatchIncludes: [/\.scss$/],
        jsWatchIncludes: [/\.(js)$/],
        htmlWatchIncludes: [/\.html$/],
        scssWatchExcludes: [],
        jsWatchExcludes: [/(vendor|libs|bower_components|node_modules)/],
        htmlWatchExcludes: [/(vendor|libs|bower_components|node_modules)/],

        useLiveReload: true,
        output: 'nested',

        liveReloadPort: 35729

    }, cfg);

    for(var i in exports.paths) {
        exports.paths[i] = exports.basePath + exports.paths[i];
    }

    if(exports.useLiveReload) {
        _startLiveReload();
    }

    _watch();
    _compileCSS();
}


function _filterList(includes, excludes, fn) {
    return function(filename) {
        var passed = false;
        for(var i = 0, len = includes.length; i < len; i++) {
            if (includes[i].test(filename)) {
                passed = true;
                break;
            }
        }
        for(i = 0, len = excludes.length; i < len; i++) {
            if (excludes[i].test(filename)) {
                passed = false;
                break;
            }
        }
        if(passed) {
            fn(filename);
        }
    };
}


function _startLiveReload() {
    _server = tinylr({
        auto: true
    });
    _listen();
}

function _listen() {
    _server.listen(exports.liveReloadPort, function(err) {
        if(err) {
            console.log('liveReload is not working');
            _isLiveReloadReady = false;
            return;
        }
        _isLiveReloadReady = true;
        console.log('... Listening on %s (pid: %s) ...', exports.liveReloadPort);
    });
}

function _reload(path) {
    if(_isLiveReloadReady) {
        _server.changed({ body: { files: [path] } });
        console.log('reloaded');
    } else {
        _listen();
    }
}

function _watch() {
    var paths = exports.paths;
    _watchPath(paths.scss, exports.scssWatchIncludes, exports.scssWatchExcludes, function(filename) {
        _compileCSS();
    });
    if(exports.useLiveReload) {
        _watchPath(paths.html, exports.htmlWatchIncludes, exports.htmlWatchExcludes, function(filename) {
            _reload(filename);
        });
        _watchPath(paths.js, exports.jsWatchIncludes, exports.jsWatchExcludes, function(filename) {
            _reload(filename);
        });
    }
}

function _watchPath(path, includes, excludes, cb) {
    if(includes.length) watch(path, _filterList(includes, excludes, cb));
}

function _compileCSS() {

    for(var i = 0, len = exports.scssFiles.length; i < len; i++) {
        var scssFileName = exports.scssFiles[i];
        var input = exports.paths.scss +'/' + scssFileName;
        var output = exports.paths.css +'/' + scssFileName.replace('.scss', '.css');

        sass.render({
            file: input,
            imagePath: exports.paths.img,
            outputStyle: exports.output,
            success: function(css) {
                console.log('scss compiled at: ' + new Date());
                fs.writeFile(output, css, function(err){
                    if(err) {
                        console.log('Error: ' + err);
                    } else {
                        console.log('saved!');
                        if(exports.useLiveReload) {
                            _reload(output);
                        }
                    }
                });
            },
            error: function(error) {
                console.log('[\'ERROR\']');
                console.log(error);
            }
        });
    }

}



exports.init = init;
