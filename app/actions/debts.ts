"use server";

import { refresh, revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Debt, DebtInsert, DebtUpdate } from "@/types";

export async function createDebtAction(_: unknown, formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Sesi kamu telah berakhir. Silakan login kembali." };
  }

  const type = formData.get("type") as unknown as Debt["type"];
  const counterpart_name = (formData.get("counterpart_name") as string).trim();
  const amountStr = formData.get("amount") as string;
  const due_date = formData.get("due_date") as string;
  const note = (formData.get("note") as string).trim();

  // Validations
  if (!type) {
    return { error: "Pilih tipe catatan (Saya dihutang atau Saya hutang)." };
  }

  if (!counterpart_name) {
    return { error: "Nama orang wajib diisi." };
  }

  const amount = Number(amountStr);
  if (Number.isNaN(amount) || !Number.isInteger(amount) || amount <= 0) {
    return { error: "Jumlah utang harus berupa angka bulat positif (Rupiah)." };
  }

  if (note && note.length > 200) {
    return { error: "Catatan maksimal 200 karakter." };
  }

  const insertData: DebtInsert = {
    amount,
    counterpart_name,
    due_date: due_date || new Date().toISOString().split("T")[0],
    note: note || null,
    type,
    user_id: user.id,
  };

  const { error } = await supabase.from("debts").insert(insertData);

  if (error) {
    console.error("Create debt error:", error);
    return { error: "Gagal menyimpan catatan utang." };
  }

  revalidatePath("/");
  return { success: true };
}

export async function updateDebtAction(_: unknown, formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Sesi kamu telah berakhir. Silakan login kembali." };
  }

  const id = formData.get("id") as string;
  const type = formData.get("type") as unknown as Debt["type"];
  const counterpart_name = (formData.get("counterpart_name") as string).trim();
  const amountStr = formData.get("amount") as string;
  const due_date = formData.get("due_date") as string;
  const note = (formData.get("note") as string).trim();

  if (!counterpart_name) {
    return { error: "Nama orang wajib diisi." };
  }

  const amount = Number(amountStr);
  if (Number.isNaN(amount) || !Number.isInteger(amount) || amount <= 0) {
    return { error: "Jumlah utang harus berupa angka positif." };
  }

  if (note && note.length > 200) {
    return { error: "Catatan maksimal 200 karakter." };
  }

  const updateData: DebtUpdate = {
    amount,
    counterpart_name,
    due_date: due_date || null,
    note: note || null,
    type: type || "owed_to_me",
  };

  const { error } = await supabase
    .from("debts")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Update debt error:", error);
    return { error: "Gagal memperbarui catatan utang." };
  }

  revalidatePath("/dashboard");
  refresh();
  return { success: true };
}

export async function toggleSettleDebtAction(_: unknown, id: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Sesi kamu telah berakhir. Silakan login kembali." };
  }

  // Fetch current debt to toggle status
  const { data: existingDebt, error: fetchError } = await supabase
    .from("debts")
    .select("settled_at")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !existingDebt) {
    return { error: "Catatan utang tidak ditemukan." };
  }

  const currentSettledAt = existingDebt.settled_at;
  const newSettledAt = currentSettledAt ? null : new Date().toISOString();

  const updateData: DebtUpdate = { settled_at: newSettledAt };

  const { error } = await supabase
    .from("debts")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Toggle settle debt error:", error);
    return { error: "Gagal mengubah status lunas." };
  }

  revalidatePath("/dashboard");
  refresh();
  return { success: true };
}

export async function deleteDebtAction(_: unknown, id: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Sesi kamu telah berakhir. Silakan login kembali." };
  }

  const { error } = await supabase
    .from("debts")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Delete debt error:", error);
    return { error: "Gagal menghapus catatan." };
  }

  refresh();
  return { success: true };
}
