// ==UserScript==
// @name         Copy/paste scripts
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Copy/paste scripts
// @author       ego-lay_atman-bay
// @match        https://snap.berkeley.edu/snap/snap.html
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    CommentMorph.prototype.userCut = function () {

    window.blockCopy = this.fullCopy()

    this.selectForEdit().destroy(); // enable copy-on-edit
};

ReporterBlockMorph.prototype.userCut = function () {

    window.blockCopy = this.fullCopy()

    // make sure to restore default slot of parent block
    var target = this.selectForEdit(); // enable copy-on-edit
    if (target !== this) {
        return this.userDestroy.call(target);
    }

    // for undrop / redrop
    var scripts = this.parentThatIsA(ScriptsMorph);
    if (scripts) {
        scripts.clearDropInfo();
        scripts.lastDroppedBlock = this;
        scripts.recordDrop(this.situation());
        scripts.dropRecord.action = 'delete';
    }

    this.topBlock().fullChanged();
    this.prepareToBeGrabbed(this.world().hand);
    this.destroy();

	var nb = window.blockCopy.fullCopy()
	var nb = nb.nextBlock()
	if (nb) {nb.destroy(); }
};

CommandBlockMorph.prototype.userCut = function () {

    window.blockCopy = this.fullCopy()
	var nb = window.blockCopy.nextBlock()
	if (nb) {nb.destroy(); }

    var target = this.selectForEdit(); // enable copy-on-edit
    if (target !== this) {
        return this.userDestroy.call(target);
    }
    if (this.nextBlock()) {
        this.userDestroyJustThis();
        return;
    }

    var scripts = this.parentThatIsA(ScriptsMorph),
        ide = this.parentThatIsA(IDE_Morph),
        parent = this.parentThatIsA(SyntaxElementMorph),
        cslot = this.parentThatIsA(CSlotMorph);

    // for undrop / redrop
    if (scripts) {
        scripts.clearDropInfo();
        scripts.lastDroppedBlock = this;
        scripts.recordDrop(this.situation());
        scripts.dropRecord.action = 'delete';
    }

    this.prepareToBeGrabbed(); // fix outer ring reporter slot

    if (ide) {
        // also stop all active processes hatted by this block
        ide.removeBlock(this);
    } else {
        this.destroy();
    }
    if (cslot) {
        cslot.fixLayout();
    }
    if (parent) {
        parent.reactToGrabOf(this); // fix highlight
    }
};

BlockMorph.prototype.userMenu = function () {
    var menu = new MenuMorph(this),
        world = this.world(),
        myself = this,
        hasLine = false,
        shiftClicked = world.currentKey === 16,
        proc = this.activeProcess(),
        top = this.topBlock(),
        vNames = proc && proc.context && proc.context.outerContext ?
                proc.context.outerContext.variables.names() : [],
        alternatives,
        field,
        rcvr;

    function addOption(label, toggle, test, onHint, offHint) {
        menu.addItem(
            [
                test ? new SymbolMorph(
                    'checkedBox',
                    MorphicPreferences.menuFontSize * 0.75
                ) : new SymbolMorph(
                    'rectangle',
                    MorphicPreferences.menuFontSize * 0.75
                ),
                localize(label)
            ],
            toggle,
            test ? onHint : offHint
        );
    }

    function renameVar() {
        var blck = myself.fullCopy();
        blck.addShadow();
        new DialogBoxMorph(
            myself,
            myself.userSetSpec,
            myself
        ).prompt(
            "Variable name",
            myself.blockSpec,
            world,
            blck.doWithAlpha(1, () => blck.fullImage()), // pic
            InputSlotMorph.prototype.getVarNamesDict.call(myself)
        );
    }

    menu.addItem(
        "help...",
        'showHelp'
    );
    if (this.isTemplate) {
        if (this.parent instanceof SyntaxElementMorph) { // in-line
            if (this.selector === 'reportGetVar') { // script var definition
                menu.addLine();
                menu.addItem(
                    'rename...',
                    () => this.refactorThisVar(true), // just the template
                    'rename only\nthis reporter'
                );
                menu.addItem(
                    'rename all...',
                    'refactorThisVar',
                    'rename all blocks that\naccess this variable'
                );
            }
        } else { // in palette
            if (this.selector === 'reportGetVar') {
                rcvr = this.scriptTarget();
                if (this.isInheritedVariable(false)) { // fully inherited
                    addOption(
                        'inherited',
                        () => rcvr.toggleInheritedVariable(this.blockSpec),
                        true,
                        'uncheck to\ndisinherit',
                        null
                    );
                } else { // not inherited
                    if (this.isInheritedVariable(true)) { // shadowed
                        addOption(
                            'inherited',
                            () => rcvr.toggleInheritedVariable(
                                this.blockSpec
                            ),
                            false,
                            null,
                            localize('check to inherit\nfrom')
                                + ' ' + rcvr.exemplar.name
                        );
                    }
                    addOption(
                        'transient',
                        'toggleTransientVariable',
                        this.isTransientVariable(),
                        'uncheck to save contents\nin the project',
                        'check to prevent contents\nfrom being saved'
                    );
                    menu.addLine();
                    menu.addItem(
                        'rename...',
                        () => this.refactorThisVar(true), // just the template
                        'rename only\nthis reporter'
                    );
                    menu.addItem(
                        'rename all...',
                        'refactorThisVar',
                        'rename all blocks that\naccess this variable'
                    );
                }
            } else if (this.selector !== 'evaluateCustomBlock') {
                menu.addItem(
                    "hide",
                    'hidePrimitive'
                );
            }

            // allow toggling inheritable attributes
            if (StageMorph.prototype.enableInheritance) {
                rcvr = this.scriptTarget();
                field = {
                    xPosition: 'x position',
                    yPosition: 'y position',
                    direction: 'direction',
                    getScale: 'size',
                    getCostumeIdx: 'costume #',
                    getVolume: 'volume',
                    getPan: 'balance',
                    reportShown: 'shown?',
                    getPenDown: 'pen down?'
                }[this.selector];
                if (field && rcvr && rcvr.exemplar) {
                    menu.addLine();
                    addOption(
                        'inherited',
                        () => rcvr.toggleInheritanceForAttribute(field),
                        rcvr.inheritsAttribute(field),
                        'uncheck to\ndisinherit',
                        localize('check to inherit\nfrom')
                            + ' ' + rcvr.exemplar.name
                    );
                }
            }

            if (StageMorph.prototype.enableCodeMapping) {
                menu.addLine();
                menu.addItem(
                    'header mapping...',
                    'mapToHeader'
                );
                menu.addItem(
                    'code mapping...',
                    'mapToCode'
                );
            }
        }
        return menu;
    }
    menu.addLine();
    if (this.selector === 'reportGetVar') {
        menu.addItem(
            'rename...',
            renameVar,
            'rename only\nthis reporter'
        );
    } else if (SpriteMorph.prototype.blockAlternatives[this.selector]) {
        menu.addItem(
            'relabel...',
            () => this.relabel(
                SpriteMorph.prototype.blockAlternatives[this.selector]
            )
        );
    } else if (this.isCustomBlock && this.alternatives) {
        alternatives = this.alternatives();
        if (alternatives.length > 0) {
            menu.addItem(
                'relabel...',
                () => this.relabel(alternatives)
            );
        }
    }

    // direct relabelling:
    // - JIT-compile HOFs - experimental
    // - vector pen trails
    if (
        contains(
            ['reportMap', 'reportKeep', 'reportFindFirst', 'reportCombine'],
            this.selector
        )
    ) {
        alternatives = {
            reportMap : 'reportAtomicMap',
            reportKeep : 'reportAtomicKeep',
            reportFindFirst: 'reportAtomicFindFirst',
            reportCombine : 'reportAtomicCombine'
        };
        menu.addItem(
            'compile',
            () => this.setSelector(alternatives[this.selector]),
            'experimental!\nmake this reporter fast and uninterruptable\n' +
                'CAUTION: Errors in the ring\ncan break your Snap! session!'
        );
    } else if (
        contains(
            [
                'reportAtomicMap',
                'reportAtomicKeep',
                'reportAtomicFindFirst',
                'reportAtomicCombine'
            ],
            this.selector
        )
    ) {
        alternatives = {
            reportAtomicMap : 'reportMap',
            reportAtomicKeep : 'reportKeep',
            reportAtomicFindFirst: 'reportFindFirst',
            reportAtomicCombine : 'reportCombine'
        };
        menu.addItem(
            'uncompile',
            () => this.setSelector(alternatives[this.selector])
        );
    } else if (
        contains(
            ['reportPenTrailsAsCostume', 'reportPentrailsAsSVG'],
            this.selector
        )
    ) {
        alternatives = {
            reportPenTrailsAsCostume : 'reportPentrailsAsSVG',
            reportPentrailsAsSVG : 'reportPenTrailsAsCostume'
        };
        menu.addItem(
            localize(
                SpriteMorph.prototype.blocks[
                    alternatives[this.selector]
                ].spec
            ),
            () => {
                this.setSelector(alternatives[this.selector]);
                this.changed();
            }
        );
    }

    menu.addItem(
        "duplicate",
        () => {
            var dup = this.fullCopy(),
                ide = this.parentThatIsA(IDE_Morph),
                blockEditor = this.parentThatIsA(BlockEditorMorph);
            dup.pickUp(world);
            // register the drop-origin, so the block can
            // slide back to its former situation if dropped
            // somewhere where it gets rejected
            if (!ide && blockEditor) {
                ide = blockEditor.target.parentThatIsA(IDE_Morph);
            }
            if (ide) {
                world.hand.grabOrigin = {
                    origin: ide.palette,
                    position: ide.palette.center()
                };
            }
        },
        'make a copy\nand pick it up'
    );

    if (this instanceof CommandBlockMorph && this.nextBlock()) {
        menu.addItem(
            (proc ? this.fullCopy() : this).thumbnail(0.5, 60),
            () => {
                var cpy = this.fullCopy(),
                    nb = cpy.nextBlock(),
                    ide = this.parentThatIsA(IDE_Morph),
                    blockEditor = this.parentThatIsA(BlockEditorMorph);
                if (nb) {nb.destroy(); }
                cpy.pickUp(world);
                if (!ide && blockEditor) {
                    ide = blockEditor.target.parentThatIsA(IDE_Morph);
                }
                if (ide) {
                    world.hand.grabOrigin = {
                        origin: ide.palette,
                        position: ide.palette.center()
                    };
                }
            },
            'only duplicate this block'
        );
        menu.addItem(
            'extract',
            'userExtractJustThis',
            'only grab this block'
        );
    }
    menu.addItem(
        "delete",
        'userDestroy'
    );
    if (isNil(this.comment)) {
        menu.addItem(
            "add comment",
            () => {
                var comment = new CommentMorph();
                this.comment = comment;
                comment.block = this;
                comment.layoutChanged();

                // Simulate drag/drop for better undo/redo behavior
                var scripts = this.parentThatIsA(ScriptsMorph),
                    ide = this.parentThatIsA(IDE_Morph),
                    blockEditor = this.parentThatIsA(BlockEditorMorph);
                if (!ide && blockEditor) {
                    ide = blockEditor.target.parentThatIsA(IDE_Morph);
                }
                if (ide) {
                    world.hand.grabOrigin = {
                        origin: ide.palette,
                        position: ide.palette.center()
                    };
                }
                scripts.clearDropInfo();
                scripts.lastDropTarget = { element: this };
                scripts.lastDroppedBlock = comment;
                scripts.recordDrop(world.hand.grabOrigin);
            }
        );
    }
    menu.addItem(
        "script pic...",
        () => {
            var ide = this.parentThatIsA(IDE_Morph) ||
                this.parentThatIsA(BlockEditorMorph).target.parentThatIsA(
                    IDE_Morph
            );
            ide.saveCanvasAs(
                top.scriptPic(),
                (ide.projectName || localize('untitled')) + ' ' +
                    localize('script pic')
            );
        },
        'save a picture\nof this script'
    );
    if (top instanceof ReporterBlockMorph ||
        (!(top instanceof PrototypeHatBlockMorph) &&
            top.allChildren().some((any) => any.selector === 'doReport'))
    ) {
        menu.addItem(
            "result pic...",
            () => top.exportResultPic(),
            'save a picture of both\nthis script and its result'
        );
    }
    if (shiftClicked) {
        menu.addItem(
            'download script',
            () => {
                var ide = this.parentThatIsA(IDE_Morph),
                    blockEditor = this.parentThatIsA(BlockEditorMorph);
                if (!ide && blockEditor) {
                    ide = blockEditor.target.parentThatIsA(IDE_Morph);
                }
                if (ide) {
                    ide.saveXMLAs(
                        ide.serializer.serialize(top),
                        top.selector + ' script',
                        false);
                }
            },
            'download this script\nas an XML file',
            new Color(100, 0, 0)
        );
    }
    if (proc) {
        if (vNames.length) {
            menu.addLine();
            vNames.forEach(vn =>
                menu.addItem(
                    vn + '...',
                    () => proc.doShowVar(vn)
                )
            );
        }
        proc.homeContext.variables.names().forEach(vn => {
            if (!contains(vNames, vn)) {
                menu.addItem(
                    vn + '...',
                    () => proc.doShowVar(vn)
                );
            }
        });
        return menu;
    }
    if (this.parent.parentThatIsA(RingMorph)) {
        menu.addLine();
        menu.addItem("unringify", 'unringify');
        if (this instanceof ReporterBlockMorph ||
                (!(top instanceof HatBlockMorph))) {
            menu.addItem("ringify", 'ringify');
        }
        return menu;
    }
	menu.addLine();
    menu.addItem(
        "Copy all",
        () => {
            window.blockCopy = this.fullCopy()
		},
		'copies the current script'
    );
    menu.addItem(
        "Copy block",
		() => {window.blockCopy = this.fullCopy()
			var nb = window.blockCopy.nextBlock()
			if (nb) {nb.destroy(); }
		}
    );
    menu.addItem(
        "Cut block",
		'userCut'
    );
    if (contains(
        ['doBroadcast', 'doSend', 'doBroadcastAndWait', 'receiveMessage',
            'receiveOnClone', 'receiveGo'],
        this.selector
    )) {
        hasLine = true;
        menu.addLine();
        menu.addItem(
            (this.selector.indexOf('receive') === 0 ?
                "senders..." : "receivers..."),
            'showMessageUsers'
        );
    }
    if (this.parent instanceof ReporterSlotMorph
            || (this.parent instanceof CommandSlotMorph)
            || (this instanceof HatBlockMorph)
            || (this instanceof CommandBlockMorph
                && (top instanceof HatBlockMorph))) {
        return menu;
    }
    if (!hasLine) {menu.addLine(); }
    menu.addItem("ringify", 'ringify');
    if (StageMorph.prototype.enableCodeMapping) {
        menu.addLine();
        menu.addItem(
            'header mapping...',
            'mapToHeader'
        );
        menu.addItem(
            'code mapping...',
            'mapToCode'
        );
    }
    return menu;
};

ScriptsMorph.prototype.userMenu = function () {
    var menu = new MenuMorph(this),
        ide = this.parentThatIsA(IDE_Morph),
        shiftClicked = this.world().currentKey === 16,
        blockEditor,
        obj = this.scriptTarget(),
        hasUndropQueue,
        stage = obj.parentThatIsA(StageMorph);

    function addOption(label, toggle, test, onHint, offHint) {
        menu.addItem(
            [
                test ? new SymbolMorph(
                    'checkedBox',
                    MorphicPreferences.menuFontSize * 0.75
                ) : new SymbolMorph(
                    'rectangle',
                    MorphicPreferences.menuFontSize * 0.75
                ),
                localize(label)
            ],
            toggle,
            test ? onHint : offHint
        );
    }

    if (!ide) {
        blockEditor = this.parentThatIsA(BlockEditorMorph);
        if (blockEditor) {
            ide = blockEditor.target.parentThatIsA(IDE_Morph);
        }
    }

    if (this.dropRecord) {
        if (this.dropRecord.lastRecord) {
            hasUndropQueue = true;
            menu.addPair(
                [
                    new SymbolMorph(
                        'turnBack',
                        MorphicPreferences.menuFontSize
                    ),
                    localize('undrop')
                ],
                'undrop',
                '^Z',
                'undo the last\nblock drop\nin this pane'
            );
        }
        if (this.dropRecord.nextRecord) {
            hasUndropQueue = true;
            menu.addPair(
                [
                    new SymbolMorph(
                        'turnForward',
                        MorphicPreferences.menuFontSize
                    ),
                    localize('redrop')
                ],
                'redrop',
                '^Y',
                'redo the last undone\nblock drop\nin this pane'
            );
        }
        if (hasUndropQueue) {
            if (shiftClicked) {
                menu.addItem(
                    "clear undrop queue",
                    () => {
                        this.dropRecord = null;
                        this.clearDropInfo();
                        this.recordDrop();
                    },
                    'forget recorded block drops\non this pane',
                    new Color(100, 0, 0)
                );
            }
            menu.addLine();
        }
    }

    menu.addItem('clean up', 'cleanUp', 'arrange scripts\nvertically');
    menu.addItem('add comment', 'addComment');
    menu.addItem(
        'scripts pic...',
        'exportScriptsPicture',
        'save a picture\nof all scripts'
    );
    if (ide) {
        menu.addLine();
        if (!blockEditor && obj.exemplar) {
            addOption(
                'inherited',
                () => obj.toggleInheritanceForAttribute('scripts'),
                obj.inheritsAttribute('scripts'),
                'uncheck to\ndisinherit',
                localize('check to inherit\nfrom')
                    + ' ' + obj.exemplar.name
            );
        }
        menu.addItem(
            'make a block...',
            () => new BlockDialogMorph(
                null,
                definition => {
                    if (definition.spec !== '') {
                        if (definition.isGlobal) {
                            stage.globalBlocks.push(definition);
                        } else {
                            obj.customBlocks.push(definition);
                        }
                        ide.flushPaletteCache();
                        ide.refreshPalette();
                        new BlockEditorMorph(definition, obj).popUp();
                    }
                },
                this
            ).prompt(
                'Make a block',
                null,
                this.world()
            )
        );
    }
	menu.addLine()
	menu.addItem(
        "paste",
        () => {
            var cpy = window.blockCopy.fullCopy(),
			    ide = this.parentThatIsA(IDE_Morph),
                blockEditor = this.parentThatIsA(BlockEditorMorph);
            cpy.pickUp(world);
            // register the drop-origin, so the block can
            // slide back to its former situation if dropped
            // somewhere where it gets rejected
            if (!ide && blockEditor) {
                ide = blockEditor.target.parentThatIsA(IDE_Morph);
            }
            if (ide) {
                world.hand.grabOrigin = {
                    origin: ide.palette,
                    position: ide.palette.center()
                };
            }
        },
        'retrieve copied script'
    );
    return menu;
};

CommentMorph.prototype.userMenu = function () {
    var menu = new MenuMorph(this);

    menu.addItem(
        "duplicate",
        () => {
            var dup = this.fullCopy(),
                ide = this.parentThatIsA(IDE_Morph),
                blockEditor = this.parentThatIsA(BlockEditorMorph),
                world = this.world();
            dup.pickUp(world);
            // register the drop-origin, so the comment can
            // slide back to its former situation if dropped
            // somewhere where it gets rejected
            if (!ide && blockEditor) {
                ide = blockEditor.target.parentThatIsA(IDE_Morph);
            }
            if (ide) {
                world.hand.grabOrigin = {
                    origin: ide.palette,
                    position: ide.palette.center()
                };
            }
        },
        'make a copy\nand pick it up'
    );
    menu.addItem("delete", 'userDestroy');
    menu.addItem(
        "comment pic...",
        () => {
            var ide = this.parentThatIsA(IDE_Morph);
            ide.saveCanvasAs(
                this.fullImage(),
                (ide.projectName || localize('untitled')) + ' ' +
                    localize('comment pic')
            );
        },
        'save a picture\nof this comment'
    );
	menu.addLine();

    menu.addItem(
        "Copy comment",
        () => {
            window.blockCopy = this.fullCopy()
		}
    );
	menu.addItem(
		"Cut comment",
		'userCut'
	)
    return menu;
};
})();
