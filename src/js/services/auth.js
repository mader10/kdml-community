import { auth, db } from '../firebase-config';
import { signInWithPhoneNumber, RecaptchaVerifier } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

class AuthService {
  constructor() {
    this.currentUser = null;
  }

  async initRecaptcha() {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'sign-in-button', {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved
        }
      });
    }
  }

  async loginWithPhone(phoneNumber) {
    try {
      await this.initRecaptcha();
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        window.recaptchaVerifier
      );
      return confirmationResult;
    } catch (error) {
      console.error('Error during phone auth:', error);
      throw error;
    }
  }

  async verifyOTP(confirmationResult, code) {
    try {
      const userCredential = await confirmationResult.confirm(code);
      this.currentUser = userCredential.user;
      const userDoc = await this.getUserData(userCredential.user.uid);
      return userDoc;
    } catch (error) {
      console.error('Error during OTP verification:', error);
      throw error;
    }
  }

  async getUserData(uid) {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data();
      }
      throw new Error('User not found in database');
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  }

  async logout() {
    try {
      await auth.signOut();
      this.currentUser = null;
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  }

  onAuthStateChanged(callback) {
    return auth.onAuthStateChanged(async (user) => {
      this.currentUser = user;
      if (user) {
        const userData = await this.getUserData(user.uid);
        callback(userData);
      } else {
        callback(null);
      }
    });
  }
}

export const authService = new AuthService(); 