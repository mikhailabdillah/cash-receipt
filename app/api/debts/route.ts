import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Debt } from "@/types";

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  // Check auth first — RLS will also enforce this, but failing early
  // gives a clearer error than an empty result set
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // biome-ignore lint/style/useDestructuring: <>
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get("status"); // 'settled' | 'unsettled' | null
  const type = searchParams.get("type"); // 'owed_to_me' | 'i_owe' | null

  // Validate query params before hitting the DB
  const validStatuses = ["settled", "unsettled"];
  const validTypes = ["owed_to_me", "i_owe"];

  if (status && !validStatuses.includes(status)) {
    return NextResponse.json(
      { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
      { status: 400 }
    );
  }

  if (type && !validTypes.includes(type)) {
    return NextResponse.json(
      { error: `Invalid type. Must be one of: ${validTypes.join(", ")}` },
      { status: 400 }
    );
  }

  let query = supabase
    .from("debts")
    .select("*")
    .order("created_at", { ascending: false });

  if (type) {
    query = query.eq("type", type);
  }

  if (status === "settled") {
    query = query.not("settled_at", "is", null);
  } else if (status === "unsettled") {
    query = query.is("settled_at", null);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching debts:", error);
    return NextResponse.json(
      { error: "Failed to fetch debts" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Debt;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { type, counterpart_name, amount, note, due_date } = body;

  // Validation
  const validTypes = ["owed_to_me", "i_owe"];
  if (!(type && validTypes.includes(type))) {
    return NextResponse.json(
      {
        error: `type is required and must be one of: ${validTypes.join(", ")}`,
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
      { error: "counterpart_name is required" },
      { status: 400 }
    );
  }

  if (typeof amount !== "number" || !Number.isInteger(amount) || amount <= 0) {
    return NextResponse.json(
      { error: "amount is required and must be a positive integer" },
      { status: 400 }
    );
  }

  if (due_date && Number.isNaN(Date.parse(due_date))) {
    return NextResponse.json(
      { error: "due_date must be a valid date" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("debts")
    .insert({
      amount,
      counterpart_name: counterpart_name.trim(),
      due_date: due_date ?? null,
      note: note ?? null,
      type,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating debt:", error);
    return NextResponse.json(
      { error: "Failed to create debt" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data }, { status: 201 });
}
