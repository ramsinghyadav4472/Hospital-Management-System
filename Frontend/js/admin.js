// Check authentication
if (!API.isAuthenticated()) {
  window.location.href = 'index.html';
}

// Verify admin role from stored user
const currentUser = API.getCurrentUser();
if (!currentUser || currentUser.role !== 'admin') {
  alert('Access denied. Admin only.');
  API.clearAuth();
  window.location.href = 'index.html';
}

// ==================== NAVIGATION ====================

const navLinks = document.querySelectorAll('.nav-link');

navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const targetSection = link.getAttribute('data-section');

    navLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');

    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    // Sections have '-section' suffix in admin.html
    const target = document.getElementById(`${targetSection}-section`);
    if (target) target.classList.add('active');

    // Load data when switching sections
    if (targetSection === 'patients') loadPatients();
    if (targetSection === 'doctors') loadDoctors();
    if (targetSection === 'appointments') loadAppointments();
  });
});

// ==================== PATIENTS ====================

let allPatientsData = [];

async function loadPatients() {
  try {
    const patients = await API.users.getAll('patient');
    allPatientsData = patients;
    renderPatients(patients);
  } catch (error) {
    console.error('Error loading patients:', error);
  }
}

function renderPatients(patients) {
  // Correct table ID is 'patientTable' (no 's') per admin.html
  const tbody = document.getElementById('patientTable');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (patients.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No patients found</td></tr>';
    return;
  }

  patients.forEach((p, i) => {
    tbody.innerHTML += `
      <tr>
        <td>${i + 1}</td>
        <td>${p.name}</td>
        <td>${p.age || 'N/A'}</td>
        <td>${p.gender || 'N/A'}</td>
        <td>${p.contact || 'N/A'}</td>
        <td>${p.email}</td>
        <td>
          <button class="btn btn-sm btn-danger" onclick="deletePatient('${p._id}')" style="padding:4px 10px;">Delete</button>
        </td>
      </tr>`;
  });
}

function searchPatients() {
  const term = document.getElementById('patientSearch')?.value.toLowerCase() || '';
  const filtered = allPatientsData.filter(p =>
    p.name.toLowerCase().includes(term) || p.email.toLowerCase().includes(term)
  );
  renderPatients(filtered);
}

async function deletePatient(id) {
  if (!confirm('Delete this patient?')) return;
  try {
    await API.users.delete(id);
    alert('Patient deleted!');
    loadPatients();
    updateStats();
  } catch (error) {
    alert('Failed to delete: ' + error.message);
  }
}

// ==================== DOCTORS ====================

let allDoctorsData = [];

async function loadDoctors() {
  try {
    const doctors = await API.users.getAll('doctor');
    allDoctorsData = doctors;
    renderDoctors(doctors);
  } catch (error) {
    console.error('Error loading doctors:', error);
  }
}

function renderDoctors(doctors) {
  // Correct table ID is 'doctorTable' (no 's') per admin.html
  const tbody = document.getElementById('doctorTable');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (doctors.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No doctors found</td></tr>';
    return;
  }

  doctors.forEach((d, i) => {
    tbody.innerHTML += `
      <tr>
        <td>${i + 1}</td>
        <td>${d.name}</td>
        <td>${d.specialization || 'N/A'}</td>
        <td>${d.contact || 'N/A'}</td>
        <td>${d.email}</td>
        <td>
          <button class="btn btn-sm btn-danger" onclick="deleteDoctor('${d._id}')" style="padding:4px 10px;">Delete</button>
        </td>
      </tr>`;
  });
}

async function deleteDoctor(id) {
  if (!confirm('Delete this doctor?')) return;
  try {
    await API.users.delete(id);
    alert('Doctor deleted!');
    loadDoctors();
    updateStats();
  } catch (error) {
    alert('Failed to delete: ' + error.message);
  }
}

// ==================== APPOINTMENTS ====================

async function loadAppointments() {
  try {
    const appointments = await API.appointments.getAll();
    renderAppointments(appointments);
  } catch (error) {
    console.error('Error loading appointments:', error);
  }
}

function renderAppointments(appointments) {
  // Correct table ID is 'appointmentTable' (no 's') per admin.html
  const tbody = document.getElementById('appointmentTable');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (appointments.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No appointments found</td></tr>';
    return;
  }

  appointments.forEach((a, i) => {
    const patientName = a.patient?.name || a.patientName || 'N/A';
    const doctorName = a.doctor?.name || a.doctorName || 'Unassigned';
    tbody.innerHTML += `
      <tr>
        <td>${i + 1}</td>
        <td>${patientName}</td>
        <td>${new Date(a.date).toLocaleDateString()}</td>
        <td>${a.time}</td>
        <td>${doctorName}</td>
        <td><span class="status-badge status-${a.status?.toLowerCase()}">${a.status}</span></td>
        <td>
          <button class="btn btn-sm btn-danger" onclick="deleteAppointment('${a._id}')" style="padding:4px 10px;">Delete</button>
        </td>
      </tr>`;
  });
}

async function deleteAppointment(id) {
  if (!confirm('Delete this appointment?')) return;
  try {
    await API.appointments.delete(id);
    alert('Appointment deleted!');
    loadAppointments();
    updateStats();
  } catch (error) {
    alert('Failed to delete: ' + error.message);
  }
}

// ==================== STATS ====================

async function updateStats() {
  try {
    const [patients, doctors, appointments] = await Promise.all([
      API.users.getAll('patient'),
      API.users.getAll('doctor'),
      API.appointments.getAll()
    ]);

    const totalPatientsEl = document.getElementById('totalPatients');
    const totalDoctorsEl = document.getElementById('totalDoctors');
    const totalAppointmentsEl = document.getElementById('totalAppointments');

    if (totalPatientsEl) totalPatientsEl.textContent = patients.length;
    if (totalDoctorsEl) totalDoctorsEl.textContent = doctors.length;
    if (totalAppointmentsEl) totalAppointmentsEl.textContent = appointments.length;
  } catch (error) {
    console.error('Error updating stats:', error);
  }
}

// ==================== PATIENT MODAL ====================
// admin.html uses onclick="openPatientModal()" / onsubmit="savePatient(event)"
// Modal ID is 'patientModal' (not 'addPatientModal')

function openPatientModal() {
  document.getElementById('patientId').value = '';
  document.getElementById('patientForm')?.reset();
  document.getElementById('patientModalTitle').textContent = 'Add Patient';
  document.getElementById('patientModal').style.display = 'flex';
}

function closePatientModal() {
  document.getElementById('patientModal').style.display = 'none';
}

async function savePatient(e) {
  e.preventDefault();

  const id = document.getElementById('patientId')?.value;
  const patientData = {
    name: document.getElementById('patientName')?.value,
    email: document.getElementById('patientEmail')?.value,
    age: parseInt(document.getElementById('patientAge')?.value),
    gender: document.getElementById('patientGender')?.value,
    contact: document.getElementById('patientContact')?.value,
    role: 'patient',
    password: 'Patient@123', // default password for admin-created patients
  };

  try {
    if (id) {
      await API.users.update(id, patientData);
      alert('Patient updated successfully!');
    } else {
      await API.auth.register(patientData);
      alert('Patient added successfully!');
    }
    closePatientModal();
    loadPatients();
    updateStats();
  } catch (error) {
    alert('Failed to save patient: ' + error.message);
  }
}

// ==================== DOCTOR MODAL ====================
// Modal ID is 'doctorModal', form onsubmit="saveDoctor(event)"

function openDoctorModal() {
  document.getElementById('doctorId').value = '';
  document.getElementById('doctorForm')?.reset();
  document.getElementById('doctorModalTitle').textContent = 'Add Doctor';

  // Load doctor's dropdown in appointment modal too
  const select = document.getElementById('appointmentDoctor');
  if (select && allDoctorsData.length > 0) {
    select.innerHTML = '<option value="">Not Assigned</option>';
    allDoctorsData.forEach(d => {
      select.innerHTML += `<option value="${d._id}">${d.name} - ${d.specialization || 'General'}</option>`;
    });
  }

  document.getElementById('doctorModal').style.display = 'flex';
}

function closeDoctorModal() {
  document.getElementById('doctorModal').style.display = 'none';
}

async function saveDoctor(e) {
  e.preventDefault();

  const id = document.getElementById('doctorId')?.value;
  const doctorData = {
    name: document.getElementById('doctorName')?.value,
    email: document.getElementById('doctorEmail')?.value,
    specialization: document.getElementById('doctorSpecialization')?.value,
    contact: document.getElementById('doctorContact')?.value,
    role: 'doctor',
    password: 'Doctor@123', // default password for admin-created doctors
  };

  try {
    if (id) {
      await API.users.update(id, doctorData);
      alert('Doctor updated successfully!');
    } else {
      await API.auth.register(doctorData);
      alert('Doctor added successfully!');
    }
    closeDoctorModal();
    loadDoctors();
    updateStats();
  } catch (error) {
    alert('Failed to save doctor: ' + error.message);
  }
}

// ==================== APPOINTMENT MODAL ====================
// Modal ID is 'appointmentModal', form onsubmit="saveAppointment(event)"

async function openAppointmentModal() {
  document.getElementById('appointmentId').value = '';
  document.getElementById('appointmentForm')?.reset();
  document.getElementById('appointmentModalTitle').textContent = 'Add Appointment';

  // Populate doctor dropdown
  const select = document.getElementById('appointmentDoctor');
  if (select) {
    select.innerHTML = '<option value="">Not Assigned</option>';
    const doctors = await API.users.getAll('doctor');
    doctors.forEach(d => {
      select.innerHTML += `<option value="${d._id}">${d.name} - ${d.specialization || 'General'}</option>`;
    });
  }

  document.getElementById('appointmentModal').style.display = 'flex';
}

function closeAppointmentModal() {
  document.getElementById('appointmentModal').style.display = 'none';
}

async function saveAppointment(e) {
  e.preventDefault();

  const patientName = document.getElementById('appointmentPatient')?.value;
  const date = document.getElementById('appointmentDate')?.value;
  const time = document.getElementById('appointmentTime')?.value;
  const doctorId = document.getElementById('appointmentDoctor')?.value;
  const status = document.getElementById('appointmentStatus')?.value || 'Pending';

  // Get doctor name from dropdown
  const doctorSelect = document.getElementById('appointmentDoctor');
  const doctorName = doctorId ? doctorSelect.options[doctorSelect.selectedIndex]?.text.split(' - ')[0] : '';

  try {
    await API.appointments.create({ patientName, date, time, doctor: doctorId, doctorName, status });
    alert('Appointment created!');
    closeAppointmentModal();
    loadAppointments();
    updateStats();
  } catch (error) {
    alert('Failed to create appointment: ' + error.message);
  }
}

// Close modals on outside click
window.addEventListener('click', (e) => {
  ['patientModal', 'doctorModal', 'appointmentModal'].forEach(id => {
    if (e.target.id === id) document.getElementById(id).style.display = 'none';
  });
});

// ==================== INITIALIZATION ====================

updateStats();
loadPatients();
