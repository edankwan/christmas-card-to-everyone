define([
        'exports',
        'settings',
        'project/controllers/dataController'
    ], function(exports, settings, dataController){

        function share(id, text) {
            switch(id){
                case 'facebook':
                    getLinkFunc = _getFacebookShareLink;
                break;
                case 'twitter':
                    getLinkFunc = _getTwitterShareLink;
                break;
                case 'gplus':
                    getLinkFunc = _getGplusShareLink;
                break;
            }
            window.open(getLinkFunc(dataController.getShareUrl(), settings.locale.socials.twitter),'share','width=640,height=480');
        }

        function _getFacebookShareLink(url){
            return 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url);
        }
        function _getTwitterShareLink(url, text){
            return 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(text.replace('<%=url%>', url));
        }
        function _getGplusShareLink(url){
            return 'https://plus.google.com/share?url=' + encodeURIComponent(url);
        }

        return {
            share: share
        };
    }
);
