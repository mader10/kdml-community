import { db } from '../firebase-config';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc,
  doc,
  orderBy,
  Timestamp 
} from 'firebase/firestore';

class MeetingsService {
  constructor() {
    this.collection = collection(db, 'meetings');
  }

  async getUpcomingMeetings(organization) {
    try {
      const now = Timestamp.now();
      const q = query(
        this.collection,
        where('dateTime', '>=', now),
        where('organization', 'in', [organization, 'both']),
        orderBy('dateTime', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching upcoming meetings:', error);
      throw error;
    }
  }

  async createMeeting(meetingData) {
    try {
      const docRef = await addDoc(this.collection, {
        ...meetingData,
        createdAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating meeting:', error);
      throw error;
    }
  }

  async updateMeeting(meetingId, updates) {
    try {
      const meetingRef = doc(this.collection, meetingId);
      await updateDoc(meetingRef, updates);
    } catch (error) {
      console.error('Error updating meeting:', error);
      throw error;
    }
  }

  async markAttendance(meetingId, userId, status) {
    try {
      const meetingRef = doc(this.collection, meetingId);
      await updateDoc(meetingRef, {
        [`attendance.${userId}`]: {
          status,
          timestamp: Timestamp.now()
        }
      });
    } catch (error) {
      console.error('Error marking attendance:', error);
      throw error;
    }
  }
}

export const meetingsService = new MeetingsService(); 