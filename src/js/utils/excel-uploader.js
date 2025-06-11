import { db } from '../firebase-config';
import { collection, doc, setDoc } from 'firebase/firestore';
import * as XLSX from 'xlsx';

export class ExcelUploader {
  constructor() {
    this.usersCollection = collection(db, 'users');
  }

  async uploadMembers(file) {
    try {
      const data = await this.readExcelFile(file);
      const validatedData = this.validateData(data);
      await this.uploadToFirebase(validatedData);
      return {
        success: true,
        totalUploaded: validatedData.length
      };
    } catch (error) {
      console.error('Error uploading members:', error);
      throw error;
    }
  }

  readExcelFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target.result;
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          resolve(jsonData);
        } catch (error) {
          reject(new Error('Error reading Excel file: ' + error.message));
        }
      };

      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };

      reader.readAsArrayBuffer(file);
    });
  }

  validateData(data) {
    const requiredFields = ['name', 'phone', 'organization'];
    const validatedData = [];

    for (const row of data) {
      // Check required fields
      const missingFields = requiredFields.filter(field => !row[field]);
      if (missingFields.length > 0) {
        console.warn(`Skipping row due to missing fields: ${missingFields.join(', ')}`, row);
        continue;
      }

      // Format phone number
      let phone = row.phone.toString().trim();
      if (!phone.startsWith('+')) {
        phone = '+91' + phone; // Add India country code if not present
      }

      // Validate organization
      const org = row.organization.toString().toUpperCase();
      if (!['SYS', 'SSF'].includes(org)) {
        console.warn(`Skipping row due to invalid organization: ${org}`, row);
        continue;
      }

      // Create validated user object
      const user = {
        name: row.name.toString().trim(),
        phone: phone,
        organization: org,
        mid: row.mid?.toString() || '',
        bloodGroup: row.bloodGroup?.toString() || '',
        isDonor: Boolean(row.isDonor),
        location: row.location?.toString() || '',
        isAdmin: Boolean(row.isAdmin),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      validatedData.push(user);
    }

    return validatedData;
  }

  async uploadToFirebase(users) {
    const batch = [];

    for (const user of users) {
      // Use phone number as document ID for easy lookup
      const docRef = doc(this.usersCollection, user.phone);
      batch.push(setDoc(docRef, user, { merge: true }));
    }

    await Promise.all(batch);
  }
} 