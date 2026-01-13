import { getDictionaryItems } from '@/lib/actions/dictionary';
import { DictionaryList } from '@/components/dictionary-list';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function DictionaryPage() {
    const items = await getDictionaryItems();

    return (
        <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link href="/">
                            <Button variant="ghost" size="icon">
                                <ChevronLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Dictionary</h1>
                    </div>
                </div>
            </header>
            <main className="max-w-4xl mx-auto px-4 py-6">
                <DictionaryList initialItems={items} />
            </main>
        </div>
    );
}
