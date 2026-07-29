<!DOCTYPE html>
<html lang="fa">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🔧 Admin Panel</title>
    <script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-database-compat.js"></script>
    <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body {
            background: #0a0a1a;
            color: #fff;
            font-family: Arial, sans-serif;
            padding: 20px;
        }
        .container {
            max-width: 500px;
            margin: 0 auto;
            background: #1a1a3e;
            padding: 25px;
            border-radius: 20px;
            border: 1px solid #ffd70033;
        }
        h1 { color: #ffd700; text-align:center; margin-bottom:20px; }
        label { display:block; color:#ffd700; font-size:12px; margin-top:12px; margin-bottom:4px; }
        input, select {
            width:100%; padding:10px; border-radius:8px; border:1px solid #333;
            background:#0a0a1a; color:#fff; font-size:14px;
        }
        button {
            width:100%; padding:12px; margin-top:10px; border:none; border-radius:10px;
            font-size:16px; font-weight:bold; cursor:pointer;
            transition: all 0.2s;
        }
        button:active { transform:scale(0.96); }
        .btn-save { background:#4caf50; color:#fff; }
        .btn-write { background:#ffd700; color:#000; }
        .btn-test { background:#ff9800; color:#fff; }
        .btn-danger { background:#f44336; color:#fff; }
        .btn-load { background:#2196f3; color:#fff; }
        .status {
            margin-top:15px; padding:10px; background:#00000044; border-radius:8px;
            text-align:center; font-size:13px; color:#aaa;
        }
        .row { display:flex; gap:10px; }
        .row input { flex:1; }
        .btn-row { display:flex; gap:10px; }
        .btn-row button { flex:1; }
        .card-preview {
            margin-top: 15px;
            padding: 15px;
            background: linear-gradient(145deg, #0d0d24, #1a1a3e);
            border-radius: 15px;
            border: 1px solid rgba(255,215,0,0.2);
            display: none;
        }
        .card-preview.show { display: block; }
        .card-preview h3 { color: #ffd700; text-align:center; margin-bottom:10px; }
        .card-preview .item { 
            padding: 4px 0; 
            border-bottom: 1px solid rgba(255,255,255,0.05);
            font-size: 13px;
            color: #ccc;
        }
        .card-preview .item span { color: #4caf50; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔧 Admin Panel</h1>
        <p style="color:#4caf50; font-size:12px; text-align:center;">✅ پروژه: nfc-bank-card-reader</p>

        <!-- ===== فرم ===== -->
        <label>🆔 Employee ID</label>
        <input type="text" id="empId" value="1783340149960">

        <label>👤 Account Name</label>
        <input type="text" id="accountName" value="MAZDAK MONSHIZADEH">

        <label>💳 Card Number</label>
        <input type="text" id="cardNumber" value="5232242096782922">

        <label>💰 Account Balance</label>
        <input type="text" id="accountBalance" value="8,538,616">

        <label>💰 Remainder Balance</label>
        <input type="text" id="remainderBalance" value="8,538,605">

        <label>🔑 Security Key</label>
        <input type="text" id="securityKey" value="Delta789032Delta">

        <label>📍 Zip Code</label>
        <input type="text" id="zipCode" value="De65590">

        <label>🔒 Cvv2</label>
        <input type="text" id="cvv2" value="522">

        <label>📋 Line Card</label>
        <input type="text" id="lineCard" value="Hannover5690">

        <label>📞 Phone</label>
        <input type="text" id="phone" value="+989920872851">

        <label>🔐 PIN (4 digits)</label>
        <input type="text" id="pin" value="1234" maxlength="4">

        <!-- ===== دکمه‌ها ===== -->
        <div class="btn-row">
            <button class="btn-save" onclick="saveData()">💾 ذخیره</button>
            <button class="btn-write" onclick="writeToCard()">📝 رایت روی کارت</button>
        </div>
        <div class="btn-row">
            <button class="btn-load" onclick="loadData()">📥 بارگذاری</button>
            <button class="btn-danger" onclick="clearAll()">🗑️ پاک کردن</button>
        </div>
        <button class="btn-test" onclick="testSave()">🧪 تست Firebase</button>

        <div class="status" id="status">⏳ آماده...</div>

        <!-- ===== پیش‌نمایش کارت ===== -->
        <div class="card-preview" id="cardPreview">
            <h3>💳 COMMERZBANK</h3>
            <div class="item">🌐 Status: <span id="pStatus">Online</span></div>
            <div class="item">🏛️ Name Bank: <span id="pBank">COMMERZBANK</span></div>
            <div class="item">👤 Account Name: <span id="pName">MAZDAK MONSHIZADEH</span></div>
            <div class="item">💳 Card Number: <span id="pCard">5232242096782922</span></div>
            <div class="item">💰 Account Balance: <span id="pBalance">€8,538,616</span></div>
            <div class="item">💰 Remainder Balance: <span id="pRemainder">8,538,605</span></div>
            <div class="item">🔑 Security Key: <span id="pKey">Delta789032Delta</span></div>
            <div class="item">📍 Zip Code: <span id="pZip">De65590</span></div>
            <div class="item">🔒 Cvv2: <span id="pCvv">522</span></div>
            <div class="item">📋 Line Card: <span id="pLine">Hannover5690</span></div>
            <div class="item">📞 Phone: <span id="pPhone">+989920872851</span></div>
            <div class="item">🆔 Employee ID: <span id="pEmpId">1783340149960</span></div>
        </div>
    </div>

    <script>
        // ===== Firebase Config =====
        const firebaseConfig = {
            apiKey: "AIzaSyDj97UCS7ZuLtpQJFACD0zesDR8gVK6RYA",
            authDomain: "nfc-bank-card-reader.firebaseapp.com",
            databaseURL: "https://nfc-bank-card-reader-default-rtdb.europe-west1.firebasedatabase.app",
            projectId: "nfc-bank-card-reader",
            storageBucket: "nfc-bank-card-reader.firebasestorage.app",
            messagingSenderId: "961058467244",
            appId: "1:961058467244:web:6b4af6cbb8270ef94e1e09"
        };

        firebase.initializeApp(firebaseConfig);
        const db = firebase.database();
        console.log('🔥 Firebase Connected:', firebaseConfig.projectId);

        // ===== توابع =====
        function showStatus(msg, color = '#aaa') {
            const el = document.getElementById('status');
            el.textContent = msg;
            el.style.color = color;
        }

        function hashPin(pin) {
            let hash = 0;
            for (let i = 0; i < pin.length; i++) {
                hash = ((hash << 5) - hash) + pin.charCodeAt(i) * (i + 3);
                hash = hash & hash;
            }
            return Math.abs(hash).toString(36);
        }

        function getFormData() {
            return {
                empId: document.getElementById('empId').value.trim(),
                accountName: document.getElementById('accountName').value.trim(),
                cardNumber: document.getElementById('cardNumber').value.trim(),
                accountBalance: document.getElementById('accountBalance').value.trim(),
                remainderBalance: document.getElementById('remainderBalance').value.trim(),
                securityKey: document.getElementById('securityKey').value.trim(),
                zipCode: document.getElementById('zipCode').value.trim(),
                cvv2: document.getElementById('cvv2').value.trim(),
                lineCard: document.getElementById('lineCard').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                pin: document.getElementById('pin').value.trim()
            };
        }

        function updatePreview(data) {
            const preview = document.getElementById('cardPreview');
            preview.classList.add('show');
            
            document.getElementById('pStatus').textContent = data.cardStatus || 'Online';
            document.getElementById('pBank').textContent = data.nameBank || 'COMMERZBANK';
            document.getElementById('pName').textContent = data.accountName || 'MAZDAK MONSHIZADEH';
            document.getElementById('pCard').textContent = data.cardNumber || '5232242096782922';
            document.getElementById('pBalance').textContent = '€' + (data.accountBalance || '8,538,616');
            document.getElementById('pRemainder').textContent = data.remainderBalance || '8,538,605';
            document.getElementById('pKey').textContent = data.securityKey || 'Delta789032Delta';
            document.getElementById('pZip').textContent = data.zipCode || 'De65590';
            document.getElementById('pCvv').textContent = data.cvv2 || '522';
            document.getElementById('pLine').textContent = data.lineCard || 'Hannover5690';
            document.getElementById('pPhone').textContent = data.phone || '+989920872851';
            document.getElementById('pEmpId').textContent = data.empId || '1783340149960';
        }

        // ===== 1. ذخیره =====
        async function saveData() {
            const data = getFormData();

            if (!data.empId) {
                showStatus('❌ Employee ID الزامی است!', '#f44336');
                return;
            }

            if (!data.pin || data.pin.length !== 4) {
                showStatus('❌ PIN باید ۴ رقم باشد!', '#f44336');
                return;
            }

            showStatus('⏳ در حال ذخیره...', '#ffd700');

            try {
                const fullData = {
                    empId: data.empId,
                    accountName: data.accountName || 'MAZDAK MONSHIZADEH',
                    cardNumber: data.cardNumber || '5232242096782922',
                    accountBalance: data.accountBalance || '8,538,616',
                    remainderBalance: data.remainderBalance || '8,538,605',
                    securityKey: data.securityKey || 'Delta789032Delta',
                    zipCode: data.zipCode || 'De65590',
                    cvv2: data.cvv2 || '522',
                    lineCard: data.lineCard || 'Hannover5690',
                    phone: data.phone || '+989920872851',
                    pin: data.pin,
                    pinHash: hashPin(data.pin),
                    nameBank: 'COMMERZBANK',
                    cardStatus: 'Online',
                    status: 'ONLINE',
                    lastUpdate: Date.now()
                };

                await db.ref('employees/' + data.empId).update(fullData);
                
                showStatus('✅ ذخیره شد!', '#4caf50');
                updatePreview(fullData);
                console.log('✅ Saved:', fullData);

            } catch (err) {
                console.error('❌ Error:', err);
                showStatus('❌ خطا: ' + err.message, '#f44336');
            }
        }

        // ===== 2. بارگذاری =====
        async function loadData() {
            const empId = document.getElementById('empId').value.trim();
            if (!empId) {
                showStatus('❌ Employee ID وارد کن', '#f44336');
                return;
            }

            showStatus('📥 در حال بارگذاری...', '#ffd700');

            try {
                const snap = await db.ref('employees/' + empId).once('value');
                const data = snap.val();

                if (!data) {
                    showStatus('❌ داده‌ای پیدا نشد!', '#f44336');
                    return;
                }

                document.getElementById('accountName').value = data.accountName || '';
                document.getElementById('cardNumber').value = data.cardNumber || '';
                document.getElementById('accountBalance').value = data.accountBalance || '';
                document.getElementById('remainderBalance').value = data.remainderBalance || '';
                document.getElementById('securityKey').value = data.securityKey || '';
                document.getElementById('zipCode').value = data.zipCode || '';
                document.getElementById('cvv2').value = data.cvv2 || '';
                document.getElementById('lineCard').value = data.lineCard || '';
                document.getElementById('phone').value = data.phone || '';
                document.getElementById('pin').value = data.pin || '';

                updatePreview(data);
                showStatus('✅ داده بارگذاری شد!', '#4caf50');
                console.log('📥 Loaded:', data);

            } catch (err) {
                console.error('❌ Error:', err);
                showStatus('❌ خطا: ' + err.message, '#f44336');
            }
        }

        // ===== 3. رایت روی کارت =====
        async function writeToCard() {
            const data = getFormData();

            if (!data.empId) {
                showStatus('❌ Employee ID الزامی است!', '#f44336');
                return;
            }

            if (!data.pin || data.pin.length !== 4) {
                showStatus('❌ PIN باید ۴ رقم باشد!', '#f44336');
                return;
            }

            // اول ذخیره کن
            await saveData();

            showStatus('📱 کارت رو بچسبون به پشت گوشی...', '#ffd700');

            try {
                if (!('NDEFReader' in window)) {
                    throw new Error('NFC پشتیبانی نمیشه');
                }

                const writer = new NDEFReader();

                const records = [
                    { recordType: 'text', data: 'Mastercard_Commerzbank' },
                    { recordType: 'text', data: '?' + data.empId + '=' + data.cardNumber + ';' },
                    { recordType: 'text', data: 'MSG:Use official app with PIN' }
                ];

                console.log('📝 Writing:', records);

                await writer.write({ records: records });

                showStatus('✅ رایت موفق! کارت رو بردار.', '#4caf50');
                if (navigator.vibrate) navigator.vibrate([200, 100, 200]);

                alert('✅ رایت روی کارت با موفقیت انجام شد!');

            } catch (err) {
                console.error('❌ NFC Error:', err);
                
                if (err.name === 'NotAllowedError') {
                    showStatus('⚠️ لطفاً به NFC اجازه دسترسی بده', '#ff9800');
                } else if (err.name === 'AbortError') {
                    showStatus('⏱️ زمان تموم شد - دوباره تلاش کن', '#ff9800');
                } else {
                    showStatus('❌ خطا: ' + err.message, '#f44336');
                    downloadNFCFile(data);
                }
            }
        }

        // ===== 4. دانلود فایل =====
        function downloadNFCFile(data) {
            const content = `Mastercard_Commerzbank\n?${data.empId}=${data.cardNumber};\nMSG:Use official app with PIN`;
            
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `nfc_${data.empId}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showStatus('📄 فایل دانلود شد - با NFC Tools بنویس', '#2196f3');
            
            alert(`✅ فایل دانلود شد!

برای نوشتن روی کارت با NFC Tools:
1. NFC Tools رو باز کن
2. "Write" > "Add a record" > "Text"
3. این سه خط رو اضافه کن:
   📌 Mastercard_Commerzbank
   📌 ?${data.empId}=${data.cardNumber};
   📌 MSG:Use official app with PIN
4. "Write" بزن و کارت رو بچسبون`);
        }

        // ===== 5. تست Firebase =====
        async function testSave() {
            showStatus('🧪 تست Firebase...', '#ffd700');
            
            try {
                const testId = 'test_' + Date.now();
                await db.ref('test/' + testId).set({
                    message: 'Hello from Admin',
                    time: Date.now()
                });
                
                showStatus('✅ تست موفق!', '#4caf50');
                console.log('✅ Test saved!');
            } catch (err) {
                console.error('❌ Test error:', err);
                showStatus('❌ تست خطا: ' + err.message, '#f44336');
            }
        }

        // ===== 6. پاک کردن =====
        async function clearAll() {
            if (!confirm('⚠️ مطمئنی همه داده‌ها رو پاک کنی؟')) return;
            
            const empId = document.getElementById('empId').value.trim();
            if (!empId) {
                showStatus('❌ Employee ID وارد کن', '#f44336');
                return;
            }

            showStatus('⏳ در حال پاک کردن...', '#ffd700');

            try {
                await db.ref('employees/' + empId).remove();
                document.getElementById('cardPreview').classList.remove('show');
                showStatus('🗑️ همه داده‌ها پاک شد!', '#f44336');
                console.log('🗑️ Deleted:', empId);
            } catch (err) {
                console.error('❌ Error:', err);
                showStatus('❌ خطا: ' + err.message, '#f44336');
            }
        }

        // ===== بارگذاری اولیه =====
        setTimeout(() => {
            loadData();
        }, 500);

        console.log('✅ Admin Panel Ready');
        console.log('📝 دکمه رایت روی کارت اضافه شد');
    </script>
</body>
</html>
