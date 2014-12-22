define(
    function(){

        var _global = typeof window !== 'undefined' ? window: global;

        var exports = {
            IMAGES_PATH: 'images/',
            MODELS_PATH: 'models/',
            AUDIOS_PATH: 'audios/',
            LOCALE_URL: '',

            pervertMode: false
        };

        var IS_DEV = exports.IS_DEV = !!_global.IS_DEV && true;
        var IS_DESKTOP = exports.IS_DESKTOP = !!_global.IS_DESKTOP && true;
        var LANG = exports.LANG = _global.LANG;

        // prevent the issue that fogetting to change it back to false on production
        exports.SKIP_PROMPT = IS_DEV && true;
        exports.SKIP_PRELOADING = IS_DEV && true;
        exports.SKIP_DRAGGING = IS_DEV && true;
        exports.DISABLE_SOUND = IS_DEV && true;
        exports.SKIP_CLEAN_UP_HASH = IS_DEV && false;

        var LOCALE_PATH = 'locales/';
        var LOCALE_BUST = true;
        var LOCALE_CALLBACK_NAME = 'onChristmasExperimentLocaleLoad';

        exports.LOCALE_URL = LOCALE_PATH + LANG + '.js?v=' + (LOCALE_BUST ? + new Date: '') + '&callback=' + LOCALE_CALLBACK_NAME;

        return exports;
    }
);
