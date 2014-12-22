define([
        'exports',
        'settings',
        'project/3d/card/card',
        'project/3d/card/cardBack2d',
        'project/ui/hueSlider/hueSlider',
        'signals'
    ],
    function(exports, settings, card, cardBack2d, hueSlider, signals) {

        var undef;

        var _win = window;

        exports.recievedData = {};
        var cardData = exports.cardData = {};

        var onCardTextChanged = exports.onCardTextChanged = new signals.Signal();

        function _getHash() {
            var hash;
            if(settings.isIFrame) {
                hash = _win.top.location.hash;
            } else {
                hash = _win.location.hash;
            }
            return hash ? hash.substr(1) : false;
        }

        function _getUrl() {
            if(settings.isIFrame) {
                return _win.top.location.href.split('#')[0];
            }
            return _win.location.href.split('#')[0];
        }

        function _clearHash() {
            if(settings.isIFrame) {
                _win.top.location.hash = '';
            } else {
                _win.location.hash = '';
            }
        }

        function parseUrl() {
            var hash = _getHash();
            if(!hash) return false;
            if(!settings.SKIP_CLEAN_UP_HASH) _clearHash();
            var data = _parseHash(hash);
            if(data) {
                // exports.recievedData = {
                //     text : 'Hello, testing!!!',
                //     hue: 0.2,
                //     items: [
                //         130, -69,
                //         -143, -66,
                //         -54, 24,
                //         -1, -108
                //     ]
                // };
                exports.recievedData = data;

                return true;
            } else {
                console.error('incorrect hash data');
            }
            exports.recievedData = null;

            return false;
        }

        function _parseHash(hash) {
            var data;
            try {
                data = JSON.parse(atob(hash));
                if((data.items.length !== 8) || (!data.text) || (data.hue === undef)) {
                    return false;
                }
            } catch(err) {
                return false;
            }
            return data;
        }

        function getShareUrl() {
            cardData.hue = hueSlider.hueRatio;
            return _getUrl() + '#' + btoa(JSON.stringify(cardData));
        }

        function updateCardItems() {
            var item;
            var cardItems = cardData.items = [];
            for(var i = 0; i < card.items.length; i++) {
                item = card.items[i];
                cardItems.push(item.tX | 0);
                cardItems.push(item.tY | 0);
            }
        }

        function updateCardText(text) {
            cardData.text = text;
            onCardTextChanged.dispatch(text);
        }

        function setHash(hash) {
            hash = '#' + hash;
            if(settings.isIFrame) {
                _win.top.location.hash = hash;
            } else {
                _win.location.hash = hash;
            }
        }

        exports.parseUrl = parseUrl;
        exports.getShareUrl = getShareUrl;
        exports.updateCardItems = updateCardItems;
        exports.updateCardText = updateCardText;
        exports.setHash = setHash;

    }
);
