import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/src/lib/api-auth";
import { JWTPayload } from "@/src/lib/auth";
import { verifySameOrigin } from "@/src/lib/csrf";

type Role = "BUYER" | "SELLER" | "ADMIN";

export function withAuth(
  handler: (
    req: NextRequest,
    user: JWTPayload,
    ...args: unknown[]
  ) => Promise<NextResponse>,
  allowedRoles?: Role[],
) {
  return async (req: NextRequest, ...args: unknown[]) => {
    if (
      ["POST", "PATCH", "PUT", "DELETE"].includes(req.method) &&
      !verifySameOrigin(req)
    ) {
      return NextResponse.json({ message: "Invalid origin" }, { status: 403 });
    }
    const user = await getAuthUser(req);
    if (!user)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (allowedRoles && !allowedRoles.includes(user.role as Role))
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    return handler(req, user, ...args);
  };
}
