SnapExtensions.primitives.set(
    'snd_load(url)',
    function (url, proc) {
        if (!proc.context.accumulator) {
            proc.context.accumulator = {
                snd: null,
            };
            let ide = this.parentThatIsA(IDE_Morph);
            ide.getURL(
                url,
                function (blob) {
                    var reader = new window.FileReader();
                    reader.readAsDataURL(blob);
                    reader.onloadend = function() {
                        let base64 = reader.result;
                        let datauri = 'data:audio/ogg;base64,' + base64.split(',')[1]
                        proc.context.accumulator.snd = new Sound(new Audio(datauri))
                    };
                },
                'blob'
            );
        } else if (proc.context.accumulator.snd) {
            return proc.context.accumulator.snd;
        }
        proc.pushContext('doYield');
        proc.pushContext();
    }
);
