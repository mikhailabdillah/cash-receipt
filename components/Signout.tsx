"use client";

import { LogOut } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "./ui/button";

const Signout = () => {
  const supabase = createClient();

  const handleSignout = async () => {
    await supabase.auth.signOut();
    redirect("/login");
  };

  return (
    <Button onClick={handleSignout} variant={"destructive"}>
      <LogOut />
      Keluar
    </Button>
  );
};

export default Signout;
