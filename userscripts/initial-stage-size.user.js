// ==UserScript==
// @name         Set initial stage size
// @namespace    https://ego-lay-atman-bay.github.io/snap-extensions/
// @version      2025-05-30
// @description  Set initial stage size
// @author       You
// @match        https://snap.berkeley.edu/snap/snap.html
// @icon         https://forum.snap.berkeley.edu/favicon/proxied?https%3A%2F%2Fd1eo0ig0pi5tcs.cloudfront.net%2Foptimized%2F2X%2Ff%2Ffec08d3829a26a75ae620be49835ef91b13ba8e9_2_32x32.png
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    IDE_Morph.prototype.init = new Proxy(
        IDE_Morph.prototype.init,
        {
            apply (target, ctx, args) {
                console.log('arguments', arguments)
                Reflect.apply(...arguments)
                
                ctx.stageRatio = 0.5
                ctx.isSmallStage = true
            }
        }
    )

    // let stage = world.childThatIsA(IDE_Morph)
    // stage.isSmallStage = true
    // stage.stageRatio = 0.5
    // stage.setExtent(world.extent())
})();
