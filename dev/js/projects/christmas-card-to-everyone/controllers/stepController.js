define([
        'exports',
        'settings',
        'project/steps/Step0',
        'project/steps/Step1',
        'project/steps/Step2',
        'project/steps/Step3',
        'project/controllers/uiController',
        'project/controllers/dataController',
        'project/controllers/stage3dController',
        'project/ui/stepTexts',
        'edankwan/loader/quickLoader',
        'PIXI',
        'EKTweener'
    ],
    function(exports, settings, Step0, Step1, Step2, Step3, uiController, dataController, stage3dController, stepTexts, quickLoader, PIXI, EKTweener) {

        exports.currentIndex = -1;
        exports.currentStep = null;

        var steps = exports.steps = [];

        var STEP_CLASSES = [Step0, Step1, Step2, Step3];
        var STEP_AMOUNT = STEP_CLASSES.length;

        function preInit() {
            for(var i = 0; i < STEP_AMOUNT; i++ ) {
                steps[i] = new STEP_CLASSES[i]();
                steps[i].preInit();
            }

            // preload assets
            settings.spriteImage = quickLoader.addSingle(settings.IMAGES_PATH + 'sprite.png', 'image').content;
        }

        function init() {

            for(var i = 0; i < STEP_AMOUNT; i++ ) {
                steps[i].init();
            }
        }

        function goToStep(index) {
            var toStep1 = index == 1 && exports.currentIndex < 1;
            var toStep4 = index == 4 && exports.currentIndex < 4;
            if((index > 0) && (index < 4)) {
                stepTexts.show();
            } else {
                stepTexts.hide();
            }
            var prevStep = steps[exports.currentIndex];
            var currentStep = steps[index];
            if(prevStep) prevStep.hide(currentStep);
            if(currentStep) currentStep.show(prevStep);
            exports.currentIndex = index;

            EKTweener.to(stepTexts.particlesUniforms.u_step, toStep1 || toStep4 ? 3.5: 2, { value: index, onComplete: function(){
                if(toStep4) {
                    // step 4  should looks exactly the same as the step 0;
                    stepTexts.particlesUniforms.u_step.value = 0;
                    goToStep(1);
                }
            }});
        }

        function goToNext() {
            goToStep(exports.currentIndex + 1);
        }

        function show() {
            stage3dController.focus();
            if(dataController.parseUrl()) {
                goToStep(0);
            } else {
                goToStep(1);
            }
        }

        exports.preInit = preInit;
        exports.init = init;
        exports.goToStep = goToStep;
        exports.goToNext = goToNext;
        exports.show = show;

    }
);
