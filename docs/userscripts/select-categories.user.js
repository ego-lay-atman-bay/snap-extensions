// ==UserScript==
// @name         Select Categories
// @namespace    https://ego-lay-atman-bay.github.io/snap-extensions
// @version      0.2
// @description  Adds the ability to select and deselect categories in the export and unused blocks dialogs.
// @author       ego-lay-atman-bay
// @match        https://snap.berkeley.edu/*/snap.html
// @icon         https://forum.snap.berkeley.edu/favicon/proxied?https%3A%2F%2Fd1eo0ig0pi5tcs.cloudfront.net%2Foptimized%2F2X%2Ff%2Ffec08d3829a26a75ae620be49835ef91b13ba8e9_2_32x32.png
// @grant        none
// ==/UserScript==
(function () {
    'use strict';

    function checkVersion() {
        if (typeof SnapVersion !== 'undefined') {
            let version = SnapVersion.split('.')
            return [version[0], version[1]].join('.')
        }
        else {
            return false
        }
    }

    if (checkVersion() >= 7 || true) {

        console.log('adding selecting categories')

        let func = BlockExportDialogMorph.prototype.buildContents.toString()

        let split = func.split('lastCat,')
        split.splice(1, 0, 'lastCat, catCheckBox')
        func = split.join('')

        let start = func.indexOf('if (lastCat && (category !== lastCat))')
        let end = func.indexOf('}', start)

        let injectStr = "if (category !== lastCat) {\n                    y += padding;\n                    catCheckBox = new ToggleMorph(\n                        'checkbox',\n                        this,\n                        () => {\n                            var blocks = [];\n                            if (contains(this.blocks.map(b => b.category), category)) {\n                                this.blocks.forEach(block => {\n                                    if (block.category != category) {\n                                        blocks.push(block)\n                                    };\n                                });\n                                this.blocks = blocks;\n                            }\n                            else {\n                                this.body.contents.children.forEach(block => {\n                                    if (block instanceof ToggleMorph) {\n                                        if (block.element instanceof CustomReporterBlockMorph || block.element instanceof CustomCommandBlockMorph) {\n                                            if (block.element.category == category) {\n                                                if (!contains(this.blocks, block.element.definition)) {\n                                                    block.trigger()\n                                                };\n                                            };\n                                        };\n                                    };\n                                });\n                            };\n                            try {\n                                this.collectDependencies(); // v8.0+\n                            }\n                            catch (err) { // v7\n                                this.body.contents.children.forEach(checkBox => {\n                                    if (checkBox instanceof ToggleMorph) {\n                                        checkBox.refresh();\n                                    }\n                                });\n                            }\n\n                        },\n                        // category,\n                        null,\n                        () => contains(this.blocks.map(b => b.category), category),\n                        null,\n                        null                        \n                    )\n                    // catCheckBox.label.color = new Color(255, 255, 255, 1)\n                    // catCheckBox.label.fontSize = 12\n                    // catCheckBox.label.setWidth()\n                    // catCheckBox.label.setTop()\n                    // catCheckBox.element.setTop(-(catCheckBox.fullBounds().height()/2))\n                    catCheckBox.setPosition(new Point(\n                        x,\n                        y + (catCheckBox.top())\n                    ));\n                    palette.addContents(catCheckBox);\n                    txt = SpriteMorph.prototype.categoryText(category);\n                    txt.setPosition(new Point(x + catCheckBox.fullBounds().width() + padding, y));\n                    txt.refresh = function() {};\n                    palette.addContents(txt);\n                    y += catCheckBox.fullBounds().height()\n                    y += padding\n                }"

        var newFunc = [func.substring(0, start), injectStr, func.substring(end + 1, func.length)].join('')
        const injectFunc = new Function('BlockExportDialogMorph.prototype.buildContents = ' + newFunc)
        injectFunc()

        BlockRemovalDialogMorph.prototype.buildContents = BlockExportDialogMorph.prototype.buildContents;
    }
})();