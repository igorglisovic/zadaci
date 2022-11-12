'use strict'

// Elements
const container = document.querySelector('main')
const letters = document.querySelectorAll('.letter')
const labelTimer = document.querySelector('.timer')
const modal = document.querySelector('.modal')
const overlay = document.querySelector('.overlay')
const btnRestart = document.querySelector('.restart')

// Correct pattern
let correct

// Timer variable
let timer

// Media query for phone
const phoneMediaQuery = window.matchMedia('(max-width: 700px)')
labelTimer.innerText = phoneMediaQuery.matches ? '05 seconds' : '04 seconds'

// Width & Height of container app
let containerWidth, containerHeight
window.addEventListener('load', () => {
  containerWidth = container.offsetWidth
  containerHeight = container.offsetHeight
})

// Get random number
const randomNumber = (min, max) =>
  Math.floor(Math.random() * (max - min + 1) + min)

let positions = []

const setRandomPositions = () => {
  letters.forEach(letter => {
    // Width & Height of current letter
    const letterWidth = letter.offsetWidth
    const letterHeight = letter.offsetHeight

    // Get random x, y
    let randomX = randomNumber(0, containerWidth - letterWidth)
    let randomY = randomNumber(0, containerHeight - letterHeight)

    // Checking for overlap
    for (let i = 0; i < positions.length; i++) {
      if (
        positions[i]?.y - positions[i]?.height <= randomY &&
        positions[i]?.y + positions[i]?.height >= randomY &&
        positions[i]?.x + positions[i]?.width >= randomX &&
        positions[i]?.x - positions[i]?.width <= randomX
      ) {
        randomX = randomNumber(0, containerWidth - letterWidth)
        randomY = randomNumber(0, containerHeight - letterHeight)
      }
    }

    // Position and dimensions of letters
    positions.push({
      x: randomX,
      y: randomY,
      height: letterHeight,
      width: letterWidth,
    })

    // Positioning letter
    letter.style.transform = 'translate(0,0)'
    letter.style.position = `absolute`
    letter.style.left = `${randomX}px`
    letter.style.top = `${randomY}px`
  })
}

const startTimer = phoneMediaQuery => {
  // Game timer
  let time = phoneMediaQuery.matches ? 5 : 4 // time in seconds

  const tick = () => {
    const seconds = String(time).padStart(2, 0)

    // Display timer on UI
    labelTimer.textContent = `${seconds} seconds`

    // When the time is up
    if (time === 0) {
      clearInterval(timer)
      newGame()
    }
    time--
  }
  tick()
  timer = setInterval(tick, 1000)
  return timer
}

const checkClickedLetter = () => {
  container.addEventListener('click', e => {
    if (e.target.classList.contains('letter')) {
      // Clicked letter
      const letter = e.target

      // When wrong letter is clicked
      if (letter.innerHTML !== correct[0]) {
        // Stop the timer
        clearInterval(timer)
        // Restart game
        newGame()
      }

      // When correct letter is clicked
      if (letter.innerHTML === correct[0]) {
        letter.style.color = 'green'
        // Disable correct letter
        letter.disabled = true
        correct.shift()
      }

      if (correct.length === 0) {
        // Stop the timer
        clearInterval(timer)

        // Show winner message
        modal.classList.remove('hidden')
        overlay.classList.remove('hidden')
      }
    }
  })
}
checkClickedLetter()

const newGame = () => {
  // Restart correct pattern
  correct = ['P', 'O', 'S', 'A', 'O']
  // Remove old positions
  positions = []

  // Remove overlays
  modal.classList.add('hidden')
  overlay.classList.add('hidden')

  // Initial styles
  letters[0].style.left = 'calc(50% - 120px)'
  letters[1].style.left = 'calc(50% - 60px)'
  letters[2].style.left = 'calc(50%)'
  letters[3].style.left = 'calc(50% + 60px)'
  letters[4].style.left = 'calc(50% + 120px)'
  letters.forEach(letter => {
    letter.style.top = 'calc(50%)'
    letter.style.color = 'black'
    letter.style.transform = 'translateY(-50%) translateX(-50%)'
    letter.disabled = true
  })

  setTimeout(() => {
    // Letters to random positions
    setRandomPositions()
    // Start the timer
    if (timer) clearInterval(timer)
    timer = startTimer(phoneMediaQuery)
  }, 2000)

  setTimeout(() => {
    letters.forEach(letter => {
      // Enable letters after positioning
      letter.disabled = false
    })
  }, 3000)
}
newGame()

// Restart game on btn restart
btnRestart.addEventListener('click', newGame)
