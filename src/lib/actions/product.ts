'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { updateDictionary } from './dictionary';

export async function getProducts() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const products = await prisma.product.findMany({
    where: {
      userId: session.user.id,
      isDeleted: false,
      consumedAt: null, // Only show active items
    },
    orderBy: {
      expiryDate: 'asc',
    },
  });

  return products.filter(p => p.quantity !== '0');
}

export async function createProduct(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const name = formData.get('name') as string;
  const quantity = formData.get('quantity') as string;
  const brand = formData.get('brand') as string;
  const expiryDate = new Date(formData.get('expiryDate') as string);
  const purchaseDate = new Date();

  if (!name || !quantity || !expiryDate) {
    throw new Error('Missing required fields');
  }

  let consumedAt = undefined;
  if (quantity === '0') {
    consumedAt = new Date();
  }

  await prisma.product.create({
    data: {
      name,
      quantity,
      brand,
      expiryDate,
      purchaseDate,
      consumedAt,
      userId: session.user.id,
    },
  });

  // Update Dictionary
  await updateDictionary(name, quantity, brand);

  revalidatePath('/');
}

export async function updateProduct(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const quantity = formData.get('quantity') as string;
  const name = formData.get('name') as string;
  const brand = formData.get('brand') as string;

  // We only typically update quantity in "Partial Consume" or generic edit
  // But generic edit might allow dates too.

  const expiryDateStr = formData.get('expiryDate') as string;
  const expiryDate = expiryDateStr ? new Date(expiryDateStr) : undefined;

  let consumedAt = undefined;
  if (quantity === '0') {
    consumedAt = new Date();
  }

  await prisma.product.update({
    where: { id, userId: session.user.id },
    data: {
      name,
      quantity,
      brand,
      expiryDate,
      consumedAt
    }
  });

  revalidatePath('/');
}

export async function openProduct(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  await prisma.product.update({
    where: { id, userId: session.user.id },
    data: {
      openedDate: new Date(),
    }
  });
  revalidatePath('/');
}

export async function consumeProduct(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  await prisma.product.update({
    where: { id, userId: session.user.id },
    data: {
      consumedAt: new Date(),
    }
  });
  revalidatePath('/');
}

export async function deleteProduct(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  await prisma.product.update({
    where: { id, userId: session.user.id },
    data: {
      isDeleted: true,
    }
  });
  revalidatePath('/');
}
