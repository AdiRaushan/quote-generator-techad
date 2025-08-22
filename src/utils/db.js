// src/utils/db.js

export function getClients() {
  const saved = localStorage.getItem("clients");
  return saved ? JSON.parse(saved) : [];
}

export function saveClients(clients) {
  localStorage.setItem("clients", JSON.stringify(clients));
}
