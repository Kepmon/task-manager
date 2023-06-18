import { defineStore } from "pinia";
import { ref } from "vue";
import { auth } from "../firebase";
import {
  UserCredential,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

export const useUserStore = defineStore("user", () => {
  const isLoggedIn = ref(false);
  const user = ref<UserCredential["user"] | null>(null);

  async function register({
    email,
    password,
  }: Record<"email" | "password", string>) {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw error;
    }
  }

  async function login({
    email,
    password,
  }: Record<"email" | "password", string>) {
    console.log("login triggered");
    try {
      const req = await signInWithEmailAndPassword(auth, email, password);
      user.value = req.user;
      isLoggedIn.value = true;
    } catch (error) {
      throw error;
    }
  }

  async function logout() {
    await signOut(auth);
    isLoggedIn.value = false;
  }

  return {
    isLoggedIn,
    register,
    login,
    logout,
    user,
  };
});
