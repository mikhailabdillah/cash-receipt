import { GalleryVerticalEnd } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { login, signup } from "./actions";

export default function LoginPage() {
  return (
    <section className="flex h-screen items-center justify-center">
      <div className="container mx-auto max-w-xl">
        <div className={"flex flex-col gap-6"}>
          <form>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="flex flex-col items-center gap-2 font-medium">
                  <div className="flex size-8 items-center justify-center rounded-md">
                    <GalleryVerticalEnd className="size-6" />
                  </div>
                  <span className="sr-only">Acme Inc.</span>
                </div>
                <h1 className="font-bold text-xl">Welcome to Acme Inc.</h1>
              </div>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  placeholder="m@example.com"
                  required
                  type="email"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input id="password" name="password" required type="password" />
              </Field>
              <Field>
                <Button formAction={login} type="submit">
                  Masuk
                </Button>
              </Field>
              <FieldSeparator>Or</FieldSeparator>
              <Field className="grid">
                <Button formAction={signup} type="submit" variant="outline">
                  Buat Akun
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </div>
      </div>
    </section>
  );
}
