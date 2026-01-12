'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { createProduct } from '@/lib/actions/product';
import { searchDictionary } from '@/lib/actions/dictionary';
import { Plus, Loader2 } from 'lucide-react';
import { addDays, format } from 'date-fns';

export function AddProductButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<{ name: string, defaultQty: string | null }[]>([]);

    // Form state
    const [name, setName] = useState('');
    const [quantity, setQuantity] = useState('');

    // Debounced search could be implemented, for now simple onChange
    const handleNameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setName(val);
        if (val.length > 1) {
            const results = await searchDictionary(val);
            setSuggestions(results);
        } else {
            setSuggestions([]);
        }
    };

    const selectSuggestion = (s: { name: string, defaultQty: string | null }) => {
        setName(s.name);
        if (s.defaultQty) setQuantity(s.defaultQty);
        setSuggestions([]);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);
        await createProduct(formData);
        setIsLoading(false);
        setIsOpen(false);
        setName('');
        setQuantity('');
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="rounded-full shadow-lg w-12 h-12 p-0 fixed bottom-6 right-6 md:static md:w-auto md:h-10 md:px-4 md:rounded-md">
                    <Plus className="w-6 h-6 md:mr-2 md:w-4 md:h-4" />
                    <span className="hidden md:inline">Add Item</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Item</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2 relative">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            name="name"
                            value={name}
                            onChange={handleNameChange}
                            required
                            autoComplete="off"
                        />
                        {suggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 z-10 bg-white border rounded-md shadow-lg mt-1 max-h-40 overflow-auto">
                                {suggestions.map((s) => (
                                    <button
                                        key={s.name}
                                        type="button"
                                        className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                                        onClick={() => selectSuggestion(s)}
                                    >
                                        <span className="font-medium">{s.name}</span>
                                        {s.defaultQty && <span className="text-gray-400 ml-2 text-xs">({s.defaultQty})</span>}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input
                            id="quantity"
                            name="quantity"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            placeholder="e.g. 500ml, 2 packs"
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="expiryDate">Expiry Date</Label>
                        <Input
                            id="expiryDate"
                            name="expiryDate"
                            type="date"
                            required
                            defaultValue={format(addDays(new Date(), 10), 'yyyy-MM-dd')}
                        />
                    </div>

                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Item
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
