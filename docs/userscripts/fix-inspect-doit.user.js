// ==UserScript==
// @name         Fix Morphic.js Inspect doIt
// @namespace    https://ego-lay-atman-bay.github.io/snap-extensions
// @version      0.1
// @description  Fixes morphic.js Inspect doIt functions to actually work.
// @author       ego-lay-atman-bay
// @match        https://snap.berkeley.edu/*/snap.html
// @icon         https://forum.snap.berkeley.edu/favicon/proxied?https%3A%2F%2Fd1eo0ig0pi5tcs.cloudfront.net%2Foptimized%2F2X%2Ff%2Ffec08d3829a26a75ae620be49835ef91b13ba8e9_2_32x32.png
// @grant        none
// ==/UserScript==
(function () {
    'use strict';
    if (typeof morphicVersion !== 'undefined') {
        console.log("fixing doIt")
        function selectionToText(func) {
            return func.replace("this.selection()", "this.text")
        }

        function fixFunction(name) {
            const getFunc = new Function('return ' + name)
            var func = getFunc()
    
            var string = selectionToText(func.toString());
            const activate = new Function(name + ' = ' + string);
            activate();
        }

        fixFunction("TextMorph.prototype.doIt")
        fixFunction("TextMorph.prototype.showIt")
        fixFunction("TextMorph.prototype.inspectIt")
    }
})()
