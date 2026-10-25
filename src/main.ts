import { app } from "./firebase";

const root = document.getElementById("app");
if (root) {
  root.textContent = "There Ain't No Virgin Mary — 2027";
  root.dataset.project = app.options.projectId;
}
