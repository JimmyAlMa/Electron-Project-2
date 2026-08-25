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
        await window.dialogApi.showErrorMessage('Product name cannot be empty')
        productInput.focus()
        return
    }
    if (!price) {
        await window.dialogApi.showErrorMessage('Product price cannot be empty')
        priceInput.focus()
        return
    }
    if (!total) {
        await window.dialogApi.showErrorMessage('Product total cannot be empty')
        totalInput.focus()
        return
    }

    // Number Conversion and Value Validation
    const priceNum = Number(price)
    const totalNum = Number(total)

    if (!Number.isInteger(priceNum) || priceNum < 0) {
        await window.dialogApi.showErrorMessage('Price not valid')
        return
    }
    if (!Number.isInteger(totalNum) || totalNum < 0) {
        await window.dialogApi.showErrorMessage('Total not valid')
        return
    }

    // Send To Main
    const result = await window.stockApi.addStock(name, priceNum, totalNum)

    if (result.success) {
        productInput.value = ''
        priceInput.value = ''
        totalInput.value = ''
        await getStockData()
    } else {
        await window.dialogApi.showErrorMessage(`${result.error}`)
    }
}

async function getStockData() {
    const result = await window.stockApi.getStock()

    if (!result.success) {
        console.log(result.error)
        return
    }

    const data = result.data
    const stockLists = document.querySelectorAll('.stockList')
    
    stockLists.forEach(stockList => {
        stockList.innerHTML = ''
        data.forEach(info => {
            const li = document.createElement('li')
            li.className = 'productList'
            
            const textSpan = document.createElement('span')
            textSpan.className = 'productText'
            textSpan.textContent = `(${info.id}) ${info.name} | ${info.price} | ${info.total}`
            textSpan.addEventListener('click', () => addToCart(info))

            const deleteButton = document.createElement('button')
            deleteButton.className = 'deleteProductButton'
            deleteButton.textContent = 'Delete'
            deleteButton.addEventListener('click', () => deleteProduct(info.id))

            li.appendChild(textSpan)
            li.appendChild(deleteButton)
            stockList.appendChild(li)
        });
    })
}

async function deleteProduct(id) {
    const result = await window.stockApi.deleteStock(id)

    if (result.success) {
        getStockData()
    } else {s
        console.log(result.error)
    }
}

let userCart = []
function addToCart(product) {
    const existing = userCart.find(item => item.id === product.id)

    if (existing) {
        existing.total += 1
    } else {
        userCart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            total: 1
        })
    }
    renderCart()
}

function renderCart() {
    const cartList = document.querySelector('#cartList')
    cartList.innerHTML = ''

    userCart.forEach(item => {
        const li = document.createElement('li')

        const textSpan = document.createElement('span')
        textSpan.textContent = `${item.name} | ${item.price} x ${item.total}`
        textSpan.addEventListener('click', () => reduceFromCart(item.id))

        li.appendChild(textSpan)
        cartList.appendChild(li)
    })
}

function reduceFromCart(id) {
    const existing = userCart.find(item => item.id === id)

    if (!existing) return

    existing.total -= 1

    if (existing.total <= 0) {
        userCart = userCart.filter(item => item.id !== id)
    }
    renderCart()
}

getStockData()