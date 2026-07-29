// ============================================
// 🔥 Firebase Configuration - employee-app-b7215
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

console.log('🔥 Firebase URL:', database.ref().toString());

// ============================================
// 📥 Get Card Data from employees/
// ============================================
async function getCardData(empId) {
    try {
        const snapshot = await database.ref('employees/' + empId).once('value');
        const data = snapshot.val();
        if (data) {
            console.log('☁️ Loaded from Firebase employees/' + empId);
            console.log('💰 Current salary:', data.salary);
        }
        return data;
    } catch(e) {
        console.error('Firebase error:', e);
        return null;
    }
}

// ============================================
// 💰 Deduct €1.00 from salary
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
    
    // آپدیت مستقیم توی Firebase
    await database.ref('employees/' + empId).update({ 
        salary: newSalary,
        lastAccessed: new Date().toISOString()
    });
    
    console.log('💰 €1.00 deducted!');
    console.log('   Old salary:', salaryStr);
    console.log('   New salary:', newSalary);
    console.log('📱 Check Firebase Console → employee-app-b7215 → employees/' + empId);
    
    return { ...currentData, salary: newSalary };
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
// 🔔 Notification Permission
// ============================================
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

document.addEventListener('click', requestNotificationPermission, { once: true });

console.log('✅ App.js Ready');
console.log('🔗 Project: employee-app-b7215');
console.log('📁 Path: employees/{empId}');
console.log('💰 Field: salary');
