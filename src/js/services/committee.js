import { db, storage } from '../firebase-config';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy 
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';

class CommitteeService {
  constructor() {
    this.collection = collection(db, 'committee');
  }

  async getCommitteeMembers(organization) {
    try {
      const q = query(
        this.collection,
        where('organization', '==', organization),
        orderBy('order')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching committee members:', error);
      throw error;
    }
  }

  async addMember(memberData, photoFile) {
    try {
      let photoUrl = '';
      
      if (photoFile) {
        const storageRef = ref(storage, `committee/${Date.now()}_${photoFile.name}`);
        await uploadBytes(storageRef, photoFile);
        photoUrl = await getDownloadURL(storageRef);
      }

      const docRef = await addDoc(this.collection, {
        ...memberData,
        photoUrl,
        createdAt: new Date()
      });

      return docRef.id;
    } catch (error) {
      console.error('Error adding committee member:', error);
      throw error;
    }
  }

  async updateMember(memberId, updates, newPhotoFile) {
    try {
      const memberRef = doc(this.collection, memberId);
      const memberDoc = await getDocs(memberRef);
      const currentData = memberDoc.data();

      let photoUrl = currentData.photoUrl;

      if (newPhotoFile) {
        // Delete old photo if exists
        if (currentData.photoUrl) {
          const oldPhotoRef = ref(storage, currentData.photoUrl);
          await deleteObject(oldPhotoRef);
        }

        // Upload new photo
        const storageRef = ref(storage, `committee/${Date.now()}_${newPhotoFile.name}`);
        await uploadBytes(storageRef, newPhotoFile);
        photoUrl = await getDownloadURL(storageRef);
      }

      await updateDoc(memberRef, {
        ...updates,
        photoUrl,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating committee member:', error);
      throw error;
    }
  }

  async deleteMember(memberId) {
    try {
      const memberRef = doc(this.collection, memberId);
      const memberDoc = await getDocs(memberRef);
      const memberData = memberDoc.data();

      // Delete photo if exists
      if (memberData.photoUrl) {
        const photoRef = ref(storage, memberData.photoUrl);
        await deleteObject(photoRef);
      }

      await deleteDoc(memberRef);
    } catch (error) {
      console.error('Error deleting committee member:', error);
      throw error;
    }
  }

  async reorderMembers(organization, newOrder) {
    try {
      const batch = db.batch();
      
      newOrder.forEach((memberId, index) => {
        const memberRef = doc(this.collection, memberId);
        batch.update(memberRef, { order: index });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error reordering committee members:', error);
      throw error;
    }
  }
}

export const committeeService = new CommitteeService(); 