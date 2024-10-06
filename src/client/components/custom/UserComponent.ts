import { SkyeComponent } from "../core/SkyeComponent.ts";

export class UserComponent extends SkyeComponent {
  constructor() {
    super({
      user: {
        id: "",
        name: "Loading...",
        email: "",
      },
      isEditing: false,
    });

    // Fetch user data when component is created
    this.fetchUserData();
  }

  async fetchUserData() {
    try {
      const response = await fetch("/api/users/1"); // Fetch user with ID 1
      const userData = await response.json();
      this.state.user = userData;
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      this.state.user.name = "Failed to load user";
    }
  }

  toggleEdit() {
    this.state.isEditing = !this.state.isEditing;
  }

  updateUser() {
    // In a real app, you'd send this update to the server
    console.log("Updating user:", this.state.user);
    this.state.isEditing = false;
  }

  override renderTemplate() {
    const template = document.createDocumentFragment();
    const userDiv = document.createElement("div");

    if (this.state.isEditing) {
      userDiv.innerHTML = `<h2>Edit User</h2><input id="nameInput" type="text" value="${this.state.user.name}"><input id="emailInput" type="email" value="${this.state.user.email}"><button id="saveButton">Save</button><button id="cancelButton">Cancel</button>      `;

      const saveButton = userDiv.querySelector("#saveButton");
      saveButton?.addEventListener("click", () => {
        const nameInput = userDiv.querySelector(
          "#nameInput"
        ) as HTMLInputElement;
        const emailInput = userDiv.querySelector(
          "#emailInput"
        ) as HTMLInputElement;
        this.state.user.name = nameInput.value;
        this.state.user.email = emailInput.value;
        this.updateUser();
      });

      const cancelButton = userDiv.querySelector("#cancelButton");
      cancelButton?.addEventListener("click", () => this.toggleEdit());
    } else {
      userDiv.innerHTML = `<h2>User Details</h2><p>Name: ${this.state.user.name}</p><p>Email: ${this.state.user.email}</p><button id="editButton">Edit</button>`;

      const editButton = userDiv.querySelector("#editButton");
      editButton?.addEventListener("click", () => this.toggleEdit());
    }

    template.appendChild(userDiv);
    return template;
  }
}

customElements.define("user-component", UserComponent);
