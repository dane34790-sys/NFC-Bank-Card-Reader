// ============================================
// ===== FIREBASE CONFIG =====
// ============================================
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyAYsu4Ji-eFHx55ARX6_4PRb5SRfx-jrhw",
    authDomain: "employee-app-b7215.firebaseapp.com",
    databaseURL: "https://employee-app-b7215-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "employee-app-b7215",
    storageBucket: "employee-app-b7215.appspot.com",
    messagingSenderId: "961058467244",
    appId: "1:961058467244:web:6b4af6cbb8270ef94e1e09"
};

firebase.initializeApp(FIREBASE_CONFIG);
const database = firebase.database();

console.log('🔥 Firebase Connected');

// ============================================
// ===== داده تست =====
// ============================================
const TEST_DATA = {
    '1783340149960': {
        empId: '1783340149960',
        cardNumber: '5232242096782922',
        accountName: 'MAZDAK MONSHIZADEH',
        nameBank: 'COMMERZBANK',
        salary: '€8,538,616',
        accountBalance: 8538616,
        remainderBalance: 8538606,
        securityKey: 'Delta789032Delta',
        zipCode: 'De65590',
        cvv2: '522',
        lineCard: 'Hannover5690',
        phone: '+989920872851',
        cardStatus: 'Online',
        status: 'ONLINE',
        pinHash: '1a2b3c4d'
    },
    '111111111111': {
        empId: '111111111111',
        cardNumber: '5232242096782922',
        accountName: 'MAZDAK MONSHIZADEH',
        nameBank: 'COMMERZBANK',
        salary: '€8,538,616',
        accountBalance: 8538616,
        remainderBalance: 8538606,
        securityKey: 'Delta789032Delta',
        zipCode: 'De65590',
        cvv2: '522',
        lineCard: 'Hannover5690',
        phone: '+989920872851',
        cardStatus: 'Online',
        status: 'ONLINE',
        pinHash: '1a2b3c4d'
    }
};

// ============================================
// ===== توابع اصلی =====
// ============================================

async function getCardData(id) {
    try {
        const snapshot = await database.ref('employees/' + id).once('value');
        const data = snapshot.val();
        if (data) {
            console.log('✅ Data from Firebase:', data);
            return data;
        }
    } catch (err) {
        console.warn('⚠️ Firebase error:', err);
    }
    
    if (TEST_DATA[id]) {
        console.log('✅ Using test data for:', id);
        return TEST_DATA[id];
    }
    
    return null;
}

async function deductOneEuro(id, data) {
    try {
        let currentBalance = 0;
        if (data.salary) {
            currentBalance = parseFloat(String(data.salary).replace(/[^0-9.]/g, '')) || 0;
        } else if (data.accountBalance) {
            currentBalance = parseFloat(String(data.accountBalance).replace(/[^0-9.]/g, '')) || 0;
        }
        
        let newBalance = Math.max(0, currentBalance - 1);
        let newBalanceStr = '€' + newBalance.toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
        
        try {
            await database.ref('employees/' + id).update({
                salary: newBalanceStr,
                accountBalance: newBalance,
                remainderBalance: Math.max(0, newBalance - 10),
                lastFeeDate: Date.now()
            });
        } catch (err) {
            console.warn('⚠️ Could not update Firebase:', err);
        }
        
        return {
            ...data,
            salary: newBalanceStr,
            accountBalance: newBalance
        };
    } catch (err) {
        console.error('❌ Error deducting fee:', err);
        return data;
    }
}

function hashPin(pin) {
    const salted = pin + 'CommerzbankSalt2024';
    let hash = 0;
    for (let i = 0; i < salted.length; i++) {
        const char = salted.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(36) + 'x' + pin.length;
}

// ============================================
// ===== متغیرها (فقط یک بار تعریف) =====
// ============================================
let currentEmpId = null;
let enteredPin = '';  // ← تغییر نام به enteredPin
let isProcessing = false;

// ============================================
// ===== توابع UI =====
// ============================================

function updateStatus(text, color = '#ffffff') {
    const el = document.getElementById('statusText');
    if (el) {
        el.textContent = text;
        el.style.color = color;
    }
    console.log('📊 Status:', text);
}

function addDebug(text, type = 'info') {
    const content = document.getElementById('debugContent');
    if (!content) return;
    const line = document.createElement('div');
    line.className = `debug-line ${type}`;
    const time = new Date().toLocaleTimeString();
    line.textContent = `[${time}] ${text}`;
    content.appendChild(line);
    content.scrollTop = content.scrollHeight;
    console.log(`[${type}]`, text);
}

function toggleDebug() {
    const box = document.getElementById('debugBox');
    if (box) {
        box.classList.toggle('active');
        if (box.classList.contains('active')) {
            document.getElementById('debugContent').innerHTML = '';
            addDebug('🚀 Debug mode activated', 'info');
        }
    }
}

function hideAll() {
    const bankCard = document.getElementById('bankCard');
    const fullInfo = document.getElementById('fullInfo');
    const feeNotice = document.getElementById('feeNotice');
    if (bankCard) bankCard.classList.add('hidden');
    if (fullInfo) fullInfo.classList.add('hidden');
    if (feeNotice) feeNotice.classList.add('hidden');
}

// ============================================
// ===== PIN Dialog =====
// ============================================

function showPinDialog() {
    console.log('🔐 Showing PIN dialog...');
    addDebug('🔐 درخواست PIN', 'info');
    
    const overlay = document.getElementById('pinOverlay');
    if (!overlay) {
        console.error('❌ pinOverlay not found!');
        return;
    }
    
    overlay.style.display = 'flex';
    overlay.style.visibility = 'visible';
    overlay.style.opacity = '1';
    overlay.classList.remove('hidden');
    
    enteredPin = '';  // ← استفاده از enteredPin
    
    const keypad = document.getElementById('pinKeypad');
    if (keypad) {
        const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9, '⌫', 0, '✓'];
        keypad.innerHTML = keys.map(k => {
            let cls = 'pin-key';
            if (k === '⌫') cls += ' clear';
            if (k === '✓') cls += ' enter';
            return `<button class="${cls}" onclick="pressPinKey('${k}')">${k}</button>`;
        }).join('');
    }
    
    updatePinDots();
    updateStatus('🔐 Enter 4-digit PIN', '#ffd700');
}

function closePin() {
    console.log('🔐 Closing PIN dialog...');
    const overlay = document.getElementById('pinOverlay');
    if (overlay) {
        overlay.style.display = 'none';
        overlay.style.visibility = 'hidden';
        overlay.style.opacity = '0';
        overlay.classList.add('hidden');
    }
    enteredPin = '';
}

function pressPinKey(key) {
    console.log('🔑 Pressed:', key);
    
    if (key === '⌫') {
        enteredPin = enteredPin.slice(0, -1);
    } else if (key === '✓') {
        if (enteredPin.length === 4) {
            verifyPin();
        } else {
            updateStatus('⚠️ PIN must be 4 digits', '#ff9800');
            addDebug('⚠️ PIN باید ۴ رقم باشد', 'warning');
        }
        return;
    } else if (enteredPin.length < 4) {
        enteredPin += key;
    }
    updatePinDots();
}

function updatePinDots() {
    const dots = document.getElementById('pinDots');
    if (dots) {
        dots.textContent = '●'.repeat(enteredPin.length) + '○'.repeat(4 - enteredPin.length);
    }
}

// ============================================
// ===== Verify PIN =====
// ============================================

async function verifyPin() {
    if (isProcessing) return;
    isProcessing = true;
    
    console.log('🔐 Verifying PIN...', enteredPin);
    addDebug('🔐 در حال بررسی PIN: ' + enteredPin, 'info');
    
    if (!currentEmpId) {
        updateStatus('❌ No employee ID', '#f44336');
        addDebug('❌ شناسه کارمند موجود نیست', 'error');
        isProcessing = false;
        return;
    }
    
    try {
        let cardData = await getCardData(currentEmpId);
        if (!cardData) {
            updateStatus('❌ Data not found', '#f44336');
            addDebug('❌ داده پیدا نشد', 'error');
            isProcessing = false;
            return;
        }
        
        // ✅ حالت تست: هر PIN ای قبول میشه
        addDebug('✅ PIN قبول شد (حالت تست)', 'success');
        closePin();
        
        const isOnline = cardData.cardStatus === 'Online' || cardData.status === 'ONLINE';
        addDebug(`🌐 وضعیت کارت: ${isOnline ? 'ONLINE' : 'OFFLINE'}`, 'info');
        
        if (isOnline) {
            updateStatus('💰 Processing €1.00 fee...', '#ff9800');
            addDebug('💰 در حال کسر ۱ یورو...', 'warning');
            cardData = await deductOneEuro(currentEmpId, cardData);
            addDebug('💰 ۱ یورو کسر شد', 'warning');
            
            const feeNotice = document.getElementById('feeNotice');
            if (feeNotice) {
                feeNotice.classList.remove('hidden');
                setTimeout(() => {
                    feeNotice.classList.add('hidden');
                }, 4000);
            }
        }
        
        showCardInfo(cardData);
        showInternalNotification(cardData);
        
        if (isOnline) {
            updateStatus('✅ Access Granted - €1.00 deducted', '#4caf50');
        } else {
            updateStatus('✅ Access Granted - Offline Mode', '#2196f3');
        }
        
        addDebug('✅ فرآیند کامل شد', 'success');
        
    } catch (err) {
        console.error('❌ Verify error:', err);
        addDebug('❌ خطا: ' + err.message, 'error');
        updateStatus('❌ Error occurred', '#f44336');
    }
    
    isProcessing = false;
}

// ============================================
// ===== Show Card Info =====
// ============================================

function showCardInfo(data) {
    console.log('📋 Showing card info...');
    addDebug('📋 نمایش اطلاعات کارت', 'info');
    
    const statusText = document.getElementById('cardStatusText');
    if (statusText) {
        statusText.textContent = '🟢 ONLINE CARD';
        statusText.style.background = 'rgba(76,175,80,0.2)';
        statusText.style.color = '#4caf50';
        statusText.style.border = '1px solid #4caf50';
    }
    
    const bankName = document.getElementById('bankName');
    const cardNumber = document.getElementById('cardNumberDisplay');
    const cardHolder = document.getElementById('cardHolder');
    const balanceDisplay = document.getElementById('balanceDisplay');
    const bankCard = document.getElementById('bankCard');
    
    if (bankName) bankName.textContent = data.nameBank || 'COMMERZBANK';
    if (cardNumber) {
        const num = data.cardNumber || '5232242096782922';
        cardNumber.textContent = '•••• •••• •••• ' + String(num).slice(-4);
    }
    if (cardHolder) cardHolder.textContent = (data.accountName || 'MAZDAK MONSHIZADEH').toUpperCase();
    if (balanceDisplay) {
        balanceDisplay.textContent = data.salary || '€8,538,616';
    }
    if (bankCard) bankCard.classList.remove('hidden');
    
    const infoContent = document.getElementById('infoContent');
    if (infoContent) {
        infoContent.innerHTML = `
            <div style="color:#ffd700; margin-bottom:3px;">🌐 Status: <span style="color:#4caf50;">${data.cardStatus || data.status || 'Online'}</span></div>
            <div style="color:#ffd700; margin-bottom:3px;">🏛️ Name Bank: <span style="color:#4caf50;">${data.nameBank || 'COMMERZBANK'}</span></div>
            <div style="color:#ffd700; margin-bottom:3px;">👤 Account Name: <span style="color:#4caf50;">${data.accountName || 'MAZDAK MONSHIZADEH'}</span></div>
            <div style="color:#ffd700; margin-bottom:3px;">💳 Card Number: <span style="color:#4caf50;">${data.cardNumber || '5232242096782922'}</span></div>
            <div style="color:#ffd700; margin-bottom:3px;">💰 Account Balance: <span style="color:#4caf50;">${data.salary || data.accountBalance || '€8,538,616'}</span></div>
            <div style="color:#ffd700; margin-bottom:3px;">💰 Remainder Balance: <span style="color:#4caf50;">${data.remainderBalance || '€8,538,606'}</span></div>
            <div style="color:#ffd700; margin-bottom:3px;">🔑 Security Key: <span style="color:#4caf50;">${data.securityKey || 'Delta789032Delta'}</span></div>
            <div style="color:#ffd700; margin-bottom:3px;">📍 Zip Code: <span style="color:#4caf50;">${data.zipCode || 'De65590'}</span></div>
            <div style="color:#ffd700; margin-bottom:3px;">🔒 Cvv2: <span style="color:#4caf50;">${data.cvv2 || '522'}</span></div>
            <div style="color:#ffd700; margin-bottom:3px;">📋 Line Card: <span style="color:#4caf50;">${data.lineCard || 'Hannover5690'}</span></div>
            <div style="color:#ffd700; margin-bottom:3px;">📞 Phone: <span style="color:#4caf50;">${data.phone || '+989920872851'}</span></div>
            <div style="color:#ffd700; margin-bottom:3px;">🆔 Employee ID: <span style="color:#4caf50;">${data.empId || currentEmpId || '111111111111'}</span></div>
        `;
        document.getElementById('fullInfo').classList.remove('hidden');
    }
    
    addDebug('✅ اطلاعات کارت نمایش داده شد', 'success');
}

function showInternalNotification(data) {
    const notif = document.getElementById('notification');
    const notifBalance = document.getElementById('notifBalance');
    
    if (notifBalance) {
        notifBalance.textContent = data.salary || data.remainderBalance || data.accountBalance || '€8,538,616';
    }
    
    if (notif) {
        notif.classList.remove('hidden');
        setTimeout(() => {
            notif.classList.add('hidden');
        }, 6000);
    }
    
    if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
    }
}

// ============================================
// ===== Start Reading NFC =====
// ============================================

async function startReading() {
    console.log('📡 Starting NFC reader...');
    addDebug('📡 شروع اسکن NFC...', 'info');
    
    hideAll();
    updateStatus('📡 Tap card...', '#ffd700');
    
    try {
        if (!('NDEFReader' in window)) {
            updateStatus('❌ NFC not supported', '#f44336');
            addDebug('❌ مرورگر از NFC پشتیبانی نمیکند', 'error');
            return;
        }
        
        const reader = new NDEFReader();
        await reader.scan();
        addDebug('✅ اسکنر فعال شد', 'success');
        
        reader.onreading = async (e) => {
            console.log('📱 Card detected!');
            addDebug('📱 کارت پیدا شد!', 'success');
            
            if (!e.message || !e.message.records) {
                updateStatus('❌ Empty card', '#f44336');
                addDebug('❌ کارت خالی است', 'error');
                return;
            }
            
            let isBankCard = false;
            let empIdFromCard = null;
            
            for (let i = 0; i < e.message.records.length; i++) {
                const record = e.message.records[i];
                
                if (record.recordType !== 'text' && record.recordType !== 'mime') continue;
                
                try {
                    const text = new TextDecoder().decode(record.data);
                    console.log('📄 Record:', text);
                    
                    if (text === 'Mastercard_Commerzbank') {
                        isBankCard = true;
                        addDebug('✅ کارت بانکی شناسایی شد', 'success');
                    }
                    
                    // پشتیبانی از هر دو فرمت
                    if (text.includes('=') && (text.includes('?') || text.includes(';'))) {
                        const clean = text.replace(/[?;]/g, '');
                        const parts = clean.split('=');
                        if (parts.length >= 2) {
                            // اگر کارت‌نمبر اول باشه یا دوم
                            if (parts[0].length > 10) {
                                empIdFromCard = parts[1];
                            } else {
                                empIdFromCard = parts[0];
                            }
                            addDebug(`✅ شناسه کارمند: ${empIdFromCard}`, 'success');
                        }
                    }
                } catch (decodeErr) {
                    console.warn('Decode error:', decodeErr);
                }
            }
            
            if (!isBankCard || !empIdFromCard) {
                updateStatus('❌ Invalid card', '#f44336');
                addDebug(`❌ خطا: isBankCard=${isBankCard}, empId=${empIdFromCard}`, 'error');
                return;
            }
            
            currentEmpId = empIdFromCard;
            addDebug(`🔍 جستجو برای: ${currentEmpId}`, 'info');
            
            // ✅ مستقیماً PIN رو نمایش بده
            updateStatus('🔐 Enter PIN', '#ffd700');
            showPinDialog();
        };
        
    } catch (err) {
        console.error('❌ NFC Error:', err);
        addDebug(`❌ خطای NFC: ${err.message}`, 'error');
        updateStatus('Error: ' + err.message, '#f44336');
    }
}

// ============================================
// ===== Test Function =====
// ============================================

async function testRead() {
    addDebug('🧪 شروع تست...', 'info');
    updateStatus('🧪 Testing...', '#ffd700');
    
    try {
        if (!('NDEFReader' in window)) {
            addDebug('❌ NFC پشتیبانی نمیشود', 'error');
            updateStatus('❌ NFC not supported', '#f44336');
            return;
        }
        
        const reader = new NDEFReader();
        await reader.scan();
        addDebug('✅ اسکنر تست فعال شد', 'success');
        
        reader.onreading = (e) => {
            addDebug('✅ کارت در تست پیدا شد!', 'success');
            
            if (!e.message || !e.message.records) {
                addDebug('❌ رکوردی پیدا نشد', 'error');
                return;
            }
            
            addDebug(`📝 تعداد رکوردها: ${e.message.records.length}`, 'info');
            
            for (let i = 0; i < e.message.records.length; i++) {
                const record = e.message.records[i];
                addDebug(`📌 رکورد ${i+1}: نوع=${record.recordType}`, 'info');
                
                if (record.recordType === 'text' || record.recordType === 'mime') {
                    try {
                        const text = new TextDecoder().decode(record.data);
                        addDebug(`   متن: "${text}"`, 'info');
                    } catch (err) {
                        addDebug(`   ❌ خطا: ${err.message}`, 'error');
                    }
                }
            }
            
            updateStatus('✅ تست کامل شد', '#4caf50');
        };
        
    } catch (err) {
        addDebug(`❌ خطای تست: ${err.message}`, 'error');
        updateStatus('❌ تست خطا داد', '#f44336');
    }
}

// ============================================
// ===== INIT =====
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 App loaded');
    
    const statusBar = document.getElementById('statusBar');
    if (statusBar) {
        const testBtn = document.createElement('button');
        testBtn.className = 'debug-btn';
        testBtn.textContent = '🧪 تست سریع کارت';
        testBtn.style.marginTop = '5px';
        testBtn.onclick = testRead;
        statusBar.parentNode.insertBefore(testBtn, statusBar.nextSibling);
    }
    
    setTimeout(() => {
        const debugBox = document.getElementById('debugBox');
        if (debugBox) {
            debugBox.classList.add('active');
            addDebug('🚀 اپ آماده است', 'success');
            addDebug('📱 روی صفحه بزنید تا اسکن شروع شود', 'info');
            addDebug('🔑 هر PIN ۴ رقمی قبول میشه (حالت تست)', 'warning');
        }
    }, 500);
    
    updateStatus('🔒 Ready to Scan', '#ffffff');
});

console.log('✅ NFC Bank Card Reader Ready');
console.log('🔑 هر PIN ۴ رقمی قبول میشه (حالت تست)');
