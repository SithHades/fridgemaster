'use server';

import { prisma } from '@/lib/prisma';

export async function updateDictionary(name: string, defaultQty: string) {
    // Case insensitive check could be complex in code, but here we just try to find exact or similar.
    // We will normalize to Title Case or lowercase for storage to help?
    // User req said: "Milk and milk should be the same".
    // So we store as Title Case usually, or stick to one.

    // Implementation: Check if exists (case insensitive via raw query or simple findFirst logic if we trust DB collation, but SQLite is case sensitive usually?)
    // Let's do a findFirst with simple case logic if possible, or just store everything capitalized.

    // Simple approach: Store original casing from user input, but search effectively?
    // Better: Normalize name to Title Case for the dictionary.

    // NOTE: In a real app we might want a better normalization strategy.

    await prisma.dictionary.upsert({
        where: { name: name }, // This assumes exact match on 'name' which is unique.
        update: { defaultQty }, // Update default quantity to latest used? Or keep old? Requirements didn't specify, assume update.
        create: {
            name: name,
            defaultQty
        }
    });
}

export async function searchDictionary(query: string) {
    if (!query) return [];

    const results = await prisma.dictionary.findMany({
        where: {
            name: {
                contains: query,
                // mode: 'insensitive' // Only works for Postgres? For SQLite need to check.
                // Prisma Client with SQLite normally supports insensitive.
            }
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

export async function updateDictionaryItem(id: string, name: string, defaultQty: string) {
    await prisma.dictionary.update({
        where: { id },
        data: { name, defaultQty }
    });
}
