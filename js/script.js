// ========================================
// ALKE WALLET - JAVASCRIPT PRINCIPAL
// ========================================

// Simulación de base de datos en LocalStorage
const STORAGE_KEYS = {
    USER: 'alkeWalletUser',
    BALANCE: 'alkeWalletBalance',
    TRANSACTIONS: 'alkeWalletTransactions',
    CONTACTS: 'alkeWalletContacts'
};

// Usuarios de prueba
const USERS = {
    'admin': { username: 'admin', password: 'admin123', name: 'Administrador' },
    'usuario': { username: 'usuario', password: 'user123', name: 'Usuario Demo' }
};

// ========================================
// UTILITY FUNCTIONS
// ========================================

// Formatear número a moneda chilena
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0
    }).format(amount);
}

// Formatear fecha
function formatDate(date) {
    return new Date(date).toLocaleDateString('es-CL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Obtener usuario actual
function getCurrentUser() {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    return userStr ? JSON.parse(userStr) : null;
}

// Guardar usuario actual
function setCurrentUser(user) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

// Cerrar sesión
function logout() {
    localStorage.removeItem(STORAGE_KEYS.USER);
    window.location.href = 'login.html';
}

// Obtener saldo
function getBalance() {
    const balance = localStorage.getItem(STORAGE_KEYS.BALANCE);
    return balance ? parseFloat(balance) : 0;
}

// Guardar saldo
function setBalance(amount) {
    localStorage.setItem(STORAGE_KEYS.BALANCE, amount.toString());
}

// Obtener transacciones
function getTransactions() {
    const transactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return transactions ? JSON.parse(transactions) : [];
}

// Guardar transacciones
function saveTransactions(transactions) {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
}

// Agregar transacción
function addTransaction(type, amount, description, recipient = null) {
    const transactions = getTransactions();
    const currentBalance = getBalance();
    
    const transaction = {
        id: 'TRX' + Date.now(),
        type: type, // 'deposit', 'send', 'receive'
        amount: parseFloat(amount),
        description: description,
        recipient: recipient,
        date: new Date().toISOString(),
        balance: currentBalance
    };
    
    transactions.unshift(transaction);
    saveTransactions(transactions);
    return transaction;
}

// Obtener contactos
function getContacts() {
    const contacts = localStorage.getItem(STORAGE_KEYS.CONTACTS);
    return contacts ? JSON.parse(contacts) : getDefaultContacts();
}

// Contactos por defecto
function getDefaultContacts() {
    return [
        { id: 1, name: 'María González', email: 'maria.gonzalez@email.com', phone: '+56912345678' },
        { id: 2, name: 'Carlos Rodríguez', email: 'carlos.rodriguez@email.com', phone: '+56987654321' },
        { id: 3, name: 'Ana Martínez', email: 'ana.martinez@email.com', phone: '+56923456789' },
        { id: 4, name: 'Pedro Silva', email: 'pedro.silva@email.com', phone: '+56934567890' }
    ];
}

// Guardar contactos
function saveContacts(contacts) {
    localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
}

// Verificar autenticación
function checkAuth() {
    const user = getCurrentUser();
    if (!user && !window.location.pathname.includes('login.html')) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// ========================================
// LOGIN PAGE
// ========================================

if (window.location.pathname.includes('login.html')) {
    $(document).ready(function() {
        
        // Toggle password visibility
        $('#togglePassword').click(function() {
            const passwordField = $('#password');
            const icon = $(this).find('i');
            
            if (passwordField.attr('type') === 'password') {
                passwordField.attr('type', 'text');
                icon.removeClass('fa-eye').addClass('fa-eye-slash');
            } else {
                passwordField.attr('type', 'password');
                icon.removeClass('fa-eye-slash').addClass('fa-eye');
            }
        });
        
        // Login form submit
        $('#loginForm').submit(function(e) {
            e.preventDefault();
            
            const username = $('#username').val().trim();
            const password = $('#password').val();
            const rememberMe = $('#rememberMe').is(':checked');
            
            // Validar credenciales
            if (USERS[username] && USERS[username].password === password) {
                // Login exitoso
                const user = {
                    username: username,
                    name: USERS[username].name,
                    loginTime: new Date().toISOString()
                };
                
                setCurrentUser(user);
                
                // Animación de éxito
                $('body').fadeOut(300, function() {
                    window.location.href = 'menu.html';
                });
                
            } else {
                // Login fallido
                $('#errorText').text('Usuario o contraseña incorrectos');
                $('#errorMessage').removeClass('d-none').hide().fadeIn();
                
                // Shake animation
                $('.card').addClass('animate__animated animate__shakeX');
                setTimeout(function() {
                    $('.card').removeClass('animate__animated animate__shakeX');
                }, 1000);
            }
        });
    });
}

// ========================================
// MENU PAGE
// ========================================

if (window.location.pathname.includes('menu.html')) {
    $(document).ready(function() {
        checkAuth();
        
        const user = getCurrentUser();
        const balance = getBalance();
        
        // Mostrar nombre de usuario
        $('#navUsername, #welcomeUsername').text(user.name);
        
        // Mostrar saldo con animación
        $('#currentBalance').html(formatCurrency(0));
        $({value: 0}).animate({value: balance}, {
            duration: 1500,
            easing: 'swing',
            complete: function() {
                $('#currentBalance').html(formatCurrency(this.value));
            }
        });
        
        // Cargar transacciones recientes
        loadRecentTransactions();
        
        // Logout
        $('#logoutBtn').click(function(e) {
            e.preventDefault();
            if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
                logout();
            }
        });
    });
    
    function loadRecentTransactions() {
        const transactions = getTransactions().slice(0, 5);
        const container = $('#recentTransactions');
        
        if (transactions.length === 0) {
            return;
        }
        
        let html = '';
        transactions.forEach(function(trx) {
            const icon = trx.type === 'deposit' ? 'fa-arrow-down text-success' : 
                        trx.type === 'send' ? 'fa-arrow-up text-danger' : 
                        'fa-arrow-down text-info';
            
            const typeLabel = trx.type === 'deposit' ? 'Depósito' : 
                            trx.type === 'send' ? 'Envío' : 'Recepción';
            
            const amountClass = trx.type === 'send' ? 'text-danger' : 'text-success';
            const amountSign = trx.type === 'send' ? '-' : '+';
            
            html += `
                <div class="transaction-item d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center">
                        <div class="transaction-icon ${trx.type} me-3">
                            <i class="fas ${icon}"></i>
                        </div>
                        <div>
                            <div class="fw-bold">${typeLabel}</div>
                            <small class="text-muted">${formatDate(trx.date)}</small>
                        </div>
                    </div>
                    <div class="text-end">
                        <div class="fw-bold ${amountClass}">${amountSign}${formatCurrency(trx.amount)}</div>
                        <small class="text-muted">Saldo: ${formatCurrency(trx.balance)}</small>
                    </div>
                </div>
            `;
        });
        
        container.html(html);
    }
}

// ========================================
// DEPOSIT PAGE
// ========================================

if (window.location.pathname.includes('deposit.html')) {
    $(document).ready(function() {
        checkAuth();
        
        const user = getCurrentUser();
        const balance = getBalance();
        
        // Mostrar saldo actual
        $('#currentBalanceDeposit').text(formatCurrency(balance));
        
        // Quick amount buttons
        $('.quick-amount').click(function() {
            const amount = $(this).data('amount');
            $('#depositAmount').val(amount);
            $(this).addClass('active').siblings().removeClass('active');
        });
        
        // Deposit form submit
        $('#depositForm').submit(function(e) {
            e.preventDefault();
            
            const amount = parseFloat($('#depositAmount').val());
            const method = $('#depositMethod').val();
            const description = $('#depositDescription').val() || 'Depósito a cuenta';
            
            // Validaciones
            if (!amount || amount < 1000) {
                showMessage('danger', 'El monto mínimo es $1.000 CLP');
                return;
            }
            
            if (!method) {
                showMessage('danger', 'Debes seleccionar un método de depósito');
                return;
            }
            
            // Procesar depósito
            const newBalance = balance + amount;
            setBalance(newBalance);
            addTransaction('deposit', amount, description + ' - ' + getMethodLabel(method));
            
            // Mostrar modal de éxito
            $('#newBalanceModal').text(formatCurrency(newBalance));
            const modal = new bootstrap.Modal($('#successModal')[0]);
            modal.show();
            
            // Limpiar formulario
            $('#depositForm')[0].reset();
            $('.quick-amount').removeClass('active');
            
            // Actualizar saldo mostrado
            $('#currentBalanceDeposit').text(formatCurrency(newBalance));
        });
        
        // Logout
        $('#logoutBtn').click(function(e) {
            e.preventDefault();
            logout();
        });
    });
    
    function getMethodLabel(method) {
        const methods = {
            'transferencia': 'Transferencia Bancaria',
            'tarjeta': 'Tarjeta',
            'efectivo': 'Efectivo'
        };
        return methods[method] || method;
    }
    
    function showMessage(type, message) {
        const alertClass = type === 'success' ? 'alert-success' : 'alert-danger';
        const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
        
        $('#depositMessage').html(`
            <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
                <i class="fas ${icon} me-2"></i>${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `);
        
        setTimeout(function() {
            $('#depositMessage').fadeOut();
        }, 5000);
    }
}

// ========================================
// SEND MONEY PAGE
// ========================================

if (window.location.pathname.includes('sendmoney.html')) {
    $(document).ready(function() {
        checkAuth();
        
        const user = getCurrentUser();
        const balance = getBalance();
        
        // Mostrar saldo actual
        $('#currentBalanceSend').text(formatCurrency(balance));
        
        // Cargar contactos
        loadContacts();
        
        // Autocomplete con jQuery UI
        const contacts = getContacts();
        const contactNames = contacts.map(c => ({ label: c.name + ' (' + c.email + ')', value: c.name, email: c.email }));
        
        $('#contactSearch').autocomplete({
            source: contactNames,
            select: function(event, ui) {
                $('#recipientName').val(ui.item.value);
                $('#recipientEmail').val(ui.item.email);
                return false;
            }
        });
        
        // Send money form
        $('#sendMoneyForm').submit(function(e) {
            e.preventDefault();
            
            const recipientName = $('#recipientName').val().trim();
            const recipientEmail = $('#recipientEmail').val().trim();
            const amount = parseFloat($('#sendAmount').val());
            const description = $('#sendDescription').val() || 'Transferencia de fondos';
            const saveContact = $('#saveContact').is(':checked');
            
            // Validaciones
            if (!recipientName || !recipientEmail) {
                showSendMessage('danger', 'Debes completar todos los campos obligatorios');
                return;
            }
            
            if (!amount || amount < 100) {
                showSendMessage('danger', 'El monto mínimo es $100 CLP');
                return;
            }
            
            if (amount > balance) {
                showSendMessage('danger', 'Saldo insuficiente para realizar esta transferencia');
                return;
            }
            
            // Procesar envío
            const newBalance = balance - amount;
            setBalance(newBalance);
            addTransaction('send', amount, description, recipientName);
            
            // Guardar contacto si se solicitó
            if (saveContact) {
                const existingContacts = getContacts();
                const exists = existingContacts.some(c => c.email === recipientEmail);
                
                if (!exists) {
                    existingContacts.push({
                        id: Date.now(),
                        name: recipientName,
                        email: recipientEmail,
                        phone: ''
                    });
                    saveContacts(existingContacts);
                    loadContacts();
                }
            }
            
            // Mostrar modal de éxito
            $('#modalRecipient').text(recipientName);
            $('#modalAmount').text(formatCurrency(amount));
            $('#modalNewBalance').text(formatCurrency(newBalance));
            
            const modal = new bootstrap.Modal($('#sendSuccessModal')[0]);
            modal.show();
            
            // Limpiar formulario
            $('#sendMoneyForm')[0].reset();
            
            // Actualizar saldo
            $('#currentBalanceSend').text(formatCurrency(newBalance));
        });
        
        // Save contact button
        $('#saveContactBtn').click(function() {
            const name = $('#newContactName').val().trim();
            const email = $('#newContactEmail').val().trim();
            const phone = $('#newContactPhone').val().trim();
            
            if (!name || !email) {
                alert('Nombre y email son obligatorios');
                return;
            }
            
            const contacts = getContacts();
            contacts.push({
                id: Date.now(),
                name: name,
                email: email,
                phone: phone
            });
            
            saveContacts(contacts);
            loadContacts();
            
            // Cerrar modal y limpiar
            bootstrap.Modal.getInstance($('#addContactModal')[0]).hide();
            $('#addContactForm')[0].reset();
        });
        
        // Logout
        $('#logoutBtn').click(function(e) {
            e.preventDefault();
            logout();
        });
    });
    
    function loadContacts() {
        const contacts = getContacts();
        const container = $('#contactsList');
        
        if (contacts.length === 0) {
            container.html('<div class="p-3 text-center text-muted">No hay contactos guardados</div>');
            return;
        }
        
        let html = '';
        contacts.forEach(function(contact) {
            const initials = contact.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
            
            html += `
                <a href="#" class="list-group-item list-group-item-action contact-item" 
                   data-name="${contact.name}" data-email="${contact.email}">
                    <div class="d-flex align-items-center">
                        <div class="contact-avatar me-3">${initials}</div>
                        <div class="flex-grow-1">
                            <div class="fw-bold">${contact.name}</div>
                            <small class="text-muted">${contact.email}</small>
                        </div>
                        <i class="fas fa-chevron-right text-muted"></i>
                    </div>
                </a>
            `;
        });
        
        container.html(html);
        
        // Click en contacto
        $('.contact-item').click(function(e) {
            e.preventDefault();
            const name = $(this).data('name');
            const email = $(this).data('email');
            
            $('#recipientName').val(name);
            $('#recipientEmail').val(email);
            $('#sendAmount').focus();
        });
    }
    
    function showSendMessage(type, message) {
        const alertClass = type === 'success' ? 'alert-success' : 'alert-danger';
        const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
        
        $('#sendMessage').html(`
            <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
                <i class="fas ${icon} me-2"></i>${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `);
    }
}

// ========================================
// TRANSACTIONS PAGE
// ========================================

if (window.location.pathname.includes('transactions.html')) {
    $(document).ready(function() {
        checkAuth();
        
        const balance = getBalance();
        
        // Mostrar saldo
        $('#balanceDisplay').text(formatCurrency(balance));
        
        // Cargar transacciones
        loadTransactions();
        
        // Calcular estadísticas del mes
        calculateMonthlyStats();
        
        // Filtros
        $('#searchTransaction, #filterType, #filterPeriod').on('change keyup', function() {
            loadTransactions();
        });
        
        // Limpiar filtros
        $('#clearFilters').click(function() {
            $('#searchTransaction').val('');
            $('#filterType').val('');
            $('#filterPeriod').val('month');
            loadTransactions();
        });
        
        // Exportar (simulado)
        $('#exportBtn').click(function() {
            alert('Función de exportación próximamente. Se generará un archivo PDF con todas las transacciones.');
        });
        
        // Logout
        $('#logoutBtn').click(function(e) {
            e.preventDefault();
            logout();
        });
    });
    
    function loadTransactions() {
        let transactions = getTransactions();
        
        // Aplicar filtros
        const searchTerm = $('#searchTransaction').val().toLowerCase();
        const filterType = $('#filterType').val();
        const filterPeriod = $('#filterPeriod').val();
        
        // Filtrar por búsqueda
        if (searchTerm) {
            transactions = transactions.filter(t => 
                t.description.toLowerCase().includes(searchTerm) ||
                (t.recipient && t.recipient.toLowerCase().includes(searchTerm))
            );
        }
        
        // Filtrar por tipo
        if (filterType) {
            transactions = transactions.filter(t => t.type === filterType);
        }
        
        // Filtrar por período
        if (filterPeriod !== 'all') {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            
            transactions = transactions.filter(t => {
                const trxDate = new Date(t.date);
                
                switch(filterPeriod) {
                    case 'today':
                        return trxDate >= today;
                    case 'week':
                        const weekAgo = new Date(today);
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        return trxDate >= weekAgo;
                    case 'month':
                        const monthAgo = new Date(today);
                        monthAgo.setMonth(monthAgo.getMonth() - 1);
                        return trxDate >= monthAgo;
                    case 'year':
                        const yearAgo = new Date(today);
                        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
                        return trxDate >= yearAgo;
                    default:
                        return true;
                }
            });
        }
        
        const tbody = $('#transactionsTableBody');
        
        if (transactions.length === 0) {
            $('#loadingState').addClass('d-none');
            $('#emptyState').removeClass('d-none');
            tbody.empty();
            return;
        }
        
        $('#loadingState').addClass('d-none');
        $('#emptyState').addClass('d-none');
        
        let html = '';
        transactions.forEach(function(trx) {
            const typeIcon = trx.type === 'deposit' ? 'fa-arrow-down text-success' : 
                           trx.type === 'send' ? 'fa-arrow-up text-danger' : 
                           'fa-arrow-down text-info';
            
            const typeLabel = trx.type === 'deposit' ? 'Depósito' : 
                            trx.type === 'send' ? 'Envío' : 'Recepción';
            
            const amountClass = trx.type === 'send' ? 'text-danger' : 'text-success';
            const amountSign = trx.type === 'send' ? '-' : '+';
            
            const recipientLabel = trx.recipient || '-';
            
            html += `
                <tr onclick="showTransactionDetail('${trx.id}')">
                    <td>
                        <div>${new Date(trx.date).toLocaleDateString('es-CL')}</div>
                        <small class="text-muted">${new Date(trx.date).toLocaleTimeString('es-CL', {hour: '2-digit', minute: '2-digit'})}</small>
                    </td>
                    <td>
                        <i class="fas ${typeIcon} me-2"></i>
                        <span>${typeLabel}</span>
                    </td>
                    <td>${trx.description}</td>
                    <td>${recipientLabel}</td>
                    <td class="text-end ${amountClass} fw-bold">
                        ${amountSign}${formatCurrency(trx.amount)}
                    </td>
                    <td class="text-end text-muted">
                        ${formatCurrency(trx.balance)}
                    </td>
                </tr>
            `;
        });
        
        tbody.html(html);
    }
    
    function calculateMonthlyStats() {
        const transactions = getTransactions();
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const monthlyTransactions = transactions.filter(t => new Date(t.date) >= monthStart);
        
        let income = 0;
        let expenses = 0;
        
        monthlyTransactions.forEach(t => {
            if (t.type === 'deposit' || t.type === 'receive') {
                income += t.amount;
            } else if (t.type === 'send') {
                expenses += t.amount;
            }
        });
        
        $('#monthlyIncome').text(formatCurrency(income));
        $('#monthlyExpenses').text(formatCurrency(expenses));
    }
    
    // Hacer la función global para que pueda ser llamada desde el onclick
    window.showTransactionDetail = function(transactionId) {
        const transactions = getTransactions();
        const trx = transactions.find(t => t.id === transactionId);
        
        if (!trx) return;
        
        const typeLabel = trx.type === 'deposit' ? 'Depósito' : 
                        trx.type === 'send' ? 'Envío' : 'Recepción';
        
        const amountClass = trx.type === 'send' ? 'text-danger' : 'text-success';
        const amountSign = trx.type === 'send' ? '-' : '+';
        
        $('#detailDate').text(formatDate(trx.date));
        $('#detailId').text(trx.id);
        $('#detailType').html(`<span class="badge bg-primary">${typeLabel}</span>`);
        $('#detailAmount').html(`<span class="${amountClass}">${amountSign}${formatCurrency(trx.amount)}</span>`);
        $('#detailDescription').text(trx.description);
        
        const modal = new bootstrap.Modal($('#transactionDetailModal')[0]);
        modal.show();
    };
}

// ========================================
// INITIALIZE DEFAULT DATA
// ========================================

// Inicializar saldo por defecto si no existe
if (getBalance() === 0 && !localStorage.getItem(STORAGE_KEYS.BALANCE)) {
    setBalance(0);
}

// Inicializar contactos por defecto
if (!localStorage.getItem(STORAGE_KEYS.CONTACTS)) {
    saveContacts(getDefaultContacts());
}