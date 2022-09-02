// ==UserScript==
// @name         Snap! editor theme
// @namespace    https://ego-lay-atman-bay.github.io/snap-extensions/
// @version      0.2
// @description  New snap editor theme
// @author       ego-lay_atman-bay
// @match        https://snap.berkeley.edu/snap/snap.html
// @icon         https://forum.snap.berkeley.edu/favicon/proxied?https%3A%2F%2Fd1eo0ig0pi5tcs.cloudfront.net%2Foptimized%2F2X%2Ff%2Ffec08d3829a26a75ae620be49835ef91b13ba8e9_2_32x32.png
// @grant        none
// ==/UserScript==
(function () {
    'use strict';

    MorphicPreferences.isLight = MorphicPreferences.isFlat

    IDE_Morph.prototype.darkDesign = function () {
        this.setDarkDesign();
        this.refreshIDE();
    };

    IDE_Morph.prototype.lightDesign = function () {
        this.setLightDesign();
        this.refreshIDE();
    };

    function replace_flat(text) {
        return text.replace('MorphicPreferences.isFlat', 'MorphicPreferences.isLight');
    }

    var dark = replace_flat(IDE_Morph.prototype.setDefaultDesign.toString());
    var light = replace_flat(IDE_Morph.prototype.setFlatDesign.toString())

    const setdark = new Function('IDE_Morph.prototype.setDarkDesign = ' + dark);
    const setlight = new Function('IDE_Morph.prototype.setLightDesign = ' + light);

    setdark()
    setlight()

    IDE_Morph.prototype.setFlatDesign = function () {
        MorphicPreferences.isFlat = true;
        IDE_Morph.prototype.scriptsPaneTexture = null;
    };

    IDE_Morph.prototype.setDefaultDesign = function () {
        MorphicPreferences.isFlat = false;
        IDE_Morph.prototype.scriptsPaneTexture = this.scriptsTexture();
    };
    console.log('Injecting menu items');
    var menu = IDE_Morph.prototype.settingsMenu.toString();
    var split = menu.split("\n    addPreference(\n        'Flat design',\n        () => {\n            if (MorphicPreferences.isFlat) {\n                return this.defaultDesign();\n            }\n            this.flatDesign();\n        },\n        MorphicPreferences.isFlat,\n        'uncheck for default\\nGUI design',\n        'check for alternative\\nGUI design',\n        false\n    );");
    split.splice(1, 0, "    addPreference(\n        'Flat design',\n        () => {\n            if (MorphicPreferences.isFlat) {                return this.defaultDesign();\n            }\n            this.flatDesign();\n        },        MorphicPreferences.isFlat,\n        'uncheck for default\\nGUI design',        'check for alternative\\nGUI design',\n        false\n    );\n	addPreference(\n        'Dark design',\n        () => {\n            if (MorphicPreferences.isLight) {\n                return this.darkDesign();\n            }\n            this.lightDesign();\n        },\n        !MorphicPreferences.isLight,\n        'uncheck for default\\nGUI design',\n        'check for alternative\\nGUI design',\n        false\n    );");
    var newFun = split.join('');
    const dark_mode = new Function('IDE_Morph.prototype.settingsMenu = ' + newFun);
    dark_mode();
})();