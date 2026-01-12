'use client';

import { useState } from 'react';
import { updateDictionaryItem, deleteDictionaryItem } from '@/lib/actions/dictionary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Pencil, Check, X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

type DictionaryItem = {
    id: string;
    name: string;
    brand: string | null;
    defaultQty: string | null;
};

export function DictionaryList({ initialItems }: { initialItems: DictionaryItem[] }) {
    const router = useRouter();
    const [items, setItems] = useState(initialItems);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ name: '', brand: '', defaultQty: '' });
    const [isLoading, setIsLoading] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return;
        setIsLoading(id);
        await deleteDictionaryItem(id);
        setItems(items.filter(i => i.id !== id));
        setIsLoading(null);
        router.refresh();
    };

    const startEdit = (item: DictionaryItem) => {
        setEditingId(item.id);
        setEditForm({ name: item.name, brand: item.brand || '', defaultQty: item.defaultQty || '' });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm({ name: '', brand: '', defaultQty: '' });
    };

    const saveEdit = async (id: string) => {
        setIsLoading(id);
        await updateDictionaryItem(id, editForm.name, editForm.brand, editForm.defaultQty);
        setItems(items.map(i => i.id === id ? { ...i, name: editForm.name, brand: editForm.brand, defaultQty: editForm.defaultQty } : i));
        setIsLoading(null);
        setEditingId(null);
        router.refresh();
    };

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            {items.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                    No items in dictionary yet.
                </div>
            ) : (
                <div className="divide-y divide-gray-200">
                    {items.map((item) => (
                        <div key={item.id} className="p-4 flex items-center justify-between gap-4">
                            {editingId === item.id ? (
                                <div className="flex-1 flex items-center gap-2 flex-wrap">
                                    <Input
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        className="w-[120px] sm:w-[150px]"
                                        placeholder="Name"
                                    />
                                    <Input
                                        value={editForm.brand}
                                        onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })}
                                        className="w-[100px] sm:w-[120px]"
                                        placeholder="Brand"
                                    />
                                    <Input
                                        value={editForm.defaultQty}
                                        onChange={(e) => setEditForm({ ...editForm, defaultQty: e.target.value })}
                                        className="w-[80px] sm:w-[100px]"
                                        placeholder="Qty"
                                    />
                                    <Button size="icon" variant="ghost" onClick={() => saveEdit(item.id)} disabled={!!isLoading}>
                                        {isLoading === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 text-green-600" />}
                                    </Button>
                                    <Button size="icon" variant="ghost" onClick={cancelEdit} disabled={!!isLoading}>
                                        <X className="w-4 h-4 text-gray-500" />
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-medium text-gray-900">{item.name}</h3>
                                            {item.brand && <span className="text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-600 font-medium">{item.brand}</span>}
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">{item.defaultQty || 'No default qty'}</p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button size="icon" variant="ghost" onClick={() => startEdit(item)}>
                                            <Pencil className="w-4 h-4 text-gray-400" />
                                        </Button>
                                        <Button size="icon" variant="ghost" onClick={() => handleDelete(item.id)} disabled={!!isLoading}>
                                            {isLoading === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 text-red-500" />}
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
