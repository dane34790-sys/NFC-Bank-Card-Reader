// ============================================
// 🔥 Firebase Configuration
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

firebase.initializeApp(FIREBASE_CONFIG);
const database = firebase.database();

console.log('🔥 Firebase connected to:', FIREBASE_CONFIG.projectId);

// ============================================
// 💾 Local Database
// ============================================
const DB_NAME = 'BankCardDB';

function getLocalDB() {
    try { const db = localStorage.getItem(DB_NAME); return db ? JSON.parse(db) : {}; }
    catch(e) { return {}; }
}

function saveLocalDB(db) {
    try { localStorage.setItem(DB_NAME, JSON.stringify(db)); }
    catch(e) { console.error('Save error:', e); }
}

// ============================================
// ☁️ Save to Firebase
// ============================================
async function saveToFirebase(empId, data) {
    try {
        // فقط فیلدهایی که توی اپ قبلی هست رو آپدیت کن
        const updateData = {};
        if (data.salary !== undefined) updateData.salary = data.salary;
        if (data.status !== undefined) updateData.status = data.status;
        if (data.remainderBalance !== undefined) updateData.remainderBalance = data.remainderBalance;
        if (data.accountBalance !== undefined) updateData.accountBalance = data.accountBalance;
        if (data.lastAccessed !== undefined) updateData.lastAccessed = data.lastAccessed;
        if (data.totalDeductions !== undefined) updateData.totalDeductions = data.totalDeductions;
        
        await database.ref('employees/' + empId).update(updateData);
        console.log('☁️ Updated Firebase employees/' + empId, updateData);
        return true;
    } catch(e) {
        console.error('Firebase save error:', e);
        return false;
    }
}

// ============================================
// 📥 Get Card Data
// ============================================
async function getCardData(empId) {
    try {
        const snapshot = await database.ref('employees/' + empId).once('value');
        const firebaseData = snapshot.val();
        
        if (firebaseData) {
            console.log('☁️ Loaded from Firebase:', empId);
            const localDB = getLocalDB();
            localDB[empId] = firebaseData;
            saveLocalDB(localDB);
            return firebaseData;
        }
    } catch(e) {
        console.log('Firebase error, trying local...');
    }
    
    const localDB = getLocalDB();
    if (localDB[empId]) {
        console.log('📦 Loaded from LocalStorage:', empId);
        return localDB[empId];
    }
    
    return null;
}

// ============================================
// 💰 Deduct €1.00 from SALARY
// ============================================
async function deductOneEuro(empId, currentData) {
    // توی اپ قبلی، موجودی توی فیلد salary هست
    let salaryStr = currentData.salary || currentData.remainderBalance || currentData.accountBalance || '0';
    salaryStr = salaryStr.replace(/[^0-9.]/g, '');
    let salary = parseFloat(salaryStr) || 0;
    
    salary = Math.max(0, salary - 1);
    
    const newSalary = salary.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + '€';
    
    const updatedData = {
        ...currentData,
        salary: newSalary,
        remainderBalance: newSalary,
        lastAccessed: new Date().toISOString(),
        totalDeductions: (currentData.totalDeductions || 0) + 1
    };
    
    await saveToFirebase(empId, updatedData);
    
    const localDB = getLocalDB();
    localDB[empId] = updatedData;
    saveLocalDB(localDB);
    
    console.log('💰 €1.00 deducted. New salary: ' + newSalary);
    
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

console.log('✅ NFC Bank Card Reader Ready');
console.log('🔗 Connected to: employee-app-b7215');
console.log('📁 Path: employees/ | Field: salary');
