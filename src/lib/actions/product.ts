'use server';

import { PrismaClient } from '@prisma/client';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { updateDictionary } from './dictionary';
import { redirect } from 'next/navigation';

const prisma = new PrismaClient();

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

  return products;
}

export async function createProduct(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const name = formData.get('name') as string;
  const quantity = formData.get('quantity') as string;
  const expiryDate = new Date(formData.get('expiryDate') as string);
  const purchaseDate = new Date();
  const barcode = formData.get('barcode') as string | null;

  if (!name || !quantity || !expiryDate) {
      throw new Error('Missing required fields');
  }

  await prisma.product.create({
    data: {
      name,
      quantity,
      expiryDate,
      purchaseDate,
      barcode,
      userId: session.user.id,
    },
  });

  // Update Dictionary
  await updateDictionary(name, quantity);

  revalidatePath('/');
  redirect('/');
}

export async function updateProduct(id: string, formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');

    const quantity = formData.get('quantity') as string;
    const name = formData.get('name') as string; // Allow renaming?
    
    // We only typically update quantity in "Partial Consume" or generic edit
    // But generic edit might allow dates too.
    
    const expiryDateStr = formData.get('expiryDate') as string;
    const expiryDate = expiryDateStr ? new Date(expiryDateStr) : undefined;

    await prisma.product.update({
        where: { id, userId: session.user.id },
        data: {
            name,
            quantity,
            expiryDate
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
