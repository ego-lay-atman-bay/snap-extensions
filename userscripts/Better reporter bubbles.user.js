// ==UserScript==
// @name         Better reporter bubbles
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Better reporter bubbles for Snap!
// @author       cameron8299
// @match        https://snap.berkeley.edu/*
// @icon         https://forum.snap.berkeley.edu/favicon/proxied?https%3A%2F%2Fd1eo0ig0pi5tcs.cloudfront.net%2Foptimized%2F2X%2Ff%2Ffec08d3829a26a75ae620be49835ef91b13ba8e9_2_32x32.png
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
SyntaxElementMorph.prototype.showBubble = function (value, exportPic, target) {
    var bubble,
        txt,
        img,
        morphToShow,
        isClickable = true,
        ide = this.parentThatIsA(IDE_Morph) || target.parentThatIsA(IDE_Morph),
        anchor = this,
        pos = this.rightCenter().add(new Point(2, 0)),
        sf = this.parentThatIsA(ScrollFrameMorph),
        wrrld = this.world() || target.world();



if (value === undefined)  {
    morphToShow = new StringMorph(
        'undefined',
        this.fontSize,
        null,
        false,
        true,
        false,
        null,
        null,
        new Color(80, 80, 80),
        'kurinto mono'
    );
} else if (value === null)  {
    morphToShow = new StringMorph(
        'null',
        this.fontSize,
        null,
        false,
        true,
        false,
        null,
        null,
        new Color(80, 80, 80),
        'kurinto mono'
    );
} else if (typeof value === 'boolean') {
        morphToShow = SpriteMorph.prototype.booleanMorph.call(
            null,
            value
        );
    } else if (isString(value)) {
        txt  = value.length > 500 ? value.slice(0, 500) + '...' : value;
        morphToShow = new TextSlotMorph(txt);
        morphToShow.fontStyle = 'kurinto mono';

    } else if (Array.isArray(value))  {
        listify = a => new List(a.map(i => (Array.isArray(i) ? listify(i) : i)));
        value = listify(value);
        value = value.isTable() ?
            new TableFrameMorph(new TableMorph(value, 10)) :
            new ListWatcherMorph(value);
        return this.showBubble(value, exportPic, target)
        if (listify(value).isTable()) morphToShow.showTableView();
    } else if (value instanceof ListWatcherMorph) {
        morphToShow = value;
        morphToShow.update(true);
        morphToShow.step = value.update;
        morphToShow.isDraggable = false;
        morphToShow.expand(this.parentThatIsA(ScrollFrameMorph).extent());
        isClickable = true;
    } else if (value instanceof TableFrameMorph) {
        morphToShow = value;
        morphToShow.isDraggable = false;
        morphToShow.expand(this.parentThatIsA(ScrollFrameMorph).extent());
        isClickable = true;
    } else if (value instanceof Morph) {
        if (isSnapObject(value)) {
            img = value.thumbnail(new Point(40, 40));
            morphToShow = new Morph();
            morphToShow.isCachingImage = true;
            morphToShow.bounds.setWidth(img.width);
            morphToShow.bounds.setHeight(img.height);
            morphToShow.cachedImage = img;
            morphToShow.version = value.version;
            morphToShow.step = function () {
                if (this.version !== value.version) {
                    img = value.thumbnail(new Point(40, 40));
                    this.cachedImage = img;
                    this.version = value.version;
                    this.changed();
                }
            };
        } else {
            img = value.fullImage();
            morphToShow = new Morph();
            morphToShow.isCachingImage = true;
            morphToShow.bounds.setWidth(img.width);
            morphToShow.bounds.setHeight(img.height);
            morphToShow.cachedImage = img;
        }
    } else if (value instanceof Costume) {
        img = value.thumbnail(new Point(40, 40));
        morphToShow = new Morph();
        morphToShow = new Morph();
        morphToShow.isCachingImage = true;
        morphToShow.bounds.setWidth(img.width);
        morphToShow.bounds.setHeight(img.height);
        morphToShow.cachedImage = img;

        // support costumes to be dragged out of result bubbles:
        morphToShow.isDraggable = true;

        morphToShow.selectForEdit = function () {
            var cst = value.copy(),
                icon,
                prepare;

            cst.name = ide.currentSprite.newCostumeName(cst.name);
            icon = new CostumeIconMorph(cst);
            prepare = icon.prepareToBeGrabbed;

            icon.prepareToBeGrabbed = function (hand) {
                hand.grabOrigin = {
                    origin: ide.palette,
                    position: ide.palette.center()
                };
                this.prepareToBeGrabbed = prepare;
            };

            icon.setCenter(this.center());
            return icon;
        };

        // support exporting costumes directly from result bubbles:
        morphToShow.userMenu = function () {
            var menu = new MenuMorph(this);
            menu.addItem(
                'export',
                () => {
                    if (value instanceof SVG_Costume) {
                        // don't show SVG costumes in a new tab (shows text)
                        ide.saveFileAs(
                            value.contents.src,
                            'text/svg',
                            value.name
                        );
                    } else { // rasterized Costume
                        ide.saveCanvasAs(value.contents, value.name);
                    }
                }
            );
            return menu;
        };

    } else if (value instanceof Sound) {
        morphToShow = new SymbolMorph('notes', 30);

        // support sounds to be dragged out of result bubbles:
        morphToShow.isDraggable = true;

        morphToShow.selectForEdit = function () {
            var snd = value.copy(),
                icon,
                prepare;

            snd.name = ide.currentSprite.newSoundName(snd.name);
            icon = new SoundIconMorph(snd);
            prepare = icon.prepareToBeGrabbed;

            icon.prepareToBeGrabbed = function (hand) {
                hand.grabOrigin = {
                    origin: ide.palette,
                    position: ide.palette.center()
                };
                this.prepareToBeGrabbed = prepare;
            };

            icon.setCenter(this.center());
            return icon;
        };

        // support exporting sounds directly from result bubbles:
        morphToShow.userMenu = function () {
            var menu = new MenuMorph(this);
            menu.addItem(
                'export',
                () => ide.saveAudioAs(value.audio, value.name)
            );
            return menu;
        };

    } else if (value instanceof Context) {
        img = value.image();
        morphToShow = new Morph();
        morphToShow.isCachingImage = true;
        morphToShow.bounds.setWidth(img.width);
        morphToShow.bounds.setHeight(img.height);
        morphToShow.cachedImage = img;

        // support blocks to be dragged out of result bubbles:
        morphToShow.isDraggable = true;

        morphToShow.selectForEdit = function () {
            var script = value.toBlock(),
                prepare = script.prepareToBeGrabbed;

            script.prepareToBeGrabbed = function (hand) {
                prepare.call(this, hand);
                hand.grabOrigin = {
                    origin: ide.palette,
                    position: ide.palette.center()
                };
                this.prepareToBeGrabbed = prepare;
            };

            script.setPosition(this.position());
            return script;
        };
    } else if (value === 0) {
        morphToShow = new TextMorph(
            '0',
            this.fontSize
        );
    } else if (value.toString) {
        return this.showBubble(
            value.toString(),
            exportPic,
            target
        );
    }
    if (ide && (ide.currentSprite !== target)) {
        if (target instanceof StageMorph) {
            anchor = ide.corral.stageIcon;
        } else if (target) {
            if (target.isTemporary) {
                target = detect(
            target.allExemplars(),
                each => !each.isTemporary
            );
        }
            anchor = detect(
                ide.corral.frame.contents.children,
                icon => icon.object === target
            );
        } else {
            target = ide;
        }
        pos = anchor.center();
    }
    bubble = new SpeechBubbleMorph(
        morphToShow,
        null,
        Math.max(this.rounding - 2, 6),
        0
    );
    bubble.popUp(
        wrrld,
        pos,
        isClickable
    );
    if (exportPic) {
        this.exportPictureWithResult(bubble);
    }
    if (anchor instanceof SpriteIconMorph) {
        bubble.keepWithin(ide.corral);
    } else if (sf) {
        bubble.keepWithin(sf);
    }
};
})();