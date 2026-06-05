 // ── STATE ──
  let allEmployees = [];
  let allDepartments = [];

  // ── API ──
  // function getBase() {
  //   return document.getElementById('api-base-url').value.trim().replace(/\/$/, '');
  // }

  async function apiFetch(path, options = {}) {
    const url = "https://employeeproject-ojur.onrender.com" + path;
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    return text ? JSON.parse(text) : {};
  }

  // ── NAVIGATION ──
  const pageTitles = {
    dashboard: 'Dashboard', employees: 'Employees', departments: 'Departments',
    'add-employee': 'Add Employee', 'add-department': 'Add Department'
  };

  function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById('page-' + id).classList.add('active');
    document.getElementById('page-title').textContent = pageTitles[id] || id;
    document.querySelectorAll('.nav-item').forEach(n => {
      if (n.getAttribute('onclick')?.includes(`'${id}'`)) n.classList.add('active');
    });
    closeSidebar();
    if (id === 'employees') loadEmployees();
    if (id === 'departments') loadDepartments();
    if (id === 'dashboard') loadDashboard();
  }

  // ── SIDEBAR ──
  function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('overlay').classList.toggle('open');
  }
  function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('overlay').classList.remove('open');
  }

  // ── MODALS ──
  function openModal(id) { document.getElementById(id).classList.add('open'); }
  function closeModal(id) { document.getElementById(id).classList.remove('open'); }

  // ── TOAST ──
  function toast(msg, type = 'success') {
    const icons = { success: 'fa-circle-check', error: 'fa-circle-xmark', info: 'fa-circle-info' };
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `<i class="fa-solid ${icons[type]}"></i> ${msg}`;
    document.getElementById('toast-container').appendChild(t);
    setTimeout(() => t.remove(), 3500);
  }

  // ── STATUS ──
  function setStatus(connected) {
    const dot = document.getElementById('status-dot');
    const txt = document.getElementById('status-text');
    dot.className = 'status-dot ' + (connected ? 'connected' : 'error');
    txt.textContent = connected ? 'API connected' : 'Not connected';
  }

  // ── FORMAT ──
  const fmt = n => n != null ? `₦${Number(n).toLocaleString()}` : '—';
  const pct = n => n != null ? `${(n * 100).toFixed(0)}%` : '—';

  // ── LOAD EMPLOYEES ──
  async function loadEmployees() {
    const tbody = document.getElementById('emp-table-body');
    tbody.innerHTML = `<tr><td colspan="9"><div class="empty-state"><div class="loader"></div></div></td></tr>`;
    try {
      const data = await apiFetch('/api/allemployees');
      allEmployees = Array.isArray(data) ? data : [];
      document.getElementById('emp-count').textContent = allEmployees.length;
      renderEmployees(allEmployees);
      setStatus(true);
    } catch (e) {
      setStatus(false);
      tbody.innerHTML = `<tr><td colspan="9"><div class="empty-state"><i class="fa-solid fa-triangle-exclamation"></i><p>Could not load employees. Check your API URL.</p></div></td></tr>`;
    }
  }

  function renderEmployees(list) {
    const tbody = document.getElementById('emp-table-body');
    if (!list.length) {
      tbody.innerHTML = `<tr><td colspan="9"><div class="empty-state"><i class="fa-solid fa-users"></i><p>No employees found</p></div></td></tr>`;
      return;
    }
    tbody.innerHTML = list.map(e => `
      <tr>
        <td class="td-mono">#${e.id}</td>
        <td><strong>${e.firstName} ${e.lastName}</strong></td>
        <td class="td-mono">${e.email}</td>
        <td><span class="td-badge blue">Dept ${e.departId}</span></td>
        <td class="td-mono">${e.yoe}yr</td>
        <td>${fmt(e.salary)}</td>
        <td><span class="td-badge green">${pct(e.tax)}</span></td>
        <td>${fmt(e.balance)}</td>
        <td>
          <div class="table-actions">
            <button class="btn btn-ghost btn-sm" onclick="viewEmployee(${e.id})" title="View"><i class="fa-solid fa-eye"></i></button>
            <button class="btn btn-ghost btn-sm" onclick="openEditModal(${e.id})" title="Edit"><i class="fa-solid fa-pen"></i></button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  function filterEmployees(q) {
    const filtered = allEmployees.filter(e =>
      `${e.firstName} ${e.lastName} ${e.email}`.toLowerCase().includes(q.toLowerCase())
    );
    renderEmployees(filtered);
  }

  // ── LOAD DEPARTMENTS ──
  async function loadDepartments() {
    const tbody = document.getElementById('dept-table-body');
    tbody.innerHTML = `<tr><td colspan="4"><div class="empty-state"><div class="loader"></div></div></td></tr>`;
    try {
      const data = await apiFetch('/api/getDepartments');
      allDepartments = Array.isArray(data) ? data : [];
      if (!allDepartments.length) {
        tbody.innerHTML = `<tr><td colspan="4"><div class="empty-state"><i class="fa-solid fa-building"></i><p>No departments yet. Create one first!</p></div></td></tr>`;
        return;
      }
      tbody.innerHTML = allDepartments.map(d => `
        <tr>
          <td class="td-mono">#${d.id}</td>
          <td><strong>${d.name}</strong></td>
          <td>${d.headOfDepartment || '—'}</td>
          <td><span class="td-badge green">${d.numberOfStaff} staff</span></td>
        </tr>
      `).join('');
      document.getElementById('stat-departments').textContent = allDepartments.length;
    } catch (e) {
      tbody.innerHTML = `<tr><td colspan="4"><div class="empty-state"><i class="fa-solid fa-triangle-exclamation"></i><p>Could not load departments.</p></div></td></tr>`;
    }
  }

  // ── DASHBOARD ──
  async function loadDashboard() {
    try {
      const data = await apiFetch('/api/allemployees');
      allEmployees = Array.isArray(data) ? data : [];
      document.getElementById('stat-employees').textContent = allEmployees.length;
      document.getElementById('emp-count').textContent = allEmployees.length;

      if (allEmployees.length) {
        const avgSal = allEmployees.reduce((s, e) => s + (e.salary || 0), 0) / allEmployees.length;
        const avgTax = allEmployees.reduce((s, e) => s + (e.tax || 0), 0) / allEmployees.length;
        document.getElementById('stat-avg-salary').textContent = fmt(avgSal);
        document.getElementById('stat-avg-tax').textContent = pct(avgTax);
      }

      // Recent 5
      const recent = allEmployees.slice(-5).reverse();
      document.getElementById('recent-emp-body').innerHTML = recent.length ? recent.map(e => `
        <tr>
          <td><strong>${e.firstName} ${e.lastName}</strong></td>
          <td class="td-mono">${e.email}</td>
          <td><span class="td-badge blue">Dept ${e.departId}</span></td>
          <td>${fmt(e.salary)}</td>
          <td>${fmt(e.balance)}</td>
        </tr>
      `).join('') : `<tr><td colspan="5"><div class="empty-state"><i class="fa-solid fa-users"></i><p>No employees yet</p></div></td></tr>`;

      setStatus(true);
    } catch (e) {
      setStatus(false);
      document.getElementById('recent-emp-body').innerHTML = `<tr><td colspan="5"><div class="empty-state"><i class="fa-solid fa-plug-circle-xmark"></i><p>Can't reach API. Check the URL above.</p></div></td></tr>`;
    }

    try {
      const depts = await apiFetch('/api/getDepartments');
      document.getElementById('stat-departments').textContent = Array.isArray(depts) ? depts.length : '—';
    } catch (_) {}
  }

  // ── VIEW EMPLOYEE ──
  async function viewEmployee(id) {
    document.getElementById('modal-content').innerHTML = `<div style="text-align:center;padding:2rem;"><div class="loader"></div></div>`;
    openModal('emp-modal');
    try {
      const data = await apiFetch(`/api/employee/${id}`);
      const emp = data.employee || data;
      const dept = data.department;
      document.getElementById('modal-content').innerHTML = `
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:1.5rem;">
          <div style="width:48px;height:48px;background:var(--accent-dim);border:1px solid var(--accent-border);border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:var(--font-head);font-weight:800;color:var(--accent);">
            ${(emp.firstName||'?')[0]}${(emp.lastName||'')[0]}
          </div>
          <div>
            <div style="font-family:var(--font-head);font-weight:700;font-size:1.1rem;">${emp.firstName} ${emp.lastName}</div>
            <div style="font-size:0.82rem;color:var(--text-muted);">${emp.email}</div>
          </div>
        </div>
        <div class="detail-grid">
          <div class="detail-item"><div class="detail-item-label">Staff ID</div><div class="detail-item-value accent">soft2026${emp.id}</div></div>
          <div class="detail-item"><div class="detail-item-label">Age</div><div class="detail-item-value">${emp.age}</div></div>
          <div class="detail-item"><div class="detail-item-label">Experience</div><div class="detail-item-value">${emp.yoe} years</div></div>
          <div class="detail-item"><div class="detail-item-label">Department</div><div class="detail-item-value">${dept ? dept.name : 'Dept #' + emp.departId}</div></div>
          <div class="detail-item"><div class="detail-item-label">Salary</div><div class="detail-item-value accent">${fmt(emp.salary)}</div></div>
          <div class="detail-item"><div class="detail-item-label">Tax Rate</div><div class="detail-item-value">${pct(emp.tax)}</div></div>
          <div class="detail-item"><div class="detail-item-label">Balance</div><div class="detail-item-value accent">${fmt(emp.balance)}</div></div>
          ${dept ? `<div class="detail-item"><div class="detail-item-label">Dept Head</div><div class="detail-item-value">${dept.headOfDepartment || '—'}</div></div>` : ''}
        </div>
      `;
    } catch (e) {
      document.getElementById('modal-content').innerHTML = `<div class="empty-state"><i class="fa-solid fa-triangle-exclamation"></i><p>Could not load employee details.</p></div>`;
    }
  }

  // ── EDIT EMPLOYEE ──
  function openEditModal(id) {
    const emp = allEmployees.find(e => e.id === id);
    if (!emp) return;
    document.getElementById('edit-emp-id').value = emp.id;
    document.getElementById('edit-fname').value = emp.firstName;
    document.getElementById('edit-lname').value = emp.lastName;
    document.getElementById('edit-email').value = emp.email;
    document.getElementById('edit-age').value = emp.age;
    document.getElementById('edit-yoe').value = emp.yoe;
    document.getElementById('edit-dept-id').value = emp.departId;
    openModal('edit-modal');
  }

  async function updateEmployee() {
    const btn = document.getElementById('update-btn');
    const id = document.getElementById('edit-emp-id').value;
    btn.innerHTML = '<div class="loader"></div> Saving...';
    btn.disabled = true;
    try {
      await apiFetch(`/api/updateEmployee/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          firstName: document.getElementById('edit-fname').value,
          lastName: document.getElementById('edit-lname').value,
          email: document.getElementById('edit-email').value,
          age: +document.getElementById('edit-age').value,
          yoe: +document.getElementById('edit-yoe').value,
          departId: +document.getElementById('edit-dept-id').value
        })
      });
      closeModal('edit-modal');
      toast('Employee updated successfully!');
      loadEmployees();
    } catch (e) {
      toast('Failed to update employee', 'error');
    } finally {
      btn.innerHTML = '<i class="fa-solid fa-save"></i> Save Changes';
      btn.disabled = false;
    }
  }

  // ── CREATE EMPLOYEE ──
  async function createEmployee() {
    const btn = document.getElementById('create-emp-btn');
    const firstName = document.getElementById('new-fname').value.trim();
    const lastName = document.getElementById('new-lname').value.trim();
    const email = document.getElementById('new-email').value.trim();
    const age = +document.getElementById('new-age').value;
    const yoe = +document.getElementById('new-yoe').value;
    const departId = +document.getElementById('new-dept').value;

    if (!firstName || !lastName || !email || !age || !departId) {
      toast('Please fill all fields', 'error'); return;
    }

    btn.innerHTML = '<div class="loader"></div> Creating...';
    btn.disabled = true;
    try {
      await apiFetch('/api/newEmployee', {
        method: 'POST',
        body: JSON.stringify({ firstName, lastName, email, age, yoe, departId })
      });
      toast('Employee created successfully! 🎉');
      ['new-fname','new-lname','new-email','new-age','new-yoe','new-dept'].forEach(id => document.getElementById(id).value = '');
      showPage('employees');
    } catch (e) {
      toast('Failed to create employee. Check department ID exists.', 'error');
    } finally {
      btn.innerHTML = '<i class="fa-solid fa-user-plus"></i> Create Employee';
      btn.disabled = false;
    }
  }

  // ── CREATE DEPARTMENT ──
  async function createDepartment() {
    const btn = document.getElementById('create-dept-btn');
    const name = document.getElementById('new-dept-name').value.trim();
    const headOfDepartment = document.getElementById('new-dept-head').value.trim();
    const numberOfStaff = +document.getElementById('new-dept-staff').value || 0;

    if (!name) { toast('Department name is required', 'error'); return; }

    btn.innerHTML = '<div class="loader"></div> Creating...';
    btn.disabled = true;
    try {
      await apiFetch('/api/newDepartment', {
        method: 'POST',
        body: JSON.stringify({ name, headOfDepartment, numberOfStaff })
      });
      toast('Department created successfully! 🎉');
      document.getElementById('new-dept-name').value = '';
      document.getElementById('new-dept-head').value = '';
      document.getElementById('new-dept-staff').value = '0';
      showPage('departments');
    } catch (e) {
      toast('Failed to create department', 'error');
    } finally {
      btn.innerHTML = '<i class="fa-solid fa-plus"></i> Create Department';
      btn.disabled = false;
    }
  }

  // ── REFRESH ALL ──
  function refreshAll() {
    loadDashboard();
    loadEmployees();
    loadDepartments();
    toast('Refreshed!', 'info');
  }

  // ── INIT ──
  loadDashboard();
