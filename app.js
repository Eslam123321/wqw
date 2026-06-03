/**
 * ==========================================================================
 * CYBERPUNK SPA INTEGRATED JAVASCRIPT - FIREBASE & SECURE GATE
 * ==========================================================================
 */

// استيراد مكتبة Firebase v10 الحديثة (ES6 Modules)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, push, set, onChildAdded, remove, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// إعدادات مشروع Firebase الخاص بك
const firebaseConfig = {
  apiKey: "AIzaSyAs-K7_P4pC7bX9M0G_h8MvJ-z9VvWvUvU",
  authDomain: "hamo-6afd7.firebaseapp.com",
  databaseURL: "https://hamo-6afd7-default-rtdb.firebaseio.com",
  projectId: "hamo-6afd7",
  storageBucket: "hamo-6afd7.firebasestorage.app",
  messagingSenderId: "107147716942",
  appId: "1:107147716942:web:7ef5752bc954d21e8e82ef"
};

// تهيئة تطبيق Firebase وقاعدة البيانات
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// انتهاء تحميل واجهة الـ DOM لتنفيذ الكود بأمان
document.addEventListener('DOMContentLoaded', () => {
    
    // ----------------------------------------------------------------------
    // 1. تعريف العناصر (DOM Elements)
    // ----------------------------------------------------------------------
    const gateOverlay = document.getElementById('gate-overlay');
    const passcodeInput = document.getElementById('passcode-input');
    const submitBtn = document.getElementById('submit-btn');
    const errorMessage = document.getElementById('error-message');
    const mainContent = document.getElementById('main-content');
    const cyberVideo = document.getElementById('cyber-video');

    const timerDays = document.getElementById('days');
    const timerHours = document.getElementById('hours');
    const timerMinutes = document.getElementById('minutes');
    const timerSeconds = document.getElementById('seconds');

    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatMessagesContainer = document.getElementById('chat-messages');
    const selfDestructBtn = document.getElementById('self-destruct-btn');

    // ----------------------------------------------------------------------
    // 2. كود شاشة الأمان (Secure Gate Lock Logic)
    // ----------------------------------------------------------------------
    const CORRECT_PASSCODE = "12345612"; // كلمة المرور المطلوبة

    function verifyPasscode() {
        const inputVal = passcodeInput.value.trim();

        if (inputVal === CORRECT_PASSCODE) {
            // إخفاء الأخطاء والاهتزازات
            errorMessage.classList.remove('visible');
            passcodeInput.classList.remove('shake');
            
            // تلاشي شاشة القفل وإظهار المحتوى الرئيسي
            gateOverlay.classList.add('fade-out');
            
            setTimeout(() => {
                gateOverlay.style.display = 'none';
                mainContent.classList.remove('hidden');
                
                // تشغيل تلقائي للفيديو بعد تخطي الحماية
                if (cyberVideo) {
                    cyberVideo.play().catch(error => {
                        console.log("Autoplay was prevented by browser, waiting for user interaction.", error);
                    });
                }
            }, 600);
        } else {
            // فشل التحقق: تفعيل الاهتزاز والرسالة الحمراء
            errorMessage.classList.add('visible');
            passcodeInput.classList.add('shake');
            playSystemBeep();

            // إزالة كلاس الاهتزاز بعد انتهاء الأنيميشن لتمكين تكراره
            setTimeout(() => {
                passcodeInput.classList.remove('shake');
            }, 400);

            // تفريغ الحقل وتجهيزه للمحاولة التالية
            passcodeInput.value = '';
            passcodeInput.focus();
        }
    }

    // ربط الحدث بالضغط على الزر أو الضغط على زر Enter داخل الحقل
    if (submitBtn && passcodeInput) {
        submitBtn.addEventListener('click', verifyPasscode);
        passcodeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                verifyPasscode();
            }
        });
    }

    // إصدار نغمة تحذيرية صوتية عند الخطأ
    function playSystemBeep() {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();

            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(120, audioCtx.currentTime);
            gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
            
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.15);
        } catch (e) {
            // Audio context failure ignored
        }
    }

    // ----------------------------------------------------------------------
    // 3. كود العداد التنازلي المستمر (Persistent Countdown Timer)
    // ----------------------------------------------------------------------
    let countdownTarget = localStorage.getItem('cyber_countdown_target');

    if (!countdownTarget) {
        // إنشاء عداد 48 ساعة من الآن وتخزينه
        const fortyEightHoursInMs = 48 * 60 * 60 * 1000;
        countdownTarget = Date.now() + fortyEightHoursInMs;
        localStorage.setItem('cyber_countdown_target', countdownTarget);
    } else {
        countdownTarget = parseInt(countdownTarget, 10);
    }

    function updateCountdown() {
        const now = Date.now();
        const difference = countdownTarget - now;

        if (difference <= 0) {
            if (timerDays) timerDays.textContent = "00";
            if (timerHours) timerHours.textContent = "00";
            if (timerMinutes) timerMinutes.textContent = "00";
            if (timerSeconds) timerSeconds.textContent = "00";
            
            const timerPanel = document.querySelector('.glow-panel');
            if (timerPanel) {
                timerPanel.style.boxShadow = "0 0 20px rgba(255, 0, 85, 0.6)";
            }
            return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        if (timerDays) timerDays.textContent = String(days).padStart(2, '0');
        if (timerHours) timerHours.textContent = String(hours).padStart(2, '0');
        if (timerMinutes) timerMinutes.textContent = String(minutes).padStart(2, '0');
        if (timerSeconds) timerSeconds.textContent = String(seconds).padStart(2, '0');
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);

    // ----------------------------------------------------------------------
    // 4. كود الـ Firebase والشات اللحظي (Firebase Realtime Chat)
    // ----------------------------------------------------------------------
    // إنشاء مُعرّف جلسة فريد لكل متصفح للتمييز بين الأطراف في الشات (باستخدام localStorage لضمان الثبات)
    let userId = localStorage.getItem('cyber_chat_user_id');
    if (!userId) {
        userId = 'AGENT-' + Math.floor(100 + Math.random() * 900);
        localStorage.setItem('cyber_chat_user_id', userId);
    }

    const messagesRef = ref(db, 'messages');
    const displayedMessageIds = new Set();

    // تحميل الرسائل المخزنة محلياً لثبات وسرعة عرض الشات
    try {
        const stored = localStorage.getItem('cyber_chat_messages');
        if (stored) {
            const cachedMessages = JSON.parse(stored);
            cachedMessages.forEach(msg => {
                displayedMessageIds.add(msg.id);
                appendMessage(msg.sender, msg.text, msg.type, msg.timestamp);
            });
        }
    } catch (e) {
        console.error("Failed to load cached messages", e);
    }

    // توليد الوقت بصيغة (HH:MM:SS)
    function getCurrentTimeString() {
        const now = new Date();
        const hrs = String(now.getHours()).padStart(2, '0');
        const mins = String(now.getMinutes()).padStart(2, '0');
        const secs = String(now.getSeconds()).padStart(2, '0');
        return `${hrs}:${mins}:${secs}`;
    }

    // صوت إشعار عند استلام رسالة جديدة من الطرف الآخر
    function playIncomingMessageChime() {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
            gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
            
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.08);
        } catch (e) {
            // Ignored
        }
    }

    // إدراج فقاعة الرسالة في صندوق الرسائل
    function appendMessage(sender, text, type, timestamp) {
        if (!chatMessagesContainer) return;

        const wrapper = document.createElement('div');
        wrapper.className = `chat-bubble-wrapper ${type}`;

        const senderSpan = document.createElement('span');
        senderSpan.className = 'chat-sender-name';
        senderSpan.textContent = sender;

        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = 'chat-bubble';
        bubbleDiv.textContent = text;

        const timeSpan = document.createElement('span');
        timeSpan.className = 'chat-timestamp';
        timeSpan.textContent = timestamp || getCurrentTimeString();

        wrapper.appendChild(senderSpan);
        wrapper.appendChild(bubbleDiv);
        wrapper.appendChild(timeSpan);
        
        chatMessagesContainer.appendChild(wrapper);
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    }

    // 1. الاستماع الفوري للرسائل المضافة حديثاً بقاعدة البيانات
    onChildAdded(messagesRef, (snapshot) => {
        const messageId = snapshot.key;
        if (displayedMessageIds.has(messageId)) return;
        displayedMessageIds.add(messageId);

        // إزالة رسائل التنبيه والترحيب عند بدء استلام المحادثات الفعلية
        const welcomePanel = document.querySelector('.system-welcome-message');
        if (welcomePanel) welcomePanel.remove();
        
        const destructPanel = document.querySelector('.system-destruct-message');
        if (destructPanel) destructPanel.remove();

        const messageData = snapshot.val();
        const isCurrentUser = messageData.userId === userId;

        const displayName = isCurrentUser ? "أنت // USER" : `العميل الآخر // ${messageData.userId}`;
        const messageType = isCurrentUser ? 'sent' : 'received';

        appendMessage(displayName, messageData.text, messageType, messageData.timestamp);

        // حفظ الرسالة في الذاكرة المحلية لضمان ثباتها
        try {
            const stored = localStorage.getItem('cyber_chat_messages');
            const msgs = stored ? JSON.parse(stored) : [];
            // تجنب تكرار حفظ الرسالة في الكاش
            if (!msgs.some(m => m.id === messageId)) {
                msgs.push({
                    id: messageId,
                    sender: displayName,
                    text: messageData.text,
                    type: messageType,
                    timestamp: messageData.timestamp
                });
                localStorage.setItem('cyber_chat_messages', JSON.stringify(msgs));
            }
        } catch (e) {
            console.error("Failed to cache message", e);
        }

        // تشغيل الرنين للرسائل الواردة فقط من الطرف الآخر
        if (!isCurrentUser) {
            playIncomingMessageChime();
        }
    });

    // 2. إرسال الرسالة السحابية عند تقديم حقل النص
    if (chatForm) {
        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const messageText = chatInput.value.trim();
            if (!messageText) return;

            const messagePayload = {
                userId: userId,
                text: messageText,
                timestamp: getCurrentTimeString()
            };

            const newMessageRef = push(messagesRef);
            set(newMessageRef, messagePayload)
                .then(() => {
                    chatInput.value = '';
                    chatInput.focus();
                })
                .catch((error) => {
                    console.error("Firebase send failed: ", error);
                });
        });
    }

    // 3. تفعيل الزر السري للتدمير الذاتي (Self-destruct click event)
    if (selfDestructBtn) {
        selfDestructBtn.addEventListener('click', () => {
            // حذف مباشر بدون نوافذ تأكيد أو تعقيدات
            remove(messagesRef)
                .then(() => {
                    console.log("Comms database cleared.");
                })
                .catch((error) => {
                    console.error("Failed to delete database node: ", error);
                });
        });
    }

    // 4. مراقبة عملية الحذف (onValue) لتطهير الشاشات فوراً عند الطرفين
    onValue(messagesRef, (snapshot) => {
        if (!chatMessagesContainer) return;

        if (!snapshot.exists()) {
            chatMessagesContainer.innerHTML = '';
            displayedMessageIds.clear();
            localStorage.removeItem('cyber_chat_messages'); // حذف الرسائل المخزنة محلياً فوراً

            // شاشة ترحيب خلو سجل المحادثة مباشرة دون رسائل تحذيرية معقدة
            const welcomeDiv = document.createElement('div');
            welcomeDiv.className = 'system-welcome-message';
            welcomeDiv.innerHTML = `
                <i class="fa-solid fa-shield-halved"></i>
                <span style="margin-top: 10px; font-family: var(--font-mono); font-size: 0.9rem; color: var(--neon-cyan); text-shadow: var(--cyan-glow); display: block;">
                    تم تأسيس قناة اتصال آمنة ومقاومة للرصد. لا توجد رسائل سابقة.
                </span>
            `;
            chatMessagesContainer.appendChild(welcomeDiv);
        }
    });
});
