"use client";

import { PlusIcon, RefreshCwIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { createDebtAction } from "@/app/actions/debts";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Field, FieldGroup, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Spinner } from "./ui/spinner";
import { Textarea } from "./ui/textarea";

const Toolbar = () => {
  const router = useRouter();

  function handleClick() {
    router.refresh();
  }

  const [state, formAction, isPending] = useActionState(createDebtAction, null);

  return (
    <div className="mb-12 flex justify-end gap-2">
      <Button onClick={handleClick} variant="outline">
        <RefreshCwIcon />
      </Button>
      <Dialog>
        <DialogTrigger render={<Button />}>
          <PlusIcon />
          Buat Kasbon
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Buat Kasbon</DialogTitle>
          <DialogDescription>
            Silakan isi detail kasbon baru Anda.
          </DialogDescription>
          <form action={formAction}>
            <FieldGroup>
              <Field>
                <Select name="type">
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tipe kasbon" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owed_to_me">Hutang</SelectItem>
                    <SelectItem value="i_owe">Piutang</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Rekanan</FieldLabel>
                <Input name="counterpart_name" placeholder="Nama rekanan" />
              </Field>
              <Field>
                <FieldLabel>Jumlah</FieldLabel>
                <Input
                  name="amount"
                  placeholder="Jumlah kasbon"
                  type="number"
                />
              </Field>
              <Field>
                <FieldLabel>Catatan</FieldLabel>
                <Textarea name="note" placeholder="Catatan tambahan" />
              </Field>
              <Field>
                <FieldLabel>Tanggal Jatuh Tempo</FieldLabel>
                <Input name="due_date" type="date" />
              </Field>
            </FieldGroup>

            <DialogFooter>
              <Button
                className="mt-6 w-full"
                disabled={isPending}
                type="submit"
              >
                {isPending ? <Spinner /> : null}
                {isPending ? "Membuat..." : "Buat"}
              </Button>
              <p aria-live="polite" className="sr-only" role="status">
                {state?.error}
              </p>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Toolbar;
