define([
        'exports',
        'mout/object/mixIn'
    ],
    function(exports, mixIn) {

        var _body;

        var DEFAULT_CONFIG = {
            fontSize: 200,
            compareFont: 'Arial, Helvetica, sans-serif',
            testText: 'Lorem ipsum dolor sit amet',
            interval: 16,
            body: document.body
        };

        function load(fonts, cb, cfg) {

            cfg = mixIn({}, DEFAULT_CONFIG, cfg);
            fonts = fonts instanceof Array ? fonts : [fonts];
            body = cfg.body;
            for(var i = 0, len = fonts.length; i < len; ++i) {
                fonts[i] = _createDom(fonts[i], cfg.size, cfg.testText);
                body.appendChild(fonts[i]);
            }
            var reference = _createDom(cfg.compareFont, cfg.size, cfg.testText);
            body.appendChild(reference);

            function checkFont() {
                var allPassed = true;
                var i = fonts.length;
                var target;
                while(i--) {
                    target = fonts[i];
                    if(target.offsetWidth && reference.offsetWidth && (target.offsetWidth != reference.offsetWidth)) {
                        fonts.splice(i, 1);
                        body.removeChild(target);
                    } else {
                        allPassed = false;
                        break;
                    }
                }
                if(allPassed) {
                        body.removeChild(reference);
                    cb();
                } else {
                    setTimeout(checkFont, cfg.interval);
                }
            }

            checkFont();
        }

        function _createDom(font, size, text) {
            var dom = document.createElement('div');
            var style = dom.style;
            style.position = 'absolute';
            style.left = '-8192px';
            style.top = '-8192px';
            style.fontFamily = font;
            style.fontSize = size + 'px';
            dom.innerHTML = text;

            return dom;
        }

        exports.load = load;

    }
);
