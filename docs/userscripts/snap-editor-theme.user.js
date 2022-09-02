// ==UserScript==
// @name         Snap! editor theme
// @namespace    https://tapermonkey.net
// @version      0.2
// @description  New snap editor theme
// @author       ego-lay_atman-bay
// @match        https://snap.berkeley.edu/snap/snap.html
// @icon         https://forum.snap.berkeley.edu/favicon/proxied?https%3A%2F%2Fd1eo0ig0pi5tcs.cloudfront.net%2Foptimized%2F2X%2Ff%2Ffec08d3829a26a75ae620be49835ef91b13ba8e9_2_32x32.png
// @grant        none
// ==/UserScript==
(function () {
    'use strict';

    MorphicPreferences.isDark = !MorphicPreferences.isFlat

    IDE_Morph.prototype.darkDesign = function () {
        this.setDarkDesign();
        this.refreshIDE();
    };

    IDE_Morph.prototype.lightDesign = function () {
        this.setLightDesign();
        this.refreshIDE();
    };

    IDE_Morph.prototype.setDarkDesign = function () {
        MorphicPreferences.isDark = true;
        SpriteMorph.prototype.paletteColor = new Color(30, 30, 30);
        SpriteMorph.prototype.paletteTextColor = new Color(230, 230, 230);
        StageMorph.prototype.paletteTextColor = SpriteMorph.prototype.paletteTextColor;
        StageMorph.prototype.paletteColor = SpriteMorph.prototype.paletteColor;
        SpriteMorph.prototype.sliderColor = SpriteMorph.prototype.paletteColor.lighter(30);

        IDE_Morph.prototype.buttonContrast = 30;
        IDE_Morph.prototype.backgroundColor = new Color(10, 10, 10);
        IDE_Morph.prototype.frameColor = SpriteMorph.prototype.paletteColor;

        IDE_Morph.prototype.groupColor = SpriteMorph.prototype.paletteColor.lighter(5);
        IDE_Morph.prototype.sliderColor = SpriteMorph.prototype.sliderColor;
        IDE_Morph.prototype.buttonLabelColor = WHITE;
        IDE_Morph.prototype.tabColors = [
            IDE_Morph.prototype.groupColor.darker(50),
            IDE_Morph.prototype.groupColor.darker(25),
            IDE_Morph.prototype.groupColor
        ];
        IDE_Morph.prototype.rotationStyleColors = IDE_Morph.prototype.tabColors;
        IDE_Morph.prototype.appModeColor = BLACK;
        IDE_Morph.prototype.padding = 1;

        SpriteIconMorph.prototype.labelColor = IDE_Morph.prototype.buttonLabelColor;
        CostumeIconMorph.prototype.labelColor = IDE_Morph.prototype.buttonLabelColor;
        SoundIconMorph.prototype.labelColor = IDE_Morph.prototype.buttonLabelColor;
        TurtleIconMorph.prototype.labelColor = IDE_Morph.prototype.buttonLabelColor;

        SyntaxElementMorph.prototype.contrast = 65;
        ScriptsMorph.prototype.feedbackColor = WHITE;

        if (!MorphicPreferences.isFlat) {
            IDE_Morph.prototype.scriptsPaneTexture = this.scriptsTexture();
        } else {
            IDE_Morph.prototype.scriptsPaneTexture = null;
        }
    };

    IDE_Morph.prototype.setLightDesign = function () {
        MorphicPreferences.isDark = false;
        SpriteMorph.prototype.paletteColor = WHITE;
        SpriteMorph.prototype.paletteTextColor = new Color(70, 70, 70);
        StageMorph.prototype.paletteTextColor = SpriteMorph.prototype.paletteTextColor;
        StageMorph.prototype.paletteColor = SpriteMorph.prototype.paletteColor;
        SpriteMorph.prototype.sliderColor = SpriteMorph.prototype.paletteColor;

        IDE_Morph.prototype.buttonContrast = 30;
        IDE_Morph.prototype.backgroundColor = new Color(220, 220, 230);
        IDE_Morph.prototype.frameColor = new Color(240, 240, 245);

        IDE_Morph.prototype.groupColor = WHITE;
        IDE_Morph.prototype.sliderColor = SpriteMorph.prototype.sliderColor;
        IDE_Morph.prototype.buttonLabelColor = new Color(70, 70, 70);
        IDE_Morph.prototype.tabColors = [
            IDE_Morph.prototype.frameColor,
            IDE_Morph.prototype.frameColor.lighter(50),
            IDE_Morph.prototype.groupColor
        ];
        IDE_Morph.prototype.rotationStyleColors = IDE_Morph.prototype.tabColors;
        IDE_Morph.prototype.appModeColor = IDE_Morph.prototype.frameColor;
        IDE_Morph.prototype.padding = 1;

        SpriteIconMorph.prototype.labelColor = IDE_Morph.prototype.buttonLabelColor;
        CostumeIconMorph.prototype.labelColor = IDE_Morph.prototype.buttonLabelColor;
        SoundIconMorph.prototype.labelColor = IDE_Morph.prototype.buttonLabelColor;
        TurtleIconMorph.prototype.labelColor = IDE_Morph.prototype.buttonLabelColor;

        SyntaxElementMorph.prototype.contrast = 25;
        ScriptsMorph.prototype.feedbackColor = new Color(153, 255, 213);

        if (!MorphicPreferences.isFlat) {
            IDE_Morph.prototype.scriptsPaneTexture = this.scriptsTexture();
        } else {
            IDE_Morph.prototype.scriptsPaneTexture = null;
        }
    };

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
    split.splice(1, 0, "    addPreference(\n        'Flat design',\n        () => {\n            if (MorphicPreferences.isFlat) {                return this.defaultDesign();\n            }\n            this.flatDesign();\n        },        MorphicPreferences.isFlat,\n        'uncheck for default\\nGUI design',        'check for alternative\\nGUI design',\n        false\n    );\n	addPreference(\n        'Dark design',\n        () => {\n            if (MorphicPreferences.isDark) {\n                return this.lightDesign();\n            }\n            this.darkDesign();\n        },\n        MorphicPreferences.isDark,\n        'uncheck for default\\nGUI design',\n        'check for alternative\\nGUI design',\n        false\n    );");
    var newFun = split.join('');
    const dark_mode = new Function('IDE_Morph.prototype.settingsMenu = ' + newFun);
    dark_mode();
})();