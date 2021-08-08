SnapExtensions.primitives.set(
    'cat_del(name)',
    function (name) {
        world.children[0].deletePaletteCategory(name);
    }
);

SnapExtensions.primitives.set(
    'cat_add(name,r,g,b)',
    function (name,r,g,b) {
        world.children[0].addPaletteCategory(name, new Color(r,g,b));
    }
);

return "imported"
