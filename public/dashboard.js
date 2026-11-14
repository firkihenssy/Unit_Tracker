<<<<<<< HEAD
// A lookup table so we can show the actual unit code instead of just "1" or "2"
const unitLookup = {
    1: "COMP 212",
    2: "SOEN 102"
};

// 1. Ask the backend for the data
fetch('/dashboard')
    .then(response => {
        if (!response.ok) {
            throw new Error("Waiting for team to create the JSON file");
        }
        return response.json();
    })
    .then(realData => {
        // 2. Render Progress
        const progressText = document.getElementById('progress-text');
        progressText.textContent = `${realData.progress.done} / ${realData.progress.total} assignments done`;

        // 3. Render Upcoming
        const upcomingList = document.getElementById('upcoming-list');
        upcomingList.innerHTML = ""; // Clear out any old HTML
        realData.upcoming.forEach(assignment => {
            const li = document.createElement('li');
            const unitCode = unitLookup[assignment.unit_id] || `Unit ${assignment.unit_id}`;
            
            li.innerHTML = `<span class="unit-code">[${unitCode}]</span> ${assignment.title} (Due: ${assignment.due_date})`;
            upcomingList.appendChild(li);
        });

        // 4. Render Overdue
        const overdueList = document.getElementById('overdue-list');
        overdueList.innerHTML = ""; // Clear out any old HTML
        realData.overdue.forEach(assignment => {
            const li = document.createElement('li');
            const unitCode = unitLookup[assignment.unit_id] || `Unit ${assignment.unit_id}`;
            
            li.style.color = "red";
            li.innerHTML = `<span class="unit-code">[${unitCode}]</span> ${assignment.title} (Due: ${assignment.due_date})`;
            overdueList.appendChild(li);
        });

    })
    .catch(error => {
        // If the backend fails (e.g. JSON file doesn't exist yet), show this message on the screen
        console.error("Dashboard error:", error);
        document.getElementById('progress-text').textContent = "Waiting for teammates to merge data.json...";
    });
=======
function renderList(listEl, items, unitLookup, emptyText, isOverdue) {
  listEl.innerHTML = '';
  if (items.length === 0) {
    const li = document.createElement('li');
    li.textContent = emptyText;
    li.style.color = '#868e96';
    listEl.appendChild(li);
    return;
  }

  items.forEach((assignment) => {
    const li = document.createElement('li');
    if (isOverdue) li.style.color = '#e03131';

    if (assignment.unit_id != null) {
      const span = document.createElement('span');
      span.className = 'unit-code';
      span.textContent = `[${unitLookup[assignment.unit_id] || `Unit ${assignment.unit_id}`}]`;
      li.appendChild(span);
    }

    li.appendChild(document.createTextNode(`${assignment.title} (Due: ${assignment.due_date})`));
    listEl.appendChild(li);
  });
}

async function loadDashboard() {
  const progressText = document.getElementById('progress-text');
  const upcomingList = document.getElementById('upcoming-list');
  const overdueList = document.getElementById('overdue-list');

  try {
    const [dashRes, unitsRes] = await Promise.all([fetch('/dashboard'), fetch('/units')]);
    const dashData = await dashRes.json();
    if (!dashRes.ok) {
      progressText.textContent = dashData.error || 'Failed to load dashboard';
      return;
    }

    const units = unitsRes.ok ? await unitsRes.json() : [];
    const unitLookup = {};
    units.forEach((u) => {
      unitLookup[u.id] = u.code || u.name;
    });

    progressText.textContent = `${dashData.progress.done} / ${dashData.progress.total} assignments done`;
    renderList(upcomingList, dashData.upcoming, unitLookup, 'No upcoming assignments', false);
    renderList(overdueList, dashData.overdue, unitLookup, 'No overdue assignments', true);
  } catch (err) {
    progressText.textContent = 'Could not connect to server';
  }
}

loadDashboard();
>>>>>>> 40c77bfe8104a732e647deb735b3d563f251dd91
