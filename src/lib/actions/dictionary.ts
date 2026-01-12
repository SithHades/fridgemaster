'use server';

import { prisma } from '@/lib/prisma';

// Update signature to include brand
export async function updateDictionary(name: string, defaultQty: string, brand: string = "") {
    await prisma.dictionary.upsert({
        where: {
            name_brand: {
                name: name,
                brand: brand
            }
        },
        update: { defaultQty },
        create: {
            name: name,
            brand: brand,
            defaultQty
        }
    });
}

export async function searchDictionary(query: string) {
    if (!query) return [];

    const results = await prisma.dictionary.findMany({
        where: {
            OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { brand: { contains: query, mode: 'insensitive' } }
            ]
        },
        take: 5
    });
    return results;
}

export async function getDictionaryItems() {
    return await prisma.dictionary.findMany({
        orderBy: { name: 'asc' }
    });
}

export async function deleteDictionaryItem(id: string) {
    await prisma.dictionary.delete({
        where: { id }
    });
}

export async function updateDictionaryItem(id: string, name: string, brand: string, defaultQty: string) {
    await prisma.dictionary.update({
        where: { id },
        data: { name, brand, defaultQty }
    });
}
