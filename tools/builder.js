/*
 *  Created by Edan Kwan base on Miller Medeiros's build script: https://gist.github.com/millermedeiros/2640928
 */

var FILE_ENCODING = 'utf-8';
var _tasks = [];
var _undef;

// ==============
// Third party
// ==============

var _minimatch = require('minimatch');
var _wrench = require('wrench');
var _fs = require('fs');
var _path = require('path');
var _requirejs = require('requirejs');
var _mixIn = require('mout/object/mixIn');
var _merge = require('mout/object/merge');
var _combine = require('mout/array/combine');

exports.selfFolderName = 'tools';

var BASE_JS_SETTINGS = {
    logLevel : 1,
    inlineText: true,
    optimize : 'uglify',
    useAlmond: true,
    // optimize : 'none',
    // exclude plugins after build
    stubModules : [],
    exclude : [],
    include :[],
    wrap: {
    },
    _localVars : {

    }
};

// ==============
// Public functions
// ==============

function init(cfg) {
    if(_checkIsBusy()) return;
    _mixIn(exports, cfg);
}



function purgeDeploy(cfg) {
    _tasks.push(function(){
        showMessage('deleting old deploy files...');

        if (_fs.existsSync(exports.deployFolder)) {

            var allFiles = _wrench.readdirSyncRecursive(exports.deployFolder);

            files = _excludeFiles(allFiles, cfg.excludes);
            files = _addFiles(files, _includeFiles(allFiles, cfg.includes), exports.deployFolder);

            var stat;
            files.forEach(function(path){
                path = exports.deployFolder + path;
                stat = _fs.statSync(path);
                if( stat.isFile() ) {
                    _fs.unlinkSync(path);
                } else if( stat.isDirectory() ){
                    if (! _fs.readdirSync(path).length) {
                        //only delete folder if empty
                        _fs.rmdirSync(path);
                    }
                }
            });
            showMessage("deleted old files");

        }
        _dispatchNextTask();
    });
}


function copyFilesToDeploy(cfg) {
    _tasks.push(function(){
        showMessage('copying files to deploy...');
        var devPath, distPath;
        var allFiles = _wrench.readdirSyncRecursive(exports.devFolder);
        files = _excludeFiles(allFiles, cfg.excludes);
        files = _addFiles(files, _includeFiles(allFiles, cfg.includes), exports.devFolder);
        files.forEach(function(path){
            //skip directories
            devPath = _path.join(exports.devFolder, path);
            if(_fs.existsSync(devPath) && _fs.statSync(devPath).isFile()){
                distPath = _path.join(exports.deployFolder, path);
                _safeCreateDir(distPath);
                _fs.writeFileSync(distPath, _fs.readFileSync(_path.join(exports.devFolder, path)));
            }
        });
        showMessage('copied files to deploy.');
        _dispatchNextTask();
    });
}


function copyFile(from, to) {
    if(_fs.statSync(from).isFile()){
        _safeCreateDir(to);
        _fs.writeFileSync(to, _fs.readFileSync(from));
    }
}


function optimizeCSS(cfg) {
    _tasks.push(function(){
        showMessage('optimizing CSS files...');
        _requirejs.optimize(cfg, function(response){
            showMessage('optimized CSS files.');
            _dispatchNextTask();
        });
    });
}

function rjs(cfg) {
    _tasks.push(function(){
        showMessage('rjs optimizing...');

        // Extract rjs config
        var baseCfg = {};
        var cfgFile = cfg._mixCfgFile;
        var content = _fs.readFileSync(cfgFile, FILE_ENCODING);
        content = content.replace(/^.*BUILD REQUIRE CONFIG.*$\n?\r?([\w\W]*?)^.*BUILD REQUIRE CONFIG END.*$\n?\r?/gm, function(){
            var cfgStr = arguments[1];
            with(cfg._localVars || BASE_JS_SETTINGS._localVars) {
                eval('baseCfg = ' + cfgStr);
            }
            return cfgStr;
        });

        var rCfg = _merge({}, BASE_JS_SETTINGS, baseCfg, cfg);

        rCfg.baseUrl = exports.devFolder + rCfg.baseUrl;

        var rootPath = (new Array(_numOfSlash(rCfg.baseUrl) + 2)).join('../');
        if(rCfg.useAlmond) {
            rCfg.name = rootPath + exports.selfFolderName + '/node_modules/almond/almond';
            // rCfg.wrap.startFile = rCfg.wrap.startFile || exports.selfFolderName + '/wrap_start.js';
            // rCfg.wrap.endFile = rCfg.wrap.endFile || exports.selfFolderName + '/wrap_end.js';
        } else {
            var tmpFilename = '_rjs' + (+new Date);
            var tmp = _fs.readFileSync(exports.selfFolderName + '/node_modules/requirejs/require.js', FILE_ENCODING);
            _fs.writeFileSync(tmpFilename + '.js', tmp +'\n require.config(\n' + JSON.stringify(baseCfg, 4, '    ') + ');', FILE_ENCODING);
            rCfg.name = rootPath + tmpFilename;
        }
        _requirejs.optimize(rCfg, function(){
            if(!rCfg.useAlmond) {
                _fs.unlinkSync(tmpFilename + '.js');
            }
            showMessage('rjs optimized.');
            _dispatchNextTask();
        });
    });
}

function minifyJS(cfg) {
    _tasks.push(function(){
        showMessage('minifying JS files...');

        var files = [];
        var allFiles = _wrench.readdirSyncRecursive(exports.devFolder);
        files = _addFiles(files, _includeFiles(allFiles, cfg.includes), exports.devFolder);
        files = _excludeFiles(files, cfg.excludes);
        files.forEach(function(path){
            if(path.lastIndexOf('.js') === path.length - 3) {
                _uglify(exports.devFolder + path, _path.join(exports.deployFolder, path));
            }
        });

        showMessage('minified JS files.');
        _dispatchNextTask();
    });
}



function start() {
    if(_checkIsBusy()) return;
    exports.isBusy = true;
    _tasks.push(_lastTask);
    _dispatchNextTask();
}

function addTask(func) {
    _tasks.push(function(){
        func();
        _dispatchNextTask();
    });
}

function replaceString(filename, key, value) {
    if(value ===_undef) value = '';

    // multi-files support
    var filenames = filename instanceof Array ? filename : null;
    if(filenames) {
        var i = filenames.length;
        var values = value instanceof Array ? value : null;
        while(i--) replaceString(filenames[i], key, values ? values[i] : value);
        return;
    }

    if(_fs.existsSync(filename)) {
        var content = _fs.readFileSync(filename, FILE_ENCODING);
        content = content.replace(key, value);
        _fs.writeFileSync(filename, content, FILE_ENCODING);
    }
}

function replaceLine(filename, key, value) {
    replaceString(filename, new RegExp('^.*' + key + '.*$(\\r?\\n?)', 'gm'), '');
}

function replaceLines(filename, key1, key2, value) {
    replaceString(filename, new RegExp('^.*' + key1 + '[\\w\\W]*?' + key2 + '.*$(\\r?\\n?)', 'gm'), '');
}

function showMessage(message, isImportant) {
    if(isImportant) showMessageLine();
    console.log(' [MESSAGE] - ' + message);
    if(isImportant) showMessageLine();
}

function showError(message) {
    showMessageLine();
    console.log(' [ERROR] - ' + message);
    showMessageLine();
}

function showMessageLine() {
    console.log('=====================================');
}


// ==============
// Private functions
// ==============

function _checkIsBusy() {
    if(exports.isBusy) {
        showError('Builder is busy at the moment.');
        return true;
    } else {
        return false;
    }
}

function _dispatchNextTask() {
    var task = _tasks.splice(0,1)[0];
    task();
}

function _lastTask() {
    showMessage('Finish building.', true);
}

function _parseFileList(filenames) {
    var globOpts = {
        matchBase: true,
        dot : true
    };
    filenames = filenames.map(function(val){
        //minimatch currently have a bug with star globs (https://github.com/isaacs/minimatch/issues/5)
        return _minimatch.makeRe(val, globOpts);
    });
    return filenames;
}

function _normalizeFilePath(files) {
    return files.map(function(filePath){
        // need to normalize and convert slashes to unix standard
        // otherwise the RegExp test will fail on windows
        return _path.normalize(filePath).replace(/\\/g, '/');
    });
}

function _addFiles(files, includes, pathPrefix) {
    var i, len;
    if(includes instanceof Array) {
        for(i = 0, len = includes.length; i < len; i++) {
            files = _addFiles(files, includes[i], pathPrefix);
        }
        return files;
    }

    files = _normalizeFilePath(files);
    if(includes.lastIndexOf('/') == includes.length - 1) {
        var path = includes;
        includes = _wrench.readdirSyncRecursive(pathPrefix + path);
        for(i = 0, len = includes.length; i < len; i++) {
            includes[i] = path + includes[i];
        }
    } else {
        includes = [includes];
    }
    return _combine(files, includes);
}

function _excludeFiles(files, excludes) {

    files = _normalizeFilePath(files);
    excludes = _parseFileList(excludes);

    return files.filter(function(filePath){
        return ! excludes.some(function(glob){
            return glob.test(filePath);
        });
    });
}
function _includeFiles(files, includes) {

    files = _normalizeFilePath(files);
    includes = _parseFileList(includes);

    return files.filter(function(filePath){
        return includes.some(function(glob){
            return glob.test(filePath);
        });
    });
}

function _uglify(srcPath, distPath, licenseArr) {
    var
    uglyfyJS = require('uglify-js'),
    jsp = uglyfyJS.parser,
    pro = uglyfyJS.uglify,
    ast = jsp.parse( _fs.readFileSync(srcPath, FILE_ENCODING) ),
    prepend = licenseArr? '\/**\n * '+ licenseArr.join('\n * ') +'\n */\n' : '';

    ast = pro.ast_mangle(ast);
    ast = pro.ast_squeeze(ast);

    _safeCreateDir(distPath);
    _fs.writeFileSync(distPath, prepend + pro.gen_code(ast), FILE_ENCODING);
    showMessage(distPath + ' uglified');
}

function _safeCreateDir(path) {
    var dir = _path.dirname(path);
    if (! _fs.existsSync(dir)) {
        _wrench.mkdirSyncRecursive(dir);
    }
}

function _numOfSlash(str) {
    var count = 0;
    for(var i = 0, len = str.length; i < len; i++) {
        if(str.substr(i, 1) == '/') count ++;
    }
    return count;
}

exports.init = init;
exports.purgeDeploy = purgeDeploy;
exports.copyFilesToDeploy = copyFilesToDeploy;
exports.copyFile = copyFile;
exports.optimizeCSS = optimizeCSS;
exports.rjs = rjs;
exports.minifyJS = minifyJS;
exports.start = start;
exports.addTask = addTask;
exports.replaceString = replaceString;
exports.replaceLine = replaceLine;
exports.replaceLines = replaceLines;
exports.showMessage = showMessage;
exports.showError = showError;
exports.showMessageLine = showMessageLine;
exports.isBusy = false;
