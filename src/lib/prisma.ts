import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const getDatabaseUrl = () => {
    let url = process.env.DATABASE_URL;
    if (!url) return undefined;

    if (process.env.DB_SCHEMA) {
        const hasQuery = url.includes('?');
        const schemaParam = `schema=${process.env.DB_SCHEMA}`;
        if (hasQuery) {
            if (!url.includes('schema=')) {
                return `${url}&${schemaParam}`;
            }
             // Simple replace if exists
             return url.replace(/schema=[^&]+/, schemaParam);
        } else {
             return `${url}?${schemaParam}`;
        }
    }
    return url;
}

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: ['query'],
        datasources: {
            db: {
                url: getDatabaseUrl(),
            },
        },
    });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
