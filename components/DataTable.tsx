"use client";

import { cn } from "cn";
import { PencilIcon, Trash2Icon } from "lucide-react";
import { useActionState, useCallback, useEffect, useState } from "react";
import {
  deleteDebtAction,
  toggleSettleDebtAction,
  updateDebtAction,
} from "@/app/actions/debts";
import type { Debt } from "@/types";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Textarea } from "./ui/textarea";

const DataTable = ({ initialDebt }: { initialDebt: Debt[] }) => (
  <div>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tipe</TableHead>
          <TableHead>Jumlah</TableHead>
          <TableHead>Rekanan</TableHead>
          <TableHead>Dibuat</TableHead>
          <TableHead>Diperbaharui</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {initialDebt.map((item) => (
          <TableRow key={item.id}>
            <TableCell>
              {item.type === "owed_to_me" ? "Dihutang" : "Hutang Saya"}
            </TableCell>
            <TableCell>
              {Intl.NumberFormat("id-ID", {
                currency: "IDR",
                style: "currency",
              }).format(item.amount)}
            </TableCell>
            <TableCell>{item.counterpart_name}</TableCell>
            <TableCell>
              <time dateTime={item.created_at}>
                {new Date(item.created_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </time>
            </TableCell>
            <TableCell>
              <time dateTime={item.updated_at}>
                {new Date(item.updated_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </time>
            </TableCell>
            <TableCell>
              <ToggleStatus item={item} />
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <EditItem item={item} />
                <DeleteItem id={item.id} />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

const ToggleStatus = ({ item }: { item: Debt }) => {
  const isSettled = !!item.settled_at;

  const [state, formAction, isPending] = useActionState(
    toggleSettleDebtAction,
    null
  );
  const toggleAction = formAction.bind(null, item.id);

  return (
    <form action={toggleAction}>
      <Button
        className={cn(
          isSettled
            ? "bg-green-100 font-bold text-green-700 hover:bg-green-100 dark:bg-green-950 dark:text-green-300"
            : "bg-red-50 text-red-700 hover:bg-red-50 dark:bg-red-950 dark:text-red-300"
        )}
        disabled={isPending}
        size={"xs"}
        type="submit"
      >
        {isPending ? <Spinner data-icon="inline-start" /> : null}
        {isSettled ? "Tandai Belum Lunas" : "Tandai Lunas"}
      </Button>
      <p aria-live="polite" className="sr-only" role="status">
        {state?.error}
      </p>
    </form>
  );
};

const EditItem = ({ item }: { item: Debt }) => {
  const [state, formAction] = useActionState(updateDebtAction, null);
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<Debt["type"] | null>(item.type);
  const [counterpart_name, setCounterpartName] = useState<string>(
    item.counterpart_name
  );
  const [amount, setAmount] = useState<number>(item.amount);
  const [note, setNote] = useState<string | undefined>(item.note);

  useEffect(() => {
    if (state?.success) {
      setOpen(false);
    }
  }, [state?.success]);

  const handleChangeType = useCallback((value: Debt["type"] | null) => {
    setType(value);
  }, []);

  const handleChangeInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      if (name === "counterpart_name") {
        setCounterpartName(value);
      }
      if (name === "amount") {
        setAmount(Number(value));
      }
      if (name === "note") {
        setNote(value);
      }
    },
    []
  );

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger
        render={
          <Button variant="outline">
            <PencilIcon />
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle className={"text-2xl"}>Edit Catatan Utang</DialogTitle>
        </DialogHeader>
        <form action={formAction}>
          <input name="id" type="hidden" value={item.id} />
          <FieldGroup>
            <Field>
              <Select name="type" onValueChange={handleChangeType} value={type}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tipe kasbon" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owed_to_me">Dihutang</SelectItem>
                  <SelectItem value="i_owe">Hutang Saya</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel>Nama Rekanan</FieldLabel>
              <Input
                name="counterpart_name"
                onChange={handleChangeInput}
                required
                type="text"
                value={counterpart_name}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="amount">Jumlah</FieldLabel>
              <Input
                id="amount"
                name="amount"
                onChange={handleChangeInput}
                type="number"
                value={amount}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="note">Catatan</FieldLabel>
              <Textarea
                id="note"
                name="note"
                onChange={handleChangeInput}
                rows={4}
                value={note || ""}
              />
            </Field>
          </FieldGroup>
          <Button className={"mt-6 w-full"} type="submit">
            Simpan
          </Button>
          <p aria-live="polite" className="sr-only" role="status">
            {state?.error}
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const DeleteItem = ({ id }: { id: string }) => {
  const [state, formAction] = useActionState(deleteDebtAction, null);
  const deleteAction = formAction.bind(null, id);

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="destructive">
            <Trash2Icon />
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle className={"text-2xl"}>Hapus Record</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Apakah Anda yakin ingin menghapus item ini?
        </DialogDescription>
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Batal</Button>} />
          <form action={deleteAction}>
            <Button type="submit" variant="destructive">
              Hapus
            </Button>
            <p aria-live="polite" className="sr-only" role="status">
              {state?.error}
            </p>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DataTable;
