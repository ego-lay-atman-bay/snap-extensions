SnapExtensions.primitives.set(
    'gp_gamepads()',
    function() {
        return new List(navigator.getGamepads());
    }
);

SnapExtensions.primitives.set(
    'gp_connected(gamepad)',
    function(gamepad) {
        if(!gamepad) {
            return false
        }
        
        return gamepad.connected
    }
);

SnapExtensions.primitives.set(
    'gp_info(gamepad)',
    function(gamepad) {
        if(!gamepad) {
            throw new Error('not a gamepad')
        }
            
        var info = []
            
        info.push(new List(['index',gamepad.index]))
        info.push(new List(['id',gamepad.id]))
        info.push(new List(['connected',gamepad.connected]))
        info.push(new List(['axes',gamepad.axes.length]))
        info.push(new List(['buttons',gamepad.buttons.length]))
        info.push(new List(['mapping',gamepad.mapping]))
        
        return new List(info)
    }
);

SnapExtensions.primitives.set(
    'gp_buttons(gamepad)',
    function(gamepad) {
        if(!gamepad) {
            throw new Error('not a gamepad')
        }
        
        var buttons = gamepad.buttons
        var buttonstate = []
        
        for (let i = 0; i <= buttons.length - 1; i++) {
            buttonstate.push(buttons[i].pressed)
        }
        
        return new List(buttonstate)
    }
);

SnapExtensions.primitives.set(
    'gp_axes(gamepad)',
    function(gamepad) {
        if(!gamepad) {
            throw new Error('not a gamepad')
        }
        
        var axes = gamepad.axes
        
        return new List(axes)
    }
);

SnapExtensions.primitives.set(
    'gp_rumble(gamepad, )',
    function(gamepad, delay, duration, strong, weak) {
        if(!gamepad) {
            throw new Error('not a gamepad')
        }
        
        gamepad.vibrationActuator.playEffect('dual-rumble', {
            startDelay: delay,
            duration: duration,
            weakMagnitude: weak,
            strongMagnitude: strong,
        });
    }
);
