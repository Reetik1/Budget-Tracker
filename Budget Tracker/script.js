class Transaction {
    constructor(type, category, amount, date) {
        this.id = Date.now().toString(36) + Math.random().toString(36).substr(2);
        this.type = type;
        this.category = category;
        this.amount = amount;
        this.date = date;
    }
}

class BudgetTracker {
    constructor() {
        this.transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        this.totalIncome = 0;
        this.totalExpenses = 0;
        this.balance = 0;
    }

    addTransaction(transaction) {
        this.transactions.push(transaction);
        this.updateLocalStorage();
    }

    removeTransaction(id) {
        this.transactions = this.transactions.filter(t => t.id !== id);
        this.updateLocalStorage();
    }

    updateLocalStorage() {
        localStorage.setItem('transactions', JSON.stringify(this.transactions));
    }

    calculateTotals() {
        this.totalIncome = this.transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);

        this.totalExpenses = this.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);

        this.balance = this.totalIncome - this.totalExpenses;
    }
}

const budgetTracker = new BudgetTracker();

const transactionForm = document.getElementById('transactionForm');
const transactionList = document.getElementById('transactionList');
const totalIncomeElement = document.getElementById('totalIncome');
const totalExpensesElement = document.getElementById('totalExpenses');
const balanceElement = document.getElementById('balance');

let budgetChart;

function updateUI() {
    budgetTracker.calculateTotals();

    totalIncomeElement.textContent = `$${budgetTracker.totalIncome.toFixed(2)}`;
    totalExpensesElement.textContent = `$${budgetTracker.totalExpenses.toFixed(2)}`;
    balanceElement.textContent = `$${budgetTracker.balance.toFixed(2)}`;

    updateTransactionList();
    updateChart();
}

function updateTransactionList() {
    transactionList.innerHTML = '';
    budgetTracker.transactions.forEach(transaction => {
        const row = document.createElement('tr');
        row.classList.add('fade-in');
        row.innerHTML = `
            <td>${transaction.date}</td>
            <td>${transaction.type}</td>
            <td>${transaction.category}</td>
            <td class="${transaction.type === 'income' ? 'text-success' : 'text-danger'}">
                $${parseFloat(transaction.amount).toFixed(2)}
            </td>
            <td>
                <i class="bi bi-trash delete-btn" data-id="${transaction.id}"></i>
            </td>
        `;
        transactionList.appendChild(row);
    });
}

function updateChart() {
    const ctx = document.getElementById('budgetChart').getContext('2d');

    const incomeData = {};
    const expenseData = {};

    budgetTracker.transactions.forEach(transaction => {
        const data = transaction.type === 'income' ? incomeData : expenseData;
        if (data[transaction.category]) {
            data[transaction.category] += parseFloat(transaction.amount);
        } else {
            data[transaction.category] = parseFloat(transaction.amount);
        }
    });

    const chartData = {
        labels: [...Object.keys(incomeData), ...Object.keys(expenseData)],
        datasets: [
            {
                label: 'Income',
                data: Object.values(incomeData),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            },
            {
                label: 'Expenses',
                data: Object.values(expenseData),
                backgroundColor: 'rgba(255, 99, 132, 0.6)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }
        ]
    };

    if (budgetChart) {
        budgetChart.destroy();
    }

    budgetChart = new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            responsive: true
        }
    });
}

transactionForm.addEventListener('submit', e => {
    e.preventDefault();
    const type = document.getElementById('transactionType').value;
    const category = document.getElementById('category').value;
    const amount = document.getElementById('amount').value;
    const date = document.getElementById('date').value;

    const transaction = new Transaction(type, category, amount, date);
    budgetTracker.addTransaction(transaction);

    transactionForm.reset();
    updateUI();
});

transactionList.addEventListener('click', e => {
    if (e.target.classList.contains('delete-btn')) {
        const id = e.target.getAttribute('data-id');
        budgetTracker.removeTransaction(id);
        updateUI();
    }
});

// Initial UI update
updateUI();