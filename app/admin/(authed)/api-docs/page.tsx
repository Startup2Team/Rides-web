import { AdminPageHeader } from "../_components";
import { SwaggerView } from "./swagger-view";

export const metadata = {
  title: "Admin · API Docs",
  robots: { index: false, follow: false },
};

export default function AdminApiDocsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Developers"
        title="API Documentation"
        subtitle="Interactive reference for the Rides backend API. Visible to signed-in admins only."
      />
      <SwaggerView />
    </div>
  );
}
