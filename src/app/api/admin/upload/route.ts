import { NextRequest, NextResponse } from "next/server";
import { cloudinary } from "@/lib/cloudinary";
import { requireTenantAdmin } from "@/lib/adminAuth";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

type CloudinaryUploadResult = {
  secure_url: string;
  public_id: string;
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const store = String(formData.get("store") || "").trim();
    const file = formData.get("file");

    if (!store) {
      return NextResponse.json({ error: "Falta store" }, { status: 400 });
    }

    await requireTenantAdmin(store);

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Archivo inválido" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "La imagen no puede superar los 5MB" },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Solo se permiten imágenes" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;

    const upload = (await cloudinary.uploader.upload(dataUri, {
      folder: `ecommerce-multi-tenant/${store}`,
      resource_type: "image",
    })) as CloudinaryUploadResult;

    return NextResponse.json({
      ok: true,
      url: upload.secure_url,
      publicId: upload.public_id,
    });
  } catch (error) {
    console.error("UPLOAD ERROR:", error);

    return NextResponse.json(
      { error: "No se pudo subir la imagen" },
      { status: 500 }
    );
  }
}