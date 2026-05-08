import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getEffectiveRolePermission } from "@/lib/permissions/effective";
import { canCreateOperationalRecords } from "@/lib/permissions/workspace";
import { createClient } from "@/lib/supabase/server";
import { getActiveWorkspace } from "@/lib/tenant/getActiveWorkspace";
import { createLeadSchema } from "@/lib/validation/leads";
import type { ApiResponse } from "@/types/api";

type LeadResponse = {
  client_id: string | null;
  created_at: string;
  estimated_value: number | string;
  id: string;
  next_follow_up_at: string | null;
  priority: "low" | "normal" | "high" | "urgent";
  source: string | null;
  status: "open" | "won" | "lost";
  title: string;
};

function jsonResponse<T>(body: ApiResponse<T>, status = 200) {
  return NextResponse.json(body, { status });
}

function getStatusForWorkspaceResult(status: "no-user" | "no-workspace" | "error") {
  if (status === "no-user") {
    return 401;
  }

  if (status === "no-workspace") {
    return 403;
  }

  return 500;
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return jsonResponse(
      {
        error: {
          code: "UNAUTHORIZED",
          message: "Sign in to view leads.",
        },
        ok: false,
      },
      401,
    );
  }

  const activeWorkspace = await getActiveWorkspace();

  if (activeWorkspace.status !== "ready") {
    return jsonResponse(
      {
        error: {
          code: "NO_ACTIVE_WORKSPACE",
          message:
            activeWorkspace.error ??
            "No active workspace is available for this account.",
        },
        ok: false,
      },
      getStatusForWorkspaceResult(activeWorkspace.status),
    );
  }

  const { data, error } = await supabase
    .from("leads")
    .select(
      "id,client_id,title,source,estimated_value,priority,status,next_follow_up_at,created_at",
    )
    .eq("workspace_id", activeWorkspace.context.workspace.id)
    .order("created_at", { ascending: false })
    .returns<LeadResponse[]>();

  if (error) {
    return jsonResponse(
      {
        error: {
          code: "LEADS_LOAD_FAILED",
          message: "We could not load leads. Please try again.",
          details: error.message,
        },
        ok: false,
      },
      500,
    );
  }

  return jsonResponse({
    data: data ?? [],
    ok: true,
  });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return jsonResponse(
      {
        error: {
          code: "UNAUTHORIZED",
          message: "Sign in to create leads.",
        },
        ok: false,
      },
      401,
    );
  }

  const activeWorkspace = await getActiveWorkspace();

  if (activeWorkspace.status !== "ready") {
    return jsonResponse(
      {
        error: {
          code: "NO_ACTIVE_WORKSPACE",
          message:
            activeWorkspace.error ??
            "No active workspace is available for this account.",
        },
        ok: false,
      },
      getStatusForWorkspaceResult(activeWorkspace.status),
    );
  }

  const rolePermission = await getEffectiveRolePermission({
    role: activeWorkspace.context.role,
    supabase,
    workspaceId: activeWorkspace.context.workspace.id,
  });

  if (
    !canCreateOperationalRecords(activeWorkspace.context.role) ||
    rolePermission?.can_create_leads === false
  ) {
    return jsonResponse(
      {
        error: {
          code: "LEAD_CREATE_FORBIDDEN",
          message: "Your workspace role cannot create leads.",
        },
        ok: false,
      },
      403,
    );
  }

  try {
    const payload = createLeadSchema.parse(await request.json());
    const workspaceId = activeWorkspace.context.workspace.id;

    let clientId: string | null = null;

    if (payload.client_name) {
      const { data: client, error: clientError } = await supabase
        .from("clients")
        .insert({
          created_by: user.id,
          email: payload.client_email ?? null,
          name: payload.client_name,
          phone: payload.client_phone ?? null,
          source: payload.source,
          updated_by: user.id,
          workspace_id: workspaceId,
        })
        .select("id")
        .single<{ id: string }>();

      if (clientError) {
        return jsonResponse(
          {
            error: {
              code: "CLIENT_CREATE_FAILED",
              message: "We could not create the lead contact. Please try again.",
              details: clientError.message,
            },
            ok: false,
          },
          500,
        );
      }

      clientId = client.id;
    }

    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .insert({
        client_id: clientId,
        created_by: user.id,
        estimated_value: payload.estimated_value,
        next_follow_up_at: payload.next_follow_up_at ?? null,
        notes: payload.notes ?? null,
        priority: payload.priority,
        source: payload.source,
        status: payload.status,
        title: payload.title,
        updated_by: user.id,
        workspace_id: workspaceId,
      })
      .select(
        "id,client_id,title,source,estimated_value,priority,status,next_follow_up_at,created_at",
      )
      .single<LeadResponse>();

    if (leadError) {
      return jsonResponse(
        {
          error: {
            code: "LEAD_CREATE_FAILED",
            message: "We could not create the lead. Please try again.",
            details: leadError.message,
          },
          ok: false,
        },
        500,
      );
    }

    await supabase.from("audit_logs").insert({
      action: "lead.created",
      actor_user_id: user.id,
      entity_id: lead.id,
      entity_type: "lead",
      metadata: {
        title: lead.title,
      },
      workspace_id: workspaceId,
    });

    return jsonResponse(
      {
        data: lead,
        ok: true,
      },
      201,
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonResponse(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Check the lead details and try again.",
            details: error.flatten().fieldErrors,
          },
          ok: false,
        },
        400,
      );
    }

    return jsonResponse(
      {
        error: {
          code: "BAD_REQUEST",
          message: "We could not read the lead details. Please try again.",
        },
        ok: false,
      },
      400,
    );
  }
}
