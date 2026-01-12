import { getProducts } from '@/lib/actions/product';
import { ProductCard } from '@/components/product-card';
import { AddProductButton } from '@/components/add-product-button';
import { RecipeGenerator } from '@/components/recipe-generator';
import { signOut } from '@/auth';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { isBefore, addDays } from 'date-fns';

export default async function Dashboard() {
  const products = await getProducts();
  
  // Filter for items expiring within 48 hours for the recipe generator
  const now = new Date();
  const next48h = addDays(now, 2);
  const expiringItems = products
    .filter(p => isBefore(p.expiryDate, next48h))
    .map(p => p.name);

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">FridgeMaster</h1>
          <div className="flex items-center gap-2">
             <RecipeGenerator expiringItems={expiringItems} />
             <form action={async () => {
                'use server';
                await signOut();
             }}>
                <Button variant="ghost" size="icon" title="Sign Out">
                    <LogOut className="w-5 h-5" />
                </Button>
             </form>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex flex-col gap-6">
            {/* Search Bar could go here */}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.length > 0 ? (
                    products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))
                ) : (
                    <div className="col-span-full text-center py-12 text-gray-400">
                        <p>Your fridge is empty!</p>
                        <p className="text-sm">Add some items to get started.</p>
                    </div>
                )}
            </div>
        </div>
      </main>

      <AddProductButton />
    </div>
  );
}
