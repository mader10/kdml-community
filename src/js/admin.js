import '../css/main.css';
import { ExcelUploader } from './utils/excel-uploader';
import { authService } from './services/auth';
import * as XLSX from 'xlsx';

// Template structure for member data
const TEMPLATE_HEADERS = [
  'name',
  'phone',
  'organization',
  'mid',
  'bloodGroup',
  'isDonor',
  'location',
  'isAdmin'
];

const TEMPLATE_DATA = [
  {
    name: 'John Doe',
    phone: '9876543210',
    organization: 'SYS',
    mid: 'SYS001',
    bloodGroup: 'O+',
    isDonor: 'TRUE',
    location: 'Kerala',
    isAdmin: 'FALSE'
  }
];

document.addEventListener('DOMContentLoaded', () => {
  // Check if user is admin
  authService.onAuthStateChanged(async (user) => {
    if (!user?.isAdmin) {
      alert('Access denied. Admin privileges required.');
      window.location.href = '/';
      return;
    }
  });

  const uploader = new ExcelUploader();
  
  // Handle template download
  document.getElementById('downloadTemplate')?.addEventListener('click', () => {
    const ws = XLSX.utils.json_to_sheet(TEMPLATE_DATA);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Members');
    
    // Add column headers
    XLSX.utils.sheet_add_aoa(ws, [TEMPLATE_HEADERS], { origin: 'A1' });
    
    // Save file
    XLSX.writeFile(wb, 'kdml_members_template.xlsx');
  });

  // Handle file upload
  document.getElementById('uploadMembers')?.addEventListener('click', async () => {
    const fileInput = document.getElementById('memberFile');
    const file = fileInput.files[0];
    
    if (!file) {
      alert('Please select a file first.');
      return;
    }

    try {
      // Show upload status
      const statusDiv = document.getElementById('uploadStatus');
      const progressBar = document.getElementById('uploadProgress');
      const progressText = document.getElementById('uploadPercent');
      const messageText = document.getElementById('uploadMessage');
      
      statusDiv.classList.remove('hidden');
      messageText.textContent = 'Reading file...';
      progressBar.style.width = '10%';
      progressText.textContent = '10%';

      // Upload members
      const result = await uploader.uploadMembers(file);
      
      // Update progress
      progressBar.style.width = '100%';
      progressText.textContent = '100%';
      messageText.textContent = `Successfully uploaded ${result.totalUploaded} members.`;

      // Show results
      const resultsDiv = document.getElementById('uploadResults');
      resultsDiv.classList.remove('hidden');
      document.getElementById('totalRecords').textContent = result.totalUploaded;
      document.getElementById('successCount').textContent = result.totalUploaded;
      document.getElementById('failedCount').textContent = '0';

    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed: ' + error.message);
      
      // Update status
      const messageText = document.getElementById('uploadMessage');
      messageText.textContent = 'Upload failed: ' + error.message;
      messageText.classList.add('text-red-600');
    }
  });
}); 