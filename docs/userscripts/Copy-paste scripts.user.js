// ==UserScript==
// @name         Copy/paste scripts test
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

    CommentMorph.prototype.userCut = function() {

        window.blockCopy = this.fullCopy()

        this.selectForEdit().destroy(); // enable copy-on-edit
    };

    ReporterBlockMorph.prototype.userCut = function() {

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
        nb = nb.nextBlock()
        if (nb) {
            nb.destroy();
        }
    };

    CommandBlockMorph.prototype.userCut = function() {

        window.blockCopy = this.fullCopy()
        var nb = window.blockCopy.nextBlock()
        if (nb) {
            nb.destroy();
        }

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

    BlockMorph.prototype._userMenu = BlockMorph.prototype._userMenu || BlockMorph.prototype.userMenu;
    BlockMorph.prototype.userMenu = function() {
        var
            menu = this._userMenu(),
            ide = this.parentThatIsA(IDE_Morph) || this.parentThatIsA(BlockEditorMorph)?.target?.parentThatIsA(IDE_Morph),
            top = this.topBlock();

        if (!this?.isTemplate) {
            menu.addLine()
            menu.addItem(
                "copy all",
                () => {
                    window.blockCopy = this.fullCopy()
                },
                'copies this block\nand blocks under it'
            );
            menu.addItem(
                "cut block",
                'userCut',
                'copies this block and\ndeletes it'
            );
            menu.addItem(
                "copy block",
                () => {
                    window.blockCopy = this.fullCopy()
                    var nb = window.blockCopy.nextBlock()
                    if (nb) {
                        nb.destroy();
                    }
                },
                'copies only this block'
            );
        }
        return menu;
    }
	BlockMorph.prototype._userMenu = BlockMorph.prototype._userMenu || BlockMorph.prototype.userMenu;

    CommentMorph.prototype._userMenu = CommentMorph.prototype._userMenu || CommentMorph.prototype.userMenu;
    CommentMorph.prototype.userMenu = function() {
        var
            menu = this._userMenu(),
            ide = this.parentThatIsA(IDE_Morph) || this.parentThatIsA(BlockEditorMorph)?.target?.parentThatIsA(IDE_Morph)

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
    }

    ScriptsMorph.prototype._userMenu = ScriptsMorph.prototype._userMenu || ScriptsMorph.prototype.userMenu;
    ScriptsMorph.prototype.userMenu = function() {
        var
            menu = this._userMenu(),
            ide = this.parentThatIsA(IDE_Morph) || this.parentThatIsA(BlockEditorMorph)?.target?.parentThatIsA(IDE_Morph)
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
})();
