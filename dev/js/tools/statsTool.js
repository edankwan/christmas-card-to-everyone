define([
        'exports',
        'Stats',
        'mout/object/mixIn',
        'stageReference'
    ],
    function(exports, Stats, mixIn, stageReference) {

        var DEFAULT_CONFIG = {
            hAlign: 'left',
            vAlign: 'top',
            appendToBody: true,
            zIndex: 1024,
            beginPriority: 1024,
            endPriority: -1024
        };

        function init(cfg) {
            if(!Stats) return;
            mixIn(exports, DEFAULT_CONFIG, cfg);
            var stats = new Stats();
            var dom = stats.domElement;
            dom.style.position = 'absolute';
            dom.style[exports.hAlign] = 0;
            dom.style[exports.vAlign] = 0;
            stageReference.onRendered.add(stats.begin, stats, exports.beginPriority);
            stageReference.onRendered.add(stats.end, stats, exports.endPriority);

            if(exports.appendToBody) {
                document.body.appendChild( dom );
            }
        }

        exports.init = init;

    }
);
