import { getAccount, getRoles } from "@/lib/api";
import { postLoginPath, resolveRole, roleByName } from "@/lib/admin-permissions";

/** After cookies are set, pick the first route this role is allowed to open. */
export async function resolvePostLoginRedirect(
  requestedNext: string | null,
): Promise<string> {
  try {
    const account = await getAccount();
    let apiPerms: unknown;
    try {
      const rolesRes = await getRoles();
      apiPerms = rolesRes.roles?.find((r) => r.id === account.role_id)?.permissions;
    } catch {
      apiPerms = undefined;
    }
    const role = resolveRole(account.role_name, apiPerms) ?? roleByName(account.role_name);
    return postLoginPath(role?.permissions ?? ["*"], requestedNext);
  } catch {
    return "/admin";
  }
}
