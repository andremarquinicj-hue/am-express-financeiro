// src/db.js
// Camada de armazenamento com LOGIN REAL (e-mail/senha + Google) via Firebase.
// André e Catrine, na MESMA empresa, usando contas DIFERENTES, veem os MESMOS dados:
// em vez de guardar por uid, este adaptador guarda tudo sob um "empresaId" fixo,
// e cada membro (uid) só precisa estar listado em /empresas/{empresaId}/membros
// para ler e escrever. Isso é o que dá o efeito de "sociedade", sem hierarquia.
//
// Expõe `window.storage` (get/set/delete/list) — nenhum componente do app precisa mudar.

import { initializeApp } from "firebase/app";
import {
  getFirestore, doc, getDoc, setDoc, deleteDoc, collection, getDocs,
} from "firebase/firestore";
import {
  getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup,
  signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut,
} from "firebase/auth";

// 1) Config do seu projeto Firebase (Configurações do projeto > Seus apps > Web)
const firebaseConfig = {
  apiKey: "AIzaSyC8m7aen3XsetjKs8dEfchLNEy9qzKOuCo",
  authDomain: "am-express-financeiro.firebaseapp.com",
  projectId: "am-express-financeiro",
  storageBucket: "am-express-financeiro.firebasestorage.app",
  messagingSenderId: "11256901190",
  appId: "1:11256901190:web:3165408ccae19a35ff6447",
};

// 2) Identificador fixo da empresa — todos os dados financeiros moram aqui,
//    compartilhados entre André e Catrine. Pode deixar como está.
const EMPRESA_ID = "am-express";

const app = initializeApp(firebaseConfig);
const fs = getFirestore(app);
const auth = getAuth(app);

let uid = null;
let resolveReady;
let ready = new Promise((r) => (resolveReady = r));

onAuthStateChanged(auth, (u) => {
  if (u) { uid = u.uid; resolveReady(); }
  else { uid = null; ready = new Promise((r) => (resolveReady = r)); }
});

const kvDoc = (key) => doc(fs, "empresas", EMPRESA_ID, "kv", key);
const lsKey = (key) => `amx::${EMPRESA_ID}::${key}`;

const storage = {
  async get(key) {
    await ready;
    const local = localStorage.getItem(lsKey(key));
    try {
      const snap = await getDoc(kvDoc(key));
      if (snap.exists()) {
        const value = snap.data().value;
        localStorage.setItem(lsKey(key), value);
        return { key, value };
      }
    } catch (e) { console.warn("get offline, usando cache local:", e); }
    return local != null ? { key, value: local } : null;
  },
  async set(key, value) {
    await ready;
    localStorage.setItem(lsKey(key), value);
    try { await setDoc(kvDoc(key), { value, updatedAt: Date.now(), atualizadoPor: uid }); }
    catch (e) { console.warn("set offline (salvo local, sincroniza depois):", e); }
    return { key, value };
  },
  async delete(key) {
    await ready;
    localStorage.removeItem(lsKey(key));
    try { await deleteDoc(kvDoc(key)); } catch (e) { console.warn(e); }
    return { key, deleted: true };
  },
  async list(prefix = "") {
    await ready;
    const snap = await getDocs(collection(fs, "empresas", EMPRESA_ID, "kv"));
    const keys = snap.docs.map((d) => d.id).filter((k) => k.startsWith(prefix));
    return { keys, prefix };
  },
};

window.storage = storage;
window.__amxLogout = () => signOut(auth);
window.__amxUserEmail = () => (auth.currentUser ? auth.currentUser.email : "");

export function watchUser(cb) { return onAuthStateChanged(auth, cb); }
export function entrarEmail(email, senha) { return signInWithEmailAndPassword(auth, email, senha); }
export function criarConta(email, senha) { return createUserWithEmailAndPassword(auth, email, senha); }
export function entrarGoogle() { return signInWithPopup(auth, new GoogleAuthProvider()); }
export function sair() { return signOut(auth); }

export default storage;
