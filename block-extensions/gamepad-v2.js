SnapExtensions.primitives.set(
    'gp_gamepads()',
    function() {
        const gamepads = navigator.getGamepads()
        if (!gamepads) {
            return new List()
        }

        const gamepadList = new List()

        for (let gamepad of gamepads) {
            if (!gamepad) {
                continue
            }
            
            const info = new List()
            info.add(new List(['id',gamepad.index + 1]))
            info.add(new List(['name',gamepad.id]))
            info.add(new List(['connected',gamepad.connected]))
            info.add(new List(['axes', new List(gamepad.axes)]))
            info.add(new List(['buttons', new List(gamepad.buttons.map(button => button.pressed))]))
            
            gamepadList.add(info)
        }

        return gamepadList
    }
)

SnapExtensions.set(
    'gp_rumble(index, duration, weak, strong)',
    function() {
        const gamepad = navigator.getGamepads()[index]

        if (!gamepad) {
            return
        }

        gamepad.vibrationActuator.playEffect('dual-rumble', {
            duration: duration,
            weakMagnitude: weak,
            strongMagnitude: strong,
        })
    }
)
