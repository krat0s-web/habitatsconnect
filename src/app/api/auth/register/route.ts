import { NextRequest, NextResponse } from 'next/server';
import admin from 'firebase-admin';

// Initialize Firebase Admin
const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}'
);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const auth = admin.auth();
const firestore = admin.firestore();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, role, phone } = body;

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis (email, password, firstName, lastName)' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      );
    }

    // Check if user already exists in Firebase Auth
    try {
      await auth.getUserByEmail(email);
      return NextResponse.json(
        { error: 'Un utilisateur avec cet email existe déjà' },
        { status: 409 }
      );
    } catch (error: any) {
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
    }

    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: `${firstName} ${lastName}`,
    });

    // Create user profile in Firestore
    const newUser = {
      id: userRecord.uid,
      email: userRecord.email,
      firstName,
      lastName,
      phone: phone || '',
      role: role || 'client',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await firestore.collection('users').doc(userRecord.uid).set(newUser);

    // Generate custom token for immediate login
    const customToken = await auth.createCustomToken(userRecord.uid);

    return NextResponse.json(
      { 
        user: newUser,
        token: customToken,
        message: 'Inscription réussie' 
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    
    let errorMessage = 'Erreur lors de l\'inscription';
    if (error.code === 'auth/email-already-exists') {
      errorMessage = 'Un utilisateur avec cet email existe déjà';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Email invalide';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Le mot de passe est trop faible';
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
