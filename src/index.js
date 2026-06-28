// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import "./db";                 // liga o window.storage ao Firebase (precisa vir antes do App)
import LoginGate from "./LoginGate";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <LoginGate>{(contaInfo) => <App contaInfo={contaInfo} />}</LoginGate>
  </React.StrictMode>
);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}
