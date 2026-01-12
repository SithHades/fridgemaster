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
    const [error, setError] = useState<string | null>(null);
    const [credits, setCredits] = useState<number | null>(null);

    const handleGenerate = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/recipes', {
                method: 'POST',
                body: JSON.stringify({ expiringItems, otherItems }),
            });

            const data = await res.json();

            if (!res.ok) {
                if (res.status === 402) {
                    setError("You don't have enough credits to generate a recipe. Please contact support or wait for top-up.");
                } else {
                    setError(data.error || "Failed to generate recipe. Please try again.");
                }
                return;
            }

            if (data.recipe) {
                setRecipe(data.recipe);
                if (data.credits !== undefined) {
                    setCredits(data.credits);
                }
            }
        } catch (e) {
            console.error(e);
            setError("An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) {
                // Optional: reset state on close if desired, but keeping recipe might be nice
            }
        }}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 px-3 sm:px-4">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span className="hidden sm:inline">Generate Recipe</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex justify-between items-center pr-8">
                        <span>AI Chef</span>
                        {credits !== null && <span className="text-sm font-normal text-muted-foreground mr-4">Credits: {credits}</span>}
                    </DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-hidden flex flex-col gap-4">
                    {!recipe ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-4">
                            {error ? (
                                <div className="p-4 bg-red-50 text-red-600 rounded-md max-w-sm">
                                    <p className="font-medium">Error</p>
                                    <p className="text-sm">{error}</p>
                                </div>
                            ) : (
                                <p className="text-gray-500">
                                    I see {expiringItems.length} items expiring soon.
                                    I can also use your {otherItems.length} other items if needed.
                                    Should I come up with a recipe idea?
                                </p>
                            )}

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
