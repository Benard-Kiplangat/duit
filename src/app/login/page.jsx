"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

const db = getFirestore();

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleEmailAuth = async () => {
    try {
      if (isSignup) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        const userDoc = {
          bio: "Lovely Duit user",
          createdAt: serverTimestamp(),
          displayName: name,
          email: userCredential.user.email,
          isAdmin: false,
          isPaid: false,
          photoUrl: userCredential.user.photoURL || "",
          uid: userCredential.user.uid,
          updatedAt: serverTimestamp(),
        };
        await setDoc(doc(db, "users", userCredential.user.uid), userDoc);
        router.push("/");
        setIsSignup(false);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (name) {
          await updateProfile(userCredential.user, { displayName: name });
        }
        router.push("/");
      }
    } catch (error) {
      alert((isSignup ? "Signup to create To-Dos" : "Login to access your To-Dos") + " failed: " + error.message);
    }
  };

  return (
  <div className="font-[family-name:var(--font-geist-sans)] bg-blue-100 min-w-screen min-h-screen py-15 px-6">
   <main className="max-w-[36rem] min-w-[18rem] mx-auto bg-white rounded-xl shadow-lg px-8 py-16">
      <h1 className="text-2xl font-bold mb-4">{isSignup ? "Sign Up" : "Login"}</h1>
      <div className="mb-4">
        {isSignup && (
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="px-4 py-2 border border-orange-300 focus:outline-none focus:border-orange-500 focus:ring-orange-500 rounded mb-2 w-full"
          />
        )}
        <input
          type="email"
          placeholder="Email use ben11@gmail.com for testing..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="px-4 py-2 border border-orange-300 focus:outline-none focus:border-orange-500 focus:ring-orange-500 rounded mb-2 w-full"
        />
        <input
          type="password"
          placeholder="Password use 12345678 for testing..."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="px-4 py-2 border border-orange-300 focus:outline-none focus:border-orange-500 focus:ring-orange-500 rounded w-full"
        />
      </div>
      <div className="flex flex-col justify-content space-between">
        <button
          onClick={handleEmailAuth}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {isSignup ? "Sign Up" : "Login"}
        </button>
      </div>
      <button
        onClick={() => setIsSignup(!isSignup)}
        className="text-sm text-orange-500 hover:underline"
      >
        {isSignup ? "Already have an account? Login" : "Don't have an account? Sign Up here"}
      </button>
    </main>
    </div>
  );
};

export default Login;