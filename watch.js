var fs = require('fs');
var _watcher = require('./tools/watcher');

_watcher.init({

    paths: {
        html: ['dev/js/projects/christmas-card-to-everyone/templates']
    },
    basePath: '',
    scssFiles: ['christmas-card-to-everyone.scss'],

    jsWatchIncludes: [/\.(js|vert|frag)$/],

    useLiveReload: true,
    output: 'nested',
    // output: 'compressed',

    liveReloadPort: 35729

});
