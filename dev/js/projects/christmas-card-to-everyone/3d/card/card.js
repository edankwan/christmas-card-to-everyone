define([
        'exports',
        '3d/stage3d',
        'project/3d/card/Carrot',
        'project/3d/card/Ornament',
        'project/3d/card/Wreath',
        './cardFront2d',
        './cardBack2d',
        'inputController',
        'project/controllers/uiController',
        'project/controllers/dataController',
        'tools/fontBusterTool',
        'edankwan/loader/quickLoader',
        'THREE',
        'EKTweener'
    ],
    function(exports, stage3d, Carrot, Ornament, Wreath, cardFront2d, cardBack2d, inputController, uiController, dataController, fontBusterTool, quickLoader, THREE, EKTweener) {

        var undef;

        exports.openRatio = 0;
        exports.offsetX = 0;
        exports.offsetY = 0;

        exports.trX = 0;
        exports.trY = 0;
        exports.rX = 0;
        exports.rY = 0;

        exports.isDraggable = false;
        exports.draggedTarget = null;
        exports.hoverTarget = null;

        var _dragTargetX = 0;
        var _dragTargetY = 0;

        var items = exports.items = [];
        var itemBoundBoxes = exports.itemBoundBoxes = [];

        var _carrot;
        var _ornament1;
        var _ornament2;
        var _wreath;

        var container = exports.container = null;

        var front = exports.front = null;
        var frontJoint = exports.frontJoint = null;
        var frontCover = exports.frontCover = null;
        var frontInner = exports.frontInner = null;
        var back = exports.back = null;
        var backCover = exports.backCover = null;
        var backInner = exports.backInner = null;

        var WIDTH = exports.WIDTH = 360;
        var HEIGHT = exports.HEIGHT = 400;
        var HALF_WIDTH = exports.HALF_WIDTH = WIDTH / 2;
        var HALF_HEIGHT = exports.HALF_HEIGHT = HEIGHT / 2;

        var PI = Math.PI;
        var PI_HALF = PI / 2;
        var PI_2 = PI * 2;

        function preInit() {

            cardFront2d.preInit();
            cardBack2d.preInit();

            _carrot = new Carrot();
            _carrot.preInit();
            items.push(_carrot);

            _ornament1 = new Ornament();
            _ornament1.preInit();
            items.push(_ornament1);

            _ornament2 = new Ornament();
            _ornament2.preInit({
                color: 0x2d7d92,
                side: 1
            });
            items.push(_ornament2);

            _wreath = new Wreath();
            _wreath.preInit();
            items.push(_wreath);

            // preload fonts
            quickLoader.addSingle('lobster-fonts', 'any', {loadFunc: function(url, cb) {
                fontBusterTool.load([
                        'lobster'
                    ], cb
                );
            }});
        }

        function init() {

            container = exports.container = new THREE.Object3D();
            frontJoint = exports.frontJoint = new THREE.Object3D();
            front = exports.front = new THREE.Object3D();
            back = exports.back = new THREE.Object3D();

            container.add(frontJoint);
            container.add(back);
            frontJoint.add(front);

            frontJoint.position.x = -WIDTH / 2;
            frontJoint.position.z = 0.1;
            front.position.x = WIDTH / 2;

            back.rotation.y = PI;

            frontCover = exports.frontCover = _createPlane();
            frontCover.receiveShadow = true;
            frontInner = exports.frontInner = _createPlane();
            frontInner.rotation.y = PI;
            front.add(frontCover);
            front.add(frontInner);

            cardFront2d.init();
            frontCover.material.map = cardFront2d.texture;

            backCover = exports.backCover = _createPlane();
            backInner = exports.backInner = _createPlane();
            backInner.rotation.y = PI;
            back.add(backCover);
            back.add(backInner);

            cardBack2d.init();
            backInner.material.map = cardBack2d.texture;

            for(var i = 0; i < items.length; i++) {
                items[i].init();
                itemBoundBoxes.push(items[i].boundBoxMesh);
                frontCover.add(items[i].container);
            }

            _ornament1.container.position.x = 100;
            _ornament2.container.position.x = -100;

            inputController.onMoved.add(function(){
                exports.trX = ((inputController.y / stage3d.height) - 0.5) * 2;
                exports.trY = ((inputController.x / stage3d.width) - 0.5) * 2;

            });

            container.visible = false;
        }

        function _createPlane() {
            var mat = new THREE.MeshPhongMaterial ({
                color: 0xedede6,
                ambient: 0x000000,
                shininess: 20,
                shading: THREE.FlatShading
            });
            var geometry = new THREE.PlaneBufferGeometry (WIDTH, HEIGHT);
            return new THREE.Mesh(geometry, mat);
        }

        function _beforeRender() {
            var openRatio = exports.openRatio;

            frontJoint.rotation.y = -PI * openRatio * 0.75;

            cardFront2d.render();
            backInner.visible = openRatio > 0.01;
            cardBack2d.render(backInner.visible);

            container.position.x = exports.offsetX + Math.sin(PI_HALF * openRatio) * WIDTH / 2 * 0.25;
            container.position.y = exports.offsetY;

            exports.rX += (exports.trX - exports.rX) * 0.05;
            exports.rY += (exports.trY - exports.rY) * 0.05;
            container.rotation.x = exports.rX * 0.1;
            container.rotation.y = exports.rY * 0.1;

            for(var i = 0; i < items.length; i++) {
                items[i].render();
            }

            if(exports.isDraggable) {

                if(exports.draggedTarget) {

                } else {
                    var raycaster = stage3d.getRaycaster();
                    var newTarget = stage3d.getRaycaster().intersectObjects(itemBoundBoxes)[0];
                    if(newTarget) {
                        newTarget = newTarget.object.item;
                    }

                    if(exports.hoverTarget && exports.hoverTarget !== newTarget) {
                        exports.hoverTarget.rollout();
                        exports.hoverTarget = null;
                    }

                    if(newTarget && exports.hoverTarget !== newTarget) {
                        newTarget.rollover();
                    }
                    exports.hoverTarget = newTarget;

                }

            }

        }

        function showReceivedCard() {
            var dataItems = dataController.recievedData.items;
            for(var i = 0; i < items.length; i++) {
                items[i].reset(dataItems[i * 2], dataItems[i * 2 + 1]);
            }
            cardBack2d.changeText(dataController.recievedData.text);
            _showCard();
        }

        function hideReceivedCard() {
            _hideCard();
        }

        function show(cb) {
            _carrot.reset(130, -69);
            _ornament1.reset(-143, -66);
            _ornament2.reset(-54, 24);
            _wreath.reset(-1, -108);
            EKTweener.to(this, 0, {openRatio: 0});
            cardBack2d.changeText();
            _showCard();
        }

        function hide() {
            _hideCard();
        }

        // dev for adjusting the
        // window.getCardItemsPos = function (){
        //     console.log({
        //         carrot: {x: _carrot.x, y: _carrot.y},
        //         ornament1: {x: _ornament1.x, y: _ornament1.y},
        //         ornament2: {x: _ornament2.x, y: _ornament2.y},
        //         wreath: {x: _wreath.x, y: _wreath.y}
        //     });
        // }

        function _showCard() {
            var item, i , len;
            for(i = 0, len = items.length; i < len; i++) {
                item = items[i];
                item.offsetY = uiController.viewportHeight + HEIGHT;
                EKTweener.to(item, 0, {offsetY: uiController.viewportHeight + HEIGHT * 2});
                EKTweener.to(item, 1, {offsetY: 0, delay: 0.2 * i + 0.3, ease: 'easeOutBack'});
            }
            stage3d.beforeRendered.add(_beforeRender);
            container.visible = true;
            EKTweener.fromTo(exports, 1, {offsetY: - uiController.viewportHeight - HEIGHT >> 1}, {offsetY: 0, ease: 'easeOutBack'});
        }

        function _hideCard() {
            EKTweener.to(exports, 1, {offsetY: uiController.viewportHeight + HEIGHT >> 1, ease: 'easeInBack', onComplete: function(){
                container.visible = false;
                stage3d.beforeRendered.remove(_beforeRender);
            }});
        }

        function _onDown(evt) {
            if(exports.hoverTarget) {
                exports.draggedTarget = exports.hoverTarget;
                exports.draggedTarget.drag();
                _dragTargetX = exports.draggedTarget.x;
                _dragTargetY = exports.draggedTarget.y;
            }
        }

        function _onMove(evt) {
            if(exports.draggedTarget) {
                exports.draggedTarget.tX = (_dragTargetX + inputController.distanceX);
                exports.draggedTarget.tY = (_dragTargetY - inputController.distanceY);
                exports.draggedTarget.tR = inputController.deltaX * 0.1;
            }
        }

        function _onUp(evt) {
            if(exports.draggedTarget) {
                exports.draggedTarget.release();
            }
            exports.draggedTarget = null;
        }

        function enableDragging() {
            if(!exports.isDraggable) {
                exports.isDraggable = true;
                stage3d.onDowned.add(_onDown);
                stage3d.onMoved.add(_onMove);
                stage3d.onUped.add(_onUp);
            }
        }

        function disableDragging() {
            if(exports.isDraggable) {
                exports.isDraggable = false;
            }
        }

        function open(duration) {
            EKTweener.to(this, duration === undef ? 0.5: duration, {openRatio: 1});
        }

        function close(duration) {
            EKTweener.to(this, duration === undef ? 0.5: duration, {openRatio: 0});
        }

        exports.preInit = preInit;
        exports.init = init;
        exports.showReceivedCard = showReceivedCard;
        exports.hideReceivedCard = hideReceivedCard;
        exports.show = show;
        exports.hide = hide;

        exports.enableDragging = enableDragging;
        exports.disableDragging = disableDragging;

        exports.open = open;
        exports.close = close;

    }
);
