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
// each task remembers when it was created (so we
// can show how many days it's been sitting there),
// carries a priority level and an optional deadline,
// and can be marked complete without being deleted —
// so it can still show up under "completed" or "all".
// ==========================================
const taskInput = document.getElementById('taskInput');
const taskPrioritySelect = document.getElementById('taskPrioritySelect');
const taskDeadlineInput = document.getElementById('taskDeadlineInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const todoViewToggle = document.getElementById('todoViewToggle');


let myTasks = JSON.parse(localStorage.getItem('myTasks')) || [];
let todoViewMode = localStorage.getItem('myTodoViewMode') || 'pending';


// converts a stored YYYY-MM-DD deadline into mm-dd-yyyy for display
function formatDeadlineDisplay(dateStr) {
   const parts = dateStr.split('-');
   if (parts.length !== 3) return dateStr;
   const [yyyy, mm, dd] = parts;
   return `${mm}-${dd}-${yyyy}`;
}


// counts full calendar days between two dates (ignoring time of day),
// so a task added yesterday evening reads as "1 day old" today,
// not "0 days old" until a full 24 hours has passed
function calendarDaysBetween(earlier, later) {
   const earlierMidnight = new Date(earlier.getFullYear(), earlier.getMonth(), earlier.getDate());
   const laterMidnight = new Date(later.getFullYear(), later.getMonth(), later.getDate());
   return Math.round((laterMidnight - earlierMidnight) / (1000 * 60 * 60 * 24));
}


function renderTasks() {
   if (!taskList) return;
   taskList.innerHTML = "";
   const now = Date.now();


   // migrate any old task formats (plain strings, or objects missing
   // the newer fields) into the full shape before filtering/rendering
   myTasks.forEach((task, index) => {
       if (typeof task === 'string') {
           myTasks[index] = { text: task, created: now, priority: 'medium', deadline: null, completed: false, subject: null };
           return;
       }
       if (!task.created) task.created = now;
       if (!task.priority) task.priority = 'medium';
       if (task.deadline === undefined) task.deadline = null;
       if (task.completed === undefined) task.completed = false;
       if (task.subject === undefined) task.subject = null;
   });


   const visibleTasks = myTasks
       .map((task, index) => ({ task, index }))
       .filter(({ task }) => {
           if (todoViewMode === 'pending') return !task.completed;
           if (todoViewMode === 'completed') return task.completed;
           return true;
       });


   if (visibleTasks.length === 0) {
       const emptyMsg = todoViewMode === 'completed' ? "nothing completed yet" : "nothing yet";
       taskList.innerHTML = `<li style="color:#aaa; text-align:center; display:block;">${emptyMsg}</li>`;
       renderHomeTodos();
       return;
   }


   visibleTasks.forEach(({ task, index }) => {
       taskList.appendChild(buildTaskListItem(task, index, renderTasks));
   });


   renderHomeTodos();
}


// builds one <li> for a task — shared by the main to-do list and by
// each school subject page's own (filtered) to-do list, so checkbox,
// priority, deadline, and overdue-badge behavior stay identical everywhere
function buildTaskListItem(task, index, onChanged) {
   const now = Date.now();
   const li = document.createElement('li');


   const leftSide = document.createElement('div');
   leftSide.className = 'task-left';


   const checkbox = document.createElement('input');
   checkbox.type = 'checkbox';
   checkbox.className = 'task-checkbox';
   checkbox.checked = task.completed;
   checkbox.addEventListener('change', () => {
       li.classList.add('task-complete');
       setTimeout(() => {
           task.completed = checkbox.checked;
           localStorage.setItem('myTasks', JSON.stringify(myTasks));
           if (onChanged) onChanged();
       }, 220);
   });


   const textWrap = document.createElement('div');
   textWrap.className = 'task-text-wrap';


   const textSpan = document.createElement('span');
   textSpan.className = 'task-text';
   textSpan.textContent = task.text;
   if (task.completed) textSpan.style.textDecoration = 'line-through';
   textWrap.appendChild(textSpan);


   if (task.deadline) {
       const deadlineSpan = document.createElement('span');
       deadlineSpan.className = 'task-deadline';
       deadlineSpan.textContent = `due ${formatDeadlineDisplay(task.deadline)}`;
       textWrap.appendChild(deadlineSpan);
   }


   leftSide.appendChild(checkbox);
   leftSide.appendChild(textWrap);
   li.appendChild(leftSide);


   const rightSide = document.createElement('div');
   rightSide.className = 'task-right';


   if (task.subject) {
       const subjectTag = document.createElement('span');
       subjectTag.className = 'subject-tag';
       subjectTag.textContent = task.subject;
       rightSide.appendChild(subjectTag);
   }


   if (!task.completed) {
       const daysOverdue = calendarDaysBetween(new Date(task.created), new Date(now));
       if (daysOverdue > 0) {
           const badge = document.createElement('span');
           badge.className = 'overdue-badge';
           badge.textContent = `(-${daysOverdue})`;
           rightSide.appendChild(badge);
       }
   }


   const priorityBadge = document.createElement('span');
   priorityBadge.className = `priority-badge priority-${task.priority}`;
   priorityBadge.textContent = task.priority;
   rightSide.appendChild(priorityBadge);


   li.appendChild(rightSide);
   return li;
}


// mirrors the pending to-dos into the homepage "to-dos" bubble
function renderHomeTodos() {
   const homeTodoList = document.getElementById('homeTodoList');
   if (!homeTodoList) return;
   homeTodoList.innerHTML = "";


   const pendingTasks = myTasks.filter(task => typeof task === 'string' || !task.completed);


   if (pendingTasks.length === 0) {
       homeTodoList.innerHTML = `<li style="color:#aaa; text-align:center; display:block;">nothing yet</li>`;
       return;
   }
   pendingTasks.forEach(task => {
       const li = document.createElement('li');
       li.textContent = typeof task === 'string' ? task : task.text;
       homeTodoList.appendChild(li);
   });
}


if (addBtn && taskInput) {
   addBtn.addEventListener('click', () => {
       const val = taskInput.value.trim();
       if (val !== "") {
           const priority = taskPrioritySelect ? taskPrioritySelect.value : 'medium';
           const deadline = (taskDeadlineInput && taskDeadlineInput.value) ? taskDeadlineInput.value : null;
           myTasks.push({ text: val, created: Date.now(), priority: priority, deadline: deadline, completed: false, subject: null });
           localStorage.setItem('myTasks', JSON.stringify(myTasks));
           taskInput.value = "";
           if (taskDeadlineInput) taskDeadlineInput.value = "";
           renderTasks();
       }
   });
}


if (todoViewToggle) {
   todoViewToggle.querySelectorAll('.view-toggle-btn').forEach(btn => {
       btn.classList.toggle('active', btn.getAttribute('data-view') === todoViewMode);
       btn.addEventListener('click', () => {
           todoViewMode = btn.getAttribute('data-view');
           localStorage.setItem('myTodoViewMode', todoViewMode);
           todoViewToggle.querySelectorAll('.view-toggle-btn').forEach(b => {
               b.classList.toggle('active', b === btn);
           });
           renderTasks();
       });
   });
}


renderTasks();


// ==========================================
// habits workspace tracker with streak counter
// each habit keeps a history of {t, s} points
// (timestamp, streak value at that point) every
// time it's bumped, so its growth can be plotted
// as a line chart alongside the plain list view.
// ==========================================
const habitInput = document.getElementById('habitInput');
const addHabitBtn = document.getElementById('addHabitBtn');
const habitList = document.getElementById('habitList');
const habitViewToggle = document.getElementById('habitViewToggle');
const habitListView = document.getElementById('habitListView');
const habitChartView = document.getElementById('habitChartView');
const habitChartSelect = document.getElementById('habitChartSelect');
const habitChartContainer = document.getElementById('habitChartContainer');


let myHabits = JSON.parse(localStorage.getItem('myHabits')) || [];
let habitViewMode = 'list';


function renderHabits() {
   if (!habitList) return;
   habitList.innerHTML = "";
   myHabits.forEach((habit, index) => {
       if (typeof habit === 'string') {
           habit = { name: habit, streak: 0, history: [{ t: Date.now(), s: 0 }] };
           myHabits[index] = habit;
       }
       if (!habit.history || habit.history.length === 0) {
           habit.history = [{ t: Date.now(), s: habit.streak || 0 }];
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
           habit.history.push({ t: Date.now(), s: habit.streak });
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
   renderHabitChartSelect();
   renderHabitChart();
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
           myHabits.push({ name: val, streak: 0, history: [{ t: Date.now(), s: 0 }] });
           localStorage.setItem('myHabits', JSON.stringify(myHabits));
           habitInput.value = "";
           renderHabits();
       }
   });
}


// ==========================================
// habit line chart — pick a habit from the
// dropdown and see its streak growth over time
// ==========================================
const habitChartMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];


function formatHabitChartDate(ts) {
   const d = new Date(ts);
   return `${habitChartMonths[d.getMonth()]} ${d.getDate()}`;
}


function renderHabitChartSelect() {
   if (!habitChartSelect) return;
   const previousValue = habitChartSelect.value;
   habitChartSelect.innerHTML = "";
   myHabits.forEach(habit => {
       const name = typeof habit === 'string' ? habit : habit.name;
       const option = document.createElement('option');
       option.value = name;
       option.textContent = name;
       habitChartSelect.appendChild(option);
   });
   const names = myHabits.map(h => (typeof h === 'string' ? h : h.name));
   if (names.includes(previousValue)) {
       habitChartSelect.value = previousValue;
   }
}


function renderHabitChart() {
   if (!habitChartContainer) return;
   habitChartContainer.innerHTML = "";


   if (myHabits.length === 0) {
       habitChartContainer.innerHTML = `<div style="color:#aaa; text-align:center; padding: 40px 10px; font-size: 14px;">no habits yet</div>`;
       return;
   }


   const firstName = typeof myHabits[0] === 'string' ? myHabits[0] : myHabits[0].name;
   const selectedName = (habitChartSelect && habitChartSelect.value) ? habitChartSelect.value : firstName;
   let habit = myHabits.find(h => (typeof h === 'string' ? h : h.name) === selectedName);
   if (!habit) habit = myHabits[0];
   if (typeof habit === 'string') habit = { name: habit, streak: 0, history: [] };


   const history = (habit.history && habit.history.length > 0) ? habit.history : [{ t: Date.now(), s: habit.streak || 0 }];


   const titleDiv = document.createElement('div');
   titleDiv.className = "habit-chart-title";
   titleDiv.textContent = `${habit.name} — ${habit.streak} day streak`;
   habitChartContainer.appendChild(titleDiv);


   const width = 600, height = 220;
   const padLeft = 34, padRight = 16, padTop = 16, padBottom = 30;


   const times = history.map(p => p.t);
   const streaks = history.map(p => p.s);
   const minT = Math.min(...times);
   const maxT = Math.max(...times);
   const maxS = Math.max(1, Math.max(...streaks));


   function xFor(t) {
       if (maxT === minT) return (padLeft + (width - padRight)) / 2;
       return padLeft + ((t - minT) / (maxT - minT)) * (width - padLeft - padRight);
   }
   function yFor(s) {
       return (height - padBottom) - (s / maxS) * (height - padTop - padBottom);
   }


   const pointsStr = history.map(p => `${xFor(p.t).toFixed(1)},${yFor(p.s).toFixed(1)}`).join(' ');
   const baselineY = height - padBottom;


   let dotsMarkup = "";
   history.forEach(p => {
       dotsMarkup += `<circle cx="${xFor(p.t).toFixed(1)}" cy="${yFor(p.s).toFixed(1)}" r="4" class="habit-chart-dot"><title>${formatHabitChartDate(p.t)}: ${p.s} days</title></circle>`;
   });


   const svgMarkup = `
       <svg viewBox="0 0 ${width} ${height}" class="habit-chart-svg" xmlns="http://www.w3.org/2000/svg">
           <line x1="${padLeft}" y1="${padTop}" x2="${padLeft}" y2="${baselineY}" class="habit-chart-axis" />
           <line x1="${padLeft}" y1="${baselineY}" x2="${width - padRight}" y2="${baselineY}" class="habit-chart-axis" />
           ${history.length > 1 ? `<polyline points="${pointsStr}" class="habit-chart-line" />` : ''}
           ${dotsMarkup}
           <text x="4" y="${padTop + 4}" class="habit-chart-axis-label">${maxS}</text>
           <text x="4" y="${baselineY + 4}" class="habit-chart-axis-label">0</text>
           <text x="${padLeft}" y="${height - 6}" class="habit-chart-axis-label">${formatHabitChartDate(minT)}</text>
           <text x="${width - padRight}" y="${height - 6}" class="habit-chart-axis-label" text-anchor="end">${formatHabitChartDate(maxT)}</text>
       </svg>
   `;


   const svgWrap = document.createElement('div');
   svgWrap.className = "habit-chart-svg-wrap";
   svgWrap.innerHTML = svgMarkup;
   habitChartContainer.appendChild(svgWrap);
}


if (habitChartSelect) {
   habitChartSelect.addEventListener('change', renderHabitChart);
}


if (habitViewToggle) {
   habitViewToggle.querySelectorAll('.view-toggle-btn').forEach(btn => {
       btn.addEventListener('click', () => {
           habitViewMode = btn.getAttribute('data-view');
           habitViewToggle.querySelectorAll('.view-toggle-btn').forEach(b => {
               b.classList.toggle('active', b === btn);
           });
           if (habitListView) habitListView.classList.toggle('view-hidden', habitViewMode !== 'list');
           if (habitChartView) habitChartView.classList.toggle('view-hidden', habitViewMode !== 'chart');
           if (habitViewMode === 'chart') renderHabitChart();
       });
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
// add shows up in both views automatically. clicking
// any day box opens it up in a modal so cramped event
// lists can be read in full.
// ==========================================
const calendarViewToggle = document.getElementById('calendarViewToggle');
const weekLayoutToggle = document.getElementById('weekLayoutToggle');
const calendarEventInput = document.getElementById('calendarEventInput');
const calendarEventDateInput = document.getElementById('calendarEventDateInput');
const recurrenceSelect = document.getElementById('recurrenceSelect');
const addCalendarEventBtn = document.getElementById('addCalendarEventBtn');
const weekViewGrid = document.getElementById('weekViewGrid');
const weekViewRows = document.getElementById('weekViewRows');
const maagDaysGrid = document.getElementById('maagDaysGrid');


let calendarEvents = JSON.parse(localStorage.getItem('myCalendarEvents')) || {};
let recurringEvents = JSON.parse(localStorage.getItem('myRecurringEvents')) || [];
let calendarViewMode = localStorage.getItem('myCalendarViewMode') || 'week';
let weekLayoutMode = localStorage.getItem('myWeekLayoutMode') || 'columns';


const calendarDayAbbrevs = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const calendarDayFullNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const calendarMonthFullNames = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];


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


// builds a local Date from a "YYYY-MM-DD" key without any timezone
// shifting (new Date("YYYY-MM-DD") parses as UTC, which can land on
// the wrong local day — this always matches dateKeyFor's own format)
function parseDateKey(key) {
   const [y, m, d] = key.split('-').map(Number);
   return new Date(y, m - 1, d);
}


// whether a recurring event rule produces an occurrence on a given date
function recurringEventAppliesToDate(rec, dateObj) {
   if (rec.type === 'daily') return true;
   const weekday = dateObj.getDay();
   if (rec.type === 'weekly') return weekday === rec.weekday;
   if (rec.type === 'biweekly') {
       if (weekday !== rec.weekday) return false;
       const anchor = parseDateKey(rec.anchorDate);
       const diffDays = Math.round((dateObj - anchor) / (1000 * 60 * 60 * 24));
       if (diffDays < 0) return false;
       return Math.floor(diffDays / 7) % 2 === 0;
   }
   return false;
}


// merges one-off events for a date with any recurring events that
// land on it, tagging each so the UI and delete behavior can tell
// them apart (deleting a recurring one removes the whole series)
function getEventsForDate(key) {
   const dateObj = parseDateKey(key);
   const regular = (calendarEvents[key] || []).map((text, index) => ({ text, recurring: false, index }));
   const recurring = recurringEvents
       .filter(rec => recurringEventAppliesToDate(rec, dateObj))
       .map(rec => ({ text: rec.text, recurring: true, recId: rec.id }));
   return [...regular, ...recurring];
}


// builds one <li> for an event object (from getEventsForDate), wiring
// up delete behavior appropriate to whether it's a one-off or recurring
function createEventListItem(ev, key, afterDelete) {
   const li = document.createElement('li');
   const span = document.createElement('span');
   span.textContent = ev.text;
   li.appendChild(span);


   if (ev.recurring) {
       const tag = document.createElement('span');
       tag.className = 'recurring-tag';
       tag.textContent = 'recurring';
       li.appendChild(tag);
   }


   const delBtn = document.createElement('button');
   delBtn.textContent = 'x';
   delBtn.className = 'delete-btn';
   delBtn.addEventListener('click', (e) => {
       e.stopPropagation();
       if (ev.recurring) {
           if (!confirm("remove this recurring event from the calendar entirely?")) return;
           recurringEvents = recurringEvents.filter(r => r.id !== ev.recId);
           localStorage.setItem('myRecurringEvents', JSON.stringify(recurringEvents));
       } else {
           calendarEvents[key].splice(ev.index, 1);
           localStorage.setItem('myCalendarEvents', JSON.stringify(calendarEvents));
       }
       renderCalendarViews();
       if (afterDelete) afterDelete();
   });


   li.appendChild(delBtn);
   return li;
}


function renderEventListInto(listEl, key) {
   listEl.innerHTML = "";
   const events = getEventsForDate(key);
   events.forEach(ev => {
       listEl.appendChild(createEventListItem(ev, key));
   });
}


// ==========================================
// day-events modal — clicking any day box in
// week or month view opens it here so cramped
// lists can be read (and trimmed) in full
// ==========================================
const dayEventsModalOverlay = document.getElementById('dayEventsModalOverlay');
const dayEventsModalTitle = document.getElementById('dayEventsModalTitle');
const dayEventsModalList = document.getElementById('dayEventsModalList');
const dayEventsModalClose = document.getElementById('dayEventsModalClose');


function formatModalDayTitle(dayDate) {
   return `${calendarDayFullNames[dayDate.getDay()]}, ${calendarMonthFullNames[dayDate.getMonth()]} ${dayDate.getDate()}`;
}


function renderDayEventsModalList(key) {
   if (!dayEventsModalList) return;
   dayEventsModalList.innerHTML = "";
   const events = getEventsForDate(key);


   if (events.length === 0) {
       dayEventsModalList.innerHTML = `<li style="color:#aaa; text-align:center; display:block;">nothing yet</li>`;
       return;
   }


   events.forEach(ev => {
       dayEventsModalList.appendChild(createEventListItem(ev, key, () => renderDayEventsModalList(key)));
   });
}


function openDayEventsModal(key, dayDate) {
   if (dayEventsModalTitle) dayEventsModalTitle.textContent = formatModalDayTitle(dayDate);
   renderDayEventsModalList(key);
   if (dayEventsModalOverlay) dayEventsModalOverlay.classList.remove('view-hidden');
}


function closeDayEventsModal() {
   if (dayEventsModalOverlay) dayEventsModalOverlay.classList.add('view-hidden');
}


if (dayEventsModalClose) dayEventsModalClose.addEventListener('click', closeDayEventsModal);
if (dayEventsModalOverlay) {
   dayEventsModalOverlay.addEventListener('click', (e) => {
       if (e.target === dayEventsModalOverlay) closeDayEventsModal();
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
       dayColumn.addEventListener('click', () => openDayEventsModal(key, dayDate));


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


// compact week layout — one row per day, so the whole
// week is visible at a glance without tall columns
function renderWeekRows() {
   if (!weekViewRows) return;
   weekViewRows.innerHTML = "";


   const today = new Date();
   const monday = getMondayOf(today);


   for (let i = 0; i < 7; i++) {
       const dayDate = new Date(monday);
       dayDate.setDate(monday.getDate() + i);
       const key = dateKeyFor(dayDate);
       const events = getEventsForDate(key);


       const row = document.createElement('div');
       row.className = "week-row-day";
       if (key === dateKeyFor(today)) row.classList.add('today-highlight');
       row.addEventListener('click', () => openDayEventsModal(key, dayDate));


       const label = document.createElement('div');
       label.className = "week-row-day-label";

       const nameLine = document.createElement('div');
       nameLine.className = "week-row-day-name";
       nameLine.textContent = calendarDayAbbrevs[dayDate.getDay()];
       label.appendChild(nameLine);

       const dateLine = document.createElement('div');
       dateLine.className = "week-row-day-date";
       dateLine.textContent = `${dayDate.getDate()}`;
       label.appendChild(dateLine);

       row.appendChild(label);


       const eventsWrap = document.createElement('div');
       eventsWrap.className = "week-row-events";


       if (events.length === 0) {
           const empty = document.createElement('span');
           empty.className = "week-row-empty";
           empty.textContent = "nothing yet";
           eventsWrap.appendChild(empty);
       } else {
           events.forEach(ev => {
               const pill = document.createElement('span');
               pill.className = "week-row-event-pill" + (ev.recurring ? " recurring" : "");
               pill.textContent = ev.text;
               eventsWrap.appendChild(pill);
           });
       }


       row.appendChild(eventsWrap);
       weekViewRows.appendChild(row);
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
       dayBox.addEventListener('click', () => openDayEventsModal(key, dayDate));


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
   renderWeekRows();
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


function applyWeekLayoutMode() {
   if (weekViewGrid) weekViewGrid.classList.toggle('view-hidden', weekLayoutMode !== 'columns');
   if (weekViewRows) weekViewRows.classList.toggle('view-hidden', weekLayoutMode !== 'rows');
   if (weekLayoutToggle) {
       weekLayoutToggle.querySelectorAll('.view-toggle-btn').forEach(btn => {
           btn.classList.toggle('active', btn.getAttribute('data-layout') === weekLayoutMode);
       });
   }
}


function applyCalendarViewMode() {
   if (calendarViewMode === 'week') {
       if (weekLayoutToggle) weekLayoutToggle.classList.remove('view-hidden');
       applyWeekLayoutMode();
   } else {
       if (weekLayoutToggle) weekLayoutToggle.classList.add('view-hidden');
       if (weekViewGrid) weekViewGrid.classList.add('view-hidden');
       if (weekViewRows) weekViewRows.classList.add('view-hidden');
   }
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


if (weekLayoutToggle) {
   weekLayoutToggle.querySelectorAll('.view-toggle-btn').forEach(btn => {
       btn.addEventListener('click', () => {
           weekLayoutMode = btn.getAttribute('data-layout');
           localStorage.setItem('myWeekLayoutMode', weekLayoutMode);
           applyWeekLayoutMode();
       });
   });
}


if (addCalendarEventBtn) {
   addCalendarEventBtn.addEventListener('click', () => {
       if (!calendarEventInput || !calendarEventDateInput) return;
       const text = calendarEventInput.value.trim();
       const dateVal = calendarEventDateInput.value || dateKeyFor(new Date());
       const recurrenceVal = recurrenceSelect ? recurrenceSelect.value : 'none';


       if (text === "") return;


       if (recurrenceVal === 'none') {
           if (!calendarEvents[dateVal]) calendarEvents[dateVal] = [];
           calendarEvents[dateVal].push(text);
           localStorage.setItem('myCalendarEvents', JSON.stringify(calendarEvents));
       } else if (recurrenceVal === 'daily') {
           recurringEvents.push({ id: Date.now() + Math.random(), text, type: 'daily', weekday: null, anchorDate: dateVal });
           localStorage.setItem('myRecurringEvents', JSON.stringify(recurringEvents));
       } else if (recurrenceVal.startsWith('weekly-')) {
           const weekday = parseInt(recurrenceVal.split('-')[1]);
           recurringEvents.push({ id: Date.now() + Math.random(), text, type: 'weekly', weekday, anchorDate: dateVal });
           localStorage.setItem('myRecurringEvents', JSON.stringify(recurringEvents));
       } else if (recurrenceVal.startsWith('biweekly-')) {
           const weekday = parseInt(recurrenceVal.split('-')[1]);
           recurringEvents.push({ id: Date.now() + Math.random(), text, type: 'biweekly', weekday, anchorDate: dateVal });
           localStorage.setItem('myRecurringEvents', JSON.stringify(recurringEvents));
       }


       calendarEventInput.value = "";
       renderCalendarViews();
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
const trackerSubjectSelect = document.getElementById('trackerSubjectSelect');


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


function renderTrackerSubjectSelect() {
   if (!trackerSubjectSelect) return;
   const previousValue = trackerSubjectSelect.value;
   trackerSubjectSelect.innerHTML = "";
   studySubjects.forEach(subject => {
       const option = document.createElement('option');
       option.value = subject;
       option.textContent = subject;
       trackerSubjectSelect.appendChild(option);
   });
   if (activeTracking) {
       trackerSubjectSelect.value = activeTracking.subject;
   } else if (studySubjects.includes(previousValue)) {
       trackerSubjectSelect.value = previousValue;
   }
}


function renderSubjectManageList() {
   if (!subjectManageList) return;
   subjectManageList.innerHTML = "";


   if (studySubjects.length === 0) {
       subjectManageList.innerHTML = `<li style="color:#aaa; text-align:center; display:block;">no activities yet</li>`;
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
           renderTrackerSubjectSelect();
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
           renderTrackerSubjectSelect();
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


// formats a timestamp as a lowercase clock time, e.g. "9:24am"
function formatTimeOfDay(ts) {
   const d = new Date(ts);
   let hours = d.getHours();
   const minutes = d.getMinutes().toString().padStart(2, '0');
   const ampm = hours >= 12 ? 'pm' : 'am';
   hours = hours % 12;
   if (hours === 0) hours = 12;
   return `${hours}:${minutes}${ampm}`;
}


function renderStudyLogs() {
   if (!studyHoursList) return;
   studyHoursList.innerHTML = "";


   const todayKey = dateKeyFor(new Date());
   const totals = {};
   studySubjects.forEach(s => totals[s] = 0);
   studyLogs.forEach(log => {
       if (!log.logged || dateKeyFor(new Date(log.logged)) !== todayKey) return;
       if (totals[log.subject] === undefined) totals[log.subject] = 0;
       totals[log.subject] += parseInt(log.minutes) || 0;
   });


   const summaryBox = document.createElement('div');
   summaryBox.className = "study-summary-box";


   const summaryTitle = document.createElement('div');
   summaryTitle.className = "summary-title";
   summaryTitle.textContent = "today's totals";
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


       const textWrap = document.createElement('div');
       textWrap.className = "study-history-text-wrap";


       const labelSpan = document.createElement('span');
       labelSpan.textContent = `${log.subject}: +${log.minutes} mins`;
       textWrap.appendChild(labelSpan);


       if (log.logged) {
           const startTs = log.logged - (log.minutes * 60000);
           const timeSpan = document.createElement('span');
           timeSpan.className = "study-history-time";
           timeSpan.textContent = `${formatTimeOfDay(startTs)} - ${formatTimeOfDay(log.logged)}`;
           textWrap.appendChild(timeSpan);
       }


       li.appendChild(textWrap);


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
           alert("add an activity first.");
           return;
       }
       const minutesValue = parseInt(studyTimeInput.value.trim());
       const selectedSubject = subjectSelect.value;


       if (!isNaN(minutesValue) && minutesValue > 0) {
           studyLogs.push({ subject: selectedSubject, minutes: minutesValue, logged: Date.now() });
           localStorage.setItem('myStudyLogs', JSON.stringify(studyLogs));
           studyTimeInput.value = "";
           renderStudyLogs();
           renderStudyBreakdownCharts();
       } else {
           alert("please enter a valid number of minutes.");
       }
   });
}


renderSubjectSelect();
renderSubjectManageList();
renderStudyLogs();


// ==========================================
// study time breakdown — two circular,
// color-coded views of logged minutes per
// activity: today (always visible up top),
// and this week (resets Monday, in its own view)
// ==========================================
const studyViewToggle = document.getElementById('studyViewToggle');
const studyTrackView = document.getElementById('studyTrackView');
const studyTimerView = document.getElementById('studyTimerView');
const studyActivitiesView = document.getElementById('studyActivitiesView');
const studyBreakdownView = document.getElementById('studyBreakdownView');
const breakdownChartDay = document.getElementById('breakdownChartDay');
const breakdownLegendDay = document.getElementById('breakdownLegendDay');
const breakdownChartWeek = document.getElementById('breakdownChartWeek');
const breakdownLegendWeek = document.getElementById('breakdownLegendWeek');


let studyViewMode = 'track';


const breakdownPalette = ['#e07a5f', '#4a7c59', '#f4a261', '#8c7e70', '#6b8fb5', '#b56b8f', '#9c8f5c', '#5c9c9c', '#b58f6b', '#7a5fe0'];


function renderDonutChart(chartEl, legendEl, logsInRange) {
   if (!chartEl || !legendEl) return;
   chartEl.innerHTML = "";
   legendEl.innerHTML = "";


   const totals = {};
   logsInRange.forEach(log => {
       if (totals[log.subject] === undefined) totals[log.subject] = 0;
       totals[log.subject] += parseInt(log.minutes) || 0;
   });


   const entries = Object.entries(totals).filter(([, mins]) => mins > 0);
   const grandTotal = entries.reduce((sum, [, mins]) => sum + mins, 0);


   if (grandTotal === 0) {
       chartEl.style.background = "#ebdccb";
       const emptyMsg = document.createElement('li');
       emptyMsg.className = "breakdown-legend-item";
       emptyMsg.textContent = "no time logged yet";
       legendEl.appendChild(emptyMsg);
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
       label.textContent = `${subject} — ${Math.round(percent)}%, ${formatMinutesToHours(mins)}`;
       li.appendChild(label);


       legendEl.appendChild(li);
   });


   chartEl.style.background = `conic-gradient(${gradientParts.join(', ')})`;
}


// today's and this week's logged sessions, as reusable filters —
// both the small persistent charts and the fullscreen modal draw
// from these so they never fall out of sync with each other
function getTodaysStudyLogs() {
   const todayKey = dateKeyFor(new Date());
   return studyLogs.filter(log => log.logged && dateKeyFor(new Date(log.logged)) === todayKey);
}


function getWeeksStudyLogs() {
   const monday = getMondayOf(new Date());
   monday.setHours(0, 0, 0, 0);
   const mondayTimestamp = monday.getTime();
   return studyLogs.filter(log => log.logged && log.logged >= mondayTimestamp);
}


function renderStudyBreakdownCharts() {
   renderDonutChart(breakdownChartDay, breakdownLegendDay, getTodaysStudyLogs());
   renderDonutChart(breakdownChartWeek, breakdownLegendWeek, getWeeksStudyLogs());
}
renderStudyBreakdownCharts();


// fullscreen chart modal — the small persistent "today" chart and
// the "this week" chart are both cramped for reading exact percentages,
// so clicking either opens a much larger version of the same data
const todayBreakdownCard = document.getElementById('todayBreakdownCard');
const weekBreakdownContainer = document.getElementById('weekBreakdownContainer');
const chartModalOverlay = document.getElementById('chartModalOverlay');
const chartModalTitle = document.getElementById('chartModalTitle');
const chartModalChart = document.getElementById('chartModalChart');
const chartModalLegend = document.getElementById('chartModalLegend');
const chartModalClose = document.getElementById('chartModalClose');


function openChartModal(title, logsInRange) {
   if (chartModalTitle) chartModalTitle.textContent = title;
   renderDonutChart(chartModalChart, chartModalLegend, logsInRange);
   if (chartModalOverlay) chartModalOverlay.classList.remove('view-hidden');
}


function closeChartModal() {
   if (chartModalOverlay) chartModalOverlay.classList.add('view-hidden');
}


if (todayBreakdownCard) {
   todayBreakdownCard.addEventListener('click', () => openChartModal('today', getTodaysStudyLogs()));
}


if (weekBreakdownContainer) {
   weekBreakdownContainer.addEventListener('click', () => openChartModal('this week', getWeeksStudyLogs()));
}


if (chartModalClose) chartModalClose.addEventListener('click', closeChartModal);
if (chartModalOverlay) {
   chartModalOverlay.addEventListener('click', (e) => {
       if (e.target === chartModalOverlay) closeChartModal();
   });
}


if (studyViewToggle) {
   studyViewToggle.querySelectorAll('.view-toggle-btn').forEach(btn => {
       btn.addEventListener('click', () => {
           studyViewMode = btn.getAttribute('data-view');
           studyViewToggle.querySelectorAll('.view-toggle-btn').forEach(b => {
               b.classList.toggle('active', b === btn);
           });
           if (studyTrackView) studyTrackView.classList.toggle('view-hidden', studyViewMode !== 'track');
           if (studyTimerView) studyTimerView.classList.toggle('view-hidden', studyViewMode !== 'timer');
           if (studyActivitiesView) studyActivitiesView.classList.toggle('view-hidden', studyViewMode !== 'activities');
           if (studyBreakdownView) studyBreakdownView.classList.toggle('view-hidden', studyViewMode !== 'breakdown');
       });
   });
}


// ==========================================
// real-time time tracker — pick an activity,
// hit start, and it counts up live like a
// stopwatch. hitting stop logs the elapsed
// time straight into that activity's totals.
// the active session is saved to localStorage
// so it keeps counting correctly even if the
// page gets reloaded mid-session.
// ==========================================
const trackerStartStopBtn = document.getElementById('trackerStartStopBtn');
const trackerCancelBtn = document.getElementById('trackerCancelBtn');
const trackerElapsedDisplay = document.getElementById('trackerElapsedDisplay');
const trackerActiveLabel = document.getElementById('trackerActiveLabel');
const trackFromLastLogCheckbox = document.getElementById('trackFromLastLogCheckbox');


let activeTracking = JSON.parse(localStorage.getItem('myActiveTracking')) || null;
let trackerIntervalId = null;


// the timestamp the most recently logged session ended at, or null
// if nothing has been logged yet — used by "start from last logged
// time" to pick up right where the last session left off, with no gap
function getLastLoggedEndTime() {
   let maxTs = null;
   studyLogs.forEach(log => {
       if (log.logged && (maxTs === null || log.logged > maxTs)) maxTs = log.logged;
   });
   return maxTs;
}


function formatElapsed(totalSeconds) {
   const hrs = Math.floor(totalSeconds / 3600);
   const mins = Math.floor((totalSeconds % 3600) / 60);
   const secs = totalSeconds % 60;
   return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}


function updateTrackerDisplay() {
   if (!trackerElapsedDisplay) return;
   if (!activeTracking) {
       trackerElapsedDisplay.textContent = "00:00:00";
       if (trackerActiveLabel) trackerActiveLabel.textContent = "";
       return;
   }
   const elapsedSeconds = Math.floor((Date.now() - activeTracking.startTime) / 1000);
   trackerElapsedDisplay.textContent = formatElapsed(elapsedSeconds);
   if (trackerActiveLabel) trackerActiveLabel.textContent = `tracking: ${activeTracking.subject}`;
}


function startTrackerTicking() {
   if (trackerIntervalId) clearInterval(trackerIntervalId);
   trackerIntervalId = setInterval(updateTrackerDisplay, 1000);
}


function setTrackerUIState() {
   if (!trackerStartStopBtn) return;
   if (activeTracking) {
       trackerStartStopBtn.textContent = 'stop';
       trackerStartStopBtn.classList.add('tracking');
       if (trackFromLastLogCheckbox) trackFromLastLogCheckbox.disabled = true;
       if (trackerCancelBtn) trackerCancelBtn.classList.remove('view-hidden');
   } else {
       trackerStartStopBtn.textContent = 'start';
       trackerStartStopBtn.classList.remove('tracking');
       if (trackFromLastLogCheckbox) trackFromLastLogCheckbox.disabled = false;
       if (trackerCancelBtn) trackerCancelBtn.classList.add('view-hidden');
   }
}


if (trackerStartStopBtn) {
   trackerStartStopBtn.addEventListener('click', () => {
       if (!activeTracking) {
           if (studySubjects.length === 0) {
               alert("add an activity first.");
               return;
           }
           const subject = trackerSubjectSelect ? trackerSubjectSelect.value : studySubjects[0];


           let startTime = Date.now();
           if (trackFromLastLogCheckbox && trackFromLastLogCheckbox.checked) {
               const lastEnd = getLastLoggedEndTime();
               if (lastEnd) startTime = lastEnd;
           }


           activeTracking = { subject: subject, startTime: startTime };
           localStorage.setItem('myActiveTracking', JSON.stringify(activeTracking));
           setTrackerUIState();
           startTrackerTicking();
           updateTrackerDisplay();
       } else {
           const elapsedMs = Date.now() - activeTracking.startTime;
           const elapsedSeconds = Math.floor(elapsedMs / 1000);


           if (elapsedSeconds >= 30) {
               const minutes = Math.max(1, Math.round(elapsedMs / 60000));
               studyLogs.push({ subject: activeTracking.subject, minutes: minutes, logged: Date.now() });
               localStorage.setItem('myStudyLogs', JSON.stringify(studyLogs));
               renderStudyLogs();
               renderStudyBreakdownCharts();
           }


           stopTrackingSession();
       }
   });
}


// tears down the active session locally without touching studyLogs —
// shared by "stop" (after logging) and "cancel" (which skips logging)
function stopTrackingSession() {
   activeTracking = null;
   localStorage.removeItem('myActiveTracking');
   clearInterval(trackerIntervalId);
   trackerIntervalId = null;
   setTrackerUIState();
   updateTrackerDisplay();
}


// cancel discards the whole session — no log entry gets created,
// unlike "stop" which saves whatever time had accumulated
if (trackerCancelBtn) {
   trackerCancelBtn.addEventListener('click', () => {
       if (!activeTracking) return;
       if (!confirm("cancel this session? the time won't be logged.")) return;
       stopTrackingSession();
   });
}


// changing the activity mid-session just relabels the session in
// place — the original start time and everything already elapsed
// stay exactly as they are, nothing gets logged or split. this is
// for correcting the label on the session you're already running,
// not for switching to a new task (cancel/stop and start a new one for that)
if (trackerSubjectSelect) {
   trackerSubjectSelect.addEventListener('change', () => {
       if (!activeTracking) return;
       const newSubject = trackerSubjectSelect.value;
       if (newSubject === activeTracking.subject) return;


       activeTracking.subject = newSubject;
       localStorage.setItem('myActiveTracking', JSON.stringify(activeTracking));
       updateTrackerDisplay();
   });
}


renderTrackerSubjectSelect();
setTrackerUIState();
updateTrackerDisplay();
if (activeTracking) startTrackerTicking();


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
// health tab — diet and gym, toggled like the
// study page's track/timer/activities/breakdown
// ==========================================
const healthViewToggle = document.getElementById('healthViewToggle');
const dietView = document.getElementById('dietView');
const gymView = document.getElementById('gymView');


let healthViewMode = 'diet';


if (healthViewToggle) {
   healthViewToggle.querySelectorAll('.view-toggle-btn').forEach(btn => {
       btn.addEventListener('click', () => {
           healthViewMode = btn.getAttribute('data-view');
           healthViewToggle.querySelectorAll('.view-toggle-btn').forEach(b => {
               b.classList.toggle('active', b === btn);
           });
           if (dietView) dietView.classList.toggle('view-hidden', healthViewMode !== 'diet');
           if (gymView) gymView.classList.toggle('view-hidden', healthViewMode !== 'gym');
           if (healthViewMode === 'gym') {
               renderGymSplit();
               renderGymMiniCalendar();
               renderGymStreak();
           }
       });
   });
}


// ==========================================
// diet — a daily food checklist (resets who's
// checked off at midnight, not the list itself),
// a completion bar, and a water glass counter
// that also resets at midnight
// ==========================================
const dietProgressLabel = document.getElementById('dietProgressLabel');
const dietProgressFill = document.getElementById('dietProgressFill');
const dietFoodInput = document.getElementById('dietFoodInput');
const addDietFoodBtn = document.getElementById('addDietFoodBtn');
const dietFoodList = document.getElementById('dietFoodList');
const waterMinusBtn = document.getElementById('waterMinusBtn');
const waterPlusBtn = document.getElementById('waterPlusBtn');
const waterCountValue = document.getElementById('waterCountValue');


let dietFoods = JSON.parse(localStorage.getItem('myDietFoods')) || [];


function renderDietProgress() {
   if (!dietProgressLabel || !dietProgressFill) return;
   const todayKey = dateKeyFor(new Date());
   const total = dietFoods.length;
   const eaten = dietFoods.filter(food => food.lastCheckedDate === todayKey).length;
   dietProgressLabel.textContent = `${eaten} / ${total} eaten`;
   const percent = total > 0 ? Math.round((eaten / total) * 100) : 0;
   dietProgressFill.style.width = `${percent}%`;
}


function renderDietFoodList() {
   if (!dietFoodList) return;
   dietFoodList.innerHTML = "";
   const todayKey = dateKeyFor(new Date());


   if (dietFoods.length === 0) {
       dietFoodList.innerHTML = `<li style="color:#aaa; text-align:center; display:block;">no foods yet</li>`;
       renderDietProgress();
       return;
   }


   dietFoods.forEach((food, index) => {
       const li = document.createElement('li');


       const leftSide = document.createElement('div');
       leftSide.className = 'task-left';


       const checkbox = document.createElement('input');
       checkbox.type = 'checkbox';
       checkbox.className = 'task-checkbox';
       checkbox.checked = food.lastCheckedDate === todayKey;
       checkbox.addEventListener('change', () => {
           food.lastCheckedDate = checkbox.checked ? todayKey : null;
           localStorage.setItem('myDietFoods', JSON.stringify(dietFoods));
           renderDietFoodList();
       });


       const textSpan = document.createElement('span');
       textSpan.textContent = food.name;
       if (checkbox.checked) textSpan.style.textDecoration = 'line-through';


       leftSide.appendChild(checkbox);
       leftSide.appendChild(textSpan);
       li.appendChild(leftSide);


       const delBtn = document.createElement('button');
       delBtn.textContent = 'x';
       delBtn.className = 'delete-btn';
       delBtn.addEventListener('click', () => {
           dietFoods.splice(index, 1);
           localStorage.setItem('myDietFoods', JSON.stringify(dietFoods));
           renderDietFoodList();
       });
       li.appendChild(delBtn);


       dietFoodList.appendChild(li);
   });


   renderDietProgress();
}


if (addDietFoodBtn && dietFoodInput) {
   addDietFoodBtn.addEventListener('click', () => {
       const val = dietFoodInput.value.trim();
       if (val !== "") {
           dietFoods.push({ name: val, lastCheckedDate: null });
           localStorage.setItem('myDietFoods', JSON.stringify(dietFoods));
           dietFoodInput.value = "";
           renderDietFoodList();
       }
   });
}


renderDietFoodList();


// water counter — resets to 0 each day by comparing
// its stored date to today's date on every load
let waterState = JSON.parse(localStorage.getItem('myWaterState')) || { count: 0, dateKey: dateKeyFor(new Date()) };
if (waterState.dateKey !== dateKeyFor(new Date())) {
   waterState = { count: 0, dateKey: dateKeyFor(new Date()) };
   localStorage.setItem('myWaterState', JSON.stringify(waterState));
}


function renderWaterCounter() {
   if (waterCountValue) waterCountValue.textContent = waterState.count;
}


if (waterPlusBtn) {
   waterPlusBtn.addEventListener('click', () => {
       waterState.count++;
       waterState.dateKey = dateKeyFor(new Date());
       localStorage.setItem('myWaterState', JSON.stringify(waterState));
       renderWaterCounter();
   });
}


if (waterMinusBtn) {
   waterMinusBtn.addEventListener('click', () => {
       waterState.count = Math.max(0, waterState.count - 1);
       waterState.dateKey = dateKeyFor(new Date());
       localStorage.setItem('myWaterState', JSON.stringify(waterState));
       renderWaterCounter();
   });
}


renderWaterCounter();


// ==========================================
// gym — a weekly split (today's card stands out),
// exercises per day via a modal, and a mini
// calendar to check off gym days and see a streak
// ==========================================
const gymSplitGrid = document.getElementById('gymSplitGrid');
const gymStreakLabel = document.getElementById('gymStreakLabel');
const gymMiniCalendar = document.getElementById('gymMiniCalendar');
const gymDayModalOverlay = document.getElementById('gymDayModalOverlay');
const gymDayModalTitle = document.getElementById('gymDayModalTitle');
const gymDayModalClose = document.getElementById('gymDayModalClose');
const gymMuscleGroupInput = document.getElementById('gymMuscleGroupInput');
const saveGymMuscleGroupBtn = document.getElementById('saveGymMuscleGroupBtn');
const gymExerciseInput = document.getElementById('gymExerciseInput');
const addGymExerciseBtn = document.getElementById('addGymExerciseBtn');
const gymExerciseList = document.getElementById('gymExerciseList');


const gymDayShortNames = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const gymDayFullNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];


let gymSplit = JSON.parse(localStorage.getItem('myGymSplit')) || {};
let gymAttendance = JSON.parse(localStorage.getItem('myGymAttendance')) || {};
let currentGymDayIndex = null;


function getGymDay(dayIndex) {
   const key = String(dayIndex);
   if (!gymSplit[key]) gymSplit[key] = { muscleGroup: "", exercises: [] };
   // migrate any old plain-string exercises into checkable objects
   gymSplit[key].exercises = gymSplit[key].exercises.map(exercise =>
       typeof exercise === 'string' ? { name: exercise, lastCheckedDate: null } : exercise
   );
   return gymSplit[key];
}


function renderGymSplit() {
   if (!gymSplitGrid) return;
   gymSplitGrid.innerHTML = "";
   const todayIdx = new Date().getDay();
   const todayKey = dateKeyFor(new Date());


   for (let i = 0; i < 7; i++) {
       const dayData = getGymDay(i);
       const card = document.createElement('div');
       card.className = "gym-day-card";
       if (i === todayIdx) card.classList.add('gym-today');


       const nameDiv = document.createElement('div');
       nameDiv.className = "gym-day-name";
       nameDiv.textContent = gymDayShortNames[i];
       card.appendChild(nameDiv);


       const muscleDiv = document.createElement('div');
       muscleDiv.className = "gym-day-muscle";
       if (dayData.muscleGroup) {
           muscleDiv.textContent = dayData.muscleGroup;
       } else {
           muscleDiv.textContent = "rest / unset";
           muscleDiv.classList.add('gym-day-unset');
       }
       card.appendChild(muscleDiv);


       if (dayData.exercises && dayData.exercises.length > 0) {
           const doneToday = dayData.exercises.filter(ex => ex.lastCheckedDate === todayKey).length;
           const countDiv = document.createElement('div');
           countDiv.className = "gym-day-exercise-count";
           countDiv.textContent = `${doneToday}/${dayData.exercises.length} done today`;
           card.appendChild(countDiv);
       }


       card.addEventListener('click', () => openGymDayModal(i));
       gymSplitGrid.appendChild(card);
   }
}


function renderGymExerciseList() {
   if (!gymExerciseList || currentGymDayIndex === null) return;
   gymExerciseList.innerHTML = "";
   const dayData = getGymDay(currentGymDayIndex);
   const todayKey = dateKeyFor(new Date());


   if (dayData.exercises.length === 0) {
       gymExerciseList.innerHTML = `<li style="color:#aaa; text-align:center; display:block;">no exercises yet</li>`;
       return;
   }


   dayData.exercises.forEach((exercise, index) => {
       const li = document.createElement('li');


       const leftSide = document.createElement('div');
       leftSide.className = 'task-left';


       const checkbox = document.createElement('input');
       checkbox.type = 'checkbox';
       checkbox.className = 'task-checkbox';
       checkbox.checked = exercise.lastCheckedDate === todayKey;
       checkbox.addEventListener('change', () => {
           exercise.lastCheckedDate = checkbox.checked ? todayKey : null;
           localStorage.setItem('myGymSplit', JSON.stringify(gymSplit));
           renderGymExerciseList();
           renderGymSplit();
       });


       const textSpan = document.createElement('span');
       textSpan.textContent = exercise.name;
       if (checkbox.checked) textSpan.style.textDecoration = 'line-through';


       leftSide.appendChild(checkbox);
       leftSide.appendChild(textSpan);
       li.appendChild(leftSide);


       const delBtn = document.createElement('button');
       delBtn.textContent = 'x';
       delBtn.className = 'delete-btn';
       delBtn.addEventListener('click', () => {
           dayData.exercises.splice(index, 1);
           localStorage.setItem('myGymSplit', JSON.stringify(gymSplit));
           renderGymExerciseList();
           renderGymSplit();
       });
       li.appendChild(delBtn);
       gymExerciseList.appendChild(li);
   });
}


function openGymDayModal(dayIndex) {
   currentGymDayIndex = dayIndex;
   const dayData = getGymDay(dayIndex);
   if (gymDayModalTitle) gymDayModalTitle.textContent = gymDayFullNames[dayIndex];
   if (gymMuscleGroupInput) gymMuscleGroupInput.value = dayData.muscleGroup || "";
   renderGymExerciseList();
   if (gymDayModalOverlay) gymDayModalOverlay.classList.remove('view-hidden');
}


function closeGymDayModal() {
   if (gymDayModalOverlay) gymDayModalOverlay.classList.add('view-hidden');
   currentGymDayIndex = null;
}


if (gymDayModalClose) gymDayModalClose.addEventListener('click', closeGymDayModal);
if (gymDayModalOverlay) {
   gymDayModalOverlay.addEventListener('click', (e) => {
       if (e.target === gymDayModalOverlay) closeGymDayModal();
   });
}


if (saveGymMuscleGroupBtn) {
   saveGymMuscleGroupBtn.addEventListener('click', () => {
       if (currentGymDayIndex === null || !gymMuscleGroupInput) return;
       const dayData = getGymDay(currentGymDayIndex);
       dayData.muscleGroup = gymMuscleGroupInput.value.trim();
       localStorage.setItem('myGymSplit', JSON.stringify(gymSplit));
       renderGymSplit();
   });
}


if (addGymExerciseBtn && gymExerciseInput) {
   addGymExerciseBtn.addEventListener('click', () => {
       if (currentGymDayIndex === null) return;
       const val = gymExerciseInput.value.trim();
       if (val !== "") {
           const dayData = getGymDay(currentGymDayIndex);
           dayData.exercises.push({ name: val, lastCheckedDate: null });
           localStorage.setItem('myGymSplit', JSON.stringify(gymSplit));
           gymExerciseInput.value = "";
           renderGymExerciseList();
           renderGymSplit();
       }
   });
}


function renderGymMiniCalendar() {
   if (!gymMiniCalendar) return;
   gymMiniCalendar.innerHTML = "";


   const today = new Date();
   const year = today.getFullYear();
   const monthIdx = today.getMonth();
   const totalDays = new Date(year, monthIdx + 1, 0).getDate();
   const firstWeekday = new Date(year, monthIdx, 1).getDay();


   const label = document.createElement('div');
   label.className = "mini-calendar-label";
   label.textContent = `${miniCalMonths[monthIdx]} ${year}`;
   gymMiniCalendar.appendChild(label);


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
       const dayDate = new Date(year, monthIdx, d);
       const key = dateKeyFor(dayDate);


       const cell = document.createElement('div');
       cell.className = "mini-calendar-day";
       if (d === today.getDate()) cell.classList.add('gym-today-ring');
       if (gymAttendance[key]) cell.classList.add('gym-attended');
       cell.textContent = d;


       cell.addEventListener('click', () => {
           if (gymAttendance[key]) {
               delete gymAttendance[key];
           } else {
               gymAttendance[key] = true;
           }
           localStorage.setItem('myGymAttendance', JSON.stringify(gymAttendance));
           renderGymMiniCalendar();
           renderGymStreak();
       });


       grid.appendChild(cell);
   }


   gymMiniCalendar.appendChild(grid);
}


function renderGymStreak() {
   if (!gymStreakLabel) return;
   let streak = 0;
   const cursor = new Date();


   // if today hasn't been checked off yet, that alone shouldn't
   // break an existing streak — start counting from yesterday
   if (!gymAttendance[dateKeyFor(cursor)]) {
       cursor.setDate(cursor.getDate() - 1);
   }
   while (gymAttendance[dateKeyFor(cursor)]) {
       streak++;
       cursor.setDate(cursor.getDate() - 1);
   }


   gymStreakLabel.textContent = `${streak} day streak`;
}


renderGymSplit();
renderGymMiniCalendar();
renderGymStreak();


// ==========================================
// school tab — a homepage for scheduling study
// sessions and managing subject pages. each subject
// page has its own to-dos (which also show up,
// tagged, under the main to-dos tab via the shared
// myTasks list), study resources, and test dates
// (which also show up in the homepage/settings
// countdowns, since they share the trackedDates list)
// ==========================================
const schoolNavToggle = document.getElementById('schoolNavToggle');
const schoolHomeView = document.getElementById('schoolHomeView');
const schoolSubjectView = document.getElementById('schoolSubjectView');
const schoolSubjectPageTitle = document.getElementById('schoolSubjectPageTitle');


const newSchoolSubjectInput = document.getElementById('newSchoolSubjectInput');
const addSchoolSubjectBtn = document.getElementById('addSchoolSubjectBtn');
const schoolSubjectManageList = document.getElementById('schoolSubjectManageList');


const scheduleSubjectSelect = document.getElementById('scheduleSubjectSelect');
const scheduleDateInput = document.getElementById('scheduleDateInput');
const scheduleTimeInput = document.getElementById('scheduleTimeInput');
const addScheduleBtn = document.getElementById('addScheduleBtn');
const scheduleList = document.getElementById('scheduleList');


const schoolTaskInput = document.getElementById('schoolTaskInput');
const addSchoolTaskBtn = document.getElementById('addSchoolTaskBtn');
const schoolTaskList = document.getElementById('schoolTaskList');


const schoolResourceNameInput = document.getElementById('schoolResourceNameInput');
const schoolResourceUrlInput = document.getElementById('schoolResourceUrlInput');
const addSchoolResourceBtn = document.getElementById('addSchoolResourceBtn');
const schoolResourceList = document.getElementById('schoolResourceList');


const schoolTestNameInput = document.getElementById('schoolTestNameInput');
const schoolTestDateInput = document.getElementById('schoolTestDateInput');
const addSchoolTestBtn = document.getElementById('addSchoolTestBtn');
const schoolTestList = document.getElementById('schoolTestList');


let schoolSubjects = JSON.parse(localStorage.getItem('mySchoolSubjects')) || [];
let schoolResources = JSON.parse(localStorage.getItem('mySchoolResources')) || {};
let schoolSchedule = JSON.parse(localStorage.getItem('mySchoolSchedule')) || [];
let currentSchoolSubject = null;


function renderSchoolNav() {
   if (!schoolNavToggle) return;
   const activeView = currentSchoolSubject === null ? 'home' : currentSchoolSubject;
   schoolNavToggle.innerHTML = "";


   const homeBtn = document.createElement('button');
   homeBtn.className = 'view-toggle-btn' + (activeView === 'home' ? ' active' : '');
   homeBtn.textContent = 'homepage';
   homeBtn.addEventListener('click', () => openSchoolHome());
   schoolNavToggle.appendChild(homeBtn);


   schoolSubjects.forEach(subject => {
       const btn = document.createElement('button');
       btn.className = 'view-toggle-btn' + (activeView === subject ? ' active' : '');
       btn.textContent = subject;
       btn.addEventListener('click', () => openSchoolSubjectPage(subject));
       schoolNavToggle.appendChild(btn);
   });
}


function openSchoolHome() {
   currentSchoolSubject = null;
   if (schoolHomeView) schoolHomeView.classList.remove('view-hidden');
   if (schoolSubjectView) schoolSubjectView.classList.add('view-hidden');
   renderSchoolNav();
}


function openSchoolSubjectPage(subject) {
   currentSchoolSubject = subject;
   if (schoolHomeView) schoolHomeView.classList.add('view-hidden');
   if (schoolSubjectView) schoolSubjectView.classList.remove('view-hidden');
   if (schoolSubjectPageTitle) schoolSubjectPageTitle.textContent = subject;
   renderSchoolNav();
   renderSchoolSubjectTasks();
   renderSchoolResourceList();
   renderSchoolTestList();
}


function renderSchoolSubjectManageList() {
   if (!schoolSubjectManageList) return;
   schoolSubjectManageList.innerHTML = "";


   if (schoolSubjects.length === 0) {
       schoolSubjectManageList.innerHTML = `<li style="color:#aaa; text-align:center; display:block;">no subjects yet</li>`;
       return;
   }


   schoolSubjects.forEach((subject, index) => {
       const li = document.createElement('li');
       const span = document.createElement('span');
       span.textContent = subject;
       li.appendChild(span);


       const delBtn = document.createElement('button');
       delBtn.textContent = 'x';
       delBtn.className = 'delete-btn';
       delBtn.addEventListener('click', () => {
           if (!confirm(`remove "${subject}" and everything on its page (to-dos, resources, tests)?`)) return;


           schoolSubjects.splice(index, 1);
           localStorage.setItem('mySchoolSubjects', JSON.stringify(schoolSubjects));


           delete schoolResources[subject];
           localStorage.setItem('mySchoolResources', JSON.stringify(schoolResources));


           myTasks = myTasks.filter(t => (typeof t === 'string' ? true : t.subject !== subject));
           localStorage.setItem('myTasks', JSON.stringify(myTasks));


           trackedDates = trackedDates.filter(d => d.schoolSubject !== subject);
           localStorage.setItem('trackedDates', JSON.stringify(trackedDates));


           schoolSchedule = schoolSchedule.filter(s => s.subject !== subject);
           localStorage.setItem('mySchoolSchedule', JSON.stringify(schoolSchedule));


           renderSchoolSubjectManageList();
           renderScheduleSubjectSelect();
           renderScheduleList();
           renderTasks();
           calculateCountdowns();


           if (currentSchoolSubject === subject) {
               openSchoolHome();
           } else {
               renderSchoolNav();
           }
       });
       li.appendChild(delBtn);
       schoolSubjectManageList.appendChild(li);
   });
}


if (addSchoolSubjectBtn && newSchoolSubjectInput) {
   addSchoolSubjectBtn.addEventListener('click', () => {
       const val = newSchoolSubjectInput.value.trim().toLowerCase();
       if (val !== "" && !schoolSubjects.includes(val)) {
           schoolSubjects.push(val);
           localStorage.setItem('mySchoolSubjects', JSON.stringify(schoolSubjects));
           newSchoolSubjectInput.value = "";
           renderSchoolSubjectManageList();
           renderScheduleSubjectSelect();
           renderSchoolNav();
       }
   });
}


function renderScheduleSubjectSelect() {
   if (!scheduleSubjectSelect) return;
   const previousValue = scheduleSubjectSelect.value;
   scheduleSubjectSelect.innerHTML = "";
   schoolSubjects.forEach(subject => {
       const option = document.createElement('option');
       option.value = subject;
       option.textContent = subject;
       scheduleSubjectSelect.appendChild(option);
   });
   if (schoolSubjects.includes(previousValue)) scheduleSubjectSelect.value = previousValue;
}


function formatScheduleDate(dateStr) {
   const parts = dateStr.split('-');
   if (parts.length !== 3) return dateStr;
   const [yyyy, mm, dd] = parts;
   return `${mm}-${dd}-${yyyy}`;
}


function formatScheduleTime(timeStr) {
   if (!timeStr) return "";
   const [hStr, mStr] = timeStr.split(':');
   let hours = parseInt(hStr);
   const ampm = hours >= 12 ? 'pm' : 'am';
   hours = hours % 12;
   if (hours === 0) hours = 12;
   return `${hours}:${mStr}${ampm}`;
}


function renderScheduleList() {
   if (!scheduleList) return;
   scheduleList.innerHTML = "";


   if (schoolSchedule.length === 0) {
       scheduleList.innerHTML = `<li style="color:#aaa; text-align:center; display:block;">nothing scheduled yet</li>`;
       return;
   }


   const sorted = schoolSchedule
       .map((session, index) => ({ session, index }))
       .sort((a, b) => `${a.session.date}T${a.session.time || '00:00'}`.localeCompare(`${b.session.date}T${b.session.time || '00:00'}`));


   sorted.forEach(({ session, index }) => {
       const li = document.createElement('li');
       li.className = 'schedule-item';


       const info = document.createElement('span');
       const subjectSpan = document.createElement('span');
       subjectSpan.className = 'schedule-item-subject';
       subjectSpan.textContent = session.subject;
       info.appendChild(subjectSpan);
       info.appendChild(document.createTextNode(
           `${formatScheduleDate(session.date)}${session.time ? ' · ' + formatScheduleTime(session.time) : ''}`
       ));
       li.appendChild(info);


       const delBtn = document.createElement('button');
       delBtn.textContent = 'x';
       delBtn.className = 'delete-btn';
       delBtn.addEventListener('click', () => {
           schoolSchedule.splice(index, 1);
           localStorage.setItem('mySchoolSchedule', JSON.stringify(schoolSchedule));
           renderScheduleList();
       });
       li.appendChild(delBtn);


       scheduleList.appendChild(li);
   });
}


if (addScheduleBtn) {
   addScheduleBtn.addEventListener('click', () => {
       if (schoolSubjects.length === 0) {
           alert("add a subject first.");
           return;
       }
       if (!scheduleDateInput || !scheduleDateInput.value) {
           alert("pick a date.");
           return;
       }
       const subject = scheduleSubjectSelect ? scheduleSubjectSelect.value : schoolSubjects[0];
       const dateVal = scheduleDateInput.value;
       const timeVal = scheduleTimeInput ? scheduleTimeInput.value : "";


       schoolSchedule.push({ subject: subject, date: dateVal, time: timeVal });
       localStorage.setItem('mySchoolSchedule', JSON.stringify(schoolSchedule));
       scheduleDateInput.value = "";
       if (scheduleTimeInput) scheduleTimeInput.value = "";
       renderScheduleList();
   });
}


// ---- per-subject to-dos (reuses myTasks + buildTaskListItem, so
// checkbox/priority/deadline/overdue behavior matches the to-dos tab) ----
function renderSchoolSubjectTasks() {
   if (!schoolTaskList || !currentSchoolSubject) return;
   schoolTaskList.innerHTML = "";


   const matching = myTasks
       .map((task, index) => ({ task, index }))
       .filter(({ task }) => typeof task !== 'string' && task.subject === currentSchoolSubject);


   if (matching.length === 0) {
       schoolTaskList.innerHTML = `<li style="color:#aaa; text-align:center; display:block;">nothing yet</li>`;
       return;
   }


   matching.forEach(({ task, index }) => {
       schoolTaskList.appendChild(buildTaskListItem(task, index, () => {
           renderSchoolSubjectTasks();
           renderTasks();
       }));
   });
}


if (addSchoolTaskBtn && schoolTaskInput) {
   addSchoolTaskBtn.addEventListener('click', () => {
       if (!currentSchoolSubject) return;
       const val = schoolTaskInput.value.trim();
       if (val !== "") {
           myTasks.push({
               text: val,
               created: Date.now(),
               priority: 'medium',
               deadline: null,
               completed: false,
               subject: currentSchoolSubject
           });
           localStorage.setItem('myTasks', JSON.stringify(myTasks));
           schoolTaskInput.value = "";
           renderSchoolSubjectTasks();
           renderTasks();
       }
   });
}


// ---- per-subject resources ----
function renderSchoolResourceList() {
   if (!schoolResourceList || !currentSchoolSubject) return;
   schoolResourceList.innerHTML = "";


   const resources = schoolResources[currentSchoolSubject] || [];


   if (resources.length === 0) {
       schoolResourceList.innerHTML = `<li style="color:#aaa; text-align:center; display:block;">nothing yet</li>`;
       return;
   }


   resources.forEach((resource, index) => {
       const li = document.createElement('li');


       if (resource.url) {
           const link = document.createElement('a');
           link.className = 'resource-item-link';
           link.href = resource.url;
           link.target = '_blank';
           link.rel = 'noopener noreferrer';
           link.textContent = resource.name;
           li.appendChild(link);
       } else {
           const span = document.createElement('span');
           span.textContent = resource.name;
           li.appendChild(span);
       }


       const delBtn = document.createElement('button');
       delBtn.textContent = 'x';
       delBtn.className = 'delete-btn';
       delBtn.addEventListener('click', () => {
           resources.splice(index, 1);
           localStorage.setItem('mySchoolResources', JSON.stringify(schoolResources));
           renderSchoolResourceList();
       });
       li.appendChild(delBtn);


       schoolResourceList.appendChild(li);
   });
}


if (addSchoolResourceBtn && schoolResourceNameInput) {
   addSchoolResourceBtn.addEventListener('click', () => {
       if (!currentSchoolSubject) return;
       const name = schoolResourceNameInput.value.trim();
       let url = schoolResourceUrlInput ? schoolResourceUrlInput.value.trim() : "";
       if (url && !/^https?:\/\//i.test(url)) url = `https://${url}`;


       if (name !== "") {
           if (!schoolResources[currentSchoolSubject]) schoolResources[currentSchoolSubject] = [];
           schoolResources[currentSchoolSubject].push({ name: name, url: url || null });
           localStorage.setItem('mySchoolResources', JSON.stringify(schoolResources));
           schoolResourceNameInput.value = "";
           if (schoolResourceUrlInput) schoolResourceUrlInput.value = "";
           renderSchoolResourceList();
       }
   });
}


// ---- per-subject upcoming tests — these are stored right in
// trackedDates (tagged with schoolSubject + a unique id), so they
// automatically also show up in the homepage countdown grid and
// the settings date list without any extra wiring ----
function renderSchoolTestList() {
   if (!schoolTestList || !currentSchoolSubject) return;
   schoolTestList.innerHTML = "";


   const matching = trackedDates.filter(d => d.schoolSubject === currentSchoolSubject);


   if (matching.length === 0) {
       schoolTestList.innerHTML = `<li style="color:#aaa; text-align:center; display:block;">nothing yet</li>`;
       return;
   }


   matching.forEach(item => {
       const target = new Date(item.date).getTime();
       const now = new Date().getTime();
       const daysLeft = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
       const displayDays = daysLeft > 0 ? `${daysLeft} days` : (daysLeft === 0 ? "today!" : "passed");


       const li = document.createElement('li');


       const leftSide = document.createElement('div');
       leftSide.style.display = 'flex';
       leftSide.style.alignItems = 'center';
       leftSide.style.gap = '10px';


       const span = document.createElement('span');
       span.textContent = `${item.name}: ${item.date}`;
       leftSide.appendChild(span);


       const daysTag = document.createElement('span');
       daysTag.className = 'test-item-days';
       daysTag.textContent = displayDays;
       leftSide.appendChild(daysTag);


       li.appendChild(leftSide);


       const delBtn = document.createElement('button');
       delBtn.textContent = 'x';
       delBtn.className = 'delete-btn';
       delBtn.addEventListener('click', () => {
           trackedDates = trackedDates.filter(d => d.id !== item.id);
           localStorage.setItem('trackedDates', JSON.stringify(trackedDates));
           renderSchoolTestList();
           calculateCountdowns();
       });
       li.appendChild(delBtn);


       schoolTestList.appendChild(li);
   });
}


if (addSchoolTestBtn && schoolTestNameInput) {
   addSchoolTestBtn.addEventListener('click', () => {
       if (!currentSchoolSubject) return;
       const name = schoolTestNameInput.value.trim();
       const dateVal = schoolTestDateInput ? schoolTestDateInput.value : "";
       if (name !== "" && dateVal !== "") {
           trackedDates.push({
               name: `${currentSchoolSubject}: ${name}`,
               date: dateVal,
               schoolSubject: currentSchoolSubject,
               id: Date.now() + Math.random()
           });
           localStorage.setItem('trackedDates', JSON.stringify(trackedDates));
           schoolTestNameInput.value = "";
           if (schoolTestDateInput) schoolTestDateInput.value = "";
           renderSchoolTestList();
           calculateCountdowns();
       }
   });
}


renderSchoolNav();
renderSchoolSubjectManageList();
renderScheduleSubjectSelect();
renderScheduleList();


// ==========================================
// brain dump post system — compose a thought,
// post it, and it shows up as a timestamped
// card below, deletable via the x in the corner
// ==========================================
const brainDumpArea = document.getElementById('brainDumpArea');
const postDumpBtn = document.getElementById('postDumpBtn');
const dumpPostsList = document.getElementById('dumpPostsList');


let dumpPosts = JSON.parse(localStorage.getItem('myDumpPosts')) || [];


function formatDumpTimestamp(ts) {
   const d = new Date(ts);
   const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
   let hours = d.getHours();
   const minutes = d.getMinutes().toString().padStart(2, '0');
   const ampm = hours >= 12 ? 'PM' : 'AM';
   hours = hours % 12;
   if (hours === 0) hours = 12;
   return `${months[d.getMonth()]} ${d.getDate()}, ${hours}:${minutes} ${ampm}`;
}


function renderDumpPosts() {
   if (!dumpPostsList) return;
   dumpPostsList.innerHTML = "";


   if (dumpPosts.length === 0) {
       dumpPostsList.innerHTML = `<div style="color:#aaa; text-align:center; padding: 15px 0; font-size: 13px;">nothing posted yet</div>`;
       return;
   }


   dumpPosts.slice().reverse().forEach(post => {
       const actualIndex = dumpPosts.indexOf(post);


       const card = document.createElement('div');
       card.className = "dump-post-card";


       const delBtn = document.createElement('button');
       delBtn.textContent = 'x';
       delBtn.className = 'dump-post-delete';
       delBtn.addEventListener('click', () => {
           dumpPosts.splice(actualIndex, 1);
           localStorage.setItem('myDumpPosts', JSON.stringify(dumpPosts));
           renderDumpPosts();
       });
       card.appendChild(delBtn);


       const textDiv = document.createElement('div');
       textDiv.className = "dump-post-text";
       textDiv.textContent = post.text;
       card.appendChild(textDiv);


       const timeDiv = document.createElement('div');
       timeDiv.className = "dump-post-timestamp";
       timeDiv.textContent = formatDumpTimestamp(post.timestamp);
       card.appendChild(timeDiv);


       dumpPostsList.appendChild(card);
   });
}


if (postDumpBtn && brainDumpArea) {
   postDumpBtn.addEventListener('click', () => {
       const text = brainDumpArea.value.trim();
       if (text !== "") {
           dumpPosts.push({ text: text, timestamp: Date.now() });
           localStorage.setItem('myDumpPosts', JSON.stringify(dumpPosts));
           brainDumpArea.value = "";
           renderDumpPosts();
       }
   });
}


renderDumpPosts();


// ==========================================
// draggable / reorderable cards — used on the
// homepage, the school tab's homepage view, and
// each subject page. cards live inside ".card-row"
// wrappers; a row can hold one card (full width) or
// two (side by side). dropping near the left/right
// edge of a card places the dragged card beside it;
// dropping near the top/bottom edge puts it in its
// own new row above/below. layout is remembered
// per container in localStorage.
// ==========================================
function getDropZone(e, rect) {
   const xFrac = (e.clientX - rect.left) / rect.width;
   const yFrac = (e.clientY - rect.top) / rect.height;
   if (xFrac < 0.25) return 'left';
   if (xFrac > 0.75) return 'right';
   return yFrac < 0.5 ? 'top' : 'bottom';
}


// removes a card from whichever row it's currently in, and deletes
// that row if it's left empty — used before moving the card elsewhere
function detachCard(card) {
   const oldRow = card.parentElement;
   if (oldRow && oldRow.classList.contains('card-row')) {
       oldRow.removeChild(card);
       if (oldRow.children.length === 0) oldRow.remove();
   }
}


function saveSortableOrder(container, storageKey) {
   const rows = Array.from(container.querySelectorAll(':scope > .card-row')).map(row =>
       Array.from(row.querySelectorAll(':scope > .draggable-card')).map(c => c.getAttribute('data-drag-id'))
   );
   localStorage.setItem(storageKey, JSON.stringify(rows));
}


// rebuilds the row/card layout from a saved [[id], [id, id], ...]
// structure; any card not mentioned (e.g. newly added since the
// layout was saved) gets appended as its own row at the end.
// builds the whole replacement in memory first and only swaps it
// into the container once it's confirmed to work, so a bad or
// outdated saved value can never leave the page looking empty
function restoreSortableLayout(container, storageKey) {
   let savedRows;
   try {
       savedRows = JSON.parse(localStorage.getItem(storageKey) || 'null');
   } catch (e) {
       savedRows = null;
   }
   if (!savedRows || !Array.isArray(savedRows) || savedRows.length === 0) return;


   // migrate an older flat "[id, id, id]" layout (from before side-by-side
   // rows existed) into the current "[[id], [id, id], ...]" row format
   if (typeof savedRows[0] === 'string') {
       savedRows = savedRows.map(id => [id]);
   }


   const cardsById = {};
   container.querySelectorAll(':scope .draggable-card').forEach(card => {
       cardsById[card.getAttribute('data-drag-id')] = card;
   });


   try {
       const fragment = document.createDocumentFragment();
       const placed = new Set();


       savedRows.forEach(rowIds => {
           if (!Array.isArray(rowIds)) return;
           const validIds = rowIds.filter(id => cardsById[id] && !placed.has(id));
           if (validIds.length === 0) return;
           const row = document.createElement('div');
           row.className = 'card-row';
           validIds.forEach(id => {
               row.appendChild(cardsById[id]);
               placed.add(id);
           });
           fragment.appendChild(row);
       });


       Object.keys(cardsById).forEach(id => {
           if (!placed.has(id)) {
               const row = document.createElement('div');
               row.className = 'card-row';
               row.appendChild(cardsById[id]);
               fragment.appendChild(row);
           }
       });


       // only touch the live container once the replacement is fully built
       container.querySelectorAll(':scope > .card-row').forEach(row => row.remove());
       container.appendChild(fragment);
   } catch (e) {
       // something about the saved layout couldn't be applied — leave
       // the container's existing (default) card-row markup untouched
       // rather than risk wiping it out
   }
}


function clearDragOverClasses(container) {
   container.querySelectorAll(':scope .draggable-card').forEach(c => {
       c.classList.remove('drag-over-left', 'drag-over-right', 'drag-over-top', 'drag-over-bottom');
   });
}


function makeSortable(containerId, storageKey) {
   const container = document.getElementById(containerId);
   if (!container) return;


   restoreSortableLayout(container, storageKey);


   let draggedCard = null;


   container.querySelectorAll(':scope .draggable-card').forEach(card => {
       const header = card.querySelector('.draggable-card-header');
       if (!header) return;


       header.addEventListener('dragstart', (e) => {
           draggedCard = card;
           card.classList.add('dragging');
           e.dataTransfer.effectAllowed = 'move';
           e.dataTransfer.setData('text/plain', card.getAttribute('data-drag-id') || '');
       });


       header.addEventListener('dragend', () => {
           card.classList.remove('dragging');
           clearDragOverClasses(container);
           draggedCard = null;
           saveSortableOrder(container, storageKey);
       });


       card.addEventListener('dragover', (e) => {
           if (!draggedCard || draggedCard === card) return;
           e.preventDefault();


           const rect = card.getBoundingClientRect();
           const zone = getDropZone(e, rect);


           clearDragOverClasses(container);
           card.classList.add(`drag-over-${zone}`);


           const targetRow = card.parentElement;


           if (zone === 'left' || zone === 'right') {
               const otherCardsInRow = Array.from(targetRow.querySelectorAll(':scope > .draggable-card'))
                   .filter(c => c !== draggedCard && c !== card);
               if (otherCardsInRow.length > 0) {
                   // row is already full with a different card — fall back
                   // to placing the dragged card as its own row instead
                   detachCard(draggedCard);
                   const newRow = document.createElement('div');
                   newRow.className = 'card-row';
                   newRow.appendChild(draggedCard);
                   targetRow.parentNode.insertBefore(newRow, zone === 'left' ? targetRow : targetRow.nextSibling);
                   return;
               }
               detachCard(draggedCard);
               if (zone === 'left') {
                   targetRow.insertBefore(draggedCard, card);
               } else {
                   targetRow.insertBefore(draggedCard, card.nextSibling);
               }
           } else {
               detachCard(draggedCard);
               const newRow = document.createElement('div');
               newRow.className = 'card-row';
               newRow.appendChild(draggedCard);
               if (zone === 'top') {
                   targetRow.parentNode.insertBefore(newRow, targetRow);
               } else {
                   targetRow.parentNode.insertBefore(newRow, targetRow.nextSibling);
               }
           }
       });


       card.addEventListener('dragleave', () => {
           card.classList.remove('drag-over-left', 'drag-over-right', 'drag-over-top', 'drag-over-bottom');
       });


       card.addEventListener('drop', (e) => {
           e.preventDefault();
       });
   });
}


makeSortable('homeSortableContainer', 'myHomeCardOrder');
makeSortable('schoolHomeSortableContainer', 'mySchoolHomeCardOrder');
makeSortable('schoolSubjectSortableContainer', 'mySchoolSubjectCardOrder');
