class Game {
	constructor(canvas, context) {
		this.canvas = canvas
		this.context = context
	}
	
	static clamp = (min, target, max) =>
		Math.min(Math.max(min, target), max)
	
	release = () => {
		const { removeUpdateInterval, player } = this
		
		removeUpdateInterval()
		player.removeMovementListeners()
	}
	
	clear = () => {
		const { canvas: { width, height }, context } = this
		context.clearRect(0, 0, width, height)
	}
	
	update = () => {
		this.clear()
		
		const {
			canvas: { width, height },
			context,
			player,
			obstacles,
			onFinishHandler,
			obstacleSpeed,
			shouldCreateObstacle,
			createObstacle
		} = this
		
		player.update(context, (x, y) => ({
			x: Game.clamp(0, x, width - player.width),
			y: Game.clamp(0, y, height - player.height)
		}))
		
		for (const obstacle of obstacles) {
			if (player.isIntersectingWith(obstacle)) {
				onFinishHandler(this)
				return
			}
			
			obstacle.x -= obstacleSpeed
			obstacle.update(context)
		}
		
		if (shouldCreateObstacle())
			createObstacle()
	}
	
	startUpdateInterval = fps => {
		this.interval = setInterval(this.update, 1000 / fps)
	}
	
	removeUpdateInterval = () => {
		const { interval } = this
		
		if (interval === undefined)
			return
		
		clearInterval(interval)
	}
	
	setSpeedMultiplier = multiplier => {
		const { removeUpdateInterval, startUpdateInterval } = this
		
		removeUpdateInterval()
		startUpdateInterval(60 * multiplier)
	}
	
	createPlayer = ({ width, height, speed, color }) => {
		this.player = new Rectangle(
			50,
			(this.canvas.height - height) / 2,
			width,
			height,
			color
		)
		
		this.player.speed = speed
		this.player.addMovementListeners()
		
		this.player.onKeyDown = keyCode => {
			switch (keyCode) {
				case 16: // Shift
					this.player.speedMultiplier = this.dashMultiplier // 3x speed dash
					
					setTimeout(() => (
						this.player.speedMultiplier = undefined
					), this.dashDuration * 1000) // 0.2 second dash
					
					break
				case 32: // Space
					this.player.y = Math.random() * (this.canvas.height - this.player.height)
					break
			}
		}
	}
	
	shouldCreateObstacle = () =>
		this.obstacles[this.obstacles.length - 1].x <= (
			this.canvas.width - this.obstacleSpacing
		)
	
	createObstacles = () => {
		this.obstacles = []
		this.createObstacle()
	}
	
	createObstacle = () => {
		const {
			canvas: { width, height },
			player,
			obstacles,
			obstacleWidth,
			lowerGapMultiplier,
			upperGapMultiplier,
			obstacleColor
		} = this
		
		const gap = player.height * (
			lowerGapMultiplier +
			Math.random() * (upperGapMultiplier - lowerGapMultiplier)
		)
		
		const remainingHeight = height - gap
		
		const height1 = Math.random() * remainingHeight
		const height2 = remainingHeight - height1
		
		obstacles.push(
			new Rectangle(width, 0, obstacleWidth, height1, obstacleColor),
			new Rectangle(width, height1 + gap, obstacleWidth, height2, obstacleColor)
		)
	}
	
	onFinish = handler => {
		this.onFinishHandler = handler
		return this
	}
}

class Rectangle {
	constructor(x, y, width, height, color) {
		this.x = x
		this.y = y
		this.width = width
		this.height = height
		this.color = color
		
		this.keyCodes = {}
	}
	
	update = (context, positionTransform = (x, y) => ({ x, y })) => {
		const { width, height, color, speed, speedMultiplier } = this
		
		let xSpeed = 0
		let ySpeed = 0
		
		if (87 in this.keyCodes) ySpeed -= speed // Up
		if (68 in this.keyCodes) xSpeed += speed // Right
		if (83 in this.keyCodes) ySpeed += speed // Down
		if (65 in this.keyCodes) xSpeed -= speed // Left
		
		const xSpeedWithMultiplier = xSpeed || ySpeed
			? xSpeed * (speedMultiplier || 1)
			: (speedMultiplier || 0)
		
		const { x, y } = positionTransform(
			this.x + xSpeedWithMultiplier,
			this.y + ySpeed * (speedMultiplier || 1)
		)
		
		this.x = x
		this.y = y
		
		context.fillStyle = color
		context.fillRect(this.x, this.y, width, height)
	}
	
	addMovementListeners = () => {
		const onKeyDown = ({ keyCode }) => {
			this.keyCodes[keyCode] = null
			
			if (this.onKeyDown)
				this.onKeyDown(keyCode)
		}
		
		const onKeyUp = ({ keyCode }) =>
			delete this.keyCodes[keyCode]
		
		window.addEventListener('keydown', onKeyDown)
		window.addEventListener('keyup', onKeyUp)
		
		this.removeMovementListeners = () => {
			window.removeEventListener('keydown', onKeyDown)
			window.removeEventListener('keyup', onKeyUp)
		}
	}
	
	isIntersectingWith = other => {
		const { x, y, width, height } = this
		
		return !(
			y + height < other.y ||
			y > other.y + other.height ||
			x + width < other.x ||
			x > other.x + other.width
		)
	}
}
