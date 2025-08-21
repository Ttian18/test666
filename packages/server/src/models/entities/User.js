import { randomUUID } from "node:crypto";

const users = [];

export default class User {
  constructor({ email, password, profileComplete = false }) {
    this._id = randomUUID();
    this.email = email;
    this.password = password;
    this.profileComplete = profileComplete;
  }

  static async findOne(query) {
    const { email } = query || {};
    if (!email) return null;
    return users.find((u) => u.email === email) || null;
  }

  static async findByIdAndUpdate(id, update) {
    const idx = users.findIndex((u) => u._id === id);
    if (idx === -1) return null;
    users[idx] = { ...users[idx], ...update };
    return users[idx];
  }

  async save() {
    const idx = users.findIndex((u) => u._id === this._id);
    if (idx >= 0) {
      users[idx] = this;
    } else {
      users.push(this);
    }
    return this;
  }
}
