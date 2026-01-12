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
    brand: string | null;
    quantity: string;
    expiryDate: Date;
    openedDate: Date | null;
}

export function ProductCard({ product }: { product: Product }) {
    const status = getExpiryStatus(new Date(product.expiryDate));
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isConsumeOpen, setIsConsumeOpen] = useState(false);

    // Edit state
    const [editName, setEditName] = useState(product.name);
    const [editBrand, setEditBrand] = useState(product.brand || '');
    const [editQty, setEditQty] = useState(product.quantity);

    // Consume state (for partial updates)
    const [consumeQty, setConsumeQty] = useState(product.quantity);

    const handleOpen = async () => {
        await openProduct(product.id);
    };

    const handleConsumeFull = async () => {
        await consumeProduct(product.id);
        setIsConsumeOpen(false);
    };

    const handlePartialConsume = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('quantity', consumeQty);
        formData.append('name', product.name);
        // We preserve name and brand during consumption update, relying on server or passing them if needed. 
        // The server updateProduct expects name/brand too or it might overwrite with null if we don't handle it.
        // Let's ensure we pass existing values.
        if (product.brand) formData.append('brand', product.brand);

        await updateProduct(product.id, formData);
        setIsConsumeOpen(false);
    };

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this item?')) {
            await deleteProduct(product.id);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', editName);
        formData.append('brand', editBrand);
        formData.append('quantity', editQty);

        await updateProduct(product.id, formData);
        setIsEditOpen(false);
    };

    return (
        <Card className={`border-l-4 shadow-sm ${getExpiryColor(status).replace('bg-', 'border-l-')}`}>
            <CardContent className="p-4">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg">{product.name}</h3>
                            {product.brand && <span className="text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-600 font-medium">{product.brand}</span>}
                        </div>
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

                <div className="mt-4 flex gap-2 justify-between items-center">
                    <div className="flex gap-2">
                        {!product.openedDate ? (
                            <Button size="sm" variant="outline" onClick={handleOpen}>
                                Open
                            </Button>
                        ) : (
                            <Button size="sm" variant="secondary" onClick={() => setIsConsumeOpen(true)}>
                                <Utensils className="w-4 h-4 mr-2" /> Consume
                            </Button>
                        )}
                    </div>

                    <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => setIsEditOpen(true)} title="Edit">
                            <Edit2 className="w-4 h-4 text-gray-500" />
                        </Button>
                        <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={handleDelete} title="Delete">
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>

            {/* Consume Dialog */}
            <Dialog open={isConsumeOpen} onOpenChange={setIsConsumeOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Consume {product.name}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleConsumeFull}>
                            Consumed it all
                        </Button>
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">Or ate some</span>
                            </div>
                        </div>
                        <form onSubmit={handlePartialConsume} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="consumeQty">Remaining Quantity</Label>
                                <Input
                                    id="consumeQty"
                                    value={consumeQty}
                                    onChange={(e) => setConsumeQty(e.target.value)}
                                />
                            </div>
                            <DialogFooter>
                                <Button type="submit">Update Remaining</Button>
                            </DialogFooter>
                        </form>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Details</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdate} className="space-y-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="brand">Brand</Label>
                            <Input
                                id="brand"
                                value={editBrand}
                                onChange={(e) => setEditBrand(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="qty">Quantity</Label>
                            <Input
                                id="qty"
                                value={editQty}
                                onChange={(e) => setEditQty(e.target.value)}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="submit">Save Changes</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
