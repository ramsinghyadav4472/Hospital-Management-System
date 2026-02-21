// Check authentication
if (!API.isAuthenticated()) {
  window.location.href = 'index.html';
}

// Get current user
let currentUser = null;

async function initPatient() {
  try {
    currentUser = await API.auth.getMe();

    // Verify patient role
    if (currentUser.role !== 'patient') {
      alert('Access denied. Patient only.');
      API.clearAuth();
      window.location.href = 'index.html';
      return;
    }

    // Display patient info (using IDs that exist in patient.html)
    const patientNameEl = document.getElementById('patientName');
    const profileNameEl = document.getElementById('profileName');
    const profileDetailsEl = document.getElementById('profileDetails');
    const profileContactEl = document.getElementById('profileContact');

    if (patientNameEl) patientNameEl.textContent = currentUser.name;
    if (profileNameEl) profileNameEl.textContent = currentUser.name;
    if (profileDetailsEl) profileDetailsEl.textContent = `Age: ${currentUser.age || 'N/A'} | Gender: ${currentUser.gender || 'N/A'}`;
    if (profileContactEl) profileContactEl.textContent = `📞 ${currentUser.contact || 'N/A'} | ✉️ ${currentUser.email}`;

    // Load data
    await loadDoctors();
    await loadAppointments();
    await loadMedicalRecords();

  } catch (error) {
    console.error('Error initializing patient dashboard:', error);
    alert('Failed to load dashboard: ' + (error.message || 'Please try again.'));
  }
}

// ==================== NAVIGATION ====================

const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.section');

navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const targetSection = link.getAttribute('data-section');

    navLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');

    sections.forEach(s => s.classList.remove('active'));
    const target = document.getElementById(`${targetSection}-section`);
    if (target) target.classList.add('active');
  });
});

// ==================== BOOK APPOINTMENT ====================

async function loadDoctors() {
  try {
    const doctors = await API.users.getAll('doctor');
    const select = document.getElementById('bookDoctor');
    if (!select) return;

    select.innerHTML = '<option value="">Choose a doctor...</option>';
    doctors.forEach(doctor => {
      select.innerHTML += `<option value="${doctor._id}">${doctor.name} - ${doctor.specialization || 'General'}</option>`;
    });
  } catch (error) {
    console.error('Error loading doctors:', error);
  }
}

// Book appointment form (using correct IDs: bookDoctor, bookDate, bookTime, bookReason)
async function bookAppointment(e) {
  e.preventDefault();

  const doctorId = document.getElementById('bookDoctor')?.value;
  const date = document.getElementById('bookDate')?.value;
  const time = document.getElementById('bookTime')?.value;
  const reason = document.getElementById('bookReason')?.value;

  if (!doctorId || !date || !time) {
    alert('Please fill in all required fields.');
    return;
  }

  // Get doctor name from selected option
  const doctorSelect = document.getElementById('bookDoctor');
  const doctorName = doctorSelect.options[doctorSelect.selectedIndex]?.text.split(' - ')[0] || '';

  try {
    await API.appointments.create({ doctor: doctorId, doctorName, date, time, reason });
    alert('Appointment booked successfully!');
    document.getElementById('bookingForm')?.reset();
    await loadAppointments();
  } catch (error) {
    alert('Failed to book appointment: ' + error.message);
  }
}

// ==================== MY APPOINTMENTS ====================

async function loadAppointments() {
  try {
    const appointments = await API.appointments.getAll();

    const now = new Date();
    const upcoming = appointments.filter(a => new Date(a.date) >= now);

    // Update stat counts (using correct IDs from patient.html)
    const upcomingCountEl = document.getElementById('upcomingCount');
    const totalAppointmentsEl = document.getElementById('totalAppointments');
    if (upcomingCountEl) upcomingCountEl.textContent = upcoming.length;
    if (totalAppointmentsEl) totalAppointmentsEl.textContent = appointments.length;

    // Populate upcoming appointments table on dashboard
    renderUpcomingTable(upcoming);

    // Populate full appointments table
    renderAllAppointmentsTable(appointments);

  } catch (error) {
    console.error('Error loading appointments:', error);
  }
}

function renderUpcomingTable(appointments) {
  const tbody = document.getElementById('upcomingAppointmentsTable');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (appointments.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#666;">No upcoming appointments</td></tr>';
    return;
  }

  appointments.forEach(a => {
    const doctorName = a.doctor?.name || a.doctorName || 'Not assigned';
    tbody.innerHTML += `
      <tr>
        <td>${new Date(a.date).toLocaleDateString()}</td>
        <td>${a.time}</td>
        <td>${doctorName}</td>
        <td><span class="status-badge status-${a.status?.toLowerCase()}">${a.status}</span></td>
      </tr>`;
  });
}

function renderAllAppointmentsTable(appointments) {
  const tbody = document.getElementById('appointmentsTable');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (appointments.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No appointments found</td></tr>';
    return;
  }

  appointments.forEach((a, i) => {
    const doctorName = a.doctor?.name || a.doctorName || 'Unassigned';
    tbody.innerHTML += `
      <tr>
        <td>${i + 1}</td>
        <td>${new Date(a.date).toLocaleDateString()}</td>
        <td>${a.time}</td>
        <td>${doctorName}</td>
        <td><span class="status-badge status-${a.status?.toLowerCase()}">${a.status}</span></td>
      </tr>`;
  });
}

// ==================== MEDICAL RECORDS ====================

async function loadMedicalRecords() {
  try {
    const records = await API.medicalRecords.getAll();

    const countEl = document.getElementById('medicalRecordsCount');
    if (countEl) countEl.textContent = records.length;

    renderMedicalRecords(records);
  } catch (error) {
    console.error('Error loading medical records:', error);
  }
}

function renderMedicalRecords(records) {
  const container = document.getElementById('medicalRecordsList');
  if (!container) return;
  container.innerHTML = '';

  if (records.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:#666;">No medical records found</p>';
    return;
  }

  records.forEach(record => {
    container.innerHTML += `
      <div class="record-card" style="background:#fff;border-radius:10px;padding:20px;margin-bottom:15px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
          <h4 style="margin:0;">Dr. ${record.doctor?.name || record.doctorName || 'N/A'}</h4>
          <span style="color:#888;font-size:0.9em;">${new Date(record.visitDate || record.createdAt).toLocaleDateString()}</span>
        </div>
        <p><strong>Diagnosis:</strong> ${record.diagnosis || 'N/A'}</p>
        <p><strong>Prescription:</strong> ${record.prescription || 'N/A'}</p>
        ${record.notes ? `<p><strong>Doctor's Notes:</strong> ${record.notes}</p>` : ''}
      </div>`;
  });
}

// ==================== INITIALIZATION ====================

initPatient();
