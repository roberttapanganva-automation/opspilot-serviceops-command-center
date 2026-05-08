import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getOwnerAccessContext } from "@/lib/owner/access";
import { uploadBrandingAssetSchema } from "@/lib/validation/branding";
import type { ApiResponse } from "@/types/api";

const bucketName = "workspace-branding";
const allowedTypes = new Set(["image/png", "image/jpeg", "image/webp"]);
const maxSizes = {
  icon: 2 * 1024 * 1024,
  logo: 5 * 1024 * 1024,
};

type UploadResult = {
  assetType: "icon" | "logo";
  path: string;
  publicUrl: string;
};

function jsonResponse<T>(body: ApiResponse<T>, status = 200) {
  return NextResponse.json(body, { status });
}

function sanitizeFileName(fileName: string, type: string) {
  const fallbackExtension =
    type === "image/png" ? "png" : type === "image/webp" ? "webp" : "jpg";
  const sanitized = fileName
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!sanitized) {
    return `asset.${fallbackExtension}`;
  }

  return sanitized.includes(".") ? sanitized : `${sanitized}.${fallbackExtension}`;
}

export async function POST(request: Request) {
  const access = await getOwnerAccessContext();

  if (access.status !== "ready") {
    return jsonResponse(
      {
        error: {
          code: access.error.code,
          message: access.error.message,
        },
        ok: false,
      },
      access.error.status,
    );
  }

  try {
    const formData = await request.formData();
    const payload = uploadBrandingAssetSchema.parse({
      asset_type: formData.get("asset_type"),
    });
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return jsonResponse(
        {
          error: {
            code: "FILE_REQUIRED",
            message: "Choose a PNG, JPG, or WebP file.",
          },
          ok: false,
        },
        400,
      );
    }

    if (!allowedTypes.has(file.type)) {
      return jsonResponse(
        {
          error: {
            code: "UNSUPPORTED_FILE_TYPE",
            message: "Use PNG, JPG, or WebP. SVG uploads are not allowed.",
          },
          ok: false,
        },
        400,
      );
    }

    if (file.size > maxSizes[payload.asset_type]) {
      return jsonResponse(
        {
          error: {
            code: "FILE_TOO_LARGE",
            message:
              payload.asset_type === "icon"
                ? "Icons must be 2MB or smaller."
                : "Logos must be 5MB or smaller.",
          },
          ok: false,
        },
        400,
      );
    }

    const workspaceId = access.activeWorkspace.workspace.id;
    const safeFileName = sanitizeFileName(file.name, file.type);
    const path = `${workspaceId}/${payload.asset_type}/${Date.now()}-${crypto.randomUUID()}-${safeFileName}`;
    const buffer = await file.arrayBuffer();
    const { error } = await access.supabase.storage
      .from(bucketName)
      .upload(path, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      return jsonResponse(
        {
          error: {
            code: "UPLOAD_FAILED",
            message: "We could not upload this branding asset.",
            details: error.message,
          },
          ok: false,
        },
        500,
      );
    }

    const { data } = access.supabase.storage.from(bucketName).getPublicUrl(path);

    return jsonResponse<UploadResult>(
      {
        data: {
          assetType: payload.asset_type,
          path,
          publicUrl: data.publicUrl,
        },
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
            message: "Choose whether this upload is a logo or icon.",
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
          message: "We could not read the upload.",
        },
        ok: false,
      },
      400,
    );
  }
}
