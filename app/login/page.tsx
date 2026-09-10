import { login, signup } from "./actions";

export default function LoginPage() {
  return (
    <form>
      <label htmlFor="email">Email:</label>
      <input id="email" name="email" required type="email" />
      <label htmlFor="password">Password:</label>
      <input id="password" name="password" required type="password" />
      <button formAction={login} type="submit">
        Log in
      </button>
      <button formAction={signup} type="submit">
        Sign up
      </button>
    </form>
  );
}
