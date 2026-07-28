// ===== تنظیمات =====
const DB_NAME = 'BankCardDB';
const APP_VERSION = '1.0.0';

// ===== دیتابیس محلی =====
function getDB() {
  try {
    const db = localStorage.getItem(DB_NAME);
    return db ? JSON.parse(db) : {};
  } catch(e) {
    return {};
  }
}

function saveDB(db) {
  try {
    localStorage.setItem(DB_NAME, JSON.stringify(db));
  } catch(e) {
    console.error('Save error:', e);
  }
}

function saveCardData(empId, data) {
  const db = getDB();
  db[empId] = data;
  saveDB(db);
  console.log('✅ Data saved for ID:', empId, data);
}

function getCardData(empId) {
  const db = getDB();
  console.log('🔍 Looking for ID:', empId, 'Found:', db[empId] ? 'Yes' : 'No');
  return db[empId] || null;
}

// ===== هش پین =====
function hashPin(pin) {
  let h = 0;
  for (let i = 0; i < pin.length; i++) {
    h = ((h << 5) - h) + pin.charCodeAt(i) * (i * 7 + 3);
    h |= 0;
  }
  return Math.abs(h).toString(36);
}

// ===== نوتیفیکیشن =====
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

// ===== ثبت Service Worker =====
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(reg => console.log('✅ SW registered'))
    .catch(err => console.log('SW error:', err));
}

document.addEventListener('click', requestNotificationPermission, { once: true });

console.log('✅ App.js loaded - Version ' + APP_VERSION);
