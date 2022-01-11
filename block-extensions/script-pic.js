// script based on https://forum.snap.berkeley.edu/t/how-do-you-get-the-script-pic-of-a-script-using-js/9765/2

SnapExtensions.primitives.set(
    'script_pic(script)',
    function(script) {
        script = script.expression;
        if (!script)
            return new Costume(newCanvas(new Point(0, 0), true), "empty");
        if (script instanceof Array) {
            script = script[0];
        }
        return new Costume(script.fullImage(), script.selector);
    }
);
