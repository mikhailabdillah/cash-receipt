import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Debt } from "@/types";

interface DebtUpdate {
  amount?: number;
  counterpart_name?: string;
  created_at?: string;
  due_date?: string | null;
  id?: string;
  note?: string | null;
  settled_at?: string | null;
  type?: "owed_to_me" | "i_owe";
  updated_at?: string;
  user_id?: string;
}

interface Context {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/debts/[id]
 * Updates debt entry or toggles/sets settlement status
 */

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <patch db>
export async function PATCH(request: NextRequest, context: Context) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json(
        { error: "ID catatan tidak valid." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Kamu harus login untuk mengubah data ini." },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Format data JSON tidak valid." },
        { status: 400 }
      );
    }

    // Verify row exists and belongs to user
    const { data: existingDebt, error: fetchError } = await supabase
      .from("debts")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existingDebt) {
      return NextResponse.json(
        {
          error:
            "Catatan utang tidak ditemukan atau kamu tidak memiliki akses.",
        },
        { status: 404 }
      );
    }

    const updatePayload: DebtUpdate = {};

    if (body.type !== undefined) {
      const validTypes: Debt["type"][] = ["owed_to_me", "i_owe"];
      if (!validTypes.includes(body.type as Debt["type"])) {
        return NextResponse.json(
          { error: "Tipe utang tidak valid." },
          { status: 400 }
        );
      }
      updatePayload.type = body.type;
    }

    if (body.counterpart_name !== undefined) {
      if (
        typeof body.counterpart_name !== "string" ||
        body.counterpart_name.trim() === ""
      ) {
        return NextResponse.json(
          { error: "Nama orang wajib diisi." },
          { status: 400 }
        );
      }
      updatePayload.counterpart_name = body.counterpart_name.trim();
    }

    if (body.amount !== undefined) {
      const parsedAmount = Number(body.amount);
      if (
        Number.isNaN(parsedAmount) ||
        !Number.isInteger(parsedAmount) ||
        parsedAmount <= 0
      ) {
        return NextResponse.json(
          { error: "Jumlah utang wajib berupa angka bulat positif." },
          { status: 400 }
        );
      }
      updatePayload.amount = parsedAmount;
    }

    if (body.due_date !== undefined) {
      updatePayload.due_date = body.due_date ? String(body.due_date) : null;
    }

    if (body.note !== undefined) {
      if (
        body.note &&
        (typeof body.note !== "string" || body.note.length > 200)
      ) {
        return NextResponse.json(
          { error: "Catatan tidak boleh melebihi 200 karakter." },
          { status: 400 }
        );
      }
      updatePayload.note = body.note ? String(body.note).trim() : null;
    }

    // Toggle or update settled_at status
    if (body.toggle_settled !== undefined) {
      updatePayload.settled_at = existingDebt.settled_at
        ? null
        : new Date().toISOString();
    } else if (body.settled_at !== undefined) {
      updatePayload.settled_at = body.settled_at
        ? new Date(body.settled_at).toISOString()
        : null;
    }

    const { data: updatedDebt, error: updateError } = await supabase
      .from("debts")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating debt:", updateError);
      return NextResponse.json(
        { error: "Gagal memperbarui catatan utang." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { data: updatedDebt, message: "Catatan berhasil diperbarui." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Unexpected error in PATCH /api/debts/[id]:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan sistem yang tidak terduga." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/debts/[id]
 * Deletes a debt entry
 */
export async function DELETE(_request: NextRequest, context: Context) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json(
        { error: "ID catatan tidak valid." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Kamu harus login terlebih dahulu." },
        { status: 401 }
      );
    }

    // Verify row exists & belongs to user
    const { data: existingDebt, error: fetchError } = await supabase
      .from("debts")
      .select("id")
      .eq("id", id)
      .single();

    if (fetchError || !existingDebt) {
      return NextResponse.json(
        {
          error:
            "Catatan utang tidak ditemukan atau kamu tidak memiliki akses.",
        },
        { status: 404 }
      );
    }

    const { error: deleteError } = await supabase
      .from("debts")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Error deleting debt:", deleteError);
      return NextResponse.json(
        { error: "Gagal menghapus catatan utang." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Catatan berhasil dihapus." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Unexpected error in DELETE /api/debts/[id]:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan sistem yang tidak terduga." },
      { status: 500 }
    );
  }
}
