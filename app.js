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

async function getCardData(id) {
    const s = await database.ref('employees/' + id).once('value');
    return s.val();
}

async function deductOneEuro(id, d) {
    let n = parseFloat((d.salary || '0').replace(/[^0-9.]/g, '')) || 0;
    n = Math.max(0, n - 1);
    const ns = n.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + '€';
    await database.ref('employees/' + id).update({ salary: ns });
    return { ...d, salary: ns };
}

function hashPin(p) {
    let h = 0;
    for (let i = 0; i < p.length; i++) {
        h = ((h << 5) - h) + p.charCodeAt(i) * (i * 7 + 3);
        h |= 0;
    }
    return Math.abs(h).toString(36);
}
