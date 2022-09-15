// ==UserScript==
// @name         Whitelist ego-lay-atman-bay Snap! extensions
// @namespace    https://ego-lay-atman-bay.github.io/snap-extensions/
// @version      0.1
// @description  Whitelist https://ego-lay-atman-bay.github.io for snap extensions
// @author       ego-lay-atman-bay
// @match        https://snap.berkeley.edu/snap/snap.html
// @icon         https://forum.snap.berkeley.edu/favicon/proxied?https%3A%2F%2Fd1eo0ig0pi5tcs.cloudfront.net%2Foptimized%2F2X%2Ff%2Ffec08d3829a26a75ae620be49835ef91b13ba8e9_2_32x32.png
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function whitelist(url) {
        console.log(`adding ${url} to whitelist`)
        SnapExtensions['urls'].push(url)
    }

    whitelist('https://ego-lay-atman-bay.github.io/snap-extensions/')
})();