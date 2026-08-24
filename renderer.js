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

async function addStock() {
    const productInput = document.getElementById('stockInputProduct')
    const priceInput = document.getElementById('stockInputPrice')
    const totalInput = document.getElementById('stockInputTotal')

    const name = productInput.value.trim()
    const price = priceInput.value
    const total = totalInput.value

    // Validate Input
    if (!name) {
        alert('Product name cannot be empty')
        productInput.focus()
        return
    }
    if (!price) {
        alert('Product price cannot be empty')
        priceInput.focus()
        return
    }
    if (!total) {
        alert('Product total cannot be empty')
        totalInput.focus()
        return
    }

    // Number Conversion and Value Validation
    const priceNum = Number(price)
    const totalNum = Number(total)

    if (!Number.isInteger(priceNum) || priceNum < 0) {
        alert('Price not valid')
        return
    }
    if (!Number.isInteger(totalNum) || totalNum < 0) {
        alert('Total not valid')
        return
    }

    // Send To Main
    const result = await window.stockApi.addStock(name, priceNum, totalNum)

    if (result.success) {
        productInput.value = ''
        priceInput.value = ''
        totalInput.value = ''
        alert('Add product success')
        await getStockData()
    } else {
        alert(result.error)
    }
}

async function getStockData() {
    const result = await window.stockApi.getStock()

    if (!result.success) {
        console.log(result.error)
        return
    }

    const data = result.data
    const stockList = document.querySelector('.stockList')
    stockList.innerHTML = ''
    
    data.forEach(info => {
        const li = document.createElement('li')
        li.textContent = `(${info.id}) ${info.name} | ${info.price} | ${info.total}`
        stockList.appendChild(li)
    });
}

getStockData()