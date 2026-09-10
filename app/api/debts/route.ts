import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Debt } from "@/types";

interface DebtInsert {
  amount: number;
  counterpart_name: string;
  due_date: string;
  note?: string;
  type: Debt["type"];
  user_id: string;
}

/**
 * GET /api/debts
 * Returns user debts, optionally filtered by ?status= and ?type=
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          error:
            "Sesi kamu tidak valid atau sudah berakhir. Silakan login kembali.",
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status")?.toLowerCase();
    const typeParam = searchParams.get("type")?.toLowerCase();

    let query = supabase
      .from("debts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    // Filter by status: 'lunas' / 'settled' vs 'belum' / 'unsettled'
    if (statusParam === "settled" || statusParam === "lunas") {
      query = query.not("settled_at", "is", null);
    } else if (
      statusParam === "unsettled" ||
      statusParam === "belum" ||
      statusParam === "belum_lunas"
    ) {
      query = query.is("settled_at", null);
    }

    // Filter by type: 'owed_to_me' / 'dihutang' vs 'i_owe' / 'hutang'
    if (typeParam === "owed_to_me" || typeParam === "dihutang") {
      query = query.eq("type", "owed_to_me");
    } else if (typeParam === "i_owe" || typeParam === "hutang") {
      query = query.eq("type", "i_owe");
    }

    const { data: debts, error } = await query;

    if (error) {
      console.error("Error fetching debts:", error);
      return NextResponse.json(
        { error: "Gagal mengambil data catatan utang. Silakan coba lagi." },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: debts || [] }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error in GET /api/debts:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan sistem yang tidak terduga." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/debts
 * Creates a new debt entry
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Kamu harus login terlebih dahulu untuk menambah catatan." },
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

    const { type, counterpart_name, amount, due_date, note } = body;

    // Input Validation
    const validTypes: Debt["type"][] = ["owed_to_me", "i_owe"];
    if (!(type && validTypes.includes(type))) {
      return NextResponse.json(
        {
          error:
            'Tipe harus diisi antara "Saya dihutang" (owed_to_me) atau "Saya hutang" (i_owe).',
        },
        { status: 400 }
      );
    }

    if (
      !counterpart_name ||
      typeof counterpart_name !== "string" ||
      counterpart_name.trim() === ""
    ) {
      return NextResponse.json(
        { error: "Nama orang wajib diisi." },
        { status: 400 }
      );
    }

    const parsedAmount = Number(amount);
    if (
      Number.isNaN(parsedAmount) ||
      !Number.isInteger(parsedAmount) ||
      parsedAmount <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Jumlah utang wajib berupa angka bulat positif (dalam Rupiah).",
        },
        { status: 400 }
      );
    }

    if (note && (typeof note !== "string" || note.length > 200)) {
      return NextResponse.json(
        { error: "Catatan tidak boleh melebihi 200 karakter." },
        { status: 400 }
      );
    }

    const insertData: DebtInsert = {
      amount: parsedAmount,
      counterpart_name: counterpart_name.trim(),
      due_date: due_date || new Date().toISOString().split("T")[0],
      note: note ? note.trim() : null,
      type,
      user_id: user.id,
    };

    const { data: newDebt, error } = await supabase
      .from("debts")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("Error creating debt:", error);
      return NextResponse.json(
        { error: "Gagal menyimpan catatan utang baru." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { data: newDebt, message: "Catatan berhasil disimpan." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Unexpected error in POST /api/debts:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan sistem yang tidak terduga." },
      { status: 500 }
    );
  }
}
