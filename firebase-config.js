
// Конфигурация Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAKehrWi12JK8AvY5y9r7pLME3Twlsvp-k",
  authDomain: "medical-info-system.firebaseapp.com",
  projectId: "medical-info-system",
  storageBucket: "medical-info-system.firebasestorage.app",
  messagingSenderId: "845037692690",
  appId: "1:845037692690:web:697d65bb120eb3897975cb"
};

// Подключаем Firebase
firebase.initializeApp(firebaseConfig);

// Подключаем авторизацию
window.auth = firebase.auth();

// Подключаем базу данных
window.db = firebase.firestore();

console.log("Firebase успешно подключён!");

// Отслеживаем состояние авторизации
window.auth.onAuthStateChanged((user) => {
  if (user) {
    console.log("Пользователь вошёл в систему:", user.email);
  } else {
    console.log("Пользователь не авторизован");
  }
});
