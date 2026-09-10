"use client";

import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "./ui/button";

const Signout = () => {
  const supabase = createClient();

  const handleSignout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <Button onClick={handleSignout} variant={"destructive"}>
      <LogOut />
      Keluar
    </Button>
  );
};

export default Signout;
