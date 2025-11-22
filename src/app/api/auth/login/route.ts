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
    const { email, password, role } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    if (!role || (role !== 'client' && role !== 'owner')) {
      return NextResponse.json(
        { error: 'Le rôle (client ou owner) est requis' },
        { status: 400 }
      );
    }

    try {
      // Get user by email
      const userRecord = await auth.getUserByEmail(email);
      
      // Get user profile from Firestore
      const userDoc = await firestore.collection('users').doc(userRecord.uid).get();

      if (!userDoc.exists) {
        return NextResponse.json(
          { error: 'Profil utilisateur non trouvé' },
          { status: 404 }
        );
      }

      const userData = userDoc.data();

      // Verify userData exists
      if (!userData) {
        return NextResponse.json(
          { error: 'Profil utilisateur invalide' },
          { status: 404 }
        );
      }

      // Check role matches
      if (userData.role !== role) {
        return NextResponse.json(
          { error: `Cette adresse email est associée à un compte "${userData.role}". Veuillez choisir le bon rôle.` },
          { status: 403 }
        );
      }

      // Generate custom token for client-side authentication
      const customToken = await auth.createCustomToken(userRecord.uid);

      // Return the custom token and user data
      return NextResponse.json(
        {
          token: customToken,
          user: {
            id: userRecord.uid,
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: userData.role,
            phone: userData.phone || '',
            avatar: userData.avatar || '',
          },
          message: 'Connexion réussie',
        },
        { status: 200 }
      );
    } catch (firebaseError: any) {
      if (firebaseError.code === 'auth/user-not-found') {
        return NextResponse.json(
          { error: 'Email ou mot de passe incorrect' },
          { status: 401 }
        );
      }
      throw firebaseError;
    }
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la connexion' },
      { status: 500 }
    );
  }
}
