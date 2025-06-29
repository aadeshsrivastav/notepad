let savedNotesArray = [];
if ('Notification' in window) {
  if (Notification.permission !== "granted" && Notification.permission !== "denied") {
    Notification.requestPermission();
  }
}
window.addEventListener("DOMContentLoaded", () => {
  const notesFromStorage = JSON.parse(localStorage.getItem("notes"));
  if (notesFromStorage) {
    savedNotesArray = notesFromStorage;
    savedNotesArray.forEach(note => renderNote(note));
  }
});

document.getElementById("saveBtn").addEventListener("click", function () {
  const text = document.getElementById("text1").value.trim();
  const selectedDate = document.getElementById("noteDate").value;

  if (text === "") return;

  const noteObj = {
    id: Date.now(),
    content: text,
    date: selectedDate,
    reminded: false
  };

  savedNotesArray.push(noteObj);
  localStorage.setItem("notes", JSON.stringify(savedNotesArray));
  renderNote(noteObj);

  document.getElementById("text1").value = "";
  document.getElementById("noteDate").value = "";
});

function renderNote(note) {
  const noteDiv = document.createElement("div");
  noteDiv.className = "savedNote";

  const now = new Date().toLocaleString();

  noteDiv.innerHTML = `
    <p>${note.content}</p>
    <small><b>Date:</b> ${note.date || 'Not selected'}</small><br>
    <small><b>Saved on:</b> ${now}</small>
    <div class="buttonGroup">
      <button class="shareBtn">Share</button>
      <button class="deleteBtn">Delete</button>
    </div>
  `;

  noteDiv.querySelector(".shareBtn").addEventListener("click", () => {
    const encodedText = encodeURIComponent(note.content);
    const whatsappURL = `https://wa.me/?text=${encodedText}`;
    window.open(whatsappURL, "_blank");
  });

  noteDiv.querySelector(".deleteBtn").addEventListener("click", () => {
    noteDiv.remove();
    savedNotesArray = savedNotesArray.filter(n => n.id !== note.id);
    localStorage.setItem("notes", JSON.stringify(savedNotesArray));
  });

  document.getElementById("savedNotesContainer").appendChild(noteDiv);
}

function checkReminders() {
  let now = new Date();
  let notes = JSON.parse(localStorage.getItem("notes")) || [];

  notes.forEach(note => {
    if (!note.reminded && note.date) {
      let noteDate = new Date(note.date + "T09:00:00");

      if (now >= noteDate) {
        if (Notification.permission === "granted") {
          new Notification("Note Reminder", {
            body: `Reminder for your note: "${note.content.slice(0, 30)}..."`,
            icon: "https://cdn-icons-png.flaticon.com/512/727/727245.png"
          });
          note.reminded = true;
          localStorage.setItem("notes", JSON.stringify(notes));
        }
      }
    }
  });
}
setInterval(checkReminders, 60000);
