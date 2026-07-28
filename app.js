// ============================================
// 🔥 Firebase Configuration - متصل به اپ قبلی
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
// ☁️ Save to Firebase (مسیر employees/)
// ============================================
async function saveToFirebase(empId, data) {
    try {
        await database.ref('employees/' + empId).update(data);
        console.log('☁️ Saved to Firebase employees/' + empId);
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
    // 1. Try Firebase first - از مسیر employees/
    try {
        const snapshot = await database.ref('employees/' + empId).once('value');
        const firebaseData = snapshot.val();
        
        if (firebaseData) {
            console.log('☁️ Loaded from Firebase employees/' + empId);
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
    let balanceStr = currentData.remainderBalance || currentData.accountBalance || '0';
    balanceStr = balanceStr.replace(/[^0-9.]/g, '');
    let balance = parseFloat(balanceStr) || 0;
    
    balance = Math.max(0, balance - 1);
    
    const newBalance = balance.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    
    const updatedData = {
        ...currentData,
        remainderBalance: newBalance,
        lastAccessed: new Date().toISOString(),
        totalDeductions: (currentData.totalDeductions || 0) + 1
    };
    
    await saveToFirebase(empId, updatedData);
    
    const localDB = getLocalDB();
    localDB[empId] = updatedData;
    saveLocalDB(localDB);
    
    console.log('💰 €1.00 deducted. New remainder: €' + newBalance);
    
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
    if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body, icon: '💳', vibrate: [200, 100, 200] });
    }
}

// ============================================
// 📱 Service Worker
// ============================================
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/NFC-Bank-Card-Reader/sw.js')
        .then(reg => console.log('✅ SW registered'))
        .catch(err => console.log('SW error:', err));
}

document.addEventListener('click', requestNotificationPermission, { once: true });

console.log('✅ NFC Bank Card Reader v' + APP_VERSION + ' Ready');
console.log('🔗 Connected to: employee-app-b7215');
console.log('📁 Path: employees/');
