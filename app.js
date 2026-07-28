// ============================================
// 🔥 Firebase Configuration - متصل به اپ قبلی employee-app-b7215
// ============================================
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyAYsu4Ji-eFHx55ARX6_4PRb5SRfx-jrhw",
    authDomain: "employee-app-b7215.firebaseapp.com",
    databaseURL: "https://employee-app-b7215-default-rtdb.firebaseio.com",
    projectId: "employee-app-b7215",
    storageBucket: "employee-app-b7215.appspot.com",
    messagingSenderId: "961058467244",
    appId: "1:961058467244:web:6b4af6cbb8270ef94e1e09"
};

// Initialize Firebase
firebase.initializeApp(FIREBASE_CONFIG);
const database = firebase.database();

console.log('🔥 Firebase connected to:', FIREBASE_CONFIG.projectId);

// ============================================
// 💾 Local Database (Fallback)
// ============================================
const DB_NAME = 'BankCardDB';
const APP_VERSION = '2.0.0';

function getLocalDB() {
    try {
        const db = localStorage.getItem(DB_NAME);
        return db ? JSON.parse(db) : {};
    } catch(e) {
        return {};
    }
}

function saveLocalDB(db) {
    try {
        localStorage.setItem(DB_NAME, JSON.stringify(db));
    } catch(e) {
        console.error('Local save error:', e);
    }
}

// ============================================
// ☁️ Save to Firebase
// ============================================
async function saveToFirebase(empId, data) {
    try {
        await database.ref('cards/' + empId).set(data);
        console.log('☁️ Saved to Firebase:', empId);
        return true;
    } catch(e) {
        console.error('Firebase save error:', e);
        return false;
    }
}

// ============================================
// 📥 Get Card Data (Firebase first, then Local)
// ============================================
async function getCardData(empId) {
    // 1. Try Firebase first
    try {
        const snapshot = await database.ref('cards/' + empId).once('value');
        const firebaseData = snapshot.val();
        
        if (firebaseData) {
            console.log('☁️ Loaded from Firebase:', empId);
            // Update local cache
            const localDB = getLocalDB();
            localDB[empId] = firebaseData;
            saveLocalDB(localDB);
            return firebaseData;
        }
    } catch(e) {
        console.log('Firebase read error, trying local...');
    }
    
    // 2. Fallback to LocalStorage
    const localDB = getLocalDB();
    if (localDB[empId]) {
        console.log('📦 Loaded from LocalStorage:', empId);
        return localDB[empId];
    }
    
    console.log('❌ No data found for:', empId);
    return null;
}

// ============================================
// 💰 Deduct €1.00 from REMAINDER balance
// ============================================
async function deductOneEuro(empId, currentData) {
    // Parse REMAINDER balance (نه Account Balance)
    let balanceStr = currentData.remainderBalance || currentData.accountBalance || '0';
    balanceStr = balanceStr.replace(/[^0-9.]/g, '');
    let balance = parseFloat(balanceStr) || 0;
    
    // Subtract €1.00
    balance = Math.max(0, balance - 1);
    
    // Format balance
    const newBalance = balance.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    
    // Update data - فقط remainderBalance کم میشه، accountBalance ثابت میمونه
    const updatedData = {
        ...currentData,
        remainderBalance: newBalance,
        lastAccessed: new Date().toISOString(),
        totalDeductions: (currentData.totalDeductions || 0) + 1
    };
    
    // Save to Firebase
    await saveToFirebase(empId, updatedData);
    
    // Save to LocalStorage
    const localDB = getLocalDB();
    localDB[empId] = updatedData;
    saveLocalDB(localDB);
    
    console.log('💰 €1.00 deducted from remainder. New remainder: €' + newBalance);
    console.log('💳 Account balance unchanged: €' + (currentData.accountBalance || '0'));
    
    return updatedData;
}

// ============================================
// 🔐 PIN Hashing
// ============================================
function hashPin(pin) {
    let h = 0;
    for (let i = 0; i < pin.length; i++) {
        h = ((h << 5) - h) + pin.charCodeAt(i) * (i * 7 + 3);
        h |= 0;
    }
    return Math.abs(h).toString(36);
}

// ============================================
// 🔔 Notification
// ============================================
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

function showSystemNotification(title, body) {
    if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
    }
    
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            body: body,
            icon: '💳',
            badge: '💳',
            vibrate: [200, 100, 200],
            tag: 'balance'
        });
    }
    
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(reg => {
            reg.showNotification(title, {
                body: body,
                icon: '💳',
                badge: '💳',
                vibrate: [200, 100, 200],
                tag: 'balance'
            });
        });
    }
}

// ============================================
// 📱 Service Worker Registration
// ============================================
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/NFC-Bank-Card-Reader/sw.js')
        .then(reg => console.log('✅ SW registered'))
        .catch(err => console.log('SW error:', err));
}

// First click notification permission
document.addEventListener('click', requestNotificationPermission, { once: true });

console.log('✅ NFC Bank Card Reader v' + APP_VERSION + ' Ready');
console.log('🔒 Firebase Project:', FIREBASE_CONFIG.projectId);
console.log('🔗 Connected to: employee-app-b7215');
