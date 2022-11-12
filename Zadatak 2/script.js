'use strict'

// Data

const account1 = {
  owner: 'Igor Glisovic',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-07-26T17:01:17.194Z',
    '2020-07-28T23:36:17.929Z',
    '2020-08-01T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
}

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
}

const accounts = [account1, account2]

// Elements
const labelWelcome = document.querySelector('.welcome')
const labelDate = document.querySelector('.date')
const labelBalance = document.querySelector('.balance__value')
const labelSumIn = document.querySelector('.summary__value--in')
const labelSumOut = document.querySelector('.summary__value--out')
const labelSumInterest = document.querySelector('.summary__value--interest')
const labelTimer = document.querySelector('.timer')

const containerApp = document.querySelector('.app')
const containerMovements = document.querySelector('.movements')

const btnLogin = document.querySelector('.login__btn')
const btnTransfer = document.querySelector('.form__btn--transfer')
const btnLoan = document.querySelector('.form__btn--loan')
const btnClose = document.querySelector('.form__btn--close')
const btnSort = document.querySelector('.btn--sort')

const inputLoginUsername = document.querySelector('.login__input--user')
const inputLoginPin = document.querySelector('.login__input--pin')
const inputTransferTo = document.querySelector('.form__input--to')
const inputTransferAmount = document.querySelector('.form__input--amount')
const inputLoanAmount = document.querySelector('.form__input--loan-amount')
const inputCloseUsername = document.querySelector('.form__input--user')
const inputClosePin = document.querySelector('.form__input--pin')

// Functions

const displayMovements = (acc, sort) => {
  containerMovements.innerHTML = ''

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements

  movs.forEach((movement, i) => {
    const type = movement > 0 ? 'deposit' : 'withdrawal'

    const date = new Date(acc.movementsDates[i])
    const day = date.getDate()
    const month = date.getMonth() + 1
    const year = date.getFullYear()

    const row = `
        <div class="movements__row">
          <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
          <div class="movements__date">${day}/${month}/${year}</div>
          <div class="movements__value">${movement.toFixed(2)} €</div>
        </div>
         `

    containerMovements.insertAdjacentHTML('afterbegin', row)
  })
}

const calcDisplayBalance = acc => {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0)
  labelBalance.textContent = `${acc.balance.toFixed(2)} €`
}

const calcDisplaySummary = acc => {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0)

  labelSumIn.textContent = `${incomes.toFixed(2)} €`

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0)
  labelSumOut.textContent = `${Math.abs(out).toFixed(2)} €`

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter(int => int >= 1)
    .reduce((acc, int) => acc + int, 0)
  labelSumInterest.textContent = `${interest.toFixed(2)}€`
}

const createUsernames = accs => {
  accs.forEach(acc => {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('')
  })
}
createUsernames(accounts)

const updateUI = acc => {
  calcDisplayBalance(acc)
  calcDisplaySummary(acc)
  displayMovements(acc)
}

const startTimer = () => {
  let time = 300

  const tick = () => {
    const minutes = String(Math.trunc(time / 60)).padStart(2, 0)
    const seconds = String(time % 60).padStart(2, 0)

    labelTimer.textContent = `${minutes}:${seconds}`

    if (time === 0) {
      clearInterval(timer)
      containerApp.style.opacity = 0
    }
    time--
  }

  tick()
  const timer = setInterval(tick, 1000)
  return timer
}

// Event handlers

let currentAccount, timer

btnLogin.addEventListener('click', e => {
  e.preventDefault()

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  )

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Welcome label
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = ''
    inputLoginPin.blur()

    // Timer
    if (timer) clearInterval(timer)
    timer = startTimer()

    // Display date and time
    const now = new Date()
    const options = {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      hour: 'numeric',
    }
    const locale = currentAccount.locale
    labelDate.textContent = Intl.DateTimeFormat(locale, options).format(now)

    // Display UI
    containerApp.style.opacity = 100
    updateUI(currentAccount)
  }
})

btnTransfer.addEventListener('click', e => {
  e.preventDefault()

  // Declare amount and reciever Acc
  const amount = +inputTransferAmount.value
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  )

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc.username !== currentAccount.username
  ) {
    // Delete input fields
    inputTransferAmount.value = inputTransferTo.value = ''
    inputTransferTo.blur()
    inputTransferAmount.blur()

    // Add movements
    receiverAcc.movements.push(amount)
    currentAccount.movements.push(-amount)

    // Add transfer date
    currentAccount.movementsDates.push(new Date().toISOString())
    receiverAcc.movementsDates.push(new Date().toISOString())

    // Update UI
    updateUI(currentAccount)
  }
})

btnLoan.addEventListener('click', e => {
  e.preventDefault()

  const amount = +inputLoanAmount.value
  const canRequestLoan = currentAccount.movements
    .filter(mov => mov > 0)
    .some(deposit => deposit >= amount * 0.1)

  if (amount > 0 && canRequestLoan) {
    // Add movement
    currentAccount.movements.push(amount)

    // Clear input fields
    inputLoanAmount.value = ''
    inputLoanAmount.blur()

    // Add transfer date
    currentAccount.movementsDates.push(new Date().toISOString())

    // Update UI
    updateUI(currentAccount)
  }
})

btnClose.addEventListener('click', e => {
  e.preventDefault()

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    )

    // Clear input fields
    inputCloseUsername.value = inputClosePin.value = ''
    inputCloseUsername.blur()
    inputClosePin.blur()

    // Delete user from data
    accounts.splice(index, 1)

    // Hide UI
    containerApp.style.opacity = 0
  }
})

let sort = false
btnSort.addEventListener('click', () => {
  displayMovements(currentAccount, !sort)
  sort = !sort
})
