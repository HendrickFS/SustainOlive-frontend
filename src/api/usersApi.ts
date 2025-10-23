import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  orderBy 
} from "firebase/firestore";
import { db } from "../firebase/config";

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  createdAt: Date;
  lastLoginAt: Date;
}

export interface AlertConfig {
  userId: string;
  email: string;
  selectedModels: string[];
  updatedAt: Date;
}

/**
 * Save or update user profile in Firestore
 * Call this after user logs in to keep track of users
 */
export const saveUserProfile = async (user: {
  uid: string;
  email: string;
  displayName?: string;
}): Promise<void> => {
  const userRef = doc(db, "users", user.uid);
  const userDoc = await getDoc(userRef);
  
  const now = new Date();
  
  if (userDoc.exists()) {
    // Update last login
    await setDoc(userRef, {
      lastLoginAt: now,
    }, { merge: true });
  } else {
    // Create new user profile
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || null,
      createdAt: now,
      lastLoginAt: now,
    });
  }
};

/**
 * Get all users from Firestore
 */
export const getAllUsers = async (): Promise<UserProfile[]> => {
  const usersRef = collection(db, "users");
  const q = query(usersRef, orderBy("email", "asc"));
  const querySnapshot = await getDocs(q);
  
  const users: UserProfile[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    users.push({
      uid: data.uid,
      email: data.email,
      displayName: data.displayName,
      createdAt: data.createdAt?.toDate() || new Date(),
      lastLoginAt: data.lastLoginAt?.toDate() || new Date(),
    });
  });
  
  return users;
};

/**
 * Get alert configuration for a specific user
 */
export const getUserAlertConfig = async (userId: string): Promise<AlertConfig> => {
  const configRef = doc(db, "alertConfigs", userId);
  const configDoc = await getDoc(configRef);
  
  if (!configDoc.exists()) {
    throw new Error("Alert configuration not found");
  }
  
  const data = configDoc.data();
  return {
    userId: data.userId,
    email: data.email,
    selectedModels: data.selectedModels || [],
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
};

/**
 * Save alert configuration for a specific user
 */
export const saveUserAlertConfig = async (
  userId: string,
  email: string,
  config: { selectedModels: string[] }
): Promise<void> => {
  const configRef = doc(db, "alertConfigs", userId);
  
  await setDoc(configRef, {
    userId,
    email,
    selectedModels: config.selectedModels,
    updatedAt: new Date(),
  });
};

/**
 * Get all alert configurations
 */
export const getAllAlertConfigs = async (): Promise<AlertConfig[]> => {
  const configsRef = collection(db, "alertConfigs");
  const querySnapshot = await getDocs(configsRef);
  
  const configs: AlertConfig[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    configs.push({
      userId: data.userId,
      email: data.email,
      selectedModels: data.selectedModels || [],
      updatedAt: data.updatedAt?.toDate() || new Date(),
    });
  });
  
  return configs;
};
