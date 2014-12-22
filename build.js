var fs = require('fs');
var _builder = require('./tools/builder');

var projectId = 'christmas-card-to-everyone';
var useAlmond = true;

_builder.init({
    devFolder: 'dev/',
    deployFolder: 'deploy/',
    indexes: [
        'deploy/index.html'
    ]
});

// ========
// Purge deploy folder
// ========
_builder.purgeDeploy({
    excludes: [
    ],
    includes: [
    ]
});

// ========
// Copy files from dev folder to deploy folder
// ========
_builder.copyFilesToDeploy({
    excludes: [
        '_*',
        '.*',
        '.DS_Store',
        'js/**'
    ],
    includes: [
        // '.htaccess'
        // 'js/shaders/**',
        // 'js/**/shaders/**',
        // 'js/libs/three/**'
    ]
});

// ========
// Optimize CSS files
// ========

_builder.optimizeCSS({
    // optimizeCss : 'standard.keepLines',
    optimizeCss : 'standard',
    cssIn: _builder.devFolder + 'css/' + projectId + '.css',
    out: _builder.deployFolder + 'css/' + projectId + '.css'
});
if(useAlmond) {
    // ========
    // Optimize JS files with almond
    // ========
    _builder.rjs({
        include: [ projectId ],
        insertRequire: [ projectId ],
        out : _builder.deployFolder + 'js/' + projectId + '.js',
        paths : {},
        map : {},
        shim : {},
        _mixCfgFile: _builder.deployFolder + 'index.html',
        _localVars: {
            PROJECT_ID: projectId
        }
    });
} else {
    // ========
    // Optimize JS files with r.js
    // ========
    _builder.rjs({
        useAlmond: false,
        include: [ projectId ],
        insertRequire: [ projectId ],
        out : _builder.deployFolder + 'js/' + projectId + '.js',
        paths : {
            'shaders' : 'empty:',
            'three' : 'empty:'
        },
        map : {},
        shim : {},
        _mixCfgFile: _builder.deployFolder + 'index.html',
        _localVars: {
            PROJECT_ID: projectId
        }
    });
}

// minifyJS is includes first then excludes
_builder.minifyJS({
    includes: [
        'locales/**'
    ],
    excludes: [

    ]
});

// ========
// Parse text files
// ========
_builder.addTask(function(){
    _builder.replaceLines(_builder.indexes, 'BUILD REMOVE', 'BUILD REMOVE END');
    _builder.replaceLine(_builder.indexes, 'BUILD ADD');
    _builder.replaceString(_builder.indexes, /UA-XXXXXXXX-X/gm, _builder.googleAnalyticsCode);
    _builder.replaceString(_builder.indexes, /VERSON_NUMBER/g, + new Date);
});

_builder.start();
