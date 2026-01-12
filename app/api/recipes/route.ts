
import { NextResponse } from 'next/server';
import { RecipeService } from '@/lib/services/recipe';
import { auth } from '@/auth';

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { ingredients } = await request.json();
    
    if (!ingredients || !Array.isArray(ingredients)) {
        return NextResponse.json({ error: 'Invalid ingredients list' }, { status: 400 });
    }

    const service = new RecipeService();
    const recipe = await service.generateRecipe(ingredients);

    return NextResponse.json({ recipe });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
