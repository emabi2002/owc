import { redirect } from "next/navigation";

export default function LegacyIntegrationRoute() {
  redirect("/admin/integrations/process");
}
