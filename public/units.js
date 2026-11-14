const form = document.getElementById('unit-form');
const list = document.getElementById('unit-list');
const message = document.getElementById('message');

// Fetch all units from the server and draw them on the page
async function loadUnits() {
  const res = await fetch('/units');
  const units = await res.json();

  list.innerHTML = '';
  units.forEach(unit => {
  const li = document.createElement('li');

  const info = document.createElement('span');
  info.textContent = `${unit.code} - ${unit.name} (${unit.lecturer || 'no lecturer'}, sem ${unit.semester || '?'})`;

  const actions = document.createElement('div');
  actions.className = 'actions';

  const editBtn = document.createElement('button');
  editBtn.textContent = 'Edit';
  editBtn.className = 'edit';
  editBtn.onclick = () => editUnit(unit);

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Delete';
  deleteBtn.className = 'delete';
  deleteBtn.onclick = () => deleteUnit(unit.id);

  actions.append(editBtn, deleteBtn);
  li.append(info, actions);
  list.appendChild(li);
});
}

// Add a unit when the form is submitted
form.addEventListener('submit', async (e) => {
  e.preventDefault(); // stop the page from reloading

  const unit = {
    code: document.getElementById('code').value,
    name: document.getElementById('name').value,
    lecturer: document.getElementById('lecturer').value,
    semester: document.getElementById('semester').value
  };

  const res = await fetch('/units', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(unit)
  });

  if (!res.ok) {
    const data = await res.json();
    message.textContent = data.error;
    return;
  }

  message.textContent = '';
  form.reset();
  loadUnits();
});

// Edit a unit (uses simple pop-up boxes for now)
async function editUnit(unit) {
  const code = prompt('Unit code:', unit.code);
  if (code === null) return; // user pressed Cancel
  const name = prompt('Unit name:', unit.name);
  if (name === null) return;
  const lecturer = prompt('Lecturer:', unit.lecturer || '');
  if (lecturer === null) return;
  const semester = prompt('Semester:', unit.semester || '');
  if (semester === null) return;

  const res = await fetch(`/units/${unit.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, name, lecturer, semester })
  });

  if (!res.ok) {
    const data = await res.json();
    message.textContent = data.error;
    return;
  }
  message.textContent = '';
  loadUnits();
}

// Delete a unit
async function deleteUnit(id) {
  if (!confirm('Delete this unit?')) return;
  await fetch(`/units/${id}`, { method: 'DELETE' });
  loadUnits();
}

// Show the units as soon as the page opens
loadUnits();