import { LockKeyhole } from "lucide-react";
import LoginForm from "./LoginForm";
import { BottomSheet } from "./ui/BottomSheet";
import { Button } from "./ui/Button";

interface SessionExpiredModalProps {
  onLogin: (username: string, password: string) => Promise<void>;
  onCancel: () => void;
}

/** Shown in place of silently-failing requests when the admin's token has
 * expired or been revoked — lets them log back in without losing whatever
 * admin page they were on (the page underneath stays mounted; see
 * RequireAuth in AuthContext). */
export default function SessionExpiredModal({ onLogin, onCancel }: SessionExpiredModalProps) {
  return (
    <BottomSheet open onClose={onCancel} dismissible={false}>
      <div className="font-admin">
        <div className="mb-5 flex items-start gap-4">
          <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600">
            <LockKeyhole className="h-6 w-6" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-display text-2xl font-semibold text-stone-900">Session expired</h2>
            <p className="mt-1 text-sm text-stone-500">
              Sign in again to continue — the page you were on is still here.
            </p>
          </div>
        </div>
        <LoginForm
          onLogin={onLogin}
          submitLabel="Sign in & continue"
          footer={
            <Button variant="secondary" size="lg" className="w-full" onClick={onCancel}>
              Cancel
            </Button>
          }
        />
      </div>
    </BottomSheet>
  );
}
