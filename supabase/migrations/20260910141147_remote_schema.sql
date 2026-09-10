create type "public"."debt_type" as enum ('owed_to_me', 'i_owe');


  create table "public"."debts" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "type" public.debt_type not null,
    "counterpart_name" text not null,
    "amount" bigint not null,
    "note" text,
    "due_date" date,
    "settled_at" timestamp with time zone,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."debts" enable row level security;

CREATE UNIQUE INDEX debts_pkey ON public.debts USING btree (id);

CREATE INDEX debts_user_id_idx ON public.debts USING btree (user_id);

alter table "public"."debts" add constraint "debts_pkey" PRIMARY KEY using index "debts_pkey";

alter table "public"."debts" add constraint "debts_amount_check" CHECK ((amount > 0)) not valid;

alter table "public"."debts" validate constraint "debts_amount_check";

alter table "public"."debts" add constraint "debts_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."debts" validate constraint "debts_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$
;

grant delete on table "public"."debts" to "anon";

grant insert on table "public"."debts" to "anon";

grant references on table "public"."debts" to "anon";

grant select on table "public"."debts" to "anon";

grant trigger on table "public"."debts" to "anon";

grant truncate on table "public"."debts" to "anon";

grant update on table "public"."debts" to "anon";

grant delete on table "public"."debts" to "authenticated";

grant insert on table "public"."debts" to "authenticated";

grant references on table "public"."debts" to "authenticated";

grant select on table "public"."debts" to "authenticated";

grant trigger on table "public"."debts" to "authenticated";

grant truncate on table "public"."debts" to "authenticated";

grant update on table "public"."debts" to "authenticated";

grant delete on table "public"."debts" to "service_role";

grant insert on table "public"."debts" to "service_role";

grant references on table "public"."debts" to "service_role";

grant select on table "public"."debts" to "service_role";

grant trigger on table "public"."debts" to "service_role";

grant truncate on table "public"."debts" to "service_role";

grant update on table "public"."debts" to "service_role";


  create policy "Users can delete their own debts"
  on "public"."debts"
  as permissive
  for delete
  to public
using ((auth.uid() = user_id));



  create policy "Users can insert their own debts"
  on "public"."debts"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "Users can update their own debts"
  on "public"."debts"
  as permissive
  for update
  to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));



  create policy "Users can view their own debts"
  on "public"."debts"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));


CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.debts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


