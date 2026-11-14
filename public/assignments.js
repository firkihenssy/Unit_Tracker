const form = document.getElementById('assignmentForm');
const titleInput = document.getElementById('titleInput');
const dueDateInput = document.getElementById('dueDateInput');
const unitSelect = document.getElementById('unitSelect');
const submitBtn = document.getElementById('submitBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const errorMsg = document.getElementById('errorMsg');
const assignmentsBody = document.getElementById('assignmentsBody');

let editingId = null;

function showError(message) {
  errorMsg.textContent = message;
  errorMsg.style.display = 'block';
}

function clearError() {
  errorMsg.textContent = '';
  errorMsg.style.display = 'none';
}

async function loadUnits() {
  try {
    const res = await fetch('/units');
    const contentType = res.headers.get('content-type') || '';
    if (!res.ok || !contentType.includes('application/json')) return;

    const units = await res.json();
    unitSelect.innerHTML = '<option value="">No unit</option>';
    units.forEach((u) => {
      const opt = document.createElement('option');
      opt.value = u.id;
      opt.textContent = u.code ? `${u.code} — ${u.name}` : u.name;
      unitSelect.appendChild(opt);
    });
  } catch {
    // Units route is still a placeholder; keep "No unit" option
  }
}

async function loadAssignments() {
  const res = await fetch('/assignments');
  const items = await res.json();

  assignmentsBody.innerHTML = '';

  items.forEach((item) => {
    const tr = document.createElement('tr');
    if (item.done) tr.classList.add('done-row');

    const doneTd = document.createElement('td');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = Boolean(item.done);
    checkbox.addEventListener('change', () => toggleDone(item.id));
    doneTd.appendChild(checkbox);

    const titleTd = document.createElement('td');
    titleTd.className = 'title-cell';
    titleTd.textContent = item.title;

    const dateTd = document.createElement('td');
    dateTd.textContent = item.due_date;

    const unitTd = document.createElement('td');
    unitTd.textContent = item.unit_id ?? '-';

    const actionsTd = document.createElement('td');
    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'secondary';
    editBtn.textContent = 'Edit';
    editBtn.style.marginRight = '6px';
    editBtn.addEventListener('click', () => startEdit(item));

    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'danger';
    delBtn.textContent = 'Delete';
    delBtn.addEventListener('click', () => deleteAssignment(item.id));

    actionsTd.append(editBtn, delBtn);
    tr.append(doneTd, titleTd, dateTd, unitTd, actionsTd);
    assignmentsBody.appendChild(tr);
  });
}

function startEdit(item) {
  editingId = item.id;
  titleInput.value = item.title;
  dueDateInput.value = item.due_date;
  unitSelect.value = item.unit_id ?? '';
  submitBtn.textContent = 'Save Changes';
  cancelEditBtn.style.display = 'inline-block';
}

function resetForm() {
  editingId = null;
  form.reset();
  submitBtn.textContent = 'Add Assignment';
  cancelEditBtn.style.display = 'none';
}

cancelEditBtn.addEventListener('click', () => {
  clearError();
  resetForm();
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearError();

  const payload = {
    title: titleInput.value,
    due_date: dueDateInput.value,
    unit_id: unitSelect.value ? Number(unitSelect.value) : null
  };

  const url = editingId ? `/assignments/${editingId}` : '/assignments';
  const method = editingId ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok) {
    showError(data.error || 'Something went wrong');
    return;
  }

  resetForm();
  await loadAssignments();
});

async function toggleDone(id) {
  clearError();
  const res = await fetch(`/assignments/${id}/done`, { method: 'PATCH' });
  if (!res.ok) {
    showError('Could not update assignment status');
    return;
  }
  await loadAssignments();
}

async function deleteAssignment(id) {
  clearError();
  const res = await fetch(`/assignments/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    showError('Could not delete assignment');
    return;
  }
  await loadAssignments();
}

loadUnits();
loadAssignments();
