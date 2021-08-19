// ==UserScript==
// @name         Snap! Color Picker
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://snap.berkeley.edu/snap/snap.html
// @icon         https://forum.snap.berkeley.edu/favicon/proxied?https%3A%2F%2Fd1eo0ig0pi5tcs.cloudfront.net%2Foptimized%2F2X%2Ff%2Ffec08d3829a26a75ae620be49835ef91b13ba8e9_2_32x32.png
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    //Based on Snap! code base with minor modification
    //Thanks dardoro

if( !InputSlotDialogMorph.prototype._createSlotTypeButtons){
InputSlotDialogMorph.prototype._createSlotTypeButtons = InputSlotDialogMorph.prototype.createSlotTypeButtons
}

InputSlotDialogMorph.prototype.createSlotTypeButtons = function () {
  this.addSlotTypeButton('Color', '%clr');
  this._createSlotTypeButtons();
}

InputSlotDialogMorph.prototype.fixSlotsLayout = function () {
    var slots = this.slots,
        scale = SyntaxElementMorph.prototype.scale,
        xPadding = 10 * scale,
        ypadding = 14 * scale,
        bh = (fontHeight(10) / 1.2 + 15) * scale, // slot type button height
        ah = (fontHeight(10) / 1.2 + 10) * scale, // arity button height
        size = 13, // number slot type radio buttons
        cols = [
            slots.left() + xPadding,
            slots.left() + slots.width() / 3,
            slots.left() + slots.width() * 2 / 3
        ],
        rows = [
            slots.top() + ypadding,
            slots.top() + ypadding + bh,
            slots.top() + ypadding + bh * 2,
            slots.top() + ypadding + bh * 3,
            slots.top() + ypadding + bh * 4,
            slots.top() + ypadding + bh * 5,

            slots.top() + ypadding + bh * 5 + ah,
            slots.top() + ypadding + bh * 5 + ah * 2
        ],
        idx,
        row = -1,
        col;

    // slot types:

    for (idx = 0; idx < size; idx += 1) {
        col = idx % 3;
        if (idx % 3 === 0) {row += 1; }
        slots.children[idx].setPosition(new Point(
            cols[col],
            rows[row]
        ));
    }

    // arity:
    col = 0;
    row = 5;
    for (idx = size; idx < size + 3; idx += 1) {
        slots.children[idx].setPosition(new Point(
            cols[col],
            rows[row + idx - size]
        ));
    }

    // default input
    this.slots.defaultInputLabel.setPosition(
        this.slots.radioButtonSingle.label.topRight().add(new Point(5, 0))
    );
    this.slots.defaultInputField.setCenter(
        this.slots.defaultInputLabel.center().add(new Point(
            this.slots.defaultInputField.width() / 2
                + this.slots.defaultInputLabel.width() / 2 + 5,
            0
        ))
    );
    this.slots.defaultSwitch.setCenter(
        this.slots.defaultInputLabel.center().add(new Point(
            this.slots.defaultSwitch.width() / 2
                + this.slots.defaultInputLabel.width() / 2 + 5,
            0
        ))
    );

    // loop arrow
    this.slots.loopArrow.setPosition(this.slots.defaultInputLabel.position());
    this.slots.settingsButton.setPosition(
        this.slots.bottomRight().subtract(
            this.slots.settingsButton.extent().add(
                this.padding + this.slots.border
            )
        )
    );

    this.slots.changed();
};

})();
