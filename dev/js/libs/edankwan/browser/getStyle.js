define(['../polyfill/getComputedStyle'], function(){

    function getStyle(elem) {
        return window.getComputedStyle(elem, "null");
    }

    return getStyle;

});