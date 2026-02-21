// Check authentication
if (!API.isAuthenticated()) {
  window.location.href = 'index.html';
}

let currentUser = null;
let allPatients = [];

async function initDoctor() {
  try {
    currentUser = await API.auth.getMe();

    // Verify doctor role
    if (currentUser.role !== 'doctor') {
      alert('Access denied. Doctor only.');
      API.clearAuth();
      window.location.href = 'index.html';
      return;
    }

    // Display doctor info using IDs that exist in doctor.html
    const doctorNameEl = document.getElementById('doctorName');
    const profileNameEl = document.getElementById('profileName');
    const profileSpecEl = document.getElementById('profileSpecialization');
    const profileContactEl = document.getElementById('profileContact');

    if (doctorNameEl) doctorNameEl.textContent = currentUser.name;
    if (profileNameEl) profileNameEl.textContent = currentUser.name;
    if (profileSpecEl) profileSpecEl.textContent = currentUser.specialization || 'General Medicine';
    if (profileContactEl) profileContactEl.textContent = `📞 ${currentUser.contact || 'N/A'} | ✉️ ${currentUser.email}`;

    // Load data
    await loadAppointments();
    await loadPatients();

  } catch (error) {
    console.error('Error initializing doctor dashboard:', error);
    alert('Failed to load dashboard. Please try again.');
  }
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
    const target = document.getElementById(`${targetSection}-section`);
    if (target) target.classList.add('active');
  });
});

// ==================== APPOINTMENTS ====================

async function loadAppointments() {
  try {
    const appointments = await API.appointments.getAll();

    const today = new Date().toDateString();
    const todayAppts = appointments.filter(a =>
      new Date(a.date).toDateString() === today
    );

    // Update stats (using correct IDs from doctor.html)
    const todayEl = document.getElementById('todayAppointments');
    const totalEl = document.getElementById('totalAppointments');
    if (todayEl) todayEl.textContent = todayAppts.length;
    if (totalEl) totalEl.textContent = appointments.length;

    // Render today's appointments table on dashboard
    renderTodayAppointments(todayAppts);

    // Render all appointments in appointments section
    renderAllAppointments(appointments);

  } catch (error) {
    console.error('Error loading appointments:', error);
  }
}

function renderTodayAppointments(appointments) {
  const tbody = document.getElementById('todayAppointmentsTable');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (appointments.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#666;">No appointments today</td></tr>';
    return;
  }

  appointments.forEach(a => {
    const patientName = a.patient?.name || a.patientName || 'Unknown';
    const patientAge = a.patient?.age || '-';
    const patientContact = a.patient?.contact || '-';
    tbody.innerHTML += `
      <tr>
        <td>${a.time}</td>
        <td>${patientName}</td>
        <td>${patientAge}</td>
        <td>${patientContact}</td>
        <td><span class="status-badge status-${a.status?.toLowerCase()}">${a.status}</span></td>
      </tr>`;
  });
}

function renderAllAppointments(appointments) {
  const tbody = document.getElementById('appointmentsTable');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (appointments.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No appointments found</td></tr>';
    return;
  }

  appointments.forEach((a, i) => {
    const patientName = a.patient?.name || a.patientName || 'Unknown';
    const patientId = a.patient?._id || '';
    tbody.innerHTML += `
      <tr>
        <td>${i + 1}</td>
        <td>${patientName}</td>
        <td>${new Date(a.date).toLocaleDateString()}</td>
        <td>${a.time}</td>
        <td><span class="status-badge status-${a.status?.toLowerCase()}">${a.status}</span></td>
        <td>
          <button class="btn btn-sm btn-primary" onclick="updateAppointmentStatus('${a._id}', 'Approved')" style="padding:4px 8px;margin:2px;">Approve</button>
          <button class="btn btn-sm btn-secondary" onclick="updateAppointmentStatus('${a._id}', 'Completed')" style="padding:4px 8px;margin:2px;">Complete</button>
        </td>
      </tr>`;
  });
}

async function updateAppointmentStatus(id, status) {
  try {
    await apiRequest(`/appointments/${id}`, { method: 'PUT', body: JSON.stringify({ status }) });
    await loadAppointments();
  } catch (error) {
    alert('Failed to update status: ' + error.message);
  }
}

// ==================== PATIENT RECORDS ====================

async function loadPatients() {
  try {
    const patients = await API.users.getAll('patient');
    allPatients = patients;

    // Update stat
    const totalPatientsEl = document.getElementById('totalPatients');
    if (totalPatientsEl) totalPatientsEl.textContent = patients.length;

    renderPatientsTable(patients);
  } catch (error) {
    console.error('Error loading patients:', error);
  }
}

function renderPatientsTable(patients) {
  const tbody = document.getElementById('patientsTable');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (patients.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#666;">No patients found</td></tr>';
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
        <td>
          <button class="btn btn-sm btn-primary" onclick="openPatientRecord('${p._id}')" style="padding:4px 12px;">View Records</button>
        </td>
      </tr>`;
  });
}

// ==================== PATIENT RECORD MODAL ====================

async function openPatientRecord(patientId) {
  const patient = allPatients.find(p => p._id === patientId);
  if (!patient) return;

  // Fill patient info in modal
  const nameEl = document.getElementById('recordPatientName');
  const ageEl = document.getElementById('recordPatientAge');
  const genderEl = document.getElementById('recordPatientGender');
  const contactEl = document.getElementById('recordPatientContact');
  const hiddenIdEl = document.getElementById('recordPatientId');

  if (nameEl) nameEl.textContent = patient.name;
  if (ageEl) ageEl.textContent = patient.age || 'N/A';
  if (genderEl) genderEl.textContent = patient.gender || 'N/A';
  if (contactEl) contactEl.textContent = patient.contact || 'N/A';
  if (hiddenIdEl) hiddenIdEl.value = patientId;

  // Load this patient's medical history
  try {
    const allRecords = await API.medicalRecords.getAll();
    const patientRecords = allRecords.filter(r =>
      (r.patient?._id || r.patient) === patientId
    );

    const historyList = document.getElementById('medicalHistoryList');
    if (historyList) {
      if (patientRecords.length === 0) {
        historyList.innerHTML = '<p style="color:#666;">No medical history found.</p>';
      } else {
        historyList.innerHTML = patientRecords.map(r => `
          <div style="background:#f8f9fa;border-radius:8px;padding:15px;margin-bottom:10px;border-left:4px solid #6c63ff;">
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
              <strong>Diagnosis: ${r.diagnosis}</strong>
              <span style="color:#888;">${new Date(r.visitDate || r.createdAt).toLocaleDateString()}</span>
            </div>
            <p style="margin:4px 0;"><strong>Prescription:</strong> ${r.prescription}</p>
            ${r.notes ? `<p style="margin:4px 0;color:#555;"><strong>Notes:</strong> ${r.notes}</p>` : ''}
          </div>`).join('');
      }
    }
  } catch (err) {
    console.error('Error loading medical history:', err);
  }

  // Show modal
  const modal = document.getElementById('patientRecordModal');
  if (modal) modal.style.display = 'flex';
}

function closePatientRecordModal() {
  const modal = document.getElementById('patientRecordModal');
  if (modal) modal.style.display = 'none';
}

async function saveMedicalRecord(e) {
  e.preventDefault();

  const patientId = document.getElementById('recordPatientId')?.value;
  const diagnosis = document.getElementById('recordDiagnosis')?.value;
  const prescription = document.getElementById('recordPrescription')?.value;
  const notes = document.getElementById('recordNotes')?.value;

  if (!patientId || !diagnosis || !prescription) {
    alert('Please fill in all required fields.');
    return;
  }

  try {
    await API.medicalRecords.create({ patient: patientId, diagnosis, prescription, notes });
    alert('Medical record saved successfully!');
    document.getElementById('medicalRecordForm')?.reset();
    await openPatientRecord(patientId); // Refresh the modal
  } catch (error) {
    alert('Failed to save record: ' + error.message);
  }
}

// Close modal on outside click
window.addEventListener('click', (e) => {
  if (e.target.id === 'patientRecordModal') closePatientRecordModal();
});

// ==================== INITIALIZATION ====================

initDoctor();
