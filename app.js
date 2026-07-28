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

console.log('🔥 Firebase connected');

// ============================================
// 📥 Get Card Data - فقط از Firebase
// ============================================
async function getCardData(empId) {
    try {
        const snapshot = await database.ref('employees/' + empId).once('value');
        const data = snapshot.val();
        
        if (data) {
            console.log('☁️ Loaded from Firebase:', empId);
            return data;
        }
    } catch(e) {
        console.error('Firebase error:', e);
    }
    
    return null;
}

// ============================================
// 💰 Deduct €1.00 - مستقیم توی Firebase
// ============================================
async function deductOneEuro(empId, currentData) {
    let salaryStr = currentData.salary || '0€';
    salaryStr = salaryStr.replace(/[^0-9.]/g, '');
    let salary = parseFloat(salaryStr) || 0;
    
    salary = Math.max(0, salary - 1);
    
    const newSalary = salary.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + '€';
    
    // مستقیم توی Firebase آپدیت کن
    try {
        await database.ref('employees/' + empId).update({
            salary: newSalary,
            lastAccessed: new Date().toISOString()
        });
        console.log('💰 €1.00 deducted from Firebase. New salary: ' + newSalary);
    } catch(e) {
        console.error('Firebase update error:', e);
    }
    
    // داده جدید رو برگردون
    return {
        ...currentData,
        salary: newSalary,
        lastAccessed: new Date().toISOString()
    };
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

console.log('✅ App.js Ready - Direct Firebase Mode');
