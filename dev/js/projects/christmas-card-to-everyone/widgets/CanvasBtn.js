define([
        'inputController',
        'mout/lang/createObject',
        'mout/object/mixIn',
        'mout/function/bind',
        'signals',
        'stageReference',
        'EKTweener'
    ],
    function(inputController, createObject, mixIn, bind, signals, stageReference, EKTweener) {

        var PI2 = Math.PI * 2;

        var Instance = {

            container: null,

            size:  102,

            radius: 44,

            opacity: 1,

            t: 0,

            onClicked: new signals.Signal(),

            hoverAnimation: 0,
            activeAnimation: 0,
            isActive: false,

            init: function(cfg) {
                this.canvas = document.createElement('canvas');
                this.ctx = this.canvas.getContext('2d');

                this.halfSize = this.size / 2;

                this.canvas.width = this.canvas.height = this.size;
                this.canvas.style.marginLeft = (- this.halfSize) + 'px';
                this.canvas.style.marginTop = (- this.halfSize) + 'px';

                this.container.insertBefore(this.canvas, this.container.childNodes[0]);

                this.boundRender = bind(this.render, this);

                inputController.add(this.container, 'over', bind(this._onOver, this));
                inputController.add(this.container, 'out', bind(this._onOut, this));
                inputController.add(this.container, 'click', bind(this._onClick, this));
            },

            _onOver: function () {
                if(this.isActive) {
                    EKTweener.to(this, .3, {hoverAnimation: 1, ease: 'linear'});
                }
            },

            _onOut: function () {
                EKTweener.to(this, .3, {hoverAnimation: 0, ease: 'linear'});
            },

            _onClick: function() {
                if(this.isActive) {
                    this.onClicked.dispatch();
                }
            },

            show: function() {
                stageReference.onRendered.add(this.boundRender);
                this.boundRender();
            },

            hide: function() {
                stageReference.onRendered.remove(this.boundRender);
            },

            enable: function() {
                this.container.classList.add('is-active');
                this.isActive = true;
                EKTweener.to(this, .3, {activeAnimation: 1, ease: 'linear'});
            },

            disable: function() {
                this.isActive = false;
                this.container.classList.remove('is-active');
                EKTweener.to(this, .3, {activeAnimation: 0, ease: 'linear'});
                this._onOut();
            },

            render: function() {
                this.t ++;
                var reversedHoverAnimation = (1 - this.hoverAnimation) * this.activeAnimation;
                var baseAngle = this.t * 0.3;
                var ctx = this.ctx;
                ctx.clearRect(0, 0, this.size, this.size);

                var radius = this.radius + (this.halfSize - this.radius) * this.activeAnimation;
                var scaleX = 1 - reversedHoverAnimation * 0.001;
                var scaleY = 1 + reversedHoverAnimation * 0.1;

                ctx.save();
                ctx.translate(this.halfSize, this.halfSize);
                ctx.rotate(this.hoverAnimation * Math.PI * 0.3);
                ctx.globalAlpha = 0.4 + this.activeAnimation * 0.6;
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(0, 0, radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.closePath();
                ctx.globalCompositeOperation = 'destination-out';
                ctx.globalAlpha = 1;
                ctx.scale(scaleX, scaleY);
                ctx.beginPath();
                ctx.arc(0, 0, radius - 2 + reversedHoverAnimation, 0, Math.PI * 2);
                ctx.fill();
                ctx.closePath();
                ctx.restore();

                ctx.save();
                ctx.beginPath();
                ctx.fillStyle = '#000';
                ctx.globalAlpha = 0.07 - reversedHoverAnimation * 0.035;
                ctx.translate(this.halfSize, this.halfSize);
                ctx.scale(scaleX, scaleX);
                ctx.arc(0, 0, radius - 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.closePath();
                ctx.restore();
            }

        };

        function create(cfg) {
            return createObject(Instance, cfg);
        }

        return {
            Instance: Instance,
            create: create
        };

    }
);
