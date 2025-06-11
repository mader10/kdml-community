import { db } from '../firebase-config';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc,
  doc,
  Timestamp 
} from 'firebase/firestore';

class FundsService {
  constructor() {
    this.collection = collection(db, 'funds');
  }

  async getActiveFunds(organization) {
    try {
      const now = Timestamp.now();
      const q = query(
        this.collection,
        where('deadline', '>=', now),
        where('organization', 'in', [organization, 'both']),
        where('status', '==', 'active')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching active funds:', error);
      throw error;
    }
  }

  async createFund(fundData) {
    try {
      const docRef = await addDoc(this.collection, {
        ...fundData,
        status: 'active',
        createdAt: Timestamp.now(),
        contributions: {}
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating fund:', error);
      throw error;
    }
  }

  async addContribution(fundId, userId, amount) {
    try {
      const fundRef = doc(this.collection, fundId);
      await updateDoc(fundRef, {
        [`contributions.${userId}`]: {
          amount,
          timestamp: Timestamp.now()
        }
      });
    } catch (error) {
      console.error('Error adding contribution:', error);
      throw error;
    }
  }

  async updateFundStatus(fundId, status) {
    try {
      const fundRef = doc(this.collection, fundId);
      await updateDoc(fundRef, {
        status,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating fund status:', error);
      throw error;
    }
  }

  async getUserContributions(userId) {
    try {
      const funds = collection(db, 'funds');
      const q = query(funds);
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          contribution: doc.data().contributions?.[userId]
        }))
        .filter(fund => fund.contribution);
    } catch (error) {
      console.error('Error fetching user contributions:', error);
      throw error;
    }
  }

  async getMonthlyFundStatus(userId, month, year) {
    try {
      const q = query(
        this.collection,
        where('type', '==', 'monthly'),
        where('month', '==', month),
        where('year', '==', year)
      );
      
      const querySnapshot = await getDocs(q);
      const fund = querySnapshot.docs[0];
      
      if (fund) {
        return {
          paid: !!fund.data().contributions?.[userId],
          amount: fund.data().contributions?.[userId]?.amount || 0
        };
      }
      
      return { paid: false, amount: 0 };
    } catch (error) {
      console.error('Error fetching monthly fund status:', error);
      throw error;
    }
  }
}

export const fundsService = new FundsService(); 