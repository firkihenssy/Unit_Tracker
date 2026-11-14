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
