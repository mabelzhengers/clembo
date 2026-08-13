// ==========================================
// core tab manager navigation logic
// ==========================================
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const targetTab = button.getAttribute('data-tab');
        
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        button.classList.add('active');
        const targetElement = document.getElementById(targetTab);
        if (targetElement) targetElement.classList.add('active');
    });
});

// ==========================================
// dark mode preference memory system
// ==========================================
const darkModeToggle = document.getElementById('darkModeToggle');

let savedDarkMode = localStorage.getItem('myDarkMode') === 'enabled';
if (savedDarkMode) {
    document.body.classList.add('dark-mode');
    if (darkModeToggle) darkModeToggle.checked = true;
}

if (darkModeToggle) {
    darkModeToggle.addEventListener('change', () => {
        if (darkModeToggle.checked) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('myDarkMode', 'enabled');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('myDarkMode', 'disabled');
        }
    });
}

// ==========================================
// username & profile greeting engine
// ==========================================
const usernameInput = document.getElementById('usernameInput');
const saveUsernameBtn = document.getElementById('saveUsernameBtn');
const welcomeMessage = document.getElementById('welcomeMessage');
const homeGreeting = document.getElementById('homeGreeting');

let savedName = localStorage.getItem('dashboardName') || "guest";
function updateGreetingUI(name) {
    if (welcomeMessage) welcomeMessage.textContent = `hello, ${name}`;
    if (homeGreeting) homeGreeting.textContent = `welcome back, ${name}`;
}
updateGreetingUI(savedName);

if (saveUsernameBtn && usernameInput) {
    saveUsernameBtn.addEventListener('click', () => {
        const nameVal = usernameInput.value.trim();
        if (nameVal !== "") {
            localStorage.setItem('dashboardName', nameVal);
            updateGreetingUI(nameVal);
            usernameInput.value = "";
        }
    });
}

// ==========================================
// to-dos workflow tracker
// ==========================================
const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');

let myTasks = JSON.parse(localStorage.getItem('myTasks')) || [];

function renderTasks() {
    if (!taskList) return;
    taskList.innerHTML = "";
    myTasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.textContent = task;
        
        const delBtn = document.createElement('button');
        delBtn.textContent = 'x';
        delBtn.className = 'delete-btn';
        delBtn.addEventListener('click', () => {
            myTasks.splice(index, 1);
            localStorage.setItem('myTasks', JSON.stringify(myTasks));
            renderTasks();
        });
        li.appendChild(delBtn);
        taskList.appendChild(li);
    });
}
if (addBtn && taskInput) {
    addBtn.addEventListener('click', () => {
        const val = taskInput.value.trim();
        if (val !== "") {
            myTasks.push(val);
            localStorage.setItem('myTasks', JSON.stringify(myTasks));
            taskInput.value = "";
            renderTasks();
        }
    });
}
renderTasks();

// ==========================================
// habits workspace tracker with streak counter
// ==========================================
const habitInput = document.getElementById('habitInput');
const addHabitBtn = document.getElementById('addHabitBtn');
const habitList = document.getElementById('habitList');

let myHabits = JSON.parse(localStorage.getItem('myHabits')) || [];

function renderHabits() {
    if (!habitList) return;
    habitList.innerHTML = "";
    myHabits.forEach((habit, index) => {
        if (typeof habit === 'string') {
            habit = { name: habit, streak: 0 };
            myHabits[index] = habit;
        }

        const li = document.createElement('li');
        
        const textSpan = document.createElement('span');
        textSpan.textContent = `${habit.name} 🔥 ${habit.streak} days`;
        li.appendChild(textSpan);
        
        const actionDiv = document.createElement('div');
        actionDiv.style.display = "flex";
        actionDiv.style.gap = "8px";
        actionDiv.style.alignItems = "center";

        const plusBtn = document.createElement('button');
        plusBtn.textContent = '+1 Day';
        plusBtn.style.padding = "4px 8px";
        plusBtn.style.fontSize = "12px";
        plusBtn.addEventListener('click', () => {
            habit.streak++;
            localStorage.setItem('myHabits', JSON.stringify(myHabits));
            renderHabits();
        });
        
        const delBtn = document.createElement('button');
        delBtn.textContent = 'x';
        delBtn.className = 'delete-btn';
        delBtn.addEventListener('click', () => {
            myHabits.splice(index, 1);
            localStorage.setItem('myHabits', JSON.stringify(myHabits));
            renderHabits();
        });

        actionDiv.appendChild(plusBtn);
        actionDiv.appendChild(delBtn);
        li.appendChild(actionDiv);
        habitList.appendChild(li);
    });
}

if (addHabitBtn && habitInput) {
    addHabitBtn.addEventListener('click', () => {
        const val = habitInput.value.trim();
        if (val !== "") {
            myHabits.push({ name: val, streak: 0 });
            localStorage.setItem('myHabits', JSON.stringify(myHabits));
            habitInput.value = "";
            renderHabits();
        }
    });
}
renderHabits();

// ==========================================
// mood tracker calendar grid logger
// ==========================================
const currentMonthYear = document.getElementById('currentMonthYear');
const ratingPicker = document.getElementById('ratingPicker');
const calendarDaysGrid = document.getElementById('calendarDaysGrid');
const archiveList = document.getElementById('archiveList');

let moodData = JSON.parse(localStorage.getItem('myMoodData')) || {};
const moodMonths = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
const moodDate = new Date();
const moodYear = moodDate.getFullYear();
const moodMonthIdx = moodDate.getMonth();
const moodDaysInMonth = new Date(moodYear, moodMonthIdx + 1, 0).getDate();

if (currentMonthYear) {
    currentMonthYear.textContent = `${moodMonths[moodMonthIdx]} ${moodYear}`;
}

function renderMoodGrid() {
    if (!calendarDaysGrid) return;
    calendarDaysGrid.innerHTML = "";

    for (let d = 1; d <= moodDaysInMonth; d++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = "mood-day-card";
        
        const dayLabel = document.createElement('div');
        dayLabel.style.fontSize = "14px";
        dayLabel.textContent = d;
        dayDiv.appendChild(dayLabel);
        
        const key = `${moodYear}-${moodMonthIdx + 1}-${d}`;
        if (moodData[key]) {
            const numericScore = parseInt(moodData[key]);
            dayDiv.classList.add(`score-${numericScore}`);
            
            // Render the exact number of oranges dynamically (e.g. Score 3 = 🍊🍊🍊)
            const starsContainer = document.createElement('div');
            starsContainer.className = "day-stars";
            
            for (let i = 0; i < numericScore; i++) {
                const starSpan = document.createElement('span');
                starSpan.textContent = "🍊";
                starSpan.style.fontSize = "10px";
                starsContainer.appendChild(starSpan);
            }
            
            dayDiv.appendChild(starsContainer);
        }
        
        calendarDaysGrid.appendChild(dayDiv);
    }
}

if (ratingPicker) {
    ratingPicker.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
            const score = btn.getAttribute('data-score') || btn.getAttribute('data-rating');
            const todayDom = new Date().getDate();
            const key = `${moodYear}-${moodMonthIdx + 1}-${todayDom}`;
            moodData[key] = score;
            localStorage.setItem('myMoodData', JSON.stringify(moodData));
            
            ratingPicker.querySelectorAll('button').forEach(b => b.classList.remove('active-star'));
            btn.classList.add('active-star');
            
            renderMoodGrid();
            renderMoodArchive();
        });
    });
}

function renderMoodArchive() {
    if (!archiveList) return;
    archiveList.innerHTML = "";
    const keys = Object.keys(moodData).sort();
    if (keys.length === 0) {
        archiveList.innerHTML = `<li style="color:#aaa; text-align:center; display:block;">no entries recorded</li>`;
        return;
    }
    keys.forEach(k => {
        const li = document.createElement('li');
        const scoreRating = parseInt(moodData[k]) || 0;
        li.textContent = `date: ${k} → rating: ${"🍊".repeat(scoreRating)}`;
        archiveList.appendChild(li);
    });
}
renderMoodGrid();
renderMoodArchive();

// ==========================================
// dynamic countdown dashboard engine
// ==========================================
const examNameInput = document.getElementById('examNameInput');
const examDateInput = document.getElementById('examDateInput');
const addExamBtn = document.getElementById('addExamBtn');
const settingsExamList = document.getElementById('settingsExamList');
const countdownContainer = document.getElementById('countdownContainer');

let trackedDates = JSON.parse(localStorage.getItem('trackedDates')) || [];

function calculateCountdowns() {
    if (settingsExamList) settingsExamList.innerHTML = "";
    if (countdownContainer) countdownContainer.innerHTML = "";

    trackedDates.forEach((item, index) => {
        const target = new Date(item.date).getTime();
        const now = new Date().getTime();
        const diff = target - now;
        const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
        const displayDays = daysLeft > 0 ? `${daysLeft} days` : (daysLeft === 0 ? "today!" : "passed");

        if (settingsExamList) {
            const li = document.createElement('li');
            li.textContent = `${item.name}: ${item.date} (${displayDays})`;
            const delBtn = document.createElement('button');
            delBtn.textContent = 'x';
            delBtn.className = 'delete-btn';
            delBtn.addEventListener('click', () => {
                trackedDates.splice(index, 1);
                localStorage.setItem('trackedDates', JSON.stringify(trackedDates));
                calculateCountdowns();
            });
            li.appendChild(delBtn);
            settingsExamList.appendChild(li);
        }

        if (countdownContainer) {
            const card = document.createElement('div');
            card.className = "countdown-card";
            card.innerHTML = `
                <div class="countdown-card-title">${item.name}</div>
                <div class="countdown-card-days">${displayDays}</div>
            `;
            countdownContainer.appendChild(card);
        }
    });
}

if (addExamBtn) {
    addExamBtn.addEventListener('click', () => {
        if (!examNameInput || !examDateInput) return;
        const name = examNameInput.value.trim();
        const dateVal = examDateInput.value;
        if (name !== "" && dateVal !== "") {
            trackedDates.push({ name: name, date: dateVal });
            localStorage.setItem('trackedDates', JSON.stringify(trackedDates));
            examNameInput.value = "";
            examDateInput.value = "";
            calculateCountdowns();
        }
    });
}
calculateCountdowns();

// ==========================================
// waag weekly schedule engine routing
// ==========================================
const calendarEventInput = document.getElementById('calendarEventInput');
const calendarDaySelect = document.getElementById('calendarDaySelect');
const addCalendarEventBtn = document.getElementById('addCalendarEventBtn');

let weeklyEvents = JSON.parse(localStorage.getItem('myWeeklyEvents')) || {
    monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: []
};

function renderWeeklyCalendar() {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    days.forEach(day => {
        const dayColumn = document.querySelector(`.day-column[data-day="${day}"] .day-events-list`);
        if (!dayColumn) return;
        dayColumn.innerHTML = "";
        
        if (weeklyEvents[day]) {
            weeklyEvents[day].forEach((eventText, index) => {
                const li = document.createElement('li');
                const span = document.createElement('span');
                span.textContent = eventText;
                li.appendChild(span);
                
                const delBtn = document.createElement('button');
                delBtn.textContent = 'x';
                delBtn.className = 'delete-btn';
                delBtn.addEventListener('click', () => {
                    weeklyEvents[day].splice(index, 1);
                    localStorage.setItem('myWeeklyEvents', JSON.stringify(weeklyEvents));
                    renderWeeklyCalendar();
                });
                
                li.appendChild(delBtn);
                dayColumn.appendChild(li);
            });
        }
    });
}

if (addCalendarEventBtn) {
    addCalendarEventBtn.addEventListener('click', () => {
        if (!calendarEventInput || !calendarDaySelect) return;
        const text = calendarEventInput.value.trim();
        const selectedDay = calendarDaySelect.value;
        if (text !== "") {
            if (!weeklyEvents[selectedDay]) weeklyEvents[selectedDay] = [];
            weeklyEvents[selectedDay].push(text);
            localStorage.setItem('myWeeklyEvents', JSON.stringify(weeklyEvents));
            calendarEventInput.value = "";
            renderWeeklyCalendar();
        }
    });
}

renderWeeklyCalendar();

// ==========================================
// maag monthly view runtime operations
// ==========================================
const maagMonthHeader = document.getElementById('maagMonthHeader');
const maagDateSelect = document.getElementById('maagDateSelect');
const maagEventInput = document.getElementById('maagEventInput');
const addMaagEventBtn = document.getElementById('addMaagEventBtn');
const maagDaysGrid = document.getElementById('maagDaysGrid');

let maagEvents = JSON.parse(localStorage.getItem('myMaagEvents')) || {};

const maagMonthsList = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
const maagDateObj = new Date();
const currentMaagYear = maagDateObj.getFullYear();
const currentMaagMonthIdx = maagDateObj.getMonth();
const totalDaysInMonth = new Date(currentMaagYear, currentMaagMonthIdx + 1, 0).getDate();

if (maagMonthHeader) {
    maagMonthHeader.textContent = `${maagMonthsList[currentMaagMonthIdx]} at a glance`;
}

function initMaagSelectorsAndGrid() {
    if (!maagDateSelect || !maagDaysGrid) return;
    
    maagDateSelect.innerHTML = "";
    maagDaysGrid.innerHTML = "";

    for (let d = 1; d <= totalDaysInMonth; d++) {
        const option = document.createElement('option');
        option.value = d;
        option.textContent = `day ${d}`;
        maagDateSelect.appendChild(option);

        const dayBox = document.createElement('div');
        dayBox.className = "maag-day-box";

        const numDiv = document.createElement('div');
        numDiv.className = "maag-day-num";
        numDiv.textContent = d;
        dayBox.appendChild(numDiv);

        const listUl = document.createElement('ul');
        listUl.className = "maag-events-list";
        listUl.id = `maag-day-list-${d}`;
        
        dayBox.appendChild(listUl);
        maagDaysGrid.appendChild(dayBox);
    }
}

function renderMaagEvents() {
    for (let d = 1; d <= totalDaysInMonth; d++) {
        const listUl = document.getElementById(`maag-day-list-${d}`);
        if (!listUl) continue;
        listUl.innerHTML = "";

        const dayEventsKey = `day-${d}`;
        if (maagEvents[dayEventsKey] && maagEvents[dayEventsKey].length > 0) {
            maagEvents[dayEventsKey].forEach((eventText, index) => {
                const li = document.createElement('li');
                const span = document.createElement('span');
                span.textContent = eventText;
                li.appendChild(span);

                const delBtn = document.createElement('button');
                delBtn.textContent = 'x';
                delBtn.className = 'delete-btn';
                delBtn.addEventListener('click', () => {
                    maagEvents[dayEventsKey].splice(index, 1);
                    localStorage.setItem('myMaagEvents', JSON.stringify(maagEvents));
                    renderMaagEvents();
                });

                li.appendChild(delBtn);
                listUl.appendChild(li);
            });
        }
    }
}

if (addMaagEventBtn) {
    addMaagEventBtn.addEventListener('click', () => {
        if (!maagEventInput || !maagDateSelect) return;
        const val = maagEventInput.value.trim();
        const selectedDay = maagDateSelect.value;
        if (val !== "") {
            const key = `day-${selectedDay}`;
            if (!maagEvents[key]) maagEvents[key] = [];
            maagEvents[key].push(val);
            localStorage.setItem('myMaagEvents', JSON.stringify(maagEvents));
            maagEventInput.value = "";
            renderMaagEvents();
        }
    });
}

initMaagSelectorsAndGrid();
renderMaagEvents();

// ==========================================
// subject study logs tracker logic
// ==========================================
const cat1Input = document.getElementById('cat1Input');
const cat2Input = document.getElementById('cat2Input');
const cat3Input = document.getElementById('cat3Input');
const saveCategoriesBtn = document.getElementById('saveCategoriesBtn');
const subjectSelect = document.getElementById('subjectSelect');
const studyTimeInput = document.getElementById('studyTimeInput');
const logHoursBtn = document.getElementById('logHoursBtn');
const studyHoursList = document.getElementById('studyHoursList');

let savedCategories = JSON.parse(localStorage.getItem('myStudyCategories')) || {
    cat1: "subject 1", cat2: "subject 2", cat3: "subject 3"
};

let studyLogs = JSON.parse(localStorage.getItem('myStudyLogs')) || [];

function updateCategoryUI() {
    if (cat1Input) cat1Input.value = savedCategories.cat1;
    if (cat2Input) cat2Input.value = savedCategories.cat2;
    if (cat3Input) cat3Input.value = savedCategories.cat3;

    if (subjectSelect && subjectSelect.options.length >= 3) {
        subjectSelect.options[0].text = savedCategories.cat1;
        subjectSelect.options[1].text = savedCategories.cat2;
        subjectSelect.options[2].text = savedCategories.cat3;
    }
}

if (saveCategoriesBtn) {
    saveCategoriesBtn.addEventListener('click', () => {
        if (!cat1Input || !cat2Input || !cat3Input) return;
        savedCategories.cat1 = cat1Input.value.trim().toLowerCase() || "subject 1";
        savedCategories.cat2 = cat2Input.value.trim().toLowerCase() || "subject 2";
        savedCategories.cat3 = cat3Input.value.trim().toLowerCase() || "subject 3";
        localStorage.setItem('myStudyCategories', JSON.stringify(savedCategories));
        updateCategoryUI();
        renderStudyLogs();
        alert("saved");
    });
}

function formatMinutesToHours(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hours > 0) {
        return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
}

function renderStudyLogs() {
    if (!studyHoursList) return;
    studyHoursList.innerHTML = "";

    const totals = { cat1: 0, cat2: 0, cat3: 0 };
    studyLogs.forEach(log => {
        if (totals[log.category] !== undefined) {
            totals[log.category] += parseInt(log.minutes) || 0;
        }
    });

    const summaryBox = document.createElement('div');
    summaryBox.className = "study-summary-box";
    summaryBox.innerHTML = `
        <div class="summary-title">total study breakdown</div>
        <div class="summary-grid">
            <div class="summary-item"><strong>${savedCategories.cat1}:</strong> <span>${formatMinutesToHours(totals.cat1)}</span></div>
            <div class="summary-item"><strong>${savedCategories.cat2}:</strong> <span>${formatMinutesToHours(totals.cat2)}</span></div>
            <div class="summary-item"><strong>${savedCategories.cat3}:</strong> <span>${formatMinutesToHours(totals.cat3)}</span></div>
        </div>
    `;
    studyHoursList.appendChild(summaryBox);

    if (studyLogs.length === 0) {
        const emptyLi = document.createElement('div');
        emptyLi.style.cssText = "color:#aaa; text-align:center; padding: 15px 0; font-size: 13px;";
        emptyLi.textContent = "no history logs recorded yet";
        studyHoursList.appendChild(emptyLi);
        return;
    }

    studyLogs.forEach((log, index) => {
        const li = document.createElement('li');
        li.className = "study-history-item";
        
        const labelSpan = document.createElement('span');
        const displaySubjectName = savedCategories[log.category] || log.category;
        labelSpan.textContent = `${displaySubjectName}: +${log.minutes} mins`;
        li.appendChild(labelSpan);

        const delBtn = document.createElement('button');
        delBtn.textContent = 'x';
        delBtn.className = 'delete-btn';
        delBtn.addEventListener('click', () => {
            studyLogs.splice(index, 1);
            localStorage.setItem('myStudyLogs', JSON.stringify(studyLogs));
            renderStudyLogs();
        });

        li.appendChild(delBtn);
        studyHoursList.appendChild(li);
    });
}

if (logHoursBtn) {
    logHoursBtn.addEventListener('click', () => {
        if (!studyTimeInput || !subjectSelect) return;
        const minutesValue = parseInt(studyTimeInput.value.trim());
        const selectedCat = subjectSelect.value;

        if (!isNaN(minutesValue) && minutesValue > 0) {
            studyLogs.push({ category: selectedCat, minutes: minutesValue });
            localStorage.setItem('myStudyLogs', JSON.stringify(studyLogs));
            studyTimeInput.value = "";
            renderStudyLogs();
        } else {
            alert("please enter a valid number of minutes.");
        }
    });
}

updateCategoryUI();
renderStudyLogs();

// ==========================================
// native study countdown clock logic
// ==========================================
let countdownTimer;
let countdownSecondsRemaining = 1500;
let countdownIsRunning = false;
const timerDisplay = document.getElementById('timerDisplay');
const startStopBtn = document.getElementById('startStopBtn');

function formatTimerUI(totalSecs) {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    if (timerDisplay) {
        timerDisplay.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
}

function setTimer(mins) {
    clearInterval(countdownTimer);
    countdownIsRunning = false;
    if (startStopBtn) startStopBtn.textContent = 'start';
    countdownSecondsRemaining = mins * 60;
    formatTimerUI(countdownSecondsRemaining);
}

if (startStopBtn) {
    startStopBtn.addEventListener('click', () => {
        if (!countdownIsRunning) {
            countdownIsRunning = true;
            startStopBtn.textContent = 'stop';
            countdownTimer = setInterval(() => {
                countdownSecondsRemaining--;
                formatTimerUI(countdownSecondsRemaining);
                if (countdownSecondsRemaining <= 0) {
                    clearInterval(countdownTimer);
                    countdownIsRunning = false;
                    startStopBtn.textContent = 'start';
                    alert("time's up!");
                }
            }, 1000);
        } else {
            clearInterval(countdownTimer);
            countdownIsRunning = false;
            startStopBtn.textContent = 'start';
        }
    });
}

const resetTimerBtn = document.getElementById('resetTimerBtn');
if (resetTimerBtn) {
    resetTimerBtn.addEventListener('click', () => {
        setTimer(25);
    });
}

// ==========================================
// brain dump automated disk tracking logic
// ==========================================
const brainDumpArea = document.getElementById('brainDumpArea');
const saveStatus = document.getElementById('saveStatus');
const clearDumpBtn = document.getElementById('clearDumpBtn');
let autoSaveDebounceTimeout;

if (brainDumpArea) {
    brainDumpArea.value = localStorage.getItem('myBrainDump') || "";
    brainDumpArea.addEventListener('input', () => {
        if (saveStatus) saveStatus.textContent = "typing...";
        clearTimeout(autoSaveDebounceTimeout);
        autoSaveDebounceTimeout = setTimeout(() => {
            localStorage.setItem('myBrainDump', brainDumpArea.value);
            if (saveStatus) saveStatus.textContent = "saved";
        }, 1000);
    });
}

if (clearDumpBtn && brainDumpArea) {
    clearDumpBtn.addEventListener('click', () => {
        if (confirm("clear thoughts?")) {
            brainDumpArea.value = "";
            localStorage.setItem('myBrainDump', "");
            if (saveStatus) saveStatus.textContent = "saved";
        }
    });
}