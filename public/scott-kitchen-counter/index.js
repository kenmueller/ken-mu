const firestore = firebase.firestore()

const doc = firestore.doc('counters/scott-kitchen')

const countLabel = document.querySelector('body > .container > .box > h1')
const incrementButton = document.querySelector('body > .container > .box > button')

let currentRotation = 0

doc.onSnapshot(
	snapshot => {
		const count = snapshot.get('value')
		
		if (typeof count === 'number')
			updateCount(count)
	},
	error => {
		alert(error.message)
		console.error(error)
	}
)

const updateCount = count => {
	countLabel.innerHTML = count
	incrementButton.style.transform = `rotate(${currentRotation += 360}deg)`
}

const incrementCount = () =>
	doc.update({
		value: firebase.firestore.FieldValue.increment(1)
	})
