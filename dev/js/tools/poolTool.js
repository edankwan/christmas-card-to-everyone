define([
        'exports',
        'mout/function/bind'
    ],
    function(exports, bind) {

        function create(Class) {
            Class.resetPool = bind(_resetPool, Class);
            Class.poolGet = bind(_poolGet, Class);
            Class.poolRelease = bind(_poolRelease, Class);

            Class.resetPool();
        }

        function _poolGet() {
            var item;
            if(this.inactivePool.length) {
                item = this.inactivePool.shift();
                this.poolWasCreated = false;
            } else {
                item = new this();
                this.poolWasCreated = true;
            }
            this.activePool.push(item);
            return item;
        }

        function _poolRelease(item) {
            for(var i = 0, len = this.activePool.length; i < len; i++) {
                if(this.activePool[i] === item) {
                    this.activePool.splice(i, 1);
                    this.inactivePool.push(item);
                    return true;
                }
            }
        }

        function _resetPool() {
            this.activePool = [];
            this.inactivePool = [];
        }

        exports.create = create;

    }
);
