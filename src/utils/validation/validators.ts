export const emailValidator = (value: string) =>
  /^\S+@\S+$/.test(value) ? null : "Invalid email";

export const passwordValidator = (value: string) =>
  value.length >= 6 ? null : "Password must be at least 6 characters";
