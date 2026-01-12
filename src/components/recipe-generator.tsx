'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';


// Need a simple markdown renderer, but to keep dependencies low we might just display text or simple HTML.
// Actually, standard text with whitespace-pre-wrap might be enough for MVP if no markdown lib.
// But plan didn't specify adding react-markdown. I will try to use simple whitespace handling first or install if needed.
// Update: I will just use whitespace-pre-line and some simple formatting for now to save installing more packages unless requested.

export function RecipeGenerator({ expiringItems, otherItems }: { expiringItems: string[], otherItems: string[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [recipe, setRecipe] = useState<string | null>(null);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/recipes', {
                method: 'POST',
                body: JSON.stringify({ expiringItems, otherItems }),
            });
            const data = await res.json();
            if (data.recipe) {
                setRecipe(data.recipe);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 px-3 sm:px-4">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span className="hidden sm:inline">Generate Recipe</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>AI Chef</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-hidden flex flex-col gap-4">
                    {!recipe ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-4">
                            <p className="text-gray-500">
                                I see {expiringItems.length} items expiring soon.
                                I can also use your {otherItems.length} other items if needed.
                                Should I come up with a recipe idea?
                            </p>
                            <Button onClick={handleGenerate} disabled={loading || (expiringItems.length === 0 && otherItems.length === 0)} className="bg-purple-600 hover:bg-purple-700">
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Generate Ideas
                            </Button>
                        </div>
                    ) : (
                        <ScrollArea className="h-full w-full rounded-md border p-4 bg-gray-50">
                            <div className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                                {recipe}
                            </div>
                        </ScrollArea>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
