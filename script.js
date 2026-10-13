const $ = (selector) => document.querySelector(selector);

const storageKey = "medis_demo_data_v1";

const initialData = {
    patients: [
        { id: 1, name: "Иванова Анна Сергеевна", birth: "1985-03-12", phone: "+7 999 123-45-67" },
        { id: 2, name: "Петров Алексей Викторович", birth: "1990-07-05", phone: "+7 999 234-56-78" },
        { id: 3, name: "Соколова Мария Ивановна", birth: "1978-11-18", phone: "+7 999 345-67-89" },
        { id: 4, name: "Кузнецов Дмитрий Сергеевич", birth: "1982-05-30", phone: "+7 999 456-78-90" },
        { id: 5, name: "Смирнова Елена Петровна", birth: "1995-09-22", phone: "+7 999 567-89-01" }
    ],
    employees: [
        { id: 1, name: "Иванов Алексей Петрович", position: "Терапевт", department: "Терапевтическое отделение" },
        { id: 2, name: "Петрова Мария Сергеевна", position: "Педиатр", department: "Педиатрическое отделение" },
        { id: 3, name: "Сидоров Андрей Иванович", position: "Хирург", department: "Хирургическое отделение" }
    ],
    departments: [
        { id: 1, name: "Терапевтическое отделение", head: "Иванов Алексей Петрович" },
        { id: 2, name: "Педиатрическое отделение", head: "Петрова Мария Сергеевна" },
        { id: 3, name: "Хирургическое отделение", head: "Сидоров Андрей Иванович" }
    ],
    services: [
        { id: 1, name: "Первичный приём терапевта", price: 1500, department: "Терапевтическое отделение" },
        { id: 2, name: "Консультация педиатра", price: 1300, department: "Педиатрическое отделение" },
        { id: 3, name: "Консультация хирурга", price: 1800, department: "Хирургическое отделение" }
    ],
    visits: [
        { id: 1, patientId: 1, employeeId: 1, date: todayString(), status: "Запланировано" },
        { id: 2, patientId: 2, employeeId: 2, date: todayString(), status: "Завершено" },
        { id: 3, patientId: 3, employeeId: 3, date: todayString(), status: "Ожидает" }
    ],

    
    medicalCards: [],
    patientServices: [],
    financialTransactions: [],
        
inventory: [
    {
        id: 1,
        name: "Перчатки медицинские",
        category: "Средства защиты",
        unit: "пар",
        quantity: 500,
        minQuantity: 100,
        price: 12
    },
    {
        id: 2,
        name: "Шприц одноразовый 5 мл",
        category: "Расходные материалы",
        unit: "шт.",
        quantity: 200,
        minQuantity: 50,
        price: 8
    },
    {
        id: 3,
        name: "Бинт стерильный",
        category: "Перевязочные материалы",
        unit: "шт.",
        quantity: 80,
        minQuantity: 100,
        price: 35
    },
    {
        id: 4,
        name: "Маски медицинские",
        category: "Средства защиты",
        unit: "шт.",
        quantity: 300,
        minQuantity: 100,
        price: 5
    },
    {
        id: 5,
        name: "Антисептик для рук",
        category: "Дезинфицирующие средства",
        unit: "л",
        quantity: 10,
        minQuantity: 15,
        price: 450
    }
],
inventoryTransactions: []

};

let data = structuredClone(initialData);
let currentPage = "Главная";
let currentFormType = null;
let currentEditingId = null;
let noticeTimer;

// Текущий пользователь Firebase
let currentFirebaseUser = null;

const pageInfo = {
    "Главная": {
        title: "Добро пожаловать!",
        description: "Система учёта и анализа деятельности медицинского учреждения"
    },
    "Пациенты": {
        title: "Пациенты",
        description: "Учёт и просмотр сведений о пациентах"
    },
    "Сотрудники": {
        title: "Сотрудники",
        description: "Сведения о персонале медицинского учреждения"
    },
    "Подразделения": {
        title: "Подразделения",
        description: "Организационная структура медицинского учреждения"
    },
    "Услуги": {
        title: "Медицинские услуги",
        description: "Справочник услуг, предоставляемых учреждением"
    },
    "Обращения": {
        title: "Обращения",
        description: "Регистрация и просмотр обращений пациентов"
    },
    "Отчёты": {
        title: "Отчёты",
        description: "Сводные показатели деятельности учреждения"
    },
    "Настройки": {
        title: "Настройки",
        description: "Информация о демонстрационной версии системы"
    },

    
"Склад": {
    title: "Склад и расходные материалы",
    description: "Учёт медицинских материалов, остатков и складских операций"
},

};

function todayString() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function loadData() {
    try {
        const saved = localStorage.getItem(storageKey);
        return saved ? JSON.parse(saved) : structuredClone(initialData);
    } catch (error) {
        console.error("Не удалось загрузить демонстрационные данные:", error);
        return structuredClone(initialData);
    }
}

function saveData() {
    try {
        localStorage.setItem(storageKey, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error("Не удалось сохранить данные:", error);
        showNotice("Не удалось сохранить данные в браузере.", true);
        return false;
    }
}



const firestoreCollections = {
    patients: "patients",
    employees: "employees",
    departments: "departments",
    services: "services",
    visits: "visits",
    medicalCards: "medicalCards",
    patientServices: "patientServices",
    financialTransactions: "financialTransactions",
    inventory: "inventory",
inventoryTransactions: "inventoryTransactions"
};

// Получаем коллекцию текущего пользователя
function getUserCollection(collectionName) {
    if (!currentFirebaseUser) {
        throw new Error("Пользователь не авторизован.");
    }

    return window.db
        .collection("users")
        .doc(currentFirebaseUser.uid)
        .collection(collectionName);
}

// Загружаем данные из Firestore
async function loadFirestoreData(user) {
    currentFirebaseUser = user;

    const loadedData = {};

    for (const [key, collectionName] of Object.entries(firestoreCollections)) {
        const collection = getUserCollection(collectionName);
        const snapshot = await collection.get();

        // При первом запуске создаём демонстрационные записи
        
if (snapshot.empty) {
    const records = initialData[key];

    // Если для коллекции нет начальных записей,
    // оставляем её пустой до добавления реальных данных.
    if (records.length === 0) {
        loadedData[key] = [];
        continue;
    }

    const batch = window.db.batch();

    for (const record of records) {
        const document = collection.doc(String(record.id));
        batch.set(document, record);
    }

    await batch.commit();

    loadedData[key] = structuredClone(records);
}
 else {
            loadedData[key] = snapshot.docs.map((document) => {
                const record = document.data();

                return {
                    ...record,
                    id: Number(record.id ?? document.id)
                };
            });
        }
    }

    data = loadedData;

    // Обновляем интерфейс полученными данными
    renderDashboard();
    navigate(currentPage);

    console.log("Данные успешно загружены из Firestore.");
}


function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);
}

function formatDate(value) {
    if (!value) return "—";

    const parts = value.split("-");
    if (parts.length !== 3) return escapeHTML(value);

    return `${parts[2]}.${parts[1]}.${parts[0]}`;
}


function getFormErrorBox() {
    const formFields = $("#formFields");
    let box = $("#formErrorMessage");

    if (!box) {
        box = document.createElement("div");
        box.id = "formErrorMessage";
        box.className = "form-error-message";
        box.setAttribute("role", "alert");
        box.hidden = true;

        formFields.insertAdjacentElement("beforebegin", box);
    }

    return box;
}

function showNotice(message, isError = false) {
    const dialog = $("#recordDialog");

    // Если форма открыта, показываем ошибку внутри неё
    if (isError && dialog.open) {
        const errorBox = getFormErrorBox();

        errorBox.textContent = message;
        errorBox.hidden = false;
        return;
    }

    // Остальные уведомления показываем в общем месте страницы
    const notice = $("#notice");

    notice.textContent = message;
    notice.classList.toggle("error", isError);
    notice.hidden = false;

    clearTimeout(noticeTimer);

    noticeTimer = setTimeout(() => {
        notice.hidden = true;
    }, 4000);
}


function getPatientName(id) {
    return data.patients.find((item) => item.id === id)?.name || "Пациент не найден";
}

function getEmployeeName(id) {
    return data.employees.find((item) => item.id === id)?.name || "Сотрудник не найден";
}

function getNextId(collection) {
    return collection.reduce((max, item) => Math.max(max, item.id), 0) + 1;
}

function isValidDateString(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return false;
    }

    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
    );
}


function timeToMinutes(time) {
    const [hours, minutes] = (time || "09:00")
        .split(":")
        .map(Number);

    return hours * 60 + minutes;
}


function normalizePhone(value) {
    const digits = value.replace(/\D/g, "");

    if (digits.length !== 11) {
        return null;
    }

    let normalizedDigits = digits;

    if (digits.startsWith("8")) {
        normalizedDigits = "7" + digits.slice(1);
    }

    if (!normalizedDigits.startsWith("7")) {
        return null;
    }

    return `+7 ${normalizedDigits.slice(1, 4)} ${normalizedDigits.slice(4, 7)}-${normalizedDigits.slice(7, 9)}-${normalizedDigits.slice(9, 11)}`;
}


function renderDate() {
    $("#currentDate").textContent = new Intl.DateTimeFormat("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric"
    }).format(new Date());
}

function renderDashboard() {
    $("#patientCount").textContent = data.patients.length;
    $("#employeeCount").textContent = data.employees.length;
    $("#serviceCount").textContent = data.services.length;
    $("#visitCount").textContent = data.visits.length;

    $("#recentVisits").innerHTML = [...data.visits]
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 5)
        .map((visit) => `
            <tr>
                <td>${escapeHTML(getPatientName(visit.patientId))}</td>
                <td>${escapeHTML(getEmployeeName(visit.employeeId))}</td>
                
<td>
    ${formatDate(visit.date)}
    <br>
    <small>${escapeHTML(visit.time || "09:00")}</small>
</td>
<td>${statusBadge(visit.status)}</td>

            </tr>
        `).join("") || emptyRow(4, "Обращений пока нет");

    $("#recentPatients").innerHTML = [...data.patients]
        .sort((a, b) => b.id - a.id)
        .slice(0, 5)
        .map((patient) => `
            <tr>
                <td>${escapeHTML(patient.name)}</td>
                <td>${formatDate(patient.birth)}</td>
                <td>${escapeHTML(patient.phone)}</td>
            </tr>
        `).join("") || emptyRow(3, "Пациентов пока нет");
}

function statusBadge(status) {
    let className = "planned";

    if (status === "Завершено") className = "complete";
    if (status === "Ожидает") className = "waiting";

    return `<span class="status ${className}">${escapeHTML(status)}</span>`;
}

function emptyRow(columns, message) {
    return `<tr><td colspan="${columns}">${escapeHTML(message)}</td></tr>`;
}

function navigate(page) {
    if (!pageInfo[page]) return;

    currentPage = page;

    document.querySelectorAll(".nav-item[data-page]").forEach((button) => {
        button.classList.toggle("active", button.dataset.page === page);
    });

    $("#pageTitle").textContent = pageInfo[page].title;
    $("#pageDescription").textContent = pageInfo[page].description;

    const isDashboard = page === "Главная";
    $("#dashboardPage").hidden = !isDashboard;
    $("#modulePage").hidden = isDashboard;

    $("#globalSearch").value = "";

    if (!isDashboard) {
        renderModule();
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
}

function getModuleConfig() {
    const configs = {
        
"Пациенты": {
    key: "patients",
    title: "Список пациентов",
    
actions: true,


    
columns: [
    ["name", "ФИО"],
    ["birth", "Дата рождения"],
    ["phone", "Телефон"]
],


    
fields: [
    {
        name: "name",
        label: "ФИО пациента",
        required: true
    },
    {
        name: "birth",
        label: "Дата рождения",
        type: "date",
        max: todayString(),
        required: true
    },
    {
        name: "phone",
        label: "Телефон",
        type: "tel",
        required: true
    }
],


    map: (item) => ({
        ...item,
        birth: formatDate(item.birth)
    })
},

        "Сотрудники": {
            key: "employees",
            title: "Список сотрудников",
            columns: [
                ["name", "ФИО"],
                ["position", "Должность"],
                ["department", "Подразделение"]
            ],
            fields: [
                { name: "name", label: "ФИО сотрудника", required: true },
                { name: "position", label: "Должность", required: true },
                {
                    name: "department",
                    label: "Подразделение",
                    type: "select",
                    options: () => data.departments.map((item) => item.name),
                    required: true
                }
            ]
        },
        "Подразделения": {
            key: "departments",
            title: "Справочник подразделений",
            columns: [
                ["name", "Название"],
                ["head", "Руководитель"]
            ],
            fields: [
                { name: "name", label: "Название подразделения", required: true },
                { name: "head", label: "Руководитель подразделения", required: true }
            ]
        },
        "Услуги": {
            key: "services",
            title: "Справочник медицинских услуг",
            columns: [
                ["name", "Название услуги"],
                ["price", "Стоимость, руб."],
                ["department", "Подразделение"]
            ],
            fields: [
                { name: "name", label: "Название услуги", required: true },
                { name: "price", label: "Стоимость, руб.", type: "number", min: "0", required: true },
                {
                    name: "department",
                    label: "Подразделение",
                    type: "select",
                    options: () => data.departments.map((item) => item.name),
                    required: true
                }
            ],
            map: (item) => ({ ...item, price: `${item.price} ₽` })
        },
        "Обращения": {
            key: "visits",
            title: "Журнал обращений",
            
columns: [
    ["patient", "Пациент"],
    ["employee", "Сотрудник"],
    ["date", "Дата"],
    ["time", "Время"],
    ["duration", "Длительность"],
    ["status", "Статус"]
],

            fields: [
                {
                    name: "patientId",
                    label: "Пациент",
                    type: "select",
                    options: () => data.patients.map((item) => ({
                        value: item.id,
                        label: item.name
                    })),
                    required: true
                },
                {
                    name: "employeeId",
                    label: "Сотрудник",
                    type: "select",
                    options: () => data.employees.map((item) => ({
                        value: item.id,
                        label: item.name
                    })),
                    required: true
                },
                { name: "date", label: "Дата обращения", type: "date", required: true },
                
{
    name: "time",
    label: "Время приёма",
    type: "time",
    required: true
},
{
    name: "duration",
    label: "Длительность (минуты)",
    type: "number",
    min: "1",
    required: true
},

                {
                    name: "status",
                    label: "Статус",
                    type: "select",
                    options: () => ["Запланировано", "Ожидает", "Завершено"],
                    required: true
                }
            ],
            
map: (item) => ({
    patient: getPatientName(item.patientId),
    employee: getEmployeeName(item.employeeId),
    date: formatDate(item.date),
    time: item.time || "09:00",
    duration: `${Number(item.duration) || 30} мин`,
    status: item.status
})

        },

        
"Склад": {
    key: "inventory",
    title: "Склад медицинских материалов",

    columns: [
        ["name", "Наименование"],
        ["category", "Категория"],
        ["unit", "Ед. измерения"],
        ["quantity", "Остаток"],
        ["minQuantity", "Мин. запас"],
        ["price", "Цена за единицу, ₽"]
    ],

    fields: [
        {
            name: "name",
            label: "Наименование материала",
            required: true
        },
        {
            name: "category",
            label: "Категория",
            type: "select",
            options: () => [
                "Средства защиты",
                "Расходные материалы",
                "Перевязочные материалы",
                "Дезинфицирующие средства",
                "Медицинские инструменты",
                "Прочее"
            ],
            required: true
        },
        {
            name: "unit",
            label: "Единица измерения",
            type: "select",
            options: () => [
                "шт.",
                "пар",
                "упак.",
                "л",
                "мл",
                "кг",
                "г"
            ],
            required: true
        },
        {
            name: "quantity",
            label: "Текущий остаток",
            type: "number",
            min: "0",
            required: true
        },
        {
            name: "minQuantity",
            label: "Минимальный остаток",
            type: "number",
            min: "0",
            required: true
        },
        {
            name: "price",
            label: "Цена за единицу, ₽",
            type: "number",
            min: "0",
            required: true
        }
    ],

    map: (item) => ({
        price: `${Number(item.price).toLocaleString("ru-RU")} ₽`
    })
}

    };

    return configs[currentPage] || null;
}

function renderModule() {
    const config = getModuleConfig();

    $("#moduleTitle").textContent = config?.title || currentPage;
    $("#moduleDescription").textContent = pageInfo[currentPage].description;
    $("#addRecordButton").hidden = !config;
    $("#moduleContent").innerHTML = "";

    if (currentPage === "Отчёты") {
        renderReports();
        return;
    }

    if (currentPage === "Настройки") {
    $("#moduleContent").innerHTML = `
        <div class="info-note">
            <strong>Информация о системе</strong><br><br>
            МедИС — демонстрационная медицинская информационная система.
            <br><br>
            <strong>Авторизация:</strong> Firebase Authentication
            <br>
            <strong>База данных:</strong> Cloud Firestore
            <br>
            <strong>Хранение:</strong> облачная база данных
            <br><br>
            Используйте только вымышленные данные.
            Система предназначена для учебных целей.
        </div>
    `;
    return;
}

    if (!config) return;

    const query = $("#globalSearch").value.trim().toLowerCase();
    const records = data[config.key].map((item) => {
        if (config.map) return { ...item, ...config.map(item) };
        return item;
    });

    const filtered = records.filter((item) =>
        Object.values(item).some((value) =>
            String(value ?? "").toLowerCase().includes(query)
        )
    );

    const headers = config.columns.map(([, label]) =>
    `<th>${escapeHTML(label)}</th>`
).join("") + "<th>Действия</th>";

    

const rows = filtered.map((item) => `
    <tr>
        ${config.columns.map(([key]) => `
            <td>${key === "status"
                ? statusBadge(item[key])
                : escapeHTML(item[key] ?? "—")}</td>
        `).join("")}

        <td class="record-actions">
            ${config.actions ? `
                <button
                    type="button"
                    class="secondary-button medical-card-button"
                    data-id="${item.id}">
                    Медицинская карта
                </button>
            ` : ""}

            <button
                type="button"
                class="secondary-button edit-record-button"
                data-id="${item.id}">
                Изменить
            </button>

            <button
                type="button"
                class="secondary-button delete-record-button"
                data-id="${item.id}">
                Удалить
            </button>
        </td>
    </tr>
`).join("");



    
$("#moduleContent").innerHTML = `
    <div class="module-toolbar">
        <input id="moduleSearch" type="search"
            placeholder="Поиск в этом разделе..."
            value="${escapeHTML(query)}">

        ${
            currentPage === "Склад"
                ? `<button type="button"
                    class="primary-button"
                    id="inventoryReceiptButton">
                    + Поступление
                </button>
                
                <button
    type="button"
    class="secondary-button"
    id="inventoryWriteOffButton">
    − Списание
</button>

<button
    type="button"
    class="secondary-button"
    id="inventoryHistoryButton">
    История операций
</button>`

                
                : ""

                
        }

        <span style="color: var(--muted); font-size: 12px;">
            Записей: ${filtered.length}
        </span>
    </div>

    ${
    currentPage === "Склад"
        ? `
            <div id="inventoryOperationForm"></div>
            <div id="inventoryHistoryContainer"></div>
        `
        : ""
}

    <div class="table-wrap">
        <table>
            <thead><tr>${headers}</tr></thead>
            <tbody>
                ${
                    rows ||
                    emptyRow(config.columns.length + 1, "Записи не найдены")
                }
            </tbody>
        </table>
    </div>
`;
const receiptButton = $("#inventoryReceiptButton");


if (receiptButton) {
    receiptButton.addEventListener("click", showInventoryReceiptForm);
}

const writeOffButton = $("#inventoryWriteOffButton");

if (writeOffButton) {
    writeOffButton.addEventListener("click", showInventoryWriteOffForm);
}

const historyButton = $("#inventoryHistoryButton");

if (historyButton) {
    historyButton.addEventListener("click", () => {
        const container = $("#inventoryHistoryContainer");

        if (container.innerHTML.trim()) {
            container.innerHTML = "";
            historyButton.textContent = "История операций";
        } else {
            renderInventoryHistory();
            historyButton.textContent = "Скрыть историю";
        }
    });
}

    // Обработчики редактирования
document.querySelectorAll(".edit-record-button").forEach((button) => {
    button.addEventListener("click", () => {
        openRecordForm(currentPage, button.dataset.id);
    });
});

// Обработчики удаления
document.querySelectorAll(".delete-record-button").forEach((button) => {
    button.addEventListener("click", () => {
        deleteRecord(Number(button.dataset.id));
    });
});

    $("#moduleSearch").addEventListener("input", (event) => {
        $("#globalSearch").value = event.target.value;
        renderModule();
        const field = $("#moduleSearch");
        field.focus();
        field.setSelectionRange(field.value.length, field.value.length);
    });

    
document.querySelectorAll(".medical-card-button").forEach((button) => {
    button.addEventListener("click", () => {
        const patientId = Number(button.dataset.id);

        openMedicalCard(patientId);
    });
});

}


function renderInventoryHistory() {
    const container = $("#inventoryHistoryContainer");

    if (!container) return;

    const transactions = [...data.inventoryTransactions].sort((a, b) => {
        const dateComparison = String(b.date || "")
            .localeCompare(String(a.date || ""));

        if (dateComparison !== 0) return dateComparison;

        return String(b.createdAt || "")
            .localeCompare(String(a.createdAt || ""));
    });

    container.innerHTML = `
        <div class="info-note">
            <h3>История складских операций</h3>

            <div class="module-toolbar">
                <input
                    id="inventoryHistorySearch"
                    type="search"
                    placeholder="Поиск по истории...">

                <span
                    id="inventoryHistoryCount"
                    style="color: var(--muted); font-size: 12px;">
                </span>
            </div>

            <div class="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>Дата</th>
                            <th>Материал</th>
                            <th>Операция</th>
                            <th>Количество</th>
                            <th>Цена за единицу</th>
                            <th>Основание</th>
                        </tr>
                    </thead>

                    <tbody id="inventoryHistoryRows"></tbody>
                </table>
            </div>
        </div>
    `;

    const searchInput = $("#inventoryHistorySearch");
    const rowsContainer = $("#inventoryHistoryRows");
    const countElement = $("#inventoryHistoryCount");

    function renderRows() {
        const query = searchInput.value.trim().toLowerCase();

        const filtered = transactions.filter((item) => {
            return [
                item.date,
                item.materialName,
                item.type,
                item.quantity,
                item.price,
                item.reason
            ].some((value) =>
                String(value ?? "").toLowerCase().includes(query)
            );
        });

        countElement.textContent = `Операций: ${filtered.length}`;

        if (!filtered.length) {
            rowsContainer.innerHTML = `
                <tr>
                    <td colspan="6">
                        ${
                            transactions.length
                                ? "По вашему запросу ничего не найдено."
                                : "Складских операций пока нет."
                        }
                    </td>
                </tr>
            `;

            return;
        }

        rowsContainer.innerHTML = filtered.map((item) => {
            const isReceipt = item.type === "Поступление";

            return `
                <tr>
                    <td>${escapeHTML(item.date || "—")}</td>

                    <td>${escapeHTML(item.materialName || "—")}</td>

                    <td>
                        <strong>
                            ${isReceipt ? "+" : "−"}
                            ${escapeHTML(item.type || "—")}
                        </strong>
                    </td>

                    <td>
                        ${isReceipt ? "+" : "−"}${escapeHTML(item.quantity ?? "—")}
                    </td>

                    <td>
                        ${Number.isFinite(Number(item.price))
                            ? `${Number(item.price).toLocaleString("ru-RU")} ₽`
                            : "—"}
                    </td>

                    <td>${escapeHTML(item.reason || "—")}</td>
                </tr>
            `;
        }).join("");
    }

    searchInput.addEventListener("input", renderRows);

    renderRows();
}


function showInventoryReceiptForm() {
    const container = $("#inventoryOperationForm");

    if (!container) return;

    if (!currentFirebaseUser) {
        showNotice("Для сохранения необходимо войти в систему.", true);
        return;
    }

    if (!data.inventory.length) {
        showNotice("Сначала добавьте материал на склад.", true);
        return;
    }

    const materialOptions = data.inventory.map((item) => `
        <option value="${item.id}">
            ${escapeHTML(item.name)} — остаток: ${item.quantity} ${escapeHTML(item.unit)}
        </option>
    `).join("");

    container.innerHTML = `
        <form id="inventoryReceiptForm" class="info-note">
            <h3>Поступление материалов</h3>

            <div class="form-field">
                <label for="receiptMaterial">Материал</label>
                <select id="receiptMaterial" name="inventoryId" required>
                    <option value="">Выберите материал</option>
                    ${materialOptions}
                </select>
            </div>

            <div class="form-field">
                <label for="receiptQuantity">Количество</label>
                <input
                    id="receiptQuantity"
                    name="quantity"
                    type="number"
                    min="1"
                    step="1"
                    required>
            </div>

            <div class="form-field">
                <label for="receiptPrice">Закупочная цена за единицу, ₽</label>
                <input
                    id="receiptPrice"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    required>
            </div>

            <div class="form-field">
                <label for="receiptDate">Дата поступления</label>
                <input
                    id="receiptDate"
                    name="date"
                    type="date"
                    value="${todayString()}"
                    max="${todayString()}"
                    required>
            </div>

            <div class="form-field">
                <label for="receiptReason">Основание поступления</label>
                <input
                    id="receiptReason"
                    name="reason"
                    type="text"
                    maxlength="200"
                    placeholder="Например, поставка от поставщика"
                    required>
            </div>

            <div class="record-actions">
                <button type="submit" class="primary-button">
                    Сохранить поступление
                </button>

                <button type="button"
                    class="secondary-button"
                    id="cancelInventoryReceipt">
                    Отмена
                </button>
            </div>
        </form>
    `;

    const form = $("#inventoryReceiptForm");
    const materialSelect = $("#receiptMaterial");
    const priceInput = $("#receiptPrice");

    function updatePrice() {
        const item = data.inventory.find(
            (record) => Number(record.id) === Number(materialSelect.value)
        );

        priceInput.value = item ? Number(item.price).toFixed(2) : "";
    }

    materialSelect.addEventListener("change", updatePrice);
    updatePrice();

    $("#cancelInventoryReceipt").addEventListener("click", () => {
        container.innerHTML = "";
    });

    form.addEventListener("submit", saveInventoryReceipt);
}


async function saveInventoryReceipt(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const submitButton = form.querySelector('button[type="submit"]');

    if (submitButton.disabled) return;

    if (!currentFirebaseUser) {
        showNotice("Для сохранения необходимо войти в систему.", true);
        return;
    }

    const formData = new FormData(form);

    const inventoryId = Number(formData.get("inventoryId"));
    const quantity = Number(formData.get("quantity"));
    const price = Number(formData.get("price"));
    const date = String(formData.get("date") || "");
    const reason = String(formData.get("reason") || "").trim();

    const item = data.inventory.find(
        (record) => Number(record.id) === inventoryId
    );

    if (!item) {
        showNotice("Выбранный материал не найден.", true);
        return;
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
        showNotice("Количество должно быть положительным целым числом.", true);
        return;
    }

    if (!Number.isFinite(price) || price < 0) {
        showNotice("Укажите корректную закупочную цену.", true);
        return;
    }

    if (!isValidDateString(date) || date > todayString()) {
        showNotice("Укажите корректную дату поступления.", true);
        return;
    }

    if (!reason) {
        showNotice("Укажите основание поступления.", true);
        return;
    }

    if (!Number.isSafeInteger(Number(item.quantity) + quantity)) {
        showNotice("Получилось слишком большое количество материала.", true);
        return;
    }

    const transactionId = getNextId(data.inventoryTransactions);

    const savedTransaction = {
        id: transactionId,
        inventoryId,
        materialName: item.name,
        type: "Поступление",
        quantity,
        price,
        date,
        reason,
        createdAt: new Date().toISOString()
    };

    submitButton.disabled = true;
    submitButton.textContent = "Сохранение...";

    try {
        const itemRef = getUserCollection("inventory")
            .doc(String(inventoryId));

        const transactionRef = getUserCollection("inventoryTransactions")
            .doc(String(transactionId));

        await window.db.runTransaction(async (dbTransaction) => {
            const itemSnapshot = await dbTransaction.get(itemRef);
            const operationSnapshot = await dbTransaction.get(transactionRef);

            if (!itemSnapshot.exists) {
                throw new Error("Материал не найден в базе данных.");
            }

            if (operationSnapshot.exists) {
                throw new Error("Операция с таким номером уже существует. Повторите попытку.");
            }

            const currentItem = itemSnapshot.data();
            const oldQuantity = Number(currentItem.quantity);
            const oldPrice = Number(currentItem.price);

            if (
                !Number.isSafeInteger(oldQuantity) ||
                oldQuantity < 0 ||
                !Number.isFinite(oldPrice) ||
                oldPrice < 0
            ) {
                throw new Error("У материала некорректные складские данные.");
            }

            const newQuantity = oldQuantity + quantity;

            // Рассчитываем среднюю цену единицы с учётом поступления.
            const newPrice = newQuantity === 0
                ? price
                : (
                    oldQuantity * oldPrice + quantity * price
                ) / newQuantity;

            dbTransaction.update(itemRef, {
                quantity: newQuantity,
                price: Math.round(newPrice * 100) / 100
            });

            dbTransaction.set(transactionRef, savedTransaction);
        });

        // Обновляем локальные данные только после успешной операции Firebase.
        const index = data.inventory.findIndex(
            (record) => Number(record.id) === inventoryId
        );

        if (index !== -1) {
            const oldQuantity = Number(data.inventory[index].quantity);
            const oldPrice = Number(data.inventory[index].price);
            const newQuantity = oldQuantity + quantity;

            const newPrice = newQuantity === 0
                ? price
                : (
                    oldQuantity * oldPrice + quantity * price
                ) / newQuantity;

            data.inventory[index] = {
                ...data.inventory[index],
                quantity: newQuantity,
                price: Math.round(newPrice * 100) / 100
            };
        }

        data.inventoryTransactions.push(savedTransaction);

        saveData();
        renderModule();

        showNotice("Поступление сохранено. Остаток склада обновлён.");
    } catch (error) {
        console.error("Ошибка поступления материалов:", error);

        showNotice(
            `Не удалось сохранить поступление: ${error.message || "ошибка Firebase"}`,
            true
        );

        submitButton.disabled = false;
        submitButton.textContent = "Сохранить поступление";
    }
}


function showInventoryWriteOffForm() {
    const container = $("#inventoryOperationForm");

    if (!container) return;

    if (!currentFirebaseUser) {
        showNotice("Для сохранения необходимо войти в систему.", true);
        return;
    }

    if (!data.inventory.length) {
        showNotice("На складе нет материалов для списания.", true);
        return;
    }

    const materialOptions = data.inventory.map((item) => `
        <option value="${item.id}">
            ${escapeHTML(item.name)} — остаток: ${item.quantity} ${escapeHTML(item.unit)}
        </option>
    `).join("");

    container.innerHTML = `
        <form id="inventoryWriteOffForm" class="info-note">
            <h3>Списание материалов</h3>

            <div class="form-field">
                <label for="writeOffMaterial">Материал</label>
                <select
                    id="writeOffMaterial"
                    name="inventoryId"
                    required>
                    <option value="">Выберите материал</option>
                    ${materialOptions}
                </select>
            </div>

            <div class="form-field">
                <label for="writeOffQuantity">Количество</label>
                <input
                    id="writeOffQuantity"
                    name="quantity"
                    type="number"
                    min="1"
                    step="1"
                    required>
            </div>

            <div class="form-field">
                <label for="writeOffDate">Дата списания</label>
                <input
                    id="writeOffDate"
                    name="date"
                    type="date"
                    value="${todayString()}"
                    max="${todayString()}"
                    required>
            </div>

            <div class="form-field">
                <label for="writeOffReason">Причина списания</label>
                <input
                    id="writeOffReason"
                    name="reason"
                    type="text"
                    maxlength="200"
                    placeholder="Например, использование при процедуре"
                    required>
            </div>

            <div class="record-actions">
                <button type="submit" class="primary-button">
                    Сохранить списание
                </button>

                <button
                    type="button"
                    class="secondary-button"
                    id="cancelInventoryWriteOff">
                    Отмена
                </button>
            </div>
        </form>
    `;

    $("#cancelInventoryWriteOff").addEventListener("click", () => {
        container.innerHTML = "";
    });

    $("#inventoryWriteOffForm").addEventListener(
        "submit",
        saveInventoryWriteOff
    );
}


async function saveInventoryWriteOff(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const submitButton = form.querySelector('button[type="submit"]');

    if (submitButton.disabled) return;

    if (!currentFirebaseUser) {
        showNotice("Для сохранения необходимо войти в систему.", true);
        return;
    }

    const formData = new FormData(form);

    const inventoryId = Number(formData.get("inventoryId"));
    const quantity = Number(formData.get("quantity"));
    const date = String(formData.get("date") || "");
    const reason = String(formData.get("reason") || "").trim();

    const item = data.inventory.find(
        (record) => Number(record.id) === inventoryId
    );

    if (!item) {
        showNotice("Выбранный материал не найден.", true);
        return;
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
        showNotice("Количество должно быть положительным целым числом.", true);
        return;
    }

    if (!isValidDateString(date) || date > todayString()) {
        showNotice("Укажите корректную дату списания.", true);
        return;
    }

    if (!reason) {
        showNotice("Укажите причину списания.", true);
        return;
    }

    if (quantity > Number(item.quantity)) {
        showNotice(
            `Недостаточно материала. Доступно: ${item.quantity} ${item.unit}.`,
            true
        );
        return;
    }

    const transactionId = getNextId(data.inventoryTransactions);

    const savedTransaction = {
        id: transactionId,
        inventoryId,
        materialName: item.name,
        type: "Списание",
        quantity,
        price: Number(item.price),
        date,
        reason,
        createdAt: new Date().toISOString()
    };

    submitButton.disabled = true;
    submitButton.textContent = "Сохранение...";

    try {
        const itemRef = getUserCollection("inventory")
            .doc(String(inventoryId));

        const transactionRef = getUserCollection("inventoryTransactions")
            .doc(String(transactionId));

        await window.db.runTransaction(async (dbTransaction) => {
            const itemSnapshot = await dbTransaction.get(itemRef);
            const operationSnapshot = await dbTransaction.get(transactionRef);

            if (!itemSnapshot.exists) {
                throw new Error("Материал не найден в базе данных.");
            }

            if (operationSnapshot.exists) {
                throw new Error(
                    "Операция с таким номером уже существует. Повторите попытку."
                );
            }

            const currentItem = itemSnapshot.data();
            const currentQuantity = Number(currentItem.quantity);
            const currentPrice = Number(currentItem.price);

            if (
                !Number.isSafeInteger(currentQuantity) ||
                currentQuantity < 0 ||
                !Number.isFinite(currentPrice) ||
                currentPrice < 0
            ) {
                throw new Error("У материала некорректные складские данные.");
            }

            if (quantity > currentQuantity) {
                throw new Error(
                    `Недостаточно материала. Доступно: ${currentQuantity}.`
                );
            }

            dbTransaction.update(itemRef, {
                quantity: currentQuantity - quantity
            });

            dbTransaction.set(transactionRef, savedTransaction);
        });

        const index = data.inventory.findIndex(
            (record) => Number(record.id) === inventoryId
        );

        if (index !== -1) {
            data.inventory[index] = {
                ...data.inventory[index],
                quantity: Number(data.inventory[index].quantity) - quantity
            };
        }

        data.inventoryTransactions.push(savedTransaction);

        saveData();
        renderModule();

        showNotice("Списание сохранено. Остаток склада обновлён.");
    } catch (error) {
        console.error("Ошибка списания материалов:", error);

        showNotice(
            `Не удалось сохранить списание: ${
                error.message || "ошибка Firebase"
            }`,
            true
        );

        submitButton.disabled = false;
        submitButton.textContent = "Сохранить списание";
    }
}


function openMedicalCard(patientId) {
    const patient = data.patients.find(
        (item) => item.id === patientId
    );

    if (!patient) {
        showNotice("Пациент не найден.", true);
        return;
    }

    $("#dashboardPage").hidden = true;
    $("#modulePage").hidden = false;

    $("#pageTitle").textContent = "Медицинская карта";
    $("#pageDescription").textContent =
        `Медицинская карта пациента: ${patient.name}`;

    $("#moduleTitle").textContent = "Медицинская карта пациента";
    $("#moduleDescription").textContent =
        "Медицинская история, услуги и финансовые сведения";

    $("#addRecordButton").hidden = true;

    const patientVisits = data.visits
        .filter((visit) => Number(visit.patientId) === patientId)
        .sort((a, b) => (b.date || "").localeCompare(a.date || ""));

    const medicalCard = (data.medicalCards || []).find(
        (card) => Number(card.patientId) === patientId
    );

    const patientServices = (data.patientServices || []).filter(
        (service) => Number(service.patientId) === patientId
    );

    const financialTransactions =
        (data.financialTransactions || []).filter(
            (transaction) =>
                Number(transaction.patientId) === patientId
        );

    const medicalDetailsHTML = medicalCard
        ? `
            <div class="info-note">
                <p><strong>Жалобы:</strong> ${
                    escapeHTML(medicalCard.complaints || "Не указаны")
                }</p>
                <p><strong>Диагноз:</strong> ${
                    escapeHTML(medicalCard.diagnosis || "Не указан")
                }</p>
                <p><strong>Назначения:</strong> ${
                    escapeHTML(medicalCard.treatment || "Не указаны")
                }</p>
                <p><strong>Аллергии:</strong> ${
                    escapeHTML(medicalCard.allergies || "Не указаны")
                }</p>
                <p><strong>Заметки:</strong> ${
                    escapeHTML(medicalCard.medicalNotes || "Нет")
                }</p>

                <button type="button"
                    class="secondary-button"
                    id="editMedicalRecordButton">
                    Редактировать запись
                </button>
            </div>
        `
        : `
            <div class="info-note">
                <strong>Медицинских записей пока нет</strong>
                <p>Добавьте первую запись о состоянии пациента.</p>
            </div>
        `;

    const visitsHTML = patientVisits.length
        ? patientVisits.map((visit) => `
            <tr>
                <td>${formatDate(visit.date)}</td>
                <td>${escapeHTML(visit.time || "09:00")}</td>
                <td>${escapeHTML(getEmployeeName(visit.employeeId))}</td>
                <td>${statusBadge(visit.status)}</td>
            </tr>
        `).join("")
        : emptyRow(4, "История обращений пока пуста");



const sortedPatientServices = [...patientServices].sort(
    (a, b) => (b.date || "").localeCompare(a.date || "")
);


const servicesHTML = patientServices.length
    ? patientServices.map((service) => {
        const quantity = Number(service.quantity) || 1;

        const cost = service.totalPrice != null
            ? Number(service.totalPrice)
            : (Number(service.price) || 0) * quantity;

        const paid = financialTransactions
            .filter((transaction) =>
                transaction.type === "Оплата услуги" &&
                Number(transaction.patientServiceId) === Number(service.id)
            )
            .reduce((sum, transaction) => {
                return sum + (Number(transaction.amount) || 0);
            }, 0);

        let paymentStatus;

        if (paid >= cost) {
            paymentStatus = "Оплачено";
        } else if (paid > 0) {
            paymentStatus = "Частично оплачено";
        } else {
            paymentStatus = "Ожидает оплаты";
        }

        return `
            <tr>
                <td>${formatDate(service.date || "")}</td>
                <td>${escapeHTML(service.serviceName || "")}</td>
                <td>${quantity}</td>
                <td>${cost.toLocaleString("ru-RU")} ₽</td>
                <td>${paymentStatus}</td>
                <td>
                    <button
                        type="button"
                        class="secondary-button"
                        data-edit-patient-service="${service.id}">
                        Изменить
                    </button>
                    <button
                        type="button"
                        class="danger-button"
                        data-delete-patient-service="${service.id}">
                        Удалить
                    </button>
                </td>
            </tr>
        `;
    }).join("")
    : emptyRow(6, "Оказанных услуг пока нет");



    
const sortedTransactions = [...financialTransactions].sort(
    (a, b) => (b.date || "").localeCompare(a.date || "")
);

const totalServicesCost = patientServices.reduce((sum, service) => {
    const quantity = Number(service.quantity) || 1;
    const price = service.totalPrice != null
        ? Number(service.totalPrice)
        : (Number(service.price) || 0) * quantity;

    return sum + price;
}, 0);

const totalPayments = financialTransactions.reduce((sum, transaction) => {
    return sum + (
        transaction.type === "Оплата услуги"
            ? Number(transaction.amount) || 0
            : 0
    );
}, 0);

const totalDebt = patientServices.reduce((sum, service) => {
    const quantity = Number(service.quantity) || 1;
    const cost = service.totalPrice != null
        ? Number(service.totalPrice)
        : (Number(service.price) || 0) * quantity;

    const paid = financialTransactions
        .filter((transaction) =>
            transaction.type === "Оплата услуги" &&
            Number(transaction.patientServiceId) === Number(service.id)
        )
        .reduce((paymentSum, transaction) => {
            return paymentSum + (Number(transaction.amount) || 0);
        }, 0);

    return sum + Math.max(0, cost - paid);
}, 0);

const financesHTML = sortedTransactions.length
    ? sortedTransactions.map((transaction) => `
        <tr>
            <td>${formatDate(transaction.date || "")}</td>
            <td>${escapeHTML(
                transaction.description || transaction.type || "Операция"
            )}</td>
            <td>${Number(transaction.amount || 0).toLocaleString("ru-RU")} ₽</td>
        </tr>
    `).join("")
    : emptyRow(3, "Финансовых операций пока нет");


    $("#moduleContent").innerHTML = `
        <div class="info-note">
            <strong>${escapeHTML(patient.name)}</strong>
            <p>Дата рождения: ${formatDate(patient.birth)}</p>
            <p>Телефон: ${escapeHTML(patient.phone || "Не указан")}</p>
        </div>

        <div class="medical-card-tabs">
            <button type="button"
                class="secondary-button medical-tab active"
                data-tab="overview">Обзор</button>
            <button type="button"
                class="secondary-button medical-tab"
                data-tab="history">Медицинская история</button>
            <button type="button"
                class="secondary-button medical-tab"
                data-tab="services">Услуги</button>
            <button type="button"
                class="secondary-button medical-tab"
                data-tab="finances">Финансы</button>
        </div>

        
<section class="medical-tab-content" data-panel="overview">
    <h3>Общая информация</h3>

    <div class="stats-grid">
        <article class="stat-card blue">
            <div>
                <span>Обращения</span>
                <strong>${patientVisits.length}</strong>
            </div>
        </article>

        <article class="stat-card green">
            <div>
                <span>Оказанные услуги</span>
                <strong>${patientServices.length}</strong>
            </div>
        </article>

        <article class="stat-card orange">
            <div>
                <span>Финансовые операции</span>
                <strong>${financialTransactions.length}</strong>
            </div>
        </article>
    </div>

    <h3>Последнее обращение</h3>

    ${
        patientVisits.length
            ? `
                <div class="info-note">
                    <p>
                        <strong>Дата:</strong>
                        ${formatDate(patientVisits[0].date)}
                    </p>
                    <p>
                        <strong>Время:</strong>
                        ${escapeHTML(patientVisits[0].time || "09:00")}
                    </p>
                    <p>
                        <strong>Сотрудник:</strong>
                        ${escapeHTML(
                            getEmployeeName(patientVisits[0].employeeId)
                        )}
                    </p>
                    <p>
                        <strong>Статус:</strong>
                        ${statusBadge(patientVisits[0].status)}
                    </p>
                </div>
            `
            : '<p class="info-note">Обращений пока нет.</p>'
    }

    <p class="info-note">
        Для просмотра медицинских записей, оказанных услуг
        и финансовой информации используйте вкладки выше.
    </p>
</section>


        <section class="medical-tab-content" data-panel="history" hidden>
            <h3>Медицинские записи</h3>

            <button type="button"
                class="secondary-button"
                id="addMedicalRecordButton">
                Добавить медицинскую запись
            </button>

            <div id="medicalRecordFormContainer"></div>

            <div id="medicalRecordDetails">
                ${medicalDetailsHTML}
            </div>

            <h3>История обращений</h3>
            <div class="table-wrap">
                <table>
                    <thead><tr>
                        <th>Дата</th><th>Время</th>
                        <th>Сотрудник</th><th>Статус</th>
                    </tr></thead>
                    <tbody>${visitsHTML}</tbody>
                </table>
            </div>
        </section>


<section class="medical-tab-content" data-panel="services" hidden>
    <h3>Оказанные услуги</h3>

    <button
        type="button"
        class="primary-button"
        id="addPatientServiceButton">
        Добавить оказанную услугу
    </button>

    <div id="patientServiceFormContainer"></div>

    <div class="table-wrap">
        <table>
            <thead>
                <tr>
                    <th>Дата</th>
                    <th>Услуга</th>
                    <th>Количество</th>
                    <th>Стоимость</th>
                    <th>Статус оплаты</th>
                    <th>Действия</th>
                </tr>
            </thead>
            <tbody>${servicesHTML}</tbody>
        </table>
    </div>
</section>


        
<section class="medical-tab-content" data-panel="finances" hidden>
    <h3>Финансовое состояние</h3>

    <div class="stats-grid">
        <article class="stat-card blue">
            <div>
                <span>Стоимость услуг</span>
                <strong>${totalServicesCost.toLocaleString("ru-RU")} ₽</strong>
            </div>
        </article>

        <article class="stat-card green">
            <div>
                <span>Оплачено</span>
                <strong>${totalPayments.toLocaleString("ru-RU")} ₽</strong>
            </div>
        </article>

        <article class="stat-card orange">
            <div>
                <span>Задолженность</span>
                <strong>${totalDebt.toLocaleString("ru-RU")} ₽</strong>
            </div>
        </article>
    </div>

    <p class="info-note">
        Оплаты учитываются отдельно по каждой оказанной услуге.
        Средства на лицевом счёте в этих показателях не учитываются.
    </p>

    <h3>Регистрация оплаты</h3>

    <button
        type="button"
        class="primary-button"
        id="addPatientPaymentButton">
        Зарегистрировать оплату
    </button>

    <div id="patientPaymentFormContainer"></div>

    <h3>История финансовых операций</h3>

    <div class="table-wrap">
        <table>
            <thead>
                <tr>
                    <th>Дата</th>
                    <th>Операция</th>
                    <th>Сумма</th>
                </tr>
            </thead>
            <tbody>${financesHTML}</tbody>
        </table>
    </div>
</section>


        <button type="button"
            class="secondary-button"
            id="backToPatientsButton">
            Вернуться к пациентам
        </button>
    `;

    document.querySelectorAll(".medical-tab").forEach((button) => {
        button.addEventListener("click", () => {
            const selectedTab = button.dataset.tab;

            document.querySelectorAll(".medical-tab").forEach((tab) => {
                const active = tab === button;
                tab.classList.toggle("active", active);
                tab.setAttribute("aria-selected", String(active));
            });

            document.querySelectorAll(".medical-tab-content").forEach((panel) => {
                panel.hidden = panel.dataset.panel !== selectedTab;
            });
        });
    });

    $("#addMedicalRecordButton").addEventListener("click", () => {
        showMedicalRecordForm(patientId);
    });

    
$("#addPatientServiceButton").addEventListener("click", () => {
    showPatientServiceForm(patientId);
});


$("#addPatientPaymentButton").addEventListener("click", () => {
    showPatientPaymentForm(patientId);
});



document.querySelectorAll("[data-edit-patient-service]").forEach((button) => {
    button.addEventListener("click", () => {
        showPatientServiceForm(
            patientId,
            Number(button.dataset.editPatientService)
        );
    });
});

document.querySelectorAll("[data-delete-patient-service]").forEach((button) => {
    button.addEventListener("click", () => {
        deletePatientService(
            patientId,
            Number(button.dataset.deletePatientService)
        );
    });
});



    const editButton = $("#editMedicalRecordButton");

    if (editButton) {
        editButton.addEventListener("click", () => {
            showMedicalRecordForm(patientId, medicalCard);
        });
    }

    $("#backToPatientsButton").addEventListener("click", () => {
        navigate("Пациенты");
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
}


function showMedicalRecordForm(patientId, existingRecord = null) {
    const container = $("#medicalRecordFormContainer");

    const record = existingRecord || {
        complaints: "",
        diagnosis: "",
        treatment: "",
        allergies: "",
        medicalNotes: ""
    };

    container.innerHTML = `
        <form id="medicalRecordForm" class="info-note">
            <h3>${existingRecord ? "Редактирование записи" : "Новая медицинская запись"}</h3>

            <div class="form-field">
                <label for="medicalComplaints">Жалобы пациента</label>
                <textarea id="medicalComplaints" name="complaints" rows="3">${escapeHTML(record.complaints)}</textarea>
            </div>

            <div class="form-field">
                <label for="medicalDiagnosis">Диагноз</label>
                <textarea id="medicalDiagnosis" name="diagnosis" rows="3">${escapeHTML(record.diagnosis)}</textarea>
            </div>

            <div class="form-field">
                <label for="medicalTreatment">Назначения и рекомендации</label>
                <textarea id="medicalTreatment" name="treatment" rows="3">${escapeHTML(record.treatment)}</textarea>
            </div>

            <div class="form-field">
                <label for="medicalAllergies">Аллергии</label>
                <textarea id="medicalAllergies" name="allergies" rows="2">${escapeHTML(record.allergies)}</textarea>
            </div>

            <div class="form-field">
                <label for="medicalNotes">Дополнительные заметки</label>
                <textarea id="medicalNotes" name="medicalNotes" rows="3">${escapeHTML(record.medicalNotes)}</textarea>
            </div>

            <div class="record-actions">
                <button type="submit" class="primary-button">
                    Сохранить запись
                </button>

                <button type="button"
                    class="secondary-button"
                    id="cancelMedicalRecordButton">
                    Отмена
                </button>
            </div>
        </form>
    `;

    $("#cancelMedicalRecordButton").addEventListener("click", () => {
        container.innerHTML = "";
    });

    $("#medicalRecordForm").addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!currentFirebaseUser) {
            showNotice("Для сохранения необходимо войти в систему.", true);
            return;
        }

        const form = event.currentTarget;
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;

        const formData = new FormData(form);

        const savedRecord = {
            ...(existingRecord || {}),
            id: existingRecord?.id ?? getNextId(data.medicalCards),
            patientId,
            complaints: String(formData.get("complaints") || "").trim(),
            diagnosis: String(formData.get("diagnosis") || "").trim(),
            treatment: String(formData.get("treatment") || "").trim(),
            allergies: String(formData.get("allergies") || "").trim(),
            medicalNotes: String(formData.get("medicalNotes") || "").trim(),
            updatedAt: new Date().toISOString()
        };

        try {
            await getUserCollection("medicalCards")
                .doc(String(savedRecord.id))
                .set(savedRecord);

            const index = data.medicalCards.findIndex(
                (item) => item.id === savedRecord.id
            );

            if (index === -1) {
                data.medicalCards.push(savedRecord);
            } else {
                data.medicalCards[index] = savedRecord;
            }

            saveData();

            showNotice("Медицинская запись сохранена в Firebase.");

            // Перерисовываем карту, чтобы показать актуальные данные.
            openMedicalCard(patientId);

            // После сохранения сразу открываем вкладку истории.
            const historyTab = document.querySelector(
                '.medical-tab[data-tab="history"]'
            );

            if (historyTab) {
                historyTab.click();
            }
        } catch (error) {
            console.error("Ошибка сохранения медицинской записи:", error);
            showNotice("Не удалось сохранить медицинскую запись в Firebase.", true);
            submitButton.disabled = false;
        }
    });
}



function showPatientServiceForm(patientId, serviceId = null) {
    const container = $("#patientServiceFormContainer");

    if (!currentFirebaseUser) {
        showNotice("Для сохранения необходимо войти в систему.", true);
        return;
    }

    const existingService = serviceId === null
        ? null
        : data.patientServices.find(
            (item) =>
                Number(item.id) === serviceId &&
                Number(item.patientId) === patientId
        );

    if (serviceId !== null && !existingService) {
        showNotice("Запись об оказанной услуге не найдена.", true);
        return;
    }

    if (!data.services.length) {
        showNotice("Сначала добавьте услуги в справочник.", true);
        return;
    }

    const selectedServiceId = existingService?.serviceId
        ?? data.services.find(
            (item) => item.name === existingService?.serviceName
        )?.id
        ?? "";

    const serviceOptions = data.services.map((service) => `
        <option
            value="${service.id}"
            ${Number(service.id) === Number(selectedServiceId) ? "selected" : ""}>
            ${escapeHTML(service.name)} — ${
                Number(service.price).toLocaleString("ru-RU")
            } ₽
        </option>
    `).join("");

    container.innerHTML = `
        <form id="patientServiceForm" class="info-note">
            <h3>${existingService ? "Редактирование услуги" : "Регистрация оказанной услуги"}</h3>

            <div class="form-field">
                <label for="patientServiceDate">Дата оказания</label>
                <input
                    id="patientServiceDate"
                    name="date"
                    type="date"
                    value="${escapeHTML(existingService?.date || todayString())}"
                    max="${todayString()}"
                    required>
            </div>

            <div class="form-field">
                <label for="patientServiceSelect">Медицинская услуга</label>
                <select id="patientServiceSelect" name="serviceId" required>
                    <option value="">Выберите услугу</option>
                    ${serviceOptions}
                </select>
            </div>

            <div class="form-field">
                <label for="patientServiceQuantity">Количество</label>
                <input
                    id="patientServiceQuantity"
                    name="quantity"
                    type="number"
                    min="1"
                    max="1000"
                    value="${existingService?.quantity ?? 1}"
                    required>
            </div>

            <div id="patientServicePricePreview" class="info-note"></div>

            

            <div class="record-actions">
                <button type="submit" class="primary-button">
                    Сохранить
                </button>
                <button
                    type="button"
                    class="secondary-button"
                    id="cancelPatientServiceButton">
                    Отмена
                </button>
            </div>
        </form>
    `;

    const form = $("#patientServiceForm");
    const serviceSelect = $("#patientServiceSelect");
    const quantityInput = $("#patientServiceQuantity");
    const pricePreview = $("#patientServicePricePreview");

    function updatePricePreview() {
        const selected = data.services.find(
            (item) => Number(item.id) === Number(serviceSelect.value)
        );

        const quantity = Number(quantityInput.value);

        if (!selected) {
            pricePreview.textContent = "Выберите услугу.";
            return;
        }

        if (!Number.isInteger(quantity) || quantity < 1 || quantity > 1000) {
            pricePreview.textContent = "Количество должно быть от 1 до 1000.";
            return;
        }

        // При редактировании сохраняем первоначальную цену,
        // если услуга не была заменена на другую.
        const unitPrice = existingService &&
            Number(selected.id) === Number(selectedServiceId)
                ? Number(existingService.price)
                : Number(selected.price);

        pricePreview.textContent =
            `Цена за единицу: ${unitPrice.toLocaleString("ru-RU")} ₽. ` +
            `Итого: ${(unitPrice * quantity).toLocaleString("ru-RU")} ₽.`;
    }

    serviceSelect.addEventListener("change", updatePricePreview);
    quantityInput.addEventListener("input", updatePricePreview);
    updatePricePreview();

    $("#cancelPatientServiceButton").addEventListener("click", () => {
        container.innerHTML = "";
    });


form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton = form.querySelector('button[type="submit"]');

    if (submitButton.disabled) {
        return;
    }

    if (!currentFirebaseUser) {
        showNotice("Для сохранения необходимо войти в систему.", true);
        return;
    }

    const selected = data.services.find(
        (item) => Number(item.id) === Number(serviceSelect.value)
    );

    const formData = new FormData(form);
    const date = String(formData.get("date") || "");
    const quantity = Number(formData.get("quantity"));

    if (!selected) {
        showNotice("Выберите услугу из справочника.", true);
        return;
    }

    if (!isValidDateString(date) || date > todayString()) {
        showNotice("Укажите корректную дату оказания услуги.", true);
        return;
    }

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 1000) {
        showNotice("Количество должно быть от 1 до 1000.", true);
        return;
    }

    const unitPrice = existingService &&
        Number(selected.id) === Number(selectedServiceId)
            ? Number(existingService.price)
            : Number(selected.price);

    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
        showNotice("Указана некорректная стоимость услуги.", true);
        return;
    }

    const savedService = {
        ...(existingService || {}),
        id: existingService?.id ?? getNextId(data.patientServices),
        patientId,
        serviceId: selected.id,
        serviceName: selected.name,
        department: selected.department || "",
        date,
        quantity,
        price: unitPrice,
        totalPrice: unitPrice * quantity,
        updatedAt: new Date().toISOString()
    };

    submitButton.disabled = true;
    submitButton.textContent = "Сохранение...";

    try {
        await getUserCollection("patientServices")
            .doc(String(savedService.id))
            .set(savedService);

        const index = data.patientServices.findIndex(
            (item) => Number(item.id) === Number(savedService.id)
        );

        if (index === -1) {
            data.patientServices.push(savedService);
        } else {
            data.patientServices[index] = savedService;
        }

        saveData();

        openMedicalCard(patientId);

        document.querySelector(
            '.medical-tab[data-tab="services"]'
        )?.click();

        showNotice("Оказанная услуга успешно сохранена.");
    } catch (error) {
        console.error("Ошибка сохранения услуги:", error);

        showNotice(
            `Не удалось сохранить услугу: ${error.message || "ошибка Firebase"}`,
            true
        );

        submitButton.disabled = false;
        submitButton.textContent = "Сохранить";
    }
});
}


async function deletePatientService(patientId, serviceId) {
    if (!currentFirebaseUser) {
        showNotice("Для удаления необходимо войти в систему.", true);
        return;
    }

    const service = data.patientServices.find(
        (item) =>
            Number(item.id) === serviceId &&
            Number(item.patientId) === patientId
    );

    if (!service) {
        showNotice("Запись об оказанной услуге не найдена.", true);
        return;
    }

    
const hasPayments = data.financialTransactions.some(
    (transaction) =>
        transaction.type === "Оплата услуги" &&
        Number(transaction.patientServiceId) === serviceId
);

if (hasPayments) {
    showNotice(
        "Нельзя удалить услугу, по которой зарегистрирована оплата. " +
        "Сначала необходимо разобраться со связанными финансовыми операциями.",
        true
    );
    return;
}


    const confirmed = confirm(
        `Удалить услугу «${service.serviceName}» из истории пациента?`
    );

    if (!confirmed) return;

    try {
        await getUserCollection("patientServices")
            .doc(String(service.id))
            .delete();

        data.patientServices = data.patientServices.filter(
            (item) => Number(item.id) !== serviceId
        );

        saveData();

        showNotice("Запись об оказанной услуге удалена.");

        openMedicalCard(patientId);

        document.querySelector(
            '.medical-tab[data-tab="services"]'
        )?.click();
    } catch (error) {
        console.error("Ошибка удаления услуги:", error);
        showNotice("Не удалось удалить услугу из Firebase.", true);
    }
}


function showPatientPaymentForm(patientId) {
    const container = $("#patientPaymentFormContainer");

    if (!currentFirebaseUser) {
        showNotice("Для регистрации оплаты необходимо войти в систему.", true);
        return;
    }

    const patientServices = data.patientServices.filter(
        (service) => Number(service.patientId) === patientId
    );

    const unpaidServices = patientServices.map((service) => {
        const quantity = Number(service.quantity) || 1;

        const cost = service.totalPrice != null
            ? Number(service.totalPrice)
            : (Number(service.price) || 0) * quantity;

        const paid = data.financialTransactions
            .filter((transaction) =>
                transaction.type === "Оплата услуги" &&
                Number(transaction.patientServiceId) === Number(service.id)
            )
            .reduce((sum, transaction) => {
                return sum + (Number(transaction.amount) || 0);
            }, 0);

        return {
            ...service,
            cost,
            paid,
            remaining: Math.max(0, cost - paid)
        };
    }).filter((service) => service.remaining > 0);

    if (!unpaidServices.length) {
        showNotice(
            "Нет услуг с задолженностью. Сначала зарегистрируйте оказанную услугу.",
            true
        );
        return;
    }

    const serviceOptions = unpaidServices.map((service) => `
        <option value="${service.id}">
            ${escapeHTML(service.serviceName || "Услуга")}
            — остаток ${service.remaining.toLocaleString("ru-RU")} ₽
        </option>
    `).join("");

    container.innerHTML = `
        <form id="patientPaymentForm" class="info-note">
            <h3>Новая оплата</h3>

            <div class="form-field">
                <label for="patientPaymentService">Оказанная услуга</label>
                <select id="patientPaymentService" name="serviceId" required>
                    ${serviceOptions}
                </select>
            </div>

            <div id="patientPaymentBalance" class="info-note"></div>

            <div class="form-field">
                <label for="patientPaymentDate">Дата оплаты</label>
                <input
                    id="patientPaymentDate"
                    name="date"
                    type="date"
                    value="${todayString()}"
                    max="${todayString()}"
                    required>
            </div>

            <div class="form-field">
                <label for="patientPaymentAmount">Сумма оплаты, ₽</label>
                <input
                    id="patientPaymentAmount"
                    name="amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    required>
            </div>

            <div class="form-field">
                <label for="patientPaymentDescription">Комментарий</label>
                <input
                    id="patientPaymentDescription"
                    name="description"
                    type="text"
                    maxlength="200"
                    placeholder="Например, частичная оплата">
            </div>

            <div class="record-actions">
                <button type="submit" class="primary-button">
                    Сохранить оплату
                </button>
                <button
                    type="button"
                    class="secondary-button"
                    id="cancelPatientPaymentButton">
                    Отмена
                </button>
            </div>
        </form>
    `;

    const form = $("#patientPaymentForm");
    const serviceSelect = $("#patientPaymentService");
    const amountInput = $("#patientPaymentAmount");
    const balanceBox = $("#patientPaymentBalance");

    function getSelectedService() {
        return unpaidServices.find(
            (service) => Number(service.id) === Number(serviceSelect.value)
        );
    }

    function updatePaymentBalance() {
        const service = getSelectedService();

        if (!service) {
            balanceBox.textContent = "Выберите услугу.";
            amountInput.max = "";
            return;
        }

        balanceBox.textContent =
            `Стоимость: ${service.cost.toLocaleString("ru-RU")} ₽. ` +
            `Уже оплачено: ${service.paid.toLocaleString("ru-RU")} ₽. ` +
            `Остаток: ${service.remaining.toLocaleString("ru-RU")} ₽.`;

        amountInput.max = service.remaining.toFixed(2);
    }

    serviceSelect.addEventListener("change", updatePaymentBalance);
    updatePaymentBalance();

    $("#cancelPatientPaymentButton").addEventListener("click", () => {
        container.innerHTML = "";
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const service = getSelectedService();
        const formData = new FormData(form);
        const date = String(formData.get("date") || "");
        const amount = Number(formData.get("amount"));
        const description = String(
            formData.get("description") || ""
        ).trim();

        if (!service) {
            showNotice("Выберите услугу.", true);
            return;
        }

        if (!isValidDateString(date) || date > todayString()) {
            showNotice("Укажите корректную дату оплаты.", true);
            return;
        }

        if (
            !Number.isFinite(amount) ||
            amount <= 0 ||
            amount > service.remaining
        ) {
            showNotice(
                "Сумма должна быть больше нуля и не превышать остаток долга по услуге.",
                true
            );
            return;
        }

        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;

        const transaction = {
            id: getNextId(data.financialTransactions),
            patientId,
            patientServiceId: service.id,
            type: "Оплата услуги",
            description: description || `Оплата: ${service.serviceName}`,
            amount: Math.round(amount * 100) / 100,
            date,
            createdAt: new Date().toISOString()
        };

        try {
            await getUserCollection("financialTransactions")
                .doc(String(transaction.id))
                .set(transaction);

            data.financialTransactions.push(transaction);
            saveData();

            showNotice("Оплата успешно сохранена.");

            openMedicalCard(patientId);

            document.querySelector(
                '.medical-tab[data-tab="finances"]'
            )?.click();
        } catch (error) {
            console.error("Ошибка сохранения оплаты:", error);

            showNotice("Не удалось сохранить оплату в Firebase.", true);
            submitButton.disabled = false;
        }
    });
}




function renderReports() {
    const completed = data.visits.filter((item) => item.status === "Завершено").length;
    const planned = data.visits.filter((item) => item.status === "Запланировано").length;
    const waiting = data.visits.filter((item) => item.status === "Ожидает").length;

    $("#moduleContent").innerHTML = `
        <div class="stats-grid">
            <article class="stat-card blue">
                <div class="stat-icon">▣</div>
                <div><span>Всего обращений</span><strong>${data.visits.length}</strong>
                <small>Все зарегистрированные записи</small></div>
            </article>
            <article class="stat-card green">
                <div class="stat-icon">✓</div>
                <div><span>Завершено</span><strong>${completed}</strong>
                <small>Завершённые обращения</small></div>
            </article>
            <article class="stat-card orange">
                <div class="stat-icon">◷</div>
                <div><span>Ожидают</span><strong>${waiting}</strong>
                <small>Ожидающие обращения</small></div>
            </article>
            <article class="stat-card purple">
                <div class="stat-icon">▦</div>
                <div><span>Запланировано</span><strong>${planned}</strong>
                <small>Запланированные обращения</small></div>
            </article>
        </div>
        <p style="color: var(--muted); margin-top: 20px; line-height: 1.7;">
            Это предварительная сводка по демонстрационным записям.
            После подключения Firebase добавим фильтр по периоду и
            построение отчётов на основе сохранённых данных.
        </p>
    `;
}


function openRecordForm(type = currentPage, recordId = null) {
    const types = {
        patient: "Пациенты",
        employee: "Сотрудники",
        service: "Услуги",
        visit: "Обращения"
    };

    const page = types[type] || type;
    const config = pageInfo[page] ? getConfigForPage(page) : null;

    if (!config) {
        showNotice("Для этого действия форма пока недоступна.", true);
        return;
    }

    if (
        config.key === "visits" &&
        (!data.patients.length || !data.employees.length)
    ) {
        showNotice(
            "Сначала добавьте хотя бы одного пациента и сотрудника.",
            true
        );
        return;
    }

    if (
        ["employees", "services"].includes(config.key) &&
        !data.departments.length
    ) {
        showNotice("Сначала добавьте подразделение.", true);
        return;
    }

    let record = null;

    if (recordId !== null) {
        record = data[config.key].find(
            (item) => item.id === Number(recordId)
        );

        if (!record) {
            showNotice("Запись не найдена.", true);
            return;
        }
    }

    currentFormType = config.key;
    currentEditingId = record ? record.id : null;

    $("#dialogTitle").textContent = record
        ? `Редактирование: ${page.toLowerCase()}`
        : config.dialogTitle;

    $("#formFields").innerHTML = config.fields
        .map(createField)
        .join("");

    // Заполняем поля данными выбранной записи
    if (record) {
        for (const field of config.fields) {
            const input = $(`#formFields [name="${field.name}"]`);

            if (input) {
                input.value = record[field.name] ?? "";
            }
        }
    }

    getFormErrorBox().hidden = true;
$("#recordDialog").showModal();
}


function getConfigForPage(page) {
    const previousPage = currentPage;
    currentPage = page;
    const config = getModuleConfig();
    currentPage = previousPage;

    if (!config) return null;

    return {
        ...config,
        dialogTitle: `Добавить запись: ${page.toLowerCase()}`,
    };
}



function createField(field) {
    const required = field.required ? "required" : "";
    let control;

    if (field.type === "select") {
        const options = (field.options?.() || []).map((option) => {
            const value = typeof option === "object"
                ? option.value
                : option;

            const label = typeof option === "object"
                ? option.label
                : option;

            return `<option value="${escapeHTML(value)}">${escapeHTML(label)}</option>`;
        }).join("");

        control = `
            <select name="${escapeHTML(field.name)}" ${required}>
                <option value="">Выберите значение</option>
                ${options}
            </select>
        `;
    } else if (field.type === "textarea") {
        control = `
            <textarea
                name="${escapeHTML(field.name)}"
                rows="3"
                ${required}
            ></textarea>
        `;
    } else {
        const type = field.type || "text";
        const min = field.min !== undefined
            ? `min="${field.min}"`
            : "";
        const max = field.max !== undefined
            ? `max="${field.max}"`
            : "";

        control = `
            <input
                name="${escapeHTML(field.name)}"
                type="${type}"
                ${min}
                ${max}
                ${required}
            >
        `;
    }

    return `
        <div class="form-field">
            <label>${escapeHTML(field.label)}</label>
            ${control}
        </div>
    `;
}




async function deleteRecord(recordId) {
    if (!currentFirebaseUser) {
        showNotice("Для удаления необходимо войти в систему.", true);
        return;
    }

    const config = getConfigForPage(currentPage);

    if (!config) return;

    const record = data[config.key].find(
        (item) => item.id === recordId
    );

    if (!record) {
        showNotice("Запись не найдена.", true);
        return;
    }

    const confirmed = confirm(
        "Вы действительно хотите удалить эту запись?"
    );

    
if (!confirmed) return;

// Проверяем, есть ли связанные обращения
if (config.key === "patients") {
    const hasVisits = data.visits.some(
        (visit) => visit.patientId === recordId
    );

    if (hasVisits) {
        showNotice(
            "Нельзя удалить пациента: сначала удалите связанные обращения.",
            true
        );
        return;
    }
}

if (config.key === "employees") {
    const hasVisits = data.visits.some(
        (visit) => visit.employeeId === recordId
    );

    if (hasVisits) {
        showNotice(
            "Нельзя удалить сотрудника: сначала удалите связанные обращения.",
            true
        );
        return;
    }
}

try {
    const collectionName = firestoreCollections[config.key];


        await getUserCollection(collectionName)
            .doc(String(recordId))
            .delete();

        data[config.key] = data[config.key].filter(
            (item) => item.id !== recordId
        );

        saveData();
        renderDashboard();
        renderModule();

        showNotice("Запись успешно удалена.");
    } catch (error) {
        console.error("Ошибка удаления записи:", error);

        showNotice(
            "Не удалось удалить запись из базы данных.",
            true
        );
    }
}


function closeRecordForm() {
    $("#recordDialog").close();
    $("#recordForm").reset();

    currentFormType = null;
    currentEditingId = null;
}


async function handleRecordSubmit(event) {
    event.preventDefault();

    if (!currentFirebaseUser) {
        showNotice("Для сохранения необходимо войти в систему.", true);
        return;
    }

    const pageByKey = {
        patients: "Пациенты",
        employees: "Сотрудники",
        departments: "Подразделения",
        services: "Услуги",
        visits: "Обращения",
        inventory: "Склад"
    };

    const page = pageByKey[currentFormType];

    if (!page) {
        showNotice("Не удалось определить тип записи.", true);
        return;
    }

    const previousPage = currentPage;
    currentPage = page;
    const config = getModuleConfig();
    currentPage = previousPage;

    if (!config) return;

    const form = event.currentTarget;
    const submitButton = form.querySelector(
        'button[type="submit"]'
    );

    const formData = new FormData(form);
    const record = {};

    for (const field of config.fields) {
        let value = formData.get(field.name);

        if (typeof value === "string") {
            value = value.trim();
        }

        if (field.required && (value === "" || value === null)) {
            showNotice("Заполните все обязательные поля.", true);
            return;
        }

        
if (field.name === "phone") {
    const phone = normalizePhone(value);

    if (!phone) {
        showNotice(
            "Введите корректный российский номер телефона из 11 цифр.",
            true
        );
        return;
    }

    value = phone;
}

if (field.type === "date") {
    if (!isValidDateString(value)) {
        showNotice("Введите корректную дату.", true);
        return;
    }

    if (
        field.name === "birth" &&
        value > todayString()
    ) {
        showNotice(
            "Дата рождения не может быть в будущем.",
            true
        );
        return;
    }
}


        
if (field.type === "number") {
    value = Number(value);

    if (!Number.isFinite(value) || value < 0) {
        showNotice(
            "Введите корректное числовое значение.",
            true
        );
        return;
    }

    if (field.name === "duration" && value < 1) {
        showNotice(
            "Длительность приёма должна быть не менее 1 минуты.",
            true
        );
        return;
    }
}


        if (["patientId", "employeeId"].includes(field.name)) {
            value = Number(value);
        }

        record[field.name] = value;
    }


if (currentFormType === "visits") {

    
if (!isValidDateString(record.date)) {
    showNotice("Укажите корректную дату приёма.", true);
    return;
}

if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(record.time || "")) {
    showNotice("Укажите корректное время приёма.", true);
    return;
}

if (
    !Number.isInteger(Number(record.duration)) ||
    Number(record.duration) < 1 ||
    Number(record.duration) > 1440
) {
    showNotice(
        "Длительность приёма должна быть целым числом от 1 до 1440 минут.",
        true
    );
    return;
}

if (
    !data.patients.some(
        (patient) => Number(patient.id) === Number(record.patientId)
    )
) {
    showNotice("Выбранный пациент не найден.", true);
    return;
}

if (
    !data.employees.some(
        (employee) => Number(employee.id) === Number(record.employeeId)
    )
) {
    showNotice("Выбранный сотрудник не найден.", true);
    return;
}

    const newStart = timeToMinutes(record.time);
    const newEnd = newStart + record.duration;

    const hasConflict = data.visits.some((visit) => {
        // При редактировании не сравниваем запись саму с собой
        if (visit.id === currentEditingId) {
            return false;
        }

        // Проверяем только записи того же врача на ту же дату
        if (
            visit.employeeId !== record.employeeId ||
            visit.date !== record.date
        ) {
            return false;
        }

        // Для старых записей без времени используем 09:00
        const existingStart = timeToMinutes(visit.time);
        const existingDuration = Number(visit.duration) || 30;
        const existingEnd = existingStart + existingDuration;

        // Проверяем, пересекаются ли два временных интервала
        return (
            newStart < existingEnd &&
            newEnd > existingStart
        );
    });

    if (hasConflict) {
        showNotice(
            "У этого врача уже есть приём на выбранное время. Выберите другое время.",
            true
        );
        return;
    }
}


    record.id = currentEditingId !== null
    ? currentEditingId
    : getNextId(data[currentFormType]);

    if (submitButton) {
        submitButton.disabled = true;
    }

    try {
        const collectionName =
            firestoreCollections[currentFormType];

        if (!collectionName) {
            throw new Error("Неизвестный тип записи.");
        }

        // Сохраняем запись в Firestore
        await getUserCollection(collectionName)
            .doc(String(record.id))
            .set(record);

        // Обновляем данные приложения после успешной записи
        // Обновляем существующую запись или добавляем новую
if (currentEditingId !== null) {
    const index = data[currentFormType].findIndex(
        (item) => item.id === currentEditingId
    );

    if (index !== -1) {
        data[currentFormType][index] = record;
    }
} else {
    data[currentFormType].push(record);
}

        // Обновляем локальную копию
        saveData();

        closeRecordForm();
        renderDashboard();

        if (currentPage === "Главная") {
            renderDashboard();
        } else {
            renderModule();
        }

        showNotice("Запись успешно сохранена в базе данных.");
    } catch (error) {
        console.error("Ошибка сохранения записи:", error);

        showNotice(
            "Не удалось сохранить запись. Проверьте подключение к базе данных.",
            true
        );
    } finally {
        if (submitButton) {
            submitButton.disabled = false;
        }
    }
}


document.querySelectorAll(".nav-item[data-page]").forEach((button) => {
    button.addEventListener("click", () => navigate(button.dataset.page));
});

document.querySelectorAll("[data-open-page]").forEach((button) => {
    button.addEventListener("click", () => navigate(button.dataset.openPage));
});

document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => openRecordForm(button.dataset.action));
});

$("#addRecordButton").addEventListener("click", () => openRecordForm(currentPage));
$("#recordForm").addEventListener("submit", handleRecordSubmit);
$("#closeDialog").addEventListener("click", closeRecordForm);
$("#cancelDialog").addEventListener("click", closeRecordForm);


function performGlobalSearch(query) {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
        navigate(currentPage);
        return;
    }

    const results = [];

    function addResults(collection, type, getText, page) {
        for (const record of collection) {
            const text = getText(record);

            if (text.toLowerCase().includes(normalizedQuery)) {
                results.push({
                    id: record.id,
                    type,
                    text,
                    page
                });
            }
        }
    }

    addResults(
        data.patients,
        "Пациент",
        (item) => `${item.name} ${item.phone} ${item.birth}`,
        "Пациенты"
    );

    addResults(
        data.employees,
        "Сотрудник",
        (item) => `${item.name} ${item.position} ${item.department}`,
        "Сотрудники"
    );

    addResults(
        data.departments,
        "Подразделение",
        (item) => `${item.name} ${item.head}`,
        "Подразделения"
    );

    addResults(
        data.services,
        "Услуга",
        (item) => `${item.name} ${item.price} ${item.department}`,
        "Услуги"
    );

    addResults(
        data.visits,
        "Обращение",
        (item) => [
            getPatientName(item.patientId),
            getEmployeeName(item.employeeId),
            item.date,
            item.status
        ].join(" "),
        "Обращения"
    );

    $("#dashboardPage").hidden = true;
    $("#modulePage").hidden = false;

    $("#pageTitle").textContent = "Результаты поиска";
    $("#pageDescription").textContent =
        `Найдено записей: ${results.length}`;

    $("#moduleTitle").textContent = "Глобальный поиск";
    $("#moduleDescription").textContent =
        "Результаты по всем основным разделам системы";

    $("#addRecordButton").hidden = true;

    $("#moduleContent").innerHTML = `
        <div class="module-toolbar">
            <span>Совпадений: ${results.length}</span>
        </div>

        <div class="table-wrap">
            <table>
                <thead>
                    <tr>
                        <th>Тип записи</th>
                        <th>Найденные сведения</th>
                        <th>Раздел</th>
                        <th>Действие</th>
                    </tr>
                </thead>
                <tbody>
                    ${
                        results.map((item) => `
                            <tr>
                                <td>${escapeHTML(item.type)}</td>
                                <td>${escapeHTML(item.text)}</td>
                                <td>${escapeHTML(item.page)}</td>
                                <td>
                                    <button
                                        type="button"
                                        class="secondary-button"
                                        data-search-page="${escapeHTML(item.page)}">
                                        Открыть раздел
                                    </button>
                                </td>
                            </tr>
                        `).join("")
                        || emptyRow(4, "Ничего не найдено")
                    }
                </tbody>
            </table>
        </div>
    `;

    document.querySelectorAll("[data-search-page]").forEach((button) => {
        button.addEventListener("click", () => {
            navigate(button.dataset.searchPage);
        });
    });
}

$("#globalSearch").addEventListener("input", (event) => {
    performGlobalSearch(event.target.value);
});



// Выход из учётной записи Firebase
$("#logoutButton").addEventListener("click", async () => {
    try {
        await window.auth.signOut();
    } catch (error) {
        console.error("Ошибка выхода:", error);
        showNotice("Не удалось выйти из системы.", true);
    }
});

// Вход в систему
$("#loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = $("#loginEmail").value.trim();
    const password = $("#loginPassword").value;
    const button = $("#loginButton");
    const errorMessage = $("#loginError");

    button.disabled = true;
    button.textContent = "Выполняется вход...";
    errorMessage.hidden = true;

    try {
        await window.auth.signInWithEmailAndPassword(email, password);
    } catch (error) {
        console.error("Ошибка авторизации:", error);

        const messages = {
            "auth/invalid-credential": "Неверная электронная почта или пароль.",
            "auth/user-not-found": "Пользователь не найден.",
            "auth/wrong-password": "Неверный пароль.",
            "auth/invalid-email": "Проверьте адрес электронной почты.",
            "auth/too-many-requests": "Слишком много попыток. Попробуйте позже."
        };

        errorMessage.textContent =
            messages[error.code] || "Не удалось выполнить вход. Проверьте данные и попробуйте снова.";

        errorMessage.hidden = false;
    } finally {
        button.disabled = false;
        button.textContent = "Войти";
    }
});

// Следим за состоянием авторизации

window.auth.onAuthStateChanged(async (user) => {
    const loginScreen = $("#loginScreen");
    const appRoot = $("#appRoot");

    if (user) {
        loginScreen.hidden = true;
        appRoot.hidden = false;

        const email = user.email || "Пользователь";

        $("#userName").textContent = email;
        $("#userName").title = email;

        document.querySelector(".user-avatar").textContent =
            email.charAt(0).toUpperCase();

        document.querySelector(".user-panel span").textContent =
            "Авторизованный пользователь";

        try {
            await loadFirestoreData(user);
        } catch (error) {
            console.error("Ошибка загрузки Firestore:", error);
            showNotice(
                "Не удалось загрузить данные. Проверьте подключение и правила Firestore.",
                true
            );
        }
    } else {
        currentFirebaseUser = null;

        appRoot.hidden = true;
        loginScreen.hidden = false;

        $("#loginPassword").value = "";

        console.log("Пользователь не авторизован");
    }
});



renderDate();
renderDashboard();
navigate("Главная");
