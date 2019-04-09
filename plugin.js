(function () {
var plugin = (function () {
    'use strict';

    var setup = function (editor, url) {
        var mapper = editor.getParam('variable_mapper', {});
        var valid = editor.getParam('variable_valid', null);
        var className = editor.getParam('variable_class', 'tinymce-variable');
        var prefix = editor.getParam('variable_prefix', '{{');
        var suffix = editor.getParam('variable_suffix', '}}');
        var stringVariableRegex = new RegExp(prefix + '([a-z. _]*)?' + suffix, 'g');
        this.htmlToString = htmlToString;
        this.stringToHTML = stringToHTML;
        function isValid(name) {
        if (!valid || valid.length === 0) {
            return true;
        }
        var validString = '|' + valid.join('|') + '|';
            return validString.indexOf('|' + name + '|') > -1 ? true : false;
        }
        function getMappedValue(cleanValue) {
            if (typeof mapper === 'function') {
                return mapper(cleanValue);
            }
            return mapper.hasOwnProperty(cleanValue) ? mapper[cleanValue] : cleanValue;
        }
        function cleanVariable(value) {
            return value.replace(/[^a-zA-Z._]/g, '');
        }
        function createHTMLVariable(value) {
            var cleanValue = cleanVariable(value);
            if (!isValid(cleanValue)) {
                return cleanValue;
            }
            var cleanMappedValue = getMappedValue(cleanValue);
            editor.fire('variableToHTML', {
                value: value,
                cleanValue: cleanValue
            });
            var variable = prefix + cleanValue + suffix;
            return '<span class="' + className + '" data-original-variable="' + variable + '" contenteditable="false">' + cleanMappedValue + '</span>';
        }
        function stringToHTML() {
            var nodeList = [],
                nodeValue,
                node,
                div;
            // find nodes that contain a string variable
            tinymce.walk(editor.getBody(), function(n) {
                if (n.nodeType == 3 && n.nodeValue && stringVariableRegex.test(n.nodeValue)) {
                    nodeValue = n.nodeValue.replace(stringVariableRegex, createHTMLVariable);
                    div = editor.dom.create('div', null, nodeValue);
                    while ((node = div.lastChild)) {
                        editor.dom.insertAfter(node, n);
                
                        if (isVariable(node)) {
                            var next = node.nextSibling;
                            editor.selection.setCursorLocation(next);
                        }
                    }
                    editor.dom.remove(n);
                }
            }, 'childNodes');
        }
        function htmlToString() {
            var nodeList = [];
            var nodeValue;
            var node;
            var div;
            tinymce.walk(editor.getBody(), function (n) {
                if (n.nodeType === 1) {
                var original = n.getAttribute('data-original-variable');
                if (original !== null) {
                    nodeList.push(n);
                }
                }
            }, 'childNodes');
            for (var _i = 0, nodeList_2 = nodeList; _i < nodeList_2.length; _i++) {
                var nodeElement = nodeList_2[_i];
                nodeValue = nodeElement.getAttribute('data-original-variable');
                div = editor.dom.create('div', null, nodeValue);
                while (true) {
                node = div.lastChild;
                if (node === undefined || node === null) {
                    break;
                }
                editor.dom.insertAfter(node, nodeElement);
                }
                editor.dom.remove(nodeElement);
            }
        }
        function addVariable(value) {
            var htmlVariable = createHTMLVariable(value);
            editor.execCommand('mceInsertContent', false, htmlVariable);
        }
        function isVariable(element) {
            if (typeof element.getAttribute === 'function' && element.hasAttribute('data-original-variable')) {
                return true;
            }
            return false;
        }
        function createMenuItems() {
            var menu = [];
            var _loop_1 = function (key) {
                if(valid.indexOf(key) > -1) {
                menu.push({
                text: mapper[key],
                onclick: function () {
                    addVariable(key);
                }
                });
                }
            };
            for (var _i = 0, _a = Object.keys(mapper); _i < _a.length; _i++) {
                var key = _a[_i];
                _loop_1(key);
            }
            return menu;
            }
            editor.on('nodechange', stringToHTML);
            editor.on('keyup', stringToHTML);
            editor.addButton('variable', {
            type: 'menubutton',
            text: 'Variable',
            icon: false,
            menu: createMenuItems()
        });
    };
    tinymce.PluginManager.add('variable', setup);
    function Plugin () {
    }

    return Plugin;

}());
plugin();})();
    