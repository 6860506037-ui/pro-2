document.addEventListener('DOMContentLoaded', () => {
  setupSidebar();
  setupThemeToggle();
  renderCalendar();
  renderRevenueChart();
});

// 1. ระบบควบคุม Sidebar (Collapsible & Off-canvas drawer)
function setupSidebar() {
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('toggle-sidebar-btn');
  const closeBtn = document.getElementById('close-sidebar-btn');

  toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('active');
  });

  closeBtn.addEventListener('click', () => {
    sidebar.classList.remove('active');
  });
}

// 2. ระบบสลับโหมดมืด/สว่าง (Dark/Light Mode)
function setupThemeToggle() {
  const themeBtn = document.getElementById('theme-toggle-btn');
  
  // ตรวจสอบสถานะจาก LocalStorage ดั้งเดิม
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-theme');
  }

  themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });
}

// 3. ปฏิทินจองห้อง (Dynamic Booking Calendar Grid) 09:00 - 18:00 น.
function renderCalendar() {
  const gridContainer = document.getElementById('booking-calendar-grid');
  gridContainer.innerHTML = ''; // เคลียร์ของเก่า

  const hours = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
  const rooms = ['ห้องประชุม A', 'ห้องประชุม B', 'ห้องประชุม C'];

  // สร้าง Header แถวแรก
  const emptyCorner = document.createElement('div');
  emptyCorner.className = 'grid-header';
  emptyCorner.innerText = 'ห้อง / เวลา';
  gridContainer.appendChild(emptyCorner);

  hours.forEach(hour => {
    const hourHeader = document.createElement('div');
    hourHeader.className = 'grid-header';
    hourHeader.innerText = hour;
    gridContainer.appendChild(hourHeader);
  });

  // จำลองสถานะการจอง (Available / Reserved)
  // ในงานจริง ข้อมูลส่วนนี้จะดึงมาจาก API หลังบ้าน
  const bookingMockData = {
    'ห้องประชุม A': {'09:00': 'available', '10:00': 'reserved', '11:00': 'reserved', '12:00': 'available', '13:00': 'available', '14:00': 'available', '15:00': 'reserved', '16:00': 'available', '17:00': 'available', '18:00': 'available'},
    'ห้องประชุม B': {'09:00': 'reserved', '10:00': 'available', '11:00': 'available', '12:00': 'available', '13:00': 'reserved', '14:00': 'reserved', '15:00': 'available', '16:00': 'available', '17:00': 'available', '18:00': 'available'},
    'ห้องประชุม C': {'09:00': 'available', '10:00': 'available', '11:00': 'available', '12:00': 'available', '13:00': 'available', '14:00': 'available', '15:00': 'available', '16:00': 'reserved', '17:00': 'reserved', '18:00': 'available'}
  };

  rooms.forEach(room => {
    // หัวข้อแถว (ชื่อห้อง)
    const roomLabel = document.createElement('div');
    roomLabel.className = 'room-label';
    roomLabel.innerText = room;
    gridContainer.appendChild(roomLabel);

    // เซลล์ช่วงเวลาแต่ละช่อง
    hours.forEach(hour => {
      const status = bookingMockData[room][hour];
      const cell = document.createElement('div');
      cell.className = `grid-cell ${status === 'reserved' ? 'cell-reserved' : 'cell-available'}`;
      cell.innerText = status === 'reserved' ? 'ไม่ว่าง' : 'ว่าง';
      gridContainer.appendChild(cell);
    });
  });
}

// 4. การจัดการแผนภูมิรายได้ด้วย Chart.js
function renderRevenueChart() {
  const ctx = document.getElementById('revenue-bar-chart').getContext('2d');
  
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['ห้องประชุม A', 'ห้องประชุม B', 'ห้องประชุม C'],
      datasets: [{
        label: 'รายได้รวม (บาท)',
        data: [12500, 8400, 15200], // ข้อมูลตัวอย่างจำลอง
        backgroundColor: [
          'rgba(52, 152, 219, 0.7)',
          'rgba(46, 204, 113, 0.7)',
          'rgba(155, 89, 182, 0.7)'
        ],
        borderColor: [
          '#3498db',
          '#2ecc71',
          '#9b59b6'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}
