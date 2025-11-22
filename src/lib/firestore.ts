import { db } from './firebase';
import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    DocumentData,
    QueryConstraint
} from 'firebase/firestore';

// Helper to convert Firestore snapshot to object with ID
export const convertDoc = (doc: any) => {
    return {
        id: doc.id,
        ...doc.data(),
    };
};

// Generic get all
export const getAll = async (collectionName: string, constraints: QueryConstraint[] = []) => {
    const q = query(collection(db, collectionName), ...constraints);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(convertDoc);
};

// Generic get by ID
export const getById = async (collectionName: string, id: string) => {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return convertDoc(docSnap);
    } else {
        return null;
    }
};

// Generic add
export const add = async (collectionName: string, data: any) => {
    const docRef = await addDoc(collection(db, collectionName), data);
    return { id: docRef.id, ...data };
};

// Generic update
export const update = async (collectionName: string, id: string, data: any) => {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, data);
    return { id, ...data };
};

// Generic delete
export const remove = async (collectionName: string, id: string) => {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
    return id;
};
