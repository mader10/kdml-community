import '../css/main.css';

import { authService } from './services/auth';
import { meetingsService } from './services/meetings';
import { fundsService } from './services/funds';
import { bloodDonorsService } from './services/blood-donors';
import { committeeService } from './services/committee';
import { format } from 'date-fns';
import HijriDate from 'hijri-date';

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  // Register service worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('SW registered:', registration);
        })
        .catch(error => {
          console.log('SW registration failed:', error);
        });
    });
  }

  // Initialize auth state listener
  authService.onAuthStateChanged(user => {
    if (user) {
      showApp(user);
    } else {
      showLogin();
    }
  });

  // Initialize login form
  const loginForm = document.getElementById('loginForm');
  loginForm?.addEventListener('submit', handleLogin);
});

// Show login screen
function showLogin() {
  document.getElementById('loginScreen').classList.remove('hidden');
  document.getElementById('app').classList.add('hidden');
}

// Show main app
async function showApp(user) {
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');

  // Update theme based on organization
  updateTheme(user.organization);

  // Initialize all sections
  initializeDates();
  initializeUserCard(user);
  await loadUpcomingMeetings(user.organization);
  await loadActiveFunds(user.organization);
  initializeNavigation();
}

// Handle login form submission
async function handleLogin(e) {
  e.preventDefault();
  const phone = document.getElementById('phone').value;
  const loginButton = document.querySelector('#loginForm button[type="submit"]');
  const originalButtonText = loginButton.textContent;

  try {
    loginButton.disabled = true;
    loginButton.textContent = 'Sending OTP...';
    
    const confirmationResult = await authService.loginWithPhone(phone);
    
    // Show OTP input
    const otpHtml = `
      <div class="mt-4">
        <label for="otp" class="block text-sm font-medium text-gray-700">Enter OTP</label>
        <input type="text" id="otp" class="form-input mt-1" required maxlength="6" pattern="[0-9]*">
        <button type="button" id="verifyOtp" class="btn btn-primary w-full mt-2">
          Verify OTP
        </button>
      </div>
    `;
    
    loginButton.insertAdjacentHTML('afterend', otpHtml);
    loginButton.classList.add('hidden');
    
    // Handle OTP verification
    document.getElementById('verifyOtp').addEventListener('click', async () => {
      const otp = document.getElementById('otp').value;
      const verifyButton = document.getElementById('verifyOtp');
      
      try {
        verifyButton.disabled = true;
        verifyButton.textContent = 'Verifying...';
        
        const userDoc = await authService.verifyOTP(confirmationResult, otp);
        console.log('Login successful:', userDoc);
      } catch (error) {
        console.error('OTP verification error:', error);
        alert('Invalid OTP. Please try again.');
        verifyButton.disabled = false;
        verifyButton.textContent = 'Verify OTP';
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    alert('Login failed. Please try again.');
    loginButton.disabled = false;
    loginButton.textContent = originalButtonText;
  }
}

// Update theme based on organization
function updateTheme(organization) {
  const root = document.documentElement;
  if (organization === 'SYS') {
    root.style.setProperty('--primary-color', '#9C1D35');
    root.style.setProperty('--primary-light', '#B33D52');
    root.style.setProperty('--primary-dark', '#7A1729');
  } else {
    root.style.setProperty('--primary-color', '#006D5B');
    root.style.setProperty('--primary-light', '#008D77');
    root.style.setProperty('--primary-dark', '#004D3F');
  }
}

// Initialize dates
function initializeDates() {
  const today = new Date();
  const hijriDate = new HijriDate();

  document.getElementById('gregorianDate').textContent = format(today, 'EEEE do MMMM yyyy');
  document.getElementById('hijriDate').textContent = `${hijriDate.getDate()} ${hijriDate.getMonthName()} ${hijriDate.getYear()}`;
}

// Initialize user card
function initializeUserCard(user) {
  document.getElementById('userName').textContent = user.name;
  document.getElementById('userMID').textContent = `MID: ${user.mid}`;
  document.getElementById('userOrg').textContent = user.organization;
  document.getElementById('profileBtn').textContent = user.name.split(' ').map(n => n[0]).join('');
}

// Load upcoming meetings
async function loadUpcomingMeetings(organization) {
  try {
    const meetings = await meetingsService.getUpcomingMeetings(organization);
    const meetingsList = document.getElementById('meetingsList');
    meetingsList.innerHTML = meetings.map(meeting => `
      <div class="bg-white rounded-lg shadow p-4">
        <h4 class="font-bold">${meeting.title}</h4>
        <p class="text-sm text-gray-600">${format(meeting.dateTime.toDate(), 'PPp')}</p>
        <p class="text-sm">${meeting.location}</p>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading meetings:', error);
  }
}

// Load active funds
async function loadActiveFunds(organization) {
  try {
    const funds = await fundsService.getActiveFunds(organization);
    const fundsList = document.getElementById('fundsList');
    fundsList.innerHTML = funds.map(fund => `
      <div class="bg-white rounded-lg shadow p-4">
        <h4 class="font-bold">${fund.name}</h4>
        <p class="text-sm text-gray-600">Deadline: ${format(fund.deadline.toDate(), 'PP')}</p>
        <div class="mt-2">
          <div class="h-2 bg-gray-200 rounded">
            <div class="h-2 bg-primary rounded" style="width: ${calculateProgress(fund)}%"></div>
          </div>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading funds:', error);
  }
}

// Calculate fund progress
function calculateProgress(fund) {
  const total = Object.values(fund.contributions || {})
    .reduce((sum, contribution) => sum + contribution.amount, 0);
  return Math.min((total / fund.target) * 100, 100);
}

// Initialize navigation
function initializeNavigation() {
  const navButtons = document.querySelectorAll('nav button');
  navButtons.forEach(button => {
    button.addEventListener('click', () => {
      navButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      // Handle navigation (you'll need to implement page switching)
    });
  });
}

// Initialize admin features if user is admin
function initializeAdminFeatures(user) {
  if (user.isAdmin) {
    // Add admin UI elements and handlers
  }
} 