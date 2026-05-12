"use server";

import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { revalidatePath } from "next/cache";

export async function deleteProductAction(
  store: string,
  productId: string
) {
  await connectDB();

  await Product.findByIdAndUpdate(productId, {
    active: false,
  });

  revalidatePath(`/${store}/admin/productos`);
}