import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Debt } from "@/types";

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <patch data>
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

  const { type, counterpart_name, amount, note, due_date, settled_at } = body;

  // Build update object with only provided fields
  const updates: Record<string, unknown> = {};

  if (type !== undefined) {
    const validTypes = ["owed_to_me", "i_owe"];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `type must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }
    updates.type = type;
  }

  if (counterpart_name !== undefined) {
    if (
      typeof counterpart_name !== "string" ||
      counterpart_name.trim() === ""
    ) {
      return NextResponse.json(
        { error: "counterpart_name cannot be empty" },
        { status: 400 }
      );
    }
    updates.counterpart_name = counterpart_name.trim();
  }

  if (amount !== undefined) {
    if (
      typeof amount !== "number" ||
      !Number.isInteger(amount) ||
      amount <= 0
    ) {
      return NextResponse.json(
        { error: "amount must be a positive integer" },
        { status: 400 }
      );
    }
    updates.amount = amount;
  }

  if (note !== undefined) {
    updates.note = note;
  }

  if (due_date !== undefined) {
    if (due_date !== null && Number.isNaN(Date.parse(due_date))) {
      return NextResponse.json(
        { error: "due_date must be a valid date or null" },
        { status: 400 }
      );
    }
    updates.due_date = due_date;
  }

  if (settled_at !== undefined) {
    if (settled_at !== null && Number.isNaN(Date.parse(settled_at))) {
      return NextResponse.json(
        { error: "settled_at must be a valid date or null" },
        { status: 400 }
      );
    }
    updates.settled_at = settled_at;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "No valid fields to update" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("debts")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    // PGRST116 = no rows returned, meaning it didn't exist or wasn't theirs (RLS)
    if (error.code === "PGRST116") {
      return NextResponse.json({ error: "Debt not found" }, { status: 404 });
    }
    console.error("Error updating debt:", error);
    return NextResponse.json(
      { error: "Failed to update debt" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data });
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("debts")
    .delete()
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json({ error: "Debt not found" }, { status: 404 });
    }
    console.error("Error deleting debt:", error);
    return NextResponse.json(
      { error: "Failed to delete debt" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data });
}
