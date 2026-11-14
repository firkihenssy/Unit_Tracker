const form = document.getElementById('assignmentForm');
const titleInput = document.getElementById('titleInput');
const dueDateInput = document.getElementById('dueDateInput');
const unitSelect = document.getElementById('unitSelect');
const errorMsg = document.getElementById('errorMsg');
const tbody = document.getElementById('assignmentsBody');
const unitMap = {};

async function request(url, method = 'GET', body) {
  errorMsg.textContent = '';
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  const data = await res.json();
  if (!res.ok) { errorMsg.textContent = data.error || 'Request failed'; return null; }
  return data;
}

async function loadUnits() {
  try {
    const res = await fetch('/units');
    if (!res.ok || !(res.headers.get('content-type') || '').includes('json')) return;
    (await res.json()).forEach(u => {
      const label = u.code ? `${u.code} - ${u.name}` : u.name;
      unitMap[u.id] = label;
      unitSelect.add(new Option(label, u.id));
    });
  } catch {}
}

async function loadAssignments() {
  const items = await request('/assignments');
  if (!items) return;
  tbody.innerHTML = '';
  items.forEach(item => {
    const tr = document.createElement('tr');
    if (item.done) tr.className = 'done';
    tr.innerHTML = `<td><input type="checkbox" ${item.done ? 'checked' : ''}></td>
      <td></td><td></td><td></td><td><button>Edit</button> <button>Delete</button></td>`;
    const cells = tr.querySelectorAll('td');
    cells[1].textContent = item.title;
    cells[2].textContent = item.due_date;
    cells[3].textContent = unitMap[item.unit_id] || (item.unit_id ? `Unit #${item.unit_id}` : '-');
    tr.querySelector('input').onchange = () => toggleDone(item.id);
    const [editBtn, delBtn] = tr.querySelectorAll('button');
    editBtn.onclick = () => editAssignment(item);
    delBtn.onclick = () => deleteAssignment(item.id);
    tbody.appendChild(tr);
  });
}

form.onsubmit = async (e) => {
  e.preventDefault();
  const unit_id = unitSelect.value ? Number(unitSelect.value) : null;
  if (await request('/assignments', 'POST', { title: titleInput.value, due_date: dueDateInput.value, unit_id })) {
    form.reset();
    loadAssignments();
  }
};

async function toggleDone(id) {
  if (await request(`/assignments/${id}/done`, 'PATCH')) loadAssignments();
}

async function editAssignment(item) {
  const title = prompt('New title:', item.title);
  if (title === null) return;
  const due_date = prompt('New due date (YYYY-MM-DD):', item.due_date);
  if (due_date === null) return;
  if (await request(`/assignments/${item.id}`, 'PUT', { title, due_date, unit_id: item.unit_id })) loadAssignments();
}

async function deleteAssignment(id) {
  if (await request(`/assignments/${id}`, 'DELETE')) loadAssignments();
}

loadUnits().then(loadAssignments);
