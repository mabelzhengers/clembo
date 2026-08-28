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
// homepage mini calendar — this month's days
// in a small grid, with today highlighted
// ==========================================
const miniCalendar = document.getElementById('miniCalendar');
const miniCalMonths = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
const miniCalWeekdays = ["s", "m", "t", "w", "t", "f", "s"];

function renderMiniCalendar() {
   if (!miniCalendar) return;
   miniCalendar.innerHTML = "";

   const today = new Date();
   const year = today.getFullYear();
   const monthIdx = today.getMonth();
   const totalDays = new Date(year, monthIdx + 1, 0).getDate();
   const firstWeekday = new Date(year, monthIdx, 1).getDay();

   const label = document.createElement('div');
   label.className = "mini-calendar-label";
   label.textContent = `${miniCalMonths[monthIdx]} ${year}`;
   miniCalendar.appendChild(label);

   const grid = document.createElement('div');
   grid.className = "mini-calendar-grid";

   miniCalWeekdays.forEach(w => {
       const head = document.createElement('div');
       head.className = "mini-calendar-weekday";
       head.textContent = w;
       grid.appendChild(head);
   });

   for (let i = 0; i < firstWeekday; i++) {
       grid.appendChild(document.createElement('div'));
   }

   for (let d = 1; d <= totalDays; d++) {
       const cell = document.createElement('div');
       cell.className = "mini-calendar-day";
       if (d === today.getDate()) cell.classList.add('mini-calendar-today');
       cell.textContent = d;
       grid.appendChild(cell);
   }

   miniCalendar.appendChild(grid);
}
renderMiniCalendar();


// ==========================================
// homepage reminders bubble — free-form text,
// separate from the brain dump, autosaved
// ==========================================
const reminderArea = document.getElementById('reminderArea');
let reminderSaveTimeout;

if (reminderArea) {
   reminderArea.value = localStorage.getItem('myReminders') || "";
   reminderArea.addEventListener('input', () => {
       clearTimeout(reminderSaveTimeout);
       reminderSaveTimeout = setTimeout(() => {
           localStorage.setItem('myReminders', reminderArea.value);
       }, 500);
   });
}


// ==========================================
// to-dos workflow tracker
// each task remembers when it was created, so we
// can show how many days it's been sitting there.
// checking it off marks it done instead of just
// deleting it outright.
// ==========================================
const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');


let myTasks = JSON.parse(localStorage.getItem('myTasks')) || [];


function renderTasks() {
   if (!taskList) return;
   taskList.innerHTML = "";
   const now = Date.now();


   myTasks.forEach((task, index) => {
       // migrate old plain-string tasks into objects with a created date
       if (typeof task === 'string') {
           task = { text: task, created: now };
           myTasks[index] = task;
       }
       if (!task.created) task.created = now;


       const li = document.createElement('li');


       const leftSide = document.createElement('div');
       leftSide.className = 'task-left';


       const checkbox = document.createElement('input');
       checkbox.type = 'checkbox';
       checkbox.className = 'task-checkbox';
       checkbox.addEventListener('change', () => {
           li.classList.add('task-complete');
           setTimeout(() => {
               myTasks.splice(index, 1);
               localStorage.setItem('myTasks', JSON.stringify(myTasks));
               renderTasks();
           }, 220);
       });


       const textSpan = document.createElement('span');
       textSpan.textContent = task.text;


       leftSide.appendChild(checkbox);
       leftSide.appendChild(textSpan);
       li.appendChild(leftSide);


       const daysOverdue = Math.floor((now - task.created) / (1000 * 60 * 60 * 24));
       if (daysOverdue > 0) {
           const badge = document.createElement('span');
           badge.className = 'overdue-badge';
           badge.textContent = `(-${daysOverdue})`;
           li.appendChild(badge);
       }


       taskList.appendChild(li);
   });
   renderHomeTodos();
}


// mirrors the to-dos list into the homepage "to-dos" bubble
function renderHomeTodos() {
   const homeTodoList = document.getElementById('homeTodoList');
   if (!homeTodoList) return;
   homeTodoList.innerHTML = "";
   if (myTasks.length === 0) {
       homeTodoList.innerHTML = `<li style="color:#aaa; text-align:center; display:block;">nothing yet</li>`;
       return;
   }
   myTasks.forEach(task => {
       const li = document.createElement('li');
       li.textContent = typeof task === 'string' ? task : task.text;
       homeTodoList.appendChild(li);
   });
}
if (addBtn && taskInput) {
   addBtn.addEventListener('click', () => {
       const val = taskInput.value.trim();
       if (val !== "") {
           myTasks.push({ text: val, created: Date.now() });
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
       textSpan.textContent = `${habit.name} — ${habit.streak} day streak`;
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
   renderHomeHabits();
}


// mirrors the habits list into the homepage "habits" bubble
function renderHomeHabits() {
   const homeHabitList = document.getElementById('homeHabitList');
   if (!homeHabitList) return;
   homeHabitList.innerHTML = "";
   if (myHabits.length === 0) {
       homeHabitList.innerHTML = `<li style="color:#aaa; text-align:center; display:block;">nothing yet</li>`;
       return;
   }
   myHabits.forEach(habit => {
       if (typeof habit === 'string') habit = { name: habit, streak: 0 };
       const li = document.createElement('li');
       li.textContent = `${habit.name} — ${habit.streak} day streak`;
       homeHabitList.appendChild(li);
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
// productivity tracker calendar grid logger
// click a date box to select it, then pick a
// rating to score (or re-score) that day
// ==========================================
const currentMonthYear = document.getElementById('currentMonthYear');
const ratingPicker = document.getElementById('ratingPicker');
const calendarDaysGrid = document.getElementById('calendarDaysGrid');
const selectedDayLabel = document.getElementById('selectedDayLabel');


let moodData = JSON.parse(localStorage.getItem('myMoodData')) || {};
const moodMonths = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
const moodDate = new Date();
const moodYear = moodDate.getFullYear();
const moodMonthIdx = moodDate.getMonth();
const moodDaysInMonth = new Date(moodYear, moodMonthIdx + 1, 0).getDate();
const moodTodayDom = moodDate.getDate();


// the day currently selected for rating — defaults to today, but the
// user can click any day box to go back and fill in a missed rating
let selectedMoodDay = moodTodayDom;


if (currentMonthYear) {
   currentMonthYear.textContent = `${moodMonths[moodMonthIdx]} ${moodYear}`;
}


function moodKeyFor(day) {
   return `${moodYear}-${moodMonthIdx + 1}-${day}`;
}


function updateSelectedDayLabel() {
   if (!selectedDayLabel) return;
   selectedDayLabel.textContent = selectedMoodDay === moodTodayDom
       ? `rating today (${selectedMoodDay})`
       : `rating ${moodMonths[moodMonthIdx]} ${selectedMoodDay}`;
}


function updateRatingPickerForSelection() {
   if (!ratingPicker) return;
   const key = moodKeyFor(selectedMoodDay);
   const existingScore = moodData[key] ? parseInt(moodData[key]) : null;
   ratingPicker.querySelectorAll('button').forEach(b => {
       const btnScore = parseInt(b.getAttribute('data-score') || b.getAttribute('data-rating'));
       b.classList.toggle('active-star', btnScore === existingScore);
   });
}


function renderMoodGrid() {
   if (!calendarDaysGrid) return;
   calendarDaysGrid.innerHTML = "";


   for (let d = 1; d <= moodDaysInMonth; d++) {
       const dayDiv = document.createElement('div');
       dayDiv.className = "mood-day-card";
       if (d === selectedMoodDay) dayDiv.classList.add('selected');
      
       const dayLabel = document.createElement('div');
       dayLabel.style.fontSize = "14px";
       dayLabel.textContent = d;
       dayDiv.appendChild(dayLabel);
      
       const key = moodKeyFor(d);
       if (moodData[key]) {
           const numericScore = parseInt(moodData[key]);
           dayDiv.classList.add(`score-${numericScore}`);
          
           // Render the exact score as a row of small dots (e.g. score 3 = ● ● ●)
           const starsContainer = document.createElement('div');
           starsContainer.className = "day-stars";
          
           for (let i = 0; i < numericScore; i++) {
               const dot = document.createElement('span');
               dot.className = "mini-dot";
               starsContainer.appendChild(dot);
           }
          
           dayDiv.appendChild(starsContainer);
       }


       dayDiv.addEventListener('click', () => {
           selectedMoodDay = d;
           updateSelectedDayLabel();
           updateRatingPickerForSelection();
           renderMoodGrid();
       });
      
       calendarDaysGrid.appendChild(dayDiv);
   }
}


if (ratingPicker) {
   ratingPicker.querySelectorAll('button').forEach(btn => {
       btn.addEventListener('click', () => {
           const score = btn.getAttribute('data-score') || btn.getAttribute('data-rating');
           const key = moodKeyFor(selectedMoodDay);
           moodData[key] = score;
           localStorage.setItem('myMoodData', JSON.stringify(moodData));
          
           updateRatingPickerForSelection();
           renderMoodGrid();
       });
   });
}


updateSelectedDayLabel();
updateRatingPickerForSelection();
renderMoodGrid();


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
// unified calendar engine — week view & month view
// share one date-keyed event store, so anything you
// add shows up in both views automatically
// ==========================================
const calendarViewToggle = document.getElementById('calendarViewToggle');
const calendarEventInput = document.getElementById('calendarEventInput');
const calendarEventDateInput = document.getElementById('calendarEventDateInput');
const addCalendarEventBtn = document.getElementById('addCalendarEventBtn');
const weekViewGrid = document.getElementById('weekViewGrid');
const maagDaysGrid = document.getElementById('maagDaysGrid');


let calendarEvents = JSON.parse(localStorage.getItem('myCalendarEvents')) || {};
let calendarViewMode = localStorage.getItem('myCalendarViewMode') || 'week';


const calendarDayAbbrevs = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];


function pad2(n) {
   return n.toString().padStart(2, '0');
}


// consistent key format for any Date object — matches the native
// <input type="date"> value format, so no parsing headaches
function dateKeyFor(dateObj) {
   return `${dateObj.getFullYear()}-${pad2(dateObj.getMonth() + 1)}-${pad2(dateObj.getDate())}`;
}


function getMondayOf(dateObj) {
   const d = new Date(dateObj);
   const day = d.getDay(); // 0 = sunday ... 6 = saturday
   const diff = day === 0 ? -6 : 1 - day;
   d.setDate(d.getDate() + diff);
   return d;
}


function renderEventListInto(listEl, key) {
   listEl.innerHTML = "";
   const events = calendarEvents[key] || [];
   events.forEach((eventText, index) => {
       const li = document.createElement('li');
       const span = document.createElement('span');
       span.textContent = eventText;
       li.appendChild(span);


       const delBtn = document.createElement('button');
       delBtn.textContent = 'x';
       delBtn.className = 'delete-btn';
       delBtn.addEventListener('click', () => {
           calendarEvents[key].splice(index, 1);
           localStorage.setItem('myCalendarEvents', JSON.stringify(calendarEvents));
           renderCalendarViews();
       });


       li.appendChild(delBtn);
       listEl.appendChild(li);
   });
}


function renderWeekView() {
   if (!weekViewGrid) return;
   weekViewGrid.innerHTML = "";


   const today = new Date();
   const monday = getMondayOf(today);


   for (let i = 0; i < 7; i++) {
       const dayDate = new Date(monday);
       dayDate.setDate(monday.getDate() + i);
       const key = dateKeyFor(dayDate);


       const dayColumn = document.createElement('div');
       dayColumn.className = "day-column";
       if (key === dateKeyFor(today)) dayColumn.classList.add('today-highlight');


       const header = document.createElement('div');
       header.className = "day-header";

       const dayNameLine = document.createElement('div');
       dayNameLine.className = "day-header-name";
       dayNameLine.textContent = calendarDayAbbrevs[dayDate.getDay()];
       header.appendChild(dayNameLine);

       const dayDateLine = document.createElement('div');
       dayDateLine.className = "day-header-date";
       dayDateLine.textContent = `${dayDate.getDate()}`;
       header.appendChild(dayDateLine);

       dayColumn.appendChild(header);


       const listUl = document.createElement('ul');
       listUl.className = "day-events-list";
       dayColumn.appendChild(listUl);


       weekViewGrid.appendChild(dayColumn);
       renderEventListInto(listUl, key);
   }
}


function renderMonthView() {
   if (!maagDaysGrid) return;
   maagDaysGrid.innerHTML = "";


   const today = new Date();
   const year = today.getFullYear();
   const monthIdx = today.getMonth();
   const totalDays = new Date(year, monthIdx + 1, 0).getDate();


   for (let d = 1; d <= totalDays; d++) {
       const dayDate = new Date(year, monthIdx, d);
       const key = dateKeyFor(dayDate);


       const dayBox = document.createElement('div');
       dayBox.className = "maag-day-box";
       if (key === dateKeyFor(today)) dayBox.classList.add('today-highlight');


       const numDiv = document.createElement('div');
       numDiv.className = "maag-day-num";
       numDiv.textContent = d;
       dayBox.appendChild(numDiv);


       const listUl = document.createElement('ul');
       listUl.className = "maag-events-list";
       dayBox.appendChild(listUl);


       maagDaysGrid.appendChild(dayBox);
       renderEventListInto(listUl, key);
   }
}


function renderCalendarViews() {
   renderWeekView();
   renderMonthView();
   renderHomeUpcomingEvents();
}


// pulls every event on or after today, across both calendar views'
// shared data, into the homepage "upcoming events" bubble
function renderHomeUpcomingEvents() {
   const homeEventsList = document.getElementById('homeEventsList');
   if (!homeEventsList) return;
   homeEventsList.innerHTML = "";


   const todayKey = dateKeyFor(new Date());
   const upcoming = [];
   Object.keys(calendarEvents).sort().forEach(key => {
       if (key >= todayKey) {
           (calendarEvents[key] || []).forEach(eventText => {
               upcoming.push({ date: key, text: eventText });
           });
       }
   });


   if (upcoming.length === 0) {
       homeEventsList.innerHTML = `<li style="color:#aaa; text-align:center; display:block;">nothing yet</li>`;
       return;
   }


   upcoming.forEach(item => {
       const li = document.createElement('li');
       const span = document.createElement('span');
       span.textContent = `${item.date}: ${item.text}`;
       li.appendChild(span);
       homeEventsList.appendChild(li);
   });
}


function applyCalendarViewMode() {
   if (weekViewGrid) weekViewGrid.classList.toggle('view-hidden', calendarViewMode !== 'week');
   if (maagDaysGrid) maagDaysGrid.classList.toggle('view-hidden', calendarViewMode !== 'month');
   if (calendarViewToggle) {
       calendarViewToggle.querySelectorAll('.view-toggle-btn').forEach(btn => {
           btn.classList.toggle('active', btn.getAttribute('data-view') === calendarViewMode);
       });
   }
}


if (calendarViewToggle) {
   calendarViewToggle.querySelectorAll('.view-toggle-btn').forEach(btn => {
       btn.addEventListener('click', () => {
           calendarViewMode = btn.getAttribute('data-view');
           localStorage.setItem('myCalendarViewMode', calendarViewMode);
           applyCalendarViewMode();
       });
   });
}


if (addCalendarEventBtn) {
   addCalendarEventBtn.addEventListener('click', () => {
       if (!calendarEventInput || !calendarEventDateInput) return;
       const text = calendarEventInput.value.trim();
       const dateVal = calendarEventDateInput.value || dateKeyFor(new Date());
       if (text !== "") {
           if (!calendarEvents[dateVal]) calendarEvents[dateVal] = [];
           calendarEvents[dateVal].push(text);
           localStorage.setItem('myCalendarEvents', JSON.stringify(calendarEvents));
           calendarEventInput.value = "";
           renderCalendarViews();
       }
   });
}


applyCalendarViewMode();
renderCalendarViews();


// ==========================================
// subject study logs tracker logic
// subjects are now a free-form, growable list
// (not capped at three) with logged sessions
// keyed by subject name.
// ==========================================
const subjectSelect = document.getElementById('subjectSelect');
const studyTimeInput = document.getElementById('studyTimeInput');
const logHoursBtn = document.getElementById('logHoursBtn');
const studyHoursList = document.getElementById('studyHoursList');
const newSubjectInput = document.getElementById('newSubjectInput');
const addSubjectBtn = document.getElementById('addSubjectBtn');
const subjectManageList = document.getElementById('subjectManageList');


// one-time migration from the old fixed cat1/cat2/cat3 setup, if present
const legacyCategories = JSON.parse(localStorage.getItem('myStudyCategories'));

let studySubjects = JSON.parse(localStorage.getItem('myStudySubjects'));
if (!studySubjects) {
   if (legacyCategories) {
       studySubjects = [legacyCategories.cat1, legacyCategories.cat2, legacyCategories.cat3].filter(Boolean);
   } else {
       studySubjects = [];
   }
   localStorage.setItem('myStudySubjects', JSON.stringify(studySubjects));
}

let studyLogs = JSON.parse(localStorage.getItem('myStudyLogs')) || [];
if (legacyCategories && !localStorage.getItem('myStudyLogsMigrated')) {
   studyLogs = studyLogs.map(log => {
       if (log.subject) return log;
       const mappedName = legacyCategories[log.category];
       return { subject: mappedName || log.category, minutes: log.minutes };
   });
   localStorage.setItem('myStudyLogs', JSON.stringify(studyLogs));
   localStorage.setItem('myStudyLogsMigrated', 'true');
}


function renderSubjectSelect() {
   if (!subjectSelect) return;
   subjectSelect.innerHTML = "";
   studySubjects.forEach(subject => {
       const option = document.createElement('option');
       option.value = subject;
       option.textContent = subject;
       subjectSelect.appendChild(option);
   });
}


function renderSubjectManageList() {
   if (!subjectManageList) return;
   subjectManageList.innerHTML = "";


   if (studySubjects.length === 0) {
       subjectManageList.innerHTML = `<li style="color:#aaa; text-align:center; display:block;">no subjects yet</li>`;
       return;
   }


   studySubjects.forEach((subject, index) => {
       const li = document.createElement('li');
       const span = document.createElement('span');
       span.textContent = subject;
       li.appendChild(span);


       const delBtn = document.createElement('button');
       delBtn.textContent = 'x';
       delBtn.className = 'delete-btn';
       delBtn.addEventListener('click', () => {
           studySubjects.splice(index, 1);
           localStorage.setItem('myStudySubjects', JSON.stringify(studySubjects));
           renderSubjectManageList();
           renderSubjectSelect();
           renderStudyLogs();
       });
       li.appendChild(delBtn);
       subjectManageList.appendChild(li);
   });
}


if (addSubjectBtn && newSubjectInput) {
   addSubjectBtn.addEventListener('click', () => {
       const val = newSubjectInput.value.trim().toLowerCase();
       if (val !== "" && !studySubjects.includes(val)) {
           studySubjects.push(val);
           localStorage.setItem('myStudySubjects', JSON.stringify(studySubjects));
           newSubjectInput.value = "";
           renderSubjectManageList();
           renderSubjectSelect();
       }
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


   const totals = {};
   studySubjects.forEach(s => totals[s] = 0);
   studyLogs.forEach(log => {
       if (totals[log.subject] === undefined) totals[log.subject] = 0;
       totals[log.subject] += parseInt(log.minutes) || 0;
   });


   const summaryBox = document.createElement('div');
   summaryBox.className = "study-summary-box";


   const summaryTitle = document.createElement('div');
   summaryTitle.className = "summary-title";
   summaryTitle.textContent = "total study breakdown";
   summaryBox.appendChild(summaryTitle);


   const summaryGrid = document.createElement('div');
   summaryGrid.className = "summary-grid";
   Object.entries(totals).forEach(([subject, mins]) => {
       const item = document.createElement('div');
       item.className = "summary-item";
       const strong = document.createElement('strong');
       strong.textContent = `${subject}:`;
       const span = document.createElement('span');
       span.textContent = formatMinutesToHours(mins);
       item.appendChild(strong);
       item.appendChild(span);
       summaryGrid.appendChild(item);
   });
   summaryBox.appendChild(summaryGrid);
   studyHoursList.appendChild(summaryBox);


   if (studyLogs.length === 0) {
       const emptyDiv = document.createElement('div');
       emptyDiv.style.cssText = "color:#aaa; text-align:center; padding: 15px 0; font-size: 13px;";
       emptyDiv.textContent = "no sessions logged yet";
       studyHoursList.appendChild(emptyDiv);
       return;
   }


   studyLogs.forEach((log, index) => {
       const li = document.createElement('li');
       li.className = "study-history-item";
      
       const labelSpan = document.createElement('span');
       labelSpan.textContent = `${log.subject}: +${log.minutes} mins`;
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
       if (studySubjects.length === 0) {
           alert("add a subject first.");
           return;
       }
       const minutesValue = parseInt(studyTimeInput.value.trim());
       const selectedSubject = subjectSelect.value;


       if (!isNaN(minutesValue) && minutesValue > 0) {
           studyLogs.push({ subject: selectedSubject, minutes: minutesValue });
           localStorage.setItem('myStudyLogs', JSON.stringify(studyLogs));
           studyTimeInput.value = "";
           renderStudyLogs();
           if (studyViewMode === 'breakdown') renderBreakdownChart();
       } else {
           alert("please enter a valid number of minutes.");
       }
   });
}


renderSubjectSelect();
renderSubjectManageList();
renderStudyLogs();


// ==========================================
// study time breakdown — circular, color-coded
// view of logged minutes per subject
// ==========================================
const studyViewToggle = document.getElementById('studyViewToggle');
const studyLogView = document.getElementById('studyLogView');
const studyBreakdownView = document.getElementById('studyBreakdownView');
const breakdownChart = document.getElementById('breakdownChart');
const breakdownLegend = document.getElementById('breakdownLegend');


let studyViewMode = 'log';


const breakdownPalette = ['#e07a5f', '#4a7c59', '#f4a261', '#8c7e70', '#6b8fb5', '#b56b8f', '#9c8f5c', '#5c9c9c', '#b58f6b', '#7a5fe0'];


function renderBreakdownChart() {
   if (!breakdownChart || !breakdownLegend) return;
   breakdownChart.innerHTML = "";
   breakdownLegend.innerHTML = "";


   const totals = {};
   studySubjects.forEach(s => totals[s] = 0);
   studyLogs.forEach(log => {
       if (totals[log.subject] === undefined) totals[log.subject] = 0;
       totals[log.subject] += parseInt(log.minutes) || 0;
   });


   const entries = Object.entries(totals).filter(([, mins]) => mins > 0);
   const grandTotal = entries.reduce((sum, [, mins]) => sum + mins, 0);


   if (grandTotal === 0) {
       breakdownChart.style.background = "#ebdccb";
       const emptyMsg = document.createElement('li');
       emptyMsg.className = "breakdown-legend-item";
       emptyMsg.textContent = "no study time logged yet";
       breakdownLegend.appendChild(emptyMsg);
       return;
   }


   let cumulativePercent = 0;
   const gradientParts = [];


   entries.forEach(([subject, mins], i) => {
       const percent = (mins / grandTotal) * 100;
       const color = breakdownPalette[i % breakdownPalette.length];
       gradientParts.push(`${color} ${cumulativePercent}% ${cumulativePercent + percent}%`);
       cumulativePercent += percent;


       const li = document.createElement('li');
       li.className = "breakdown-legend-item";


       const swatch = document.createElement('span');
       swatch.className = "breakdown-swatch";
       swatch.style.backgroundColor = color;
       li.appendChild(swatch);


       const label = document.createElement('span');
       label.textContent = `${subject} — ${formatMinutesToHours(mins)} (${Math.round(percent)}%)`;
       li.appendChild(label);


       breakdownLegend.appendChild(li);
   });


   breakdownChart.style.background = `conic-gradient(${gradientParts.join(', ')})`;
}


if (studyViewToggle) {
   studyViewToggle.querySelectorAll('.view-toggle-btn').forEach(btn => {
       btn.addEventListener('click', () => {
           studyViewMode = btn.getAttribute('data-view');
           studyViewToggle.querySelectorAll('.view-toggle-btn').forEach(b => {
               b.classList.toggle('active', b === btn);
           });
           if (studyLogView) studyLogView.classList.toggle('view-hidden', studyViewMode !== 'log');
           if (studyBreakdownView) studyBreakdownView.classList.toggle('view-hidden', studyViewMode !== 'breakdown');
           if (studyViewMode === 'breakdown') renderBreakdownChart();
       });
   });
}


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
