define([
        'exports',
        'signals',
        'amd-utils/object/mixIn',
        'amd-utils/array/combine'
    ],
    function(facebook, signals, mixIn, combine){

        var undef;
        var win = window;

        var config = {
            appId: '180266822152408',
            status : true,
            cookie : true,
            xfbml  : true,
            oauth  : true
        };

        var _requiredPermissions = [];
        var _existedPermissions = {};

        mixIn(facebook, {
            isAPIReady: false,
            isInitialized: false,
            isInitializeReady: false,
            isInitializeStarted: false,
            isLoggedIn: false,
            isAuthenticated: false,
            uid: null,
            name: '',
            accessToken: null,
            loginResponse: null,
            config: config,
            isGetFacebookAPIStarted: false,

            requiredPermissions: _requiredPermissions,
            existedPermissions: _existedPermissions,

            // TAB
            canvasPageInfo: {},
            canvasWidth: 810,
            canvasHeight: 800
        });

        var DEBUG = false;

        function getFacebookAPI(){
            facebook.isGetFacebookAPIStarted = true;

            // standard facebook async code:
            var d = document;
            var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
            if (d.getElementById(id)) {return;}
            js = d.createElement('script'); js.id = id; js.async = true;
            js.src = '//connect.facebook.net/en_US/all' + (DEBUG ? '/debug' : '') + '.js';
            ref.parentNode.insertBefore(js, ref);
        }

        function fbAsyncInit(){
            facebook.isAPIReady = true;
            setCanvasSize();

            if(!facebook.isInitializeStarted && facebook.isInitializeReady) init();
        }

        function init(options){

            if(facebook.isInitializeStarted) return;
            mixIn(config, options);
            facebook.isInitializeReady = true;
            if(!facebook.isInitialized && facebook.isAPIReady){
                facebook.isInitializeStarted = true;
                  
                FB.init(facebook.config);
                FB.getLoginStatus(_getLoginStatus);
            }
        }

        function requirePermissions(newPermissions){
            combine(_requiredPermissions, newPermissions);
            var i = _requiredPermissions.length;
            while(i--){
                if(_existedPermissions[_requiredPermissions[i]]) {
                    _requiredPermissions.splice(i, 1);
                }
            }
        }

        function login(onSuccess, onError) {
            if(_requiredPermissions.length > 0 || !facebook.isAuthenticated) {
                FB.login(function(response) {
                    if(response.authResponse && !response.error) {
                        _onAuthenticated(response, function(){
                            for(var i = 0, len = _requiredPermissions.length; i < len; i++) {
                                if(!_existedPermissions[_requiredPermissions[i]]) {
                                    if(onError) onError(response);
                                    return;
                                }
                            }
                            _requiredPermissions.splice(0, _requiredPermissions.length);
                            onSuccess(response);
                        });
                    } else {
                        facebook.isAuthenticated = false;
                        if(onError) onError(response);
                    }
                },
                {
                    scope: _requiredPermissions.join(',')
                });
            } else {
                onSuccess(true);
            }
        }

        function run(){
            FB[arguments[0]].apply(FB,  arguments.slice(1));
        }


        function _getLoginStatus(response) {
            facebook.loginResponse = response;
            if (response.status === 'connected') {
                _onAuthenticated(response);
            } else {
                facebook.uid = facebook.accessToken = null;
                facebook.isAuthenticated = false;
                if (response.status === 'not_authorized') {
                    facebook.isLoggedIn = true;
                } else {
                    facebook.isLoggedIn = false;
                }
            }
            facebook.isInitialized = true;
        }

        function _onAuthenticated(response, callback){
            facebook.isLoggedIn = true;
            facebook.isAuthenticated = true;
            facebook.uid = response.authResponse.userID;
            facebook.accessToken = response.authResponse.accessToken;
            FB.api('/me/permissions', function(resp) {
                mixIn(_existedPermissions, resp.data[0]);
                if(callback) callback(response);
            });
        }



        function isCanvasReady(){
            return win.FB && win.FB.Canvas;
        }

        function setCanvasSize(width, height) {
            if(width !== undef) facebook.canvasWidth = width;
            if(height !== undef) facebook.canvasHeight = height;
            if(isCanvasReady()) FB.Canvas.setSize({ width: facebook.canvasWidth, height: facebook.canvasHeight });
        }

        function getCanvasPageInfo(){
            //TODO
        }

        function scrollTo(x, y){
            if(isCanvasReady()) FB.Canvas.scrollTo(x, y);
        }


        facebook.init = init;
        facebook.getFacebookAPI = getFacebookAPI;
        facebook.fbAsyncInit = window.fbAsyncInit = fbAsyncInit;
        facebook.requirePermissions = requirePermissions;
        facebook.login = login;
        facebook.run = run;

		

        //tab
        //
        facebook.isCanvasReady = isCanvasReady;
        facebook.setCanvasSize = setCanvasSize;
        facebook.getCanvasPageInfo = getCanvasPageInfo;
        facebook.scrollTo = scrollTo;

    }
)
