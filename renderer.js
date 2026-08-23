

const navbar = document.querySelector('nav')
const stockContainer = document.querySelector('#stockContainer')
const cashierContainer = document.querySelector('#cashierContainer')
const historyContainer = document.querySelector('#historyContainer')
navbar.addEventListener('click', (event) => {
    const target = event.target

    if (target.matches('.stockNav')) {
        stockContainer.style.display = 'grid'
        cashierContainer.style.display = 'none'
        historyContainer.style.display = 'none'
    }

    if (target.matches('.transactionNav')) {
        stockContainer.style.display = 'none'
        cashierContainer.style.display = 'grid'
        historyContainer.style.display = 'none'
    }

    if (target.matches('.historyNav')) {
        stockContainer.style.display = 'none'
        cashierContainer.style.display = 'none'
        historyContainer.style.display = 'flex'
    }
})