interface Debt {
  amount: number;
  counterpart_name: string;
  created_at: string;
  due_date?: string | null;
  id: string;
  note?: string;
  settled_at?: string | null;
  type: "owed_to_me" | "i_owe";
  updated_at: string;
  user_id: string;
}

interface DebtInsert {
  amount: number;
  counterpart_name: string;
  created_at?: string;
  due_date?: string | null;
  id?: string;
  note?: string | null;
  settled_at?: string | null;
  type: Debt["type"];
  updated_at?: string;
  user_id: string;
}

interface DebtUpdate {
  amount?: number;
  counterpart_name?: string;
  created_at?: string;
  due_date?: string | null;
  id?: string;
  note?: string | null;
  settled_at?: string | null;
  type?: Debt["type"];
  updated_at?: string;
  user_id?: string;
}

export type { Debt, DebtInsert, DebtUpdate };
