define([
        'exports',
        'settings',
        'lodash',
        'project/shaders/snippets'
    ],
    function(exports, settings, _, shaderSnippets) {

        function compile(src) {
            return _.template(src, shaderSnippets);
        }

        exports.compile = compile;

    }
);
