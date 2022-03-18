//credits to @pumpkinhead for the original library. I fixed up a few things so it works much better.

SnapExtensions.primitives.set(
    'file_ask(types,script)',
    function (typesList,callback) {
        var receiver = this;

        var input = document.createElement("input");
        input.type = "file";
        input.id = "fileInput";
        input.style = "position:absolute;display:none;"
        input.multiple = true;
        document.body.appendChild(input);
        console.log(callback);

        input.onchange = function() {
        delete input.onchange;

        invoke(callback, new List([new List(input.files)]));
        }

        var types = typesList.asArray();

        //compile types list to comma separated list
        var accept = "";

        if (types.length > 0) {
        for (let i in types) {
            let v = types[i];
            
            if (typeof v == "string") {
            accept += v
            }

            //last item doesn't have a comma at the end
            if (i + 1 < types.length) {
            accept += ","
            }
        }
        } else {
        accept = "*.*"; //i think that means all files
        }

        input.accept = accept; 
        input.click();
    }
)

SnapExtensions.primitives.set(
    'file_prop(prop,file)',
    function (prop,file) {
        if (prop == 'name') {
            return file.name;
        } else if (prop == 'size') {
            return file.size;
        } else if (prop == 'type') {
            return file.type;
        } else if (prop == 'last modified') {
            return file.lastModified;
        } else {
            throw new Error('unrecognized file type', {cause: 'user'});
        }
    }
)

SnapExtensions.primitives.set (
    'file_read(file,type',
    function (file,type,process) {
            if (!(file instanceof File)) throw new Error("Not a file");

        var reader = new FileReader();
        var readerResult;

        var isMedia = type == "costume" || type == "vector costume" || type == "sound";

        reader.addEventListener("load", function() {
            var res = reader.result;

            if (type == "costume" || type == "vector costume") {
                var img = document.createElement("img");
                
                img.onload = function() {
                //for bitmap costume
                if (type == "costume") {
                    var canvas = document.createElement("canvas");
                    canvas.width = img.width;
                    canvas.height = img.height;
                    canvas.getContext("2d").drawImage(img, 0, 0);

                    readerResult = new Costume(canvas, file.name);
                } else if (type == "vector costume") { //for vector costume
                    readerResult = new SVG_Costume(img, file.name);
                }

                process.resume()
                }

                img.src = res;
            } else if (type == "sound") {
            var audioElem = document.createElement("audio");

            audioElem.type = file.type;
            audioElem.src = res;

            readerResult = new Sound(audioElem, file.name);
            process.resume(); 
            } else {
                readerResult = res;
                process.resume();
            }
        })
            
        if (isMedia) {
        if (type == "costume" && file.type.slice(0, 6) != "image/") throw new Error("Not an image file");
        if (type == "vector costume" && file.type != "image/svg+xml") throw new Error("Not an SVG file");
        if (type == "sound" && file.type.slice(0, 6) != "audio/") throw new Error("Not an audio file");

        reader.readAsDataURL(file);
        } else if (type == "text") {
        reader.readAsText(file);
        } else if (type == "binary string") {
        reader.readAsBinaryString(file);
        } else {
        throw new Error("Incorrect type");
        }

        process.homeContext.variables.addVar("res")
        process.pause();

        return function() {
        return readerResult;
        }
    }
)

SnapExtensions.primitives.set (
    'file_test(file)',
    function (file) {
        return !(file instanceof File);
    }
)