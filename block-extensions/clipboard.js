SnapExtensions.primitives.set(
    'clip_copy(txt)',
    function(txt) {
        if("clipboard" in navigator) {
          navigator.clipboard.writeText(txt)
        } else {
          alert("I can't send thing to clipboard.")
        }
    }
);

SnapExtensions.primitives.set(
    'clip_txt()',
    function() {
        return function anonymous() {
            var done = false,
                thing = null
            if ("clipboard" in navigator) {
                navigator.clipboard.readText(thing).then(x => {
                    thing = x;
                    done = true
                })
            } else {
                alert("I can't retrieve thing from clipboard.");
                done = true
            }

            return new List([function() {
                return done
            }, function() {
                return thing
            }])
        };
    };
);

SnapExtensions.primitives.set(
    'clip_img()',
    function() {
        return function anonymouse() {
            var done = false,
                thing = new Costume(newCanvas(new Point(1, 1), true), "empty"),
                item = null

            const error = (function Error(txt) {
                done = true;
                throw txt;
            })

            if ("clipboard" in navigator) {
                navigator.clipboard.read()
                    .then(clipData => {
                        item = clipData.find(v => v.types.includes("image/png"));
                        if (!item)
                            error("No image data")
                        item.getType("image/png")
                            .then(blob => {
                                var url = (window.URL || window.webkitURL).createObjectURL(blob);
                                var img = new Image();
                                img.onload = function() {
                                    canvas = newCanvas(new Point(img.width, img.height), true);
                                    canvas.getContext('2d').drawImage(img, 0, 0);
                                    thing = new Costume(canvas, "Clipboard")
                                    done = true;
                                };
                                img.src = url;
                                return;
                            })
                            .catch(err => error("No PNG data: " + err));
                    })
                    .catch(err => error("I can't retrieve thing from clipboard: " + err));
            } else {
                alert("I can't retrieve thing from clipboard.");
                done = true
            }

            return new List([function() {
                return done
            }, function() {
                return thing
            }])
        };
    };
);
