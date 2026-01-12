'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getExpiryStatus, getExpiryColor } from '@/lib/utils';
import { format } from 'date-fns';
import { Edit2, Trash2, Utensils, CheckCircle, AlertCircle } from 'lucide-react';
import { openProduct, consumeProduct, deleteProduct, updateProduct } from '@/lib/actions/product';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Product {
    id: string;
    name: string;
    quantity: string;
    expiryDate: Date;
    openedDate: Date | null;
}

export function ProductCard({ product }: { product: Product }) {
    const status = getExpiryStatus(new Date(product.expiryDate));
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editQty, setEditQty] = useState(product.quantity);

    const handleOpen = async () => {
        await openProduct(product.id);
    };

    const handleConsumeFull = async () => {
        await consumeProduct(product.id);
    };

    const handleDelete = async () => {
        if(confirm('Are you sure you want to delete this item?')) {
            await deleteProduct(product.id);
        }
    };

    const handlePartialUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('quantity', editQty);
        formData.append('name', product.name);
        // Preserve expiry date for now in partial edit, or allow editing it too?
        // Requirements just said "Partial Consume" -> updates quantity.
        await updateProduct(product.id, formData);
        setIsEditOpen(false);
    };

    return (
        <Card className={`border-l-4 shadow-sm ${getExpiryColor(status).replace('bg-', 'border-l-')}`}>
            <CardContent className="p-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-lg">{product.name}</h3>
                        <p className="text-sm text-gray-500">{product.quantity}</p>
                    </div>
                    <Badge variant="outline" className={getExpiryColor(status)}>
                        {status === 'expired' ? 'Expired' : 
                         status === 'warning' ? 'Expiring Soon' : 'Fresh'}
                    </Badge>
                </div>
                
                <div className="mt-2 text-sm space-y-1">
                    <div className="flex items-center gap-2 text-gray-600">
                        <AlertCircle className="w-4 h-4" />
                        <span>Expires: {format(new Date(product.expiryDate), 'MMM d, yyyy')}</span>
                    </div>
                    {product.openedDate && (
                        <div className="flex items-center gap-2 text-blue-600">
                            <CheckCircle className="w-4 h-4" />
                            <span>Opened: {format(new Date(product.openedDate), 'MMM d')}</span>
                        </div>
                    )}
                </div>

                <div className="mt-4 flex gap-2 justify-end">
                    {!product.openedDate && (
                        <Button size="sm" variant="outline" onClick={handleOpen}>
                            Open
                        </Button>
                    )}
                    
                    <Button size="sm" variant="secondary" onClick={() => setIsEditOpen(true)}>
                        <Utensils className="w-4 h-4 mr-1" /> Eat
                    </Button>

                    <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={handleDelete}>
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </CardContent>

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Consume {product.name}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleConsumeFull}>
                            Fully Consumed (Remove)
                        </Button>
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">Or update quantity</span>
                            </div>
                        </div>
                        <form onSubmit={handlePartialUpdate} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="qty">Remaining Quantity</Label>
                                <Input 
                                    id="qty" 
                                    value={editQty} 
                                    onChange={(e) => setEditQty(e.target.value)} 
                                />
                            </div>
                            <DialogFooter>
                                <Button type="submit">Update</Button>
                            </DialogFooter>
                        </form>
                    </div>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
