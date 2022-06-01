// Credits to pumpkinhead for the script builder library https://forum.snap.berkeley.edu/t/script-builder-library-part-1/3361
// which I just copy and pasted all the js code for the blocks into this file

SnapExtensions.primitives.set(
    'sb_after(child,script)',
    function (child,script) {
        //if empty
if (!(script.expression instanceof BlockMorph)) return child;
if (!(child.expression instanceof BlockMorph)) return script;

var tailBlock = script.expression.fullCopy();
var outCtx = new Context(undefined, tailBlock);
var lastChild = tailBlock.nextBlock();

while (lastChild instanceof BlockMorph) {
 tailBlock = lastChild;
 lastChild = lastChild.nextBlock();
}

tailBlock.add(child.expression.fullCopy());
tailBlock.fixLayout();

//combine inputs
outCtx.inputs = script.inputs;

for (let v of child.inputs) {
 if (outCtx.inputs.indexOf(v) < 0) {
  outCtx.inputs.push(v);
 }
}

return outCtx;
    }
);

SnapExtensions.primitives.set(
    'sb_put-slot(thing,slot,target)',
    function (thing,slot,target) {
        //if empty
if (!(target.expression instanceof BlockMorph)) return thing;
if (!(thing.expression instanceof BlockMorph || thing.expression instanceof ReporterBlockMorph || typeof(thing) == "string" || typeof(thing) == "number" || typeof(thing) == "boolean")) return target;

var type = typeof(thing);
var slotNum = 1;
//console.log();

var outExpr = target.expression;  //.fullCopy();
var outCtx = new Context(undefined, outExpr);
//outCtx.inputs = thing.inputs || [];

var block;

if (thing.expression instanceof Morph) block = thing.expression;   //.fullCopy();

for (let i in outExpr.children) {
 let child = outExpr.children[i];

 if (type == "boolean") {
  if (child instanceof BooleanSlotMorph) {
   child.value = thing;
   return outCtx;
  }
 } else
 if (child instanceof InputSlotMorph || child instanceof RingMorph || child instanceof CSlotMorph || child instanceof ArgMorph) {
  if (slotNum == slot) {
   //console.log(child);

   if (type == "string" || type == "number") {
    if (!(child.children[0] instanceof InputSlotStringMorph)) return target;

    child.setContents(thing);
    delete child.bindingID;
    return outCtx;     
   }

   if (child instanceof RingMorph) {
    child.embed(block, thing.inputs);

    return outCtx;
   } if (child instanceof CSlotMorph) {
    let input = child;

    //clear children
    while (input.children[0] !== undefined) input.removeChild(input.children[0]);

    input.children.push(block);
    block.parent = input;
    input.fixLayout(); 
   } else {
    if (child instanceof InputSlotMorph) {
     thing.expression.isNumeric = child.isNumeric;
     thing.expression.fixLayout();
    }

    outExpr.children.splice(i, 1, block);
    block.parent = outExpr;
    outExpr.fixLayout();
   }

   //target.expression.fixLayout();
   //outCtx.inputs = thing.inputs; 
   return outCtx;
  }

  slotNum++;
 }
}

return target; 
    }
);

SnapExtensions.primitives.set(
    'sb_fbslot(val,expr)',
    function (val,expr) {if (!(expr.expression instanceof BlockMorph)) return expr;

var isBlock = val.expression instanceof BlockMorph;
var type = typeof(val);
var block = null;

if (type == "boolean") {
 //Create true/false boolean block
 //Just copying properties from a boolean block i logged to the dev console
 block = new ReporterBlockMorph();
 block.isPredicate = true;
 block.selector = "reportBoolean";
 block.blockSpec = "%bool";
 block.category = "operators";
 block.color = new Color(98, 194, 19, 1);

 let slotMorph = new BooleanSlotMorph();
 slotMorph.color = new Color(98, 194, 19);
 slotMorph.value = val;
 //slotMorph.type = null;
 slotMorph.isStatic = true;
 //slotMorph.isTemplate = false;
 //slotMorph.isFreeForm = false;

 slotMorph.fixLayout();
 block.add(slotMorph);
 block.fixLayout();
} else if (isBlock) {
 block = val.expression.fullCopy();
}

var outCtx = new Context(undefined, expr.expression);

for (let i in outCtx.expression.children) {
 let input = outCtx.expression.children[i];

 //console.log(input);
 
 if (input instanceof RingMorph) { //Ring 
  if (input.children[0].children.length == 0) { //If empty
   if (isBlock) {
    input.children[0].add(block);
    input.children[0].fixLayout();

    return outCtx; 
   }
  }
 } else if (input instanceof CSlotMorph) {
  if (input.children[0] === undefined) { //is empty
  //if (input.isEmptySlot()) {
   if (isBlock || type == "boolean") {
    if (block instanceof CommandBlockMorph) {
     input.add(block);
     input.fixLayout();
    } else {
     outCtx.expression.children.splice(i, 1, block);
     block.parent = outCtx.expression;

     block.fixLayout();
    }

    return outCtx;
   }
  } 
 } else if (input instanceof InputSlotMorph) { //Input slot
  //if (input.children[0].text == "") { //is empty
  if (input.isEmptySlot()) {
   if (type == "string" || type == "number") {
    input.setContents(val);
    delete input.bindingID; 
   } else {
    outCtx.expression.children.splice(i, 1, block);
    block.parent = outCtx.expression;

    block.fixLayout();
   }

   return outCtx;
  }
 } else if (input instanceof BooleanSlotMorph) { //Bool slot
  if (input.value === null) { //is empty
   if (type == "boolean") {
    input.value = val;
    return outCtx;
   } else if (isBlock) {
    outCtx.expression.children.splice(i, 1, block);
    block.parent = outCtx.expression;

    block.fixLayout(); 
   }

   return outCtx; 
  } 
 }
}

return expr;
 }
)

SnapExtensions.primitives.set(
    'sb_get-slot(n,target)',
    function (n,target) {
		//if empty
if (!(target.expression instanceof BlockMorph)) return new Context();

function get(child) {
  if (child instanceof BooleanSlotMorph) {
    return child.value;
  } else if (child instanceof InputSlotMorph) {
    return child.children[0].text;
  } else if (child instanceof CSlotMorph) {
    var block = child.children[0];
    //if (block instanceof BlockMorph) block = block.fullCopy();

    return new Context(null, block);
  } else if (child instanceof RingMorph) {
    var block = child.children[0].children[0];
    //if (block instanceof BlockMorph) block = block.fullCopy();

    return new Context(null, block);
  } else if (child instanceof MultiArgMorph) {
     var outArr = [];

     for (let j = 0; j < child.children.length - 1; j++) {
       outArr.push( get(child.children[j]) );
     }

     return new List(outArr);
  } else {
    return new Context(null, child);
  }
}

var slotNum = 1;
for (let i in target.expression.children) {
 let child = target.expression.children[i];

 if (child instanceof InputSlotMorph || child instanceof RingMorph || child instanceof CSlotMorph || child instanceof ArgMorph || child instanceof BlockMorph) {
  if (n === slotNum) {
   console.log(child);

   return get(child);
  }

  slotNum++;
 }
}

return new Context(); 
 }
)

SnapExtensions.primitives.set(
    'sb_#slots(expr)',
    function (expr) {
		return expr.expression.inputs().length;
 }
)

SnapExtensions.primitives.set(
    'sb_blocks(expr)',
    function (expr) {
		var out = [];
var block = expr.expression;

while (block) {
  var itm = block.fullCopy();
  if (itm.nextBlock())  itm.children.pop();
  out.push( new Context(0, itm) );
  block = block.nextBlock();
}

return new List(out);
 }
)

SnapExtensions.primitives.set(
    'sb_copy(obj)',
    function (obj) {
		if (typeof obj === "object") {
  if (obj instanceof Context) {
    var ctx = new Context();
    ctx.inputs = copy(obj.inputs);
    if (obj.expression)  ctx.expression = obj.expression.fullCopy();
    return ctx;
  }

  return ("fullCopy" in obj) ?
    obj.fullCopy() : //copy everything, including inputs
    copy(obj);       //use built-in shallow copy function
}

return obj; //for primitive types
 }
)
