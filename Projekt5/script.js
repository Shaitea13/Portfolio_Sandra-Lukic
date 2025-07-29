// Budget Tracker App
class BudgetTracker {
    constructor() {
        this.transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        this.budgets = JSON.parse(localStorage.getItem('budgets')) || {};
        this.currentType = 'income';
        this.currentFilter = 'all';
        this.categories = {
            income: [
                { id: 'salary', name: 'Gehalt', icon: '💼' },
                { id: 'freelance', name: 'Freelance', icon: '💻' },
                { id: 'investment', name: 'Investitionen', icon: '📈' },
                { id: 'gift', name: 'Geschenke', icon: '🎁' },
                { id: 'other_income', name: 'Sonstiges', icon: '💰' }
            ],
            expense: [
                { id: 'food', name: 'Lebensmittel', icon: '🛒' },
                { id: 'transport', name: 'Transport', icon: '🚗' },
                { id: 'housing', name: 'Wohnen', icon: '🏠' },
                { id: 'entertainment', name: 'Unterhaltung', icon: '🎬' },
                { id: 'health', name: 'Gesundheit', icon: '🏥' },
                { id: 'shopping', name: 'Shopping', icon: '🛍️' },
                { id: 'education', name: 'Bildung', icon: '📚' },
                { id: 'utilities', name: 'Nebenkosten', icon: '💡' },
                { id: 'other_expense', name: 'Sonstiges', icon: '💸' }
            ]
        };
        
        this.categoryChart = null;
        this.monthlyChart = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateCategories();
        this.updateDashboard();
        this.renderTransactions();
        this.renderBudgets();
        this.updateStatistics();
        this.initCharts();
        this.setDefaultDate();
    }

    setupEventListeners() {
        // Transaction Type Buttons
        document.querySelectorAll('.type-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentType = e.target.dataset.type;
                this.updateCategories();
            });
        });

        // Filter Buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.renderTransactions();
            });
        });

        // Transaction Form
        document.getElementById('transactionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTransaction();
        });

        // Budget Form
        document.getElementById('budgetForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addBudget();
        });
    }

    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('date').value = today;
    }

    updateCategories() {
        const select = document.getElementById('category');
        const budgetSelect = document.getElementById('budgetCategory');
        const categories = this.categories[this.currentType];
        
        select.innerHTML = '<option value="">Kategorie wählen...</option>';
        budgetSelect.innerHTML = '<option value="">Kategorie wählen...</option>';
        
        categories.forEach(cat => {
            select.innerHTML += `<option value="${cat.id}">${cat.icon} ${cat.name}</option>`;
        });
        
        // Budget categories (only expenses)
        this.categories.expense.forEach(cat => {
            budgetSelect.innerHTML += `<option value="${cat.id}">${cat.icon} ${cat.name}</option>`;
        });
    }

    addTransaction() {
        const description = document.getElementById('description').value;
        const amount = parseFloat(document.getElementById('amount').value);
        const category = document.getElementById('category').value;
        const date = document.getElementById('date').value;

        if (!description || !amount || !category || !date) return;

        const transaction = {
            id: Date.now(),
            type: this.currentType,
            description,
            amount,
            category,
            date,
            timestamp: new Date().toISOString()
        };

        this.transactions.unshift(transaction);
        this.saveData();
        this.updateDashboard();
        this.renderTransactions();
        this.renderBudgets();
        this.updateStatistics();
        this.updateCharts();

        // Reset form
        document.getElementById('transactionForm').reset();
        this.setDefaultDate();

        // Show success message
        this.showNotification('Transaktion erfolgreich hinzugefügt!', 'success');
    }

    deleteTransaction(id) {
        if (confirm('Möchten Sie diese Transaktion wirklich löschen?')) {
            this.transactions = this.transactions.filter(t => t.id !== id);
            this.saveData();
            this.updateDashboard();
            this.renderTransactions();
            this.renderBudgets();
            this.updateStatistics();
            this.updateCharts();
            this.showNotification('Transaktion gelöscht', 'info');
        }
    }

    updateDashboard() {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const monthlyTransactions = this.transactions.filter(t => {
            const date = new Date(t.date);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        });

        const income = monthlyTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const expense = monthlyTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const balance = income - expense;

        // Update values
        document.getElementById('totalIncome').textContent = this.formatCurrency(income);
        document.getElementById('totalExpense').textContent = this.formatCurrency(expense);
        document.getElementById('totalBalance').textContent = this.formatCurrency(balance);

        // Update budget status
        const totalBudget = Object.values(this.budgets).reduce((sum, b) => sum + b.limit, 0);
        const budgetUsed = totalBudget > 0 ? (expense / totalBudget) * 100 : 0;
        document.getElementById('budgetStatus').textContent = `${Math.round(budgetUsed)}%`;
    }

    renderTransactions() {
        const container = document.getElementById('transactionList');
        let filteredTransactions = this.transactions;

        if (this.currentFilter !== 'all') {
            filteredTransactions = this.transactions.filter(t => t.type === this.currentFilter);
        }

        if (filteredTransactions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📊</div>
                    <p>Keine Transaktionen gefunden</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filteredTransactions.slice(0, 50).map(t => {
            const category = this.getCategoryById(t.type, t.category);
            const date = new Date(t.date).toLocaleDateString('de-DE');
            
            return `
                <div class="transaction-item">
                    <div class="transaction-info">
                        <div class="transaction-icon ${t.type}">
                            ${category ? category.icon : '💰'}
                        </div>
                        <div class="transaction-details">
                            <h4>${t.description}</h4>
                            <p>${category ? category.name : ''} • ${date}</p>
                        </div>
                    </div>
                    <div class="transaction-amount">
                        <span class="amount ${t.type}">
                            ${t.type === 'income' ? '+' : '-'} ${this.formatCurrency(t.amount)}
                        </span>
                        <button class="delete-btn" onclick="app.deleteTransaction(${t.id})">
                            🗑️
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderBudgets() {
        const container = document.getElementById('budgetList');
        const budgetEntries = Object.entries(this.budgets);

        if (budgetEntries.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🎯</div>
                    <p>Noch keine Budget-Ziele gesetzt</p>
                </div>
            `;
            return;
        }

        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        container.innerHTML = budgetEntries.map(([categoryId, budget]) => {
            const category = this.getCategoryById('expense', categoryId);
            if (!category) return '';

            // Calculate spent amount for this category
            const spent = this.transactions
                .filter(t => {
                    const date = new Date(t.date);
                    return t.type === 'expense' && 
                           t.category === categoryId &&
                           date.getMonth() === currentMonth &&
                           date.getFullYear() === currentYear;
                })
                .reduce((sum, t) => sum + t.amount, 0);

            const percentage = (spent / budget.limit) * 100;
            const progressClass = percentage > 100 ? 'danger' : percentage > 80 ? 'warning' : '';

            return `
                <div class="budget-item">
                    <div class="budget-info">
                        <div class="budget-category">
                            ${category.icon} ${category.name}
                        </div>
                        <div class="budget-numbers">
                            <div class="budget-spent">${this.formatCurrency(spent)} / ${this.formatCurrency(budget.limit)}</div>
                            <div class="budget-actions">
                                <button class="budget-delete" onclick="app.deleteBudget('${categoryId}')">
                                    Löschen
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="budget-progress">
                        <div class="budget-progress-bar ${progressClass}" style="width: ${Math.min(percentage, 100)}%"></div>
                    </div>
                </div>
            `;
        }).join('');
    }

    addBudget() {
        const category = document.getElementById('budgetCategory').value;
        const limit = parseFloat(document.getElementById('budgetLimit').value);

        if (!category || !limit) return;

        this.budgets[category] = {
            limit,
            created: new Date().toISOString()
        };

        this.saveData();
        this.renderBudgets();
        this.closeBudgetModal();
        document.getElementById('budgetForm').reset();
        this.showNotification('Budget-Ziel gesetzt!', 'success');
    }

    deleteBudget(categoryId) {
        if (confirm('Möchten Sie dieses Budget-Ziel wirklich löschen?')) {
            delete this.budgets[categoryId];
            this.saveData();
            this.renderBudgets();
            this.showNotification('Budget-Ziel gelöscht', 'info');
        }
    }

    updateStatistics() {
        // Top Categories
        const topCategories = this.getTopCategories();
        const topCategoriesHtml = topCategories.map(cat => `
            <div class="category-stat">
                <span>${cat.icon} ${cat.name}</span>
                <span>${this.formatCurrency(cat.amount)}</span>
            </div>
        `).join('');
        document.getElementById('topCategories').innerHTML = topCategoriesHtml || '<p>Keine Daten</p>';

        // Month Comparison
        const comparison = this.getMonthComparison();
        document.getElementById('monthComparison').innerHTML = `
            <div class="stat-value">${comparison.trend}</div>
            <div class="stat-label">${comparison.label}</div>
        `;

        // Savings Rate
        const savingsRate = this.getSavingsRate();
        document.getElementById('savingsRate').innerHTML = `
            <div class="stat-value">${savingsRate}%</div>
            <div class="stat-label">der Einnahmen gespart</div>
        `;

        // Average Daily Expenses
        const avgExpenses = this.getAverageExpenses();
        document.getElementById('avgExpenses').innerHTML = `
            <div class="stat-value">${this.formatCurrency(avgExpenses)}</div>
            <div class="stat-label">pro Tag</div>
        `;
    }

    getTopCategories() {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const categoryTotals = {};
        
        this.transactions
            .filter(t => {
                const date = new Date(t.date);
                return t.type === 'expense' &&
                       date.getMonth() === currentMonth &&
                       date.getFullYear() === currentYear;
            })
            .forEach(t => {
                categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
            });

        return Object.entries(categoryTotals)
            .map(([categoryId, amount]) => {
                const category = this.getCategoryById('expense', categoryId);
                return category ? { ...category, amount } : null;
            })
            .filter(Boolean)
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 3);
    }

    getMonthComparison() {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

        const currentExpenses = this.getMonthlyExpenses(currentMonth, currentYear);
        const lastExpenses = this.getMonthlyExpenses(lastMonth, lastMonthYear);

        const difference = currentExpenses - lastExpenses;
        const percentage = lastExpenses > 0 ? (difference / lastExpenses) * 100 : 0;

        return {
            trend: percentage > 0 ? `+${Math.round(percentage)}%` : `${Math.round(percentage)}%`,
            label: 'im Vergleich zum Vormonat'
        };
    }

    getSavingsRate() {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        const income = this.getMonthlyIncome(currentMonth, currentYear);
        const expenses = this.getMonthlyExpenses(currentMonth, currentYear);

        if (income === 0) return 0;
        const savingsRate = ((income - expenses) / income) * 100;
        return Math.max(0, Math.round(savingsRate));
    }

    getAverageExpenses() {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentExpenses = this.transactions
            .filter(t => {
                const date = new Date(t.date);
                return t.type === 'expense' && date >= thirtyDaysAgo;
            })
            .reduce((sum, t) => sum + t.amount, 0);

        return recentExpenses / 30;
    }

    getMonthlyExpenses(month, year) {
        return this.transactions
            .filter(t => {
                const date = new Date(t.date);
                return t.type === 'expense' &&
                       date.getMonth() === month &&
                       date.getFullYear() === year;
            })
            .reduce((sum, t) => sum + t.amount, 0);
    }

    getMonthlyIncome(month, year) {
        return this.transactions
            .filter(t => {
                const date = new Date(t.date);
                return t.type === 'income' &&
                       date.getMonth() === month &&
                       date.getFullYear() === year;
            })
            .reduce((sum, t) => sum + t.amount, 0);
    }

    initCharts() {
        // Category Chart
        const categoryCtx = document.getElementById('categoryChart').getContext('2d');
        this.categoryChart = new Chart(categoryCtx, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        '#5e72e4',
                        '#2dce89',
                        '#f5365c',
                        '#fb6340',
                        '#11cdef',
                        '#172b4d',
                        '#8898aa'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });

        // Monthly Chart
        const monthlyCtx = document.getElementById('monthlyChart').getContext('2d');
        this.monthlyChart = new Chart(monthlyCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Einnahmen',
                        data: [],
                        borderColor: '#2dce89',
                        backgroundColor: 'rgba(45, 206, 137, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Ausgaben',
                        data: [],
                        borderColor: '#f5365c',
                        backgroundColor: 'rgba(245, 54, 92, 0.1)',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        this.updateCharts();
    }

    updateCharts() {
        // Update Category Chart
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const categoryData = {};
        
        this.transactions
            .filter(t => {
                const date = new Date(t.date);
                return t.type === 'expense' &&
                       date.getMonth() === currentMonth &&
                       date.getFullYear() === currentYear;
            })
            .forEach(t => {
                const category = this.getCategoryById('expense', t.category);
                if (category) {
                    categoryData[category.name] = (categoryData[category.name] || 0) + t.amount;
                }
            });

        this.categoryChart.data.labels = Object.keys(categoryData);
        this.categoryChart.data.datasets[0].data = Object.values(categoryData);
        this.categoryChart.update();

        // Update Monthly Chart
        const monthlyData = this.getMonthlyData();
        this.monthlyChart.data.labels = monthlyData.labels;
        this.monthlyChart.data.datasets[0].data = monthlyData.income;
        this.monthlyChart.data.datasets[1].data = monthlyData.expenses;
        this.monthlyChart.update();
    }

    getMonthlyData() {
        const months = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const labels = [];
        const income = [];
        const expenses = [];

        for (let i = 5; i >= 0; i--) {
            let month = currentMonth - i;
            let year = currentYear;
            
            if (month < 0) {
                month += 12;
                year--;
            }

            labels.push(months[month]);
            income.push(this.getMonthlyIncome(month, year));
            expenses.push(this.getMonthlyExpenses(month, year));
        }

        return { labels, income, expenses };
    }

    getCategoryById(type, id) {
        return this.categories[type].find(cat => cat.id === id);
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
    }

    showNotification(message, type = 'info') {
        const container = document.getElementById('notificationContainer');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span>${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
            <span>${message}</span>
        `;
        
        container.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    openBudgetModal() {
        document.getElementById('budgetModal').classList.add('show');
    }

    closeBudgetModal() {
        document.getElementById('budgetModal').classList.remove('show');
    }

    exportData() {
        const data = {
            transactions: this.transactions,
            budgets: this.budgets,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `budget-tracker-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showNotification('Daten erfolgreich exportiert!', 'success');
    }

    importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.transactions && Array.isArray(data.transactions)) {
                    this.transactions = data.transactions;
                }
                
                if (data.budgets && typeof data.budgets === 'object') {
                    this.budgets = data.budgets;
                }
                
                this.saveData();
                this.updateDashboard();
                this.renderTransactions();
                this.renderBudgets();
                this.updateStatistics();
                this.updateCharts();
                
                this.showNotification('Daten erfolgreich importiert!', 'success');
            } catch (error) {
                this.showNotification('Fehler beim Importieren der Daten', 'error');
            }
        };
        
        reader.readAsText(file);
    }

    clearAllData() {
        if (confirm('Möchten Sie wirklich ALLE Daten löschen? Diese Aktion kann nicht rückgängig gemacht werden!')) {
            this.transactions = [];
            this.budgets = {};
            this.saveData();
            this.updateDashboard();
            this.renderTransactions();
            this.renderBudgets();
            this.updateStatistics();
            this.updateCharts();
            this.showNotification('Alle Daten wurden gelöscht', 'info');
        }
    }

    saveData() {
        localStorage.setItem('transactions', JSON.stringify(this.transactions));
        localStorage.setItem('budgets', JSON.stringify(this.budgets));
    }
}

// Initialize app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new BudgetTracker();
});