import { useState, type FormEvent } from "react";
import { ArrowRight, CircleAlert, Eye, EyeOff, Lock, User } from "lucide-react";
import { Button } from "./ui/Button";
import { Field, TextInput } from "./ui/Field";

interface LoginFormProps {
  onLogin: (username: string, password: string) => Promise<void>;
  submitLabel: string;
  /** Rendered under the submit button, e.g. a Cancel button. */
  footer?: React.ReactNode;
}

/** Username + password form shared by the login page and the
 * session-expired sheet. */
export default function LoginForm({ onLogin, submitLabel, footer }: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onLogin(username, password);
    } catch {
      setError("Incorrect username or password.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="flex items-center gap-3 rounded-2xl bg-red-50 p-3.5 text-sm font-medium text-red-700" role="alert">
          <CircleAlert className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
          {error}
        </div>
      )}
      <Field label="Username" htmlFor="login-username">
        <TextInput
          id="login-username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          required
          leading={<User className="h-5 w-5" aria-hidden="true" />}
        />
      </Field>
      <Field label="Password" htmlFor="login-password">
        <TextInput
          id="login-password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
          leading={<Lock className="h-5 w-5" aria-hidden="true" />}
          trailing={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="flex h-10 w-10 items-center justify-center rounded-full text-stone-400 hover:bg-stone-100"
            >
              {showPassword ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
            </button>
          }
        />
      </Field>
      <Button
        type="submit"
        size="lg"
        loading={submitting}
        className="mt-2 w-full"
        icon={!submitting && <ArrowRight className="order-last h-5 w-5" aria-hidden="true" />}
      >
        {submitting ? "Signing in…" : submitLabel}
      </Button>
      {footer}
    </form>
  );
}
