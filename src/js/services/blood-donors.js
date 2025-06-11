import { db } from '../firebase-config';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  orderBy
} from 'firebase/firestore';

class BloodDonorsService {
  constructor() {
    this.collection = collection(db, 'users');
  }

  async getDonorsByBloodGroup(bloodGroup) {
    try {
      const q = query(
        this.collection,
        where('bloodGroup', '==', bloodGroup),
        where('isDonor', '==', true),
        orderBy('name')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching donors by blood group:', error);
      throw error;
    }
  }

  async searchDonors(searchTerm) {
    try {
      // Note: This is a simple implementation. For production,
      // consider using Algolia or similar search service
      const q = query(
        this.collection,
        where('isDonor', '==', true),
        orderBy('name')
      );
      
      const querySnapshot = await getDocs(q);
      const donors = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return donors.filter(donor => 
        donor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donor.bloodGroup.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donor.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      console.error('Error searching donors:', error);
      throw error;
    }
  }

  async getAllBloodGroups() {
    return ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  }

  async getDonorStats() {
    try {
      const bloodGroups = await this.getAllBloodGroups();
      const stats = {};
      
      for (const group of bloodGroups) {
        const donors = await this.getDonorsByBloodGroup(group);
        stats[group] = donors.length;
      }
      
      return stats;
    } catch (error) {
      console.error('Error fetching donor stats:', error);
      throw error;
    }
  }
}

export const bloodDonorsService = new BloodDonorsService(); 