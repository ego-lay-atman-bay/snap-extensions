// ==UserScript==
// @name         Snap! editor theme
// @namespace    https://ego-lay-atman-bay.github.io/snap-extensions/
// @version      0.5
// @description  New snap editor theme
// @author       ego-lay_atman-bay
// @match        https://snap.berkeley.edu/snap/snap.html
// @icon         https://forum.snap.berkeley.edu/favicon/proxied?https%3A%2F%2Fd1eo0ig0pi5tcs.cloudfront.net%2Foptimized%2F2X%2Ff%2Ffec08d3829a26a75ae620be49835ef91b13ba8e9_2_32x32.png
// @grant        none
// ==/UserScript==
(function () {
    'use strict';
    console.log('Injecting theme');

    MorphicPreferences.isLight = MorphicPreferences.isFlat

    function update_settings() {
        var settings = IDE_Morph.prototype.applySavedSettings.toString();
        var settings_lines = settings.split('\n');

        var get_light_mode = "        theme = this.getSetting('theme');\n\n    if (theme === 'light') {\n        this.setLightDesign();\n    } else if (theme == 'dark') {\n        this.setDarkDesign();\n    } else {\n        if (design == 'flat') {\n            this.setLightDesign();\n        } else {\n            this.setDarkDesign();\n        }\n    }";

        settings_lines.splice(settings_lines.indexOf(''), 0, get_light_mode);

        const settings_func = new Function('IDE_Morph.prototype.applySavedSettings = ' + settings_lines.join('\n'));
        settings_func();

        IDE_Morph.prototype.applySavedSettings();
    }

    IDE_Morph.prototype.darkDesign = function () {
        this.setDarkDesign();

        this.refreshIDE();
        this.saveSetting('theme', 'dark');
    };

    IDE_Morph.prototype.lightDesign = function () {
        this.setLightDesign();

        this.refreshIDE();
        this.saveSetting('theme', 'light');
    };

    function replace_flat(text) {
        return text.replace('MorphicPreferences.isFlat', 'MorphicPreferences.isLight');
    }

    function set_func(name) {
        const getFunc = new Function('return ' + name)
        var func = getFunc()

        var string = replace_flat(func.toString());
        const activate = new Function(name + ' = ' + string);
        activate();
    }

    function inject_design() {
        var injection = "    if (MorphicPreferences.isLight) {\n        this.saveSetting('theme', 'light');\n    } else {\n        this.saveSetting('theme', 'dark');\n    }";

        var flatdesign = IDE_Morph.prototype.flatDesign.toString().split('\n');
        var defaultdesign = IDE_Morph.prototype.defaultDesign.toString().split('\n');

        flatdesign.splice(flatdesign['length']-1, 0, injection);
        defaultdesign.splice(defaultdesign['length']-1, 0, injection);

        const injected_flat = new Function('IDE_Morph.prototype.flatDesign = ' + flatdesign.join('\n'));
        const injected_default = new Function('IDE_Morph.prototype.defaultDesign = ' + defaultdesign.join('\n'));

        injected_flat();
        injected_default();
    }

    inject_design();

    set_func('IDE_Morph.prototype.createLogo');

    set_func('IDE_Morph.prototype.createControlBar');

    set_func('IDE_Morph.prototype.createCategories');
    set_func('IDE_Morph.prototype.createSpriteBar');
    set_func('IDE_Morph.prototype.createCorralBar');
    set_func('BlockDialogMorph.prototype.addCategoryButton');
    set_func('BlockDialogMorph.prototype.addCustomCategoryButton');
    set_func('SpriteMorph.prototype.searchBlocks');

    var dark = replace_flat(IDE_Morph.prototype.setDefaultDesign.toString());
    var light = replace_flat(IDE_Morph.prototype.setFlatDesign.toString())

    dark = dark.split('\n')
    dark.splice(-1, 0, "PushButtonMorph.prototype.outlineColor = IDE_Morph.prototype.frameColor;\n    ToggleButtonMorph.prototype.outlineColor = IDE_Morph.prototype.frameColor;\n    TabMorph.prototype.outlineColor = IDE_Morph.prototype.frameColor;\n    ToggleMorph.prototype.outlineColor = IDE_Morph.prototype.frameColor;\n    ToggleElementMorph.prototype.outlineColor = IDE_Morph.prototype.frameColor;")
    dark = dark.join('\n')

    light = light.split('\n')
    light.splice(-1, 0, "    PushButtonMorph.prototype.outlineColor = IDE_Morph.prototype.frameColor;\n    ToggleButtonMorph.prototype.outlineColor = IDE_Morph.prototype.frameColor;\n    TabMorph.prototype.outlineColor = IDE_Morph.prototype.frameColor;\n    ToggleMorph.prototype.outlineColor = IDE_Morph.prototype.frameColor;\n    ToggleElementMorph.prototype.outlineColor = IDE_Morph.prototype.frameColor;")
    light = light.join('\n')

    // console.log(dark)
    // console.log(light)

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

    var menu = IDE_Morph.prototype.settingsMenu.toString();
    var split = menu.split("\n    addPreference(\n        'Flat design',\n        () => {\n            if (MorphicPreferences.isFlat) {\n                return this.defaultDesign();\n            }\n            this.flatDesign();\n        },\n        MorphicPreferences.isFlat,\n        'uncheck for default\\nGUI design',\n        'check for alternative\\nGUI design',\n        false\n    );");
    split.splice(1, 0, "    addPreference(\n        'Flat design',\n        () => {\n            if (MorphicPreferences.isFlat) {                return this.defaultDesign();\n            }\n            this.flatDesign();\n        },        MorphicPreferences.isFlat,\n        'uncheck for default\\nGUI design',        'check for alternative\\nGUI design',\n        false\n    );\n	addPreference(\n        'Dark theme',\n        () => {\n            if (MorphicPreferences.isLight) {\n                return this.darkDesign();\n            }\n            this.lightDesign();\n        },\n        !MorphicPreferences.isLight,\n        'uncheck for light\\nGUI theme',\n        'check for dark\\nGUI theme',\n        false\n    );");
    var newFun = split.join('');
    const dark_mode = new Function('IDE_Morph.prototype.settingsMenu = ' + newFun);
    dark_mode();

    update_settings();

})();
