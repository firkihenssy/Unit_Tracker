// The exact JSON contract your team agreed on
const fakeData = {
  "upcoming": [ 
      { "id": 1, "title": "Read Express docs", "due_date": "2026-11-20", "unit_id": 2 },
      { "id": 2, "title": "Build API route", "due_date": "2026-11-22", "unit_id": 1 }
  ],
  "overdue":  [
      { "id": 3, "title": "Setup Git branch", "due_date": "2026-11-13", "unit_id": 1 }
  ],
  "progress": { "done": 5, "total": 12 }
};

// Fake lookup table to map unit_ids to actual unit codes (Stretch Goal)
const unitLookup = {
    1: "COMP 212",
    2: "SOEN 102"
};

// 1. Render Progress
const progressText = document.getElementById('progress-text');
progressText.textContent = `${fakeData.progress.done} / ${fakeData.progress.total} assignments done`;

// 2. Render Upcoming
const upcomingList = document.getElementById('upcoming-list');
fakeData.upcoming.forEach(assignment => {
    const li = document.createElement('li');
    const unitCode = unitLookup[assignment.unit_id] || `Unit ${assignment.unit_id}`;
    
    // Inserts the unit code and title into the list item
    li.innerHTML = `<span class="unit-code">[${unitCode}]</span> ${assignment.title} (Due: ${assignment.due_date})`;
    upcomingList.appendChild(li);
});

// 3. Render Overdue
const overdueList = document.getElementById('overdue-list');
fakeData.overdue.forEach(assignment => {
    const li = document.createElement('li');
    const unitCode = unitLookup[assignment.unit_id] || `Unit ${assignment.unit_id}`;
    
    // Stretch goal: colors overdue items red
    li.style.color = "red";
    li.innerHTML = `<span class="unit-code">[${unitCode}]</span> ${assignment.title} (Due: ${assignment.due_date})`;
    overdueList.appendChild(li);
});