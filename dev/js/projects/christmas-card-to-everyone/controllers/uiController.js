define([
        'exports',
        'settings',
        'project/ui/preloader',
        'project/ui/header',
        'project/ui/footer',
        'project/ui/instructions',
        'project/ui/stepTexts',
        'stageReference'
    ],
    function(exports, settings, preloader, header, footer, instructions, stepTexts, stageReference) {

        exports.headerHeight = 0;
        exports.footerHeight = 0;
        exports.viewportHeight = 0;
        exports.viewportCenterY = 0;
        exports.viewportCenterYOffset = 0; // 2d based

        var _isUIReady = false;

        function preInit() {
            preloader.init();
            header.preInit();
            footer.preInit();
            instructions.preInit();
            stepTexts.preInit();
        }

        function init() {
            header.init();
            settings.appContainer.appendChild(header.container);
            footer.init();
            settings.appContainer.appendChild(footer.container);
            instructions.init();
            settings.appContainer.appendChild(instructions.container);

            stepTexts.init();
            settings.appContainer.appendChild(stepTexts.container);

            _isUIReady = true;
            updateHeights();
        }

        function updateHeights(headerHeight, footerHeight) {
            exports.headerHeight = headerHeight = headerHeight || exports.headerHeight;
            exports.footerHeight = footerHeight = footerHeight || exports.footerHeight;
            exports.viewportHeight = stageReference.stageHeight - headerHeight - footerHeight;
            exports.viewportCenterY = headerHeight + exports.viewportHeight / 2;
            exports.viewportCenterYOffset = exports.viewportCenterY - stageReference.stageHeight / 2;

            if(_isUIReady) {
                header.onResize();
                footer.onResize();
                instructions.onResize(exports.viewportCenterY);
                stepTexts.onResize(exports.viewportCenterY);
            }
        }

        function show() {
            header.show();
            footer.show();
        }

        exports.preInit = preInit;
        exports.init = init;
        exports.updateHeights = updateHeights;
        exports.show = show;

    }
);
