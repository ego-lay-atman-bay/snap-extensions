// ==UserScript==
// @name         Copy/paste scripts
// @namespace    https://ego-lay-atman-bay.github.io/snap-extensions/
// @version      0.2
// @description  Copy/paste scripts
// @author       ego-lay_atman-bay
// @match        https://snap.berkeley.edu/snap/snap.html
// @icon         https://forum.snap.berkeley.edu/favicon/proxied?https%3A%2F%2Fd1eo0ig0pi5tcs.cloudfront.net%2Foptimized%2F2X%2Ff%2Ffec08d3829a26a75ae620be49835ef91b13ba8e9_2_32x32.png
// @grant        none
// ==/UserScript==
(function() {
    'use strict';
    IDE_Morph.prototype.userCopy = function (event) {
        var world = this.world();
        var underHand,
            hand,
            mouseOverList,
            isComment;
    
        hand = world.hand;
        mouseOverList = hand.mouseOverList;
    
        underHand = mouseOverList[0].parentThatIsA(BlockMorph) || 
                    mouseOverList[0].parentThatIsA(CommentMorph);
        
        if (underHand && !underHand.isTemplate && !(underHand instanceof PrototypeHatBlockMorph)) {
            let content = underHand.fullCopy();
            isComment = content instanceof CommentMorph;
    
            if (isComment) {
                this.clipboard = {
                    type: 'comment',
                    content: content.text()
                }
                return
            }
    
            if ((event === 'ctrl shift c') && (content instanceof CommandBlockMorph || content instanceof HatBlockMorph)) {
                var nb = content.nextBlock();
                if (nb) {
                    nb.destroy();
                }
            }
    
            content.parent = this;
            this.clipboard = {
                type: 'xml',
                content: content.toXMLString()
            };
            content.destroy();
        }
    }
    
    IDE_Morph.prototype.userCut = function (event) {
        var world = this.world();
        var underHand,
            hand,
            mouseOverList,
            isComment;
    
        hand = world.hand;
        mouseOverList = hand.mouseOverList;
    
        underHand = mouseOverList[0].parentThatIsA(BlockMorph) || 
                    mouseOverList[0].parentThatIsA(CommentMorph);
        
        if (underHand && !underHand.isTemplate && !(underHand instanceof PrototypeHatBlockMorph)) {
            let content = underHand.fullCopy();
            isComment = content instanceof CommentMorph;
    
            if (isComment) {
                this.clipboard = {
                    type: 'comment',
                    content: content.text()
                }
                underHand.userDestroy()
                return
            }
    
            if (content instanceof CommandBlockMorph || content instanceof HatBlockMorph) {
                var nb = content.nextBlock();
                if (nb) {
                    nb.destroy();
                }
            }
    
            content.parent = this;
            this.clipboard = {
                type: 'xml',
                content: content.toXMLString()
            };
            content.destroy();
    
            underHand.userDestroy()
        }
    }
    
    IDE_Morph.prototype.userPaste = function (event) {
        var world = this.world();
    
        if (this.clipboard) {
            switch (this.clipboard.type) {
                case 'xml':
                    this.droppedText(this.clipboard.content);
                    break;
                case 'comment':
                    let comment = new CommentMorph(this.clipboard.content);
                    comment.pickUp(world);
                    world.hand.grabOrigin = {
                        origin: this.palette,
                        position: this.palette.center()
                    };
                    break;
                default:
                    break;
            }
        }
    }

    BlockMorph.prototype._userMenu = BlockMorph.prototype._userMenu || BlockMorph.prototype.userMenu;
    BlockMorph.prototype.userMenu = function() {
        var menu = this._userMenu(),
            ide = this.parentThatIsA(IDE_Morph) || this.parentThatIsA(BlockEditorMorph)?.target?.parentThatIsA(IDE_Morph),
            top = this.topBlock();

        if (!this?.isTemplate) {
            menu.addLine();
            if ((this instanceof CommandBlockMorph)) {
                menu.addItem(
                    'copy all',
                    () => {
                        ide.clipboard = {
                            type: 'xml',
                            content: this.toXMLString()
                        };
                    },
                    'Send this block and all\nblocks underneath to the clipboard.'
                );
            }
            menu.addItem(
                'copy block',
                () => {
                    let block = this.fullCopy();
                    if (this instanceof CommandBlockMorph || this instanceof HatBlockMorph) {
                        var nb = block.nextBlock();
                        if (nb) {
                            nb.destroy();
                        }
                    }

                    block.parent = ide;
                    ide.clipboard = {
                        type: 'xml',
                        content: block.toXMLString()
                    };
                    block.destroy();
                },
                'Send this block to the clipboard.'
            );
            menu.addItem(
                'cut block',
                () => {
                    let block = this.fullCopy();
                    if (this instanceof CommandBlockMorph || this instanceof HatBlockMorph) {
                        var nb = block.nextBlock();
                        if (nb) {
                            nb.destroy();
                        }
                    }

                    block.parent = ide;
                    ide.clipboard = {
                        type: 'xml',
                        content: block.toXMLString()
                    };
                    block.destroy();

                    this.userDestroy();
                },
                'Send this block to the\nclipboard and delete this block.'
            );
        }
        return menu;
    }

    CommentMorph.prototype._userMenu = CommentMorph.prototype._userMenu || CommentMorph.prototype.userMenu;
    CommentMorph.prototype.userMenu = function() {
        var menu = this._userMenu(),
            ide = this.parentThatIsA(IDE_Morph) || this.parentThatIsA(BlockEditorMorph)?.target?.parentThatIsA(IDE_Morph)
            
        menu.addLine();
        menu.addItem(
            'copy comment',
            () => {
                ide.clipboard = {
                    type: 'comment',
                    content: this.text()
                };
            },
            'Send this comment\nto the clipboard'
        );
        menu.addItem(
            'cut comment',
            () => {
                ide.clipboard = {
                    type: 'comment',
                    content: this.text()
                };
    
                this.userDestroy()
            },
            'Send this comment to the\nclipboard and delete this comment'
        );
        return menu;
    }

    ScriptsMorph.prototype._userMenu = ScriptsMorph.prototype._userMenu || ScriptsMorph.prototype.userMenu;
    ScriptsMorph.prototype.userMenu = function() {
        var menu = this._userMenu(),
            ide = this.parentThatIsA(IDE_Morph) || this.parentThatIsA(BlockEditorMorph)?.target?.parentThatIsA(IDE_Morph)
        
            if (ide.clipboard) {
            menu.addLine();
            menu.addItem(
                "paste",
                () => {
                    ide.userPaste();
                },
                'Retrieve script\nfrom clipboard'
            );
        }
        return menu;
    };

    function injectFireEvent(fun, lookFor, code) {
        let script = fun,
            split = script.split('\n')
        
        for (var index = 0; index < split.length; index++) {
            const line = split[index];
            if (line.includes('this.children.concat')) {
                break
            }
        }

        split.splice(index, 0, code)

        script = split.join('\n')
        return script
    }


    let newScript = injectFireEvent(StageMorph.prototype.fireKeyEvent.toString(), 'this.children.concat', "    if (evt === 'ctrl shift c' || (evt === 'ctrl c')) {\n        ide.userCopy(evt);\n        return;\n    }\n    if (evt === 'ctrl x') {\n        ide.userCut(evt);\n        return;\n    }\n    if (evt === 'ctrl v' || (evt === 'ctrl shift v')) {\n        ide.userPaste();\n        return;\n    }")

    let f = new Function('StageMorph.prototype.fireKeyEvent = ' + newScript)
    f()
})();
