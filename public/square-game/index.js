const canvas = document.querySelector('canvas')
const context = canvas.getContext('2d')

window.addEventListener('keydown', ({ keyCode }) =>
	keyCode === 13 // Enter
		? document
			.querySelectorAll('.inputs > input')
			.forEach(input => input.blur())
		: null
)

const str = id =>
	document.getElementById(id).value

const num = id =>
	parseFloat(str(id))

const createGame = () => {
	window.game = new Game(canvas, context)
	
	game.createPlayer({
		width: num('player-width'),
		height: num('player-height'),
		speed: num('player-speed'),
		color: str('player-color')
	})
	
	game.dashMultiplier = num('dash-multiplier')
	game.dashDuration = num('dash-duration')
	
	game.obstacleWidth = num('obstacle-width')
	game.obstacleSpacing = num('obstacle-spacing')
	game.obstacleSpeed = num('obstacle-speed')
	game.obstacleColor = str('obstacle-color')
	
	game.lowerGapMultiplier = num('lower-gap-multiplier')
	game.upperGapMultiplier = num('upper-gap-multiplier')
	
	game.createObstacles()
	game.setSpeedMultiplier(num('speed-multiplier'))
	
	game.onFinish(game => {
		game.release()
		createGame()
	})
}

createGame()
