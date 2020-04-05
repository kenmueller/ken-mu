const firestore = firebase.firestore()

const doc = firestore.doc('counters/scott-kitchen')

const countLabel = document.querySelector('body > .container > .inner-container > .box > h1')
const incrementButton = document.querySelector('body > .container > .inner-container > .box > button')

const chartSelector = 'body > .container > .inner-container > .chart'

let count = 0
let lastDay = null
let logs = []

let currentRotation = 0

doc.onSnapshot(
	snapshot => {
		count = snapshot.get('value')
		lastDay = snapshot.get('lastDay')?.toDate()
		logs = snapshot.get('logs')
		
		updateCount()
		updateChart()
	},
	error => {
		alert(error.message)
		console.error(error)
	}
)

const updateCount = () => {
	countLabel.innerHTML = count
	incrementButton.style.transform = `rotate(${currentRotation += 360}deg)`
}

const updateChart = () =>
	new Chartist.Line(
		chartSelector,
		{
			labels: [...Array(logs.length).keys()],
			series: [{ data: logs }]
		},
		{
			axisX: { showLabel: false }
		}
	)

const incrementCount = () => {
	const now = new Date
	
	return doc.update({
		value: firebase.firestore.FieldValue.increment(1),
		lastDay: now,
		logs: datesAreOnSameDay(now, lastDay)
			? logs.length
				? (logs[logs.length - 1]++, logs)
				: [1]
			: firebase.firestore.FieldValue.arrayUnion(1)
	})
}

const datesAreOnSameDay = (a, b) =>
	a.getFullYear() === b.getFullYear() &&
	a.getMonth() === b.getMonth() &&
	a.getDate() === b.getDate()
