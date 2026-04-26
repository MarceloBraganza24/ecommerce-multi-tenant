import { Product } from "@/models/Product";
import type { OrderItem } from "@/types/store";

export async function reserveStock(items: OrderItem[]) {
  const reserved: OrderItem[] = [];

  try {
    for (const item of items) {
      if (item.variantSku) {
        const result = await Product.updateOne(
          {
            _id: item.productId,
            "variants.sku": item.variantSku,
            "variants.stock": { $gte: item.quantity },
            active: true,
          },
          {
            $inc: {
              "variants.$.stock": -item.quantity,
              stock: -item.quantity,
            },
          }
        );

        if (result.modifiedCount !== 1) {
          throw new Error(`Stock insuficiente para ${item.title}`);
        }
      } else {
        const result = await Product.updateOne(
          {
            _id: item.productId,
            stock: { $gte: item.quantity },
            active: true,
          },
          {
            $inc: {
              stock: -item.quantity,
            },
          }
        );

        if (result.modifiedCount !== 1) {
          throw new Error(`Stock insuficiente para ${item.title}`);
        }
      }

      reserved.push(item);
    }
  } catch (error) {
    await releaseStock(reserved);
    throw error;
  }
}

export async function releaseStock(items: OrderItem[]) {
  for (const item of items) {
    if (item.variantSku) {
      await Product.updateOne(
        {
          _id: item.productId,
          "variants.sku": item.variantSku,
        },
        {
          $inc: {
            "variants.$.stock": item.quantity,
            stock: item.quantity,
          },
        }
      );
    } else {
      await Product.updateOne(
        { _id: item.productId },
        {
          $inc: {
            stock: item.quantity,
          },
        }
      );
    }
  }
}