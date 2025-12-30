"use client";
export function isAuthed() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("jourt_auth") === "true";
}

export function setAuthed() {
  localStorage.setItem("jourt_auth", "true");
}

export function clearAuthed() {
  localStorage.removeItem("jourt_auth");
}
