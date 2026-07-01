// src/lib/store.js
// Camada de dados única do app. Em produção (com Firebase), src/db.js substitui
// `window.storage` por um adaptador Firestore — este arquivo não muda em nada.
// Aqui ele só garante que, sem Firebase configurado, o app ainda funciona
// (memória local), para você testar a interface antes de plugar o backend.

const hasWindowStorage = typeof window !== "undefined" && window.storage;
const mem = {};

export async function loadKey(key, fallback) {
  if (!hasWindowStorage) return key in mem ? mem[key] : fallback;
  try {
    const r = await window.storage.get(key);
    return r ? JSON.parse(r.value) : fallback;
  } catch {
    return fallback;
  }
}

export async function saveKey(key, value) {
  if (!hasWindowStorage) {
    mem[key] = value;
    return;
  }
  try {
    await window.storage.set(key, JSON.stringify(value));
  } catch (e) {
    console.error("Falha ao salvar", key, e);
  }
}

export const storageIsLive = () => hasWindowStorage;
