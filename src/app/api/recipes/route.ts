
import { NextResponse } from 'next/server';
import { RecipeService } from '@/lib/services/recipe';
import { auth } from '@/auth';

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { expiringItems, otherItems } = await request.json();

    if (!expiringItems && !otherItems) {
      return NextResponse.json({ error: 'No ingredients provided' }, { status: 400 });
    }

    const service = new RecipeService();
    const recipe = await service.generateRecipe(expiringItems || [], otherItems || []);

    return NextResponse.json({ recipe });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
