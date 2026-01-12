import { auth } from "@/auth"; // Assuming auth is exported from src/auth.ts
import { prisma } from "@/lib/prisma"; // Assuming prisma client is exported from here
import { NextResponse } from "next/server";
import OpenAI from "openai";
import crypto from "crypto";

const openai = new OpenAI({
  apiKey: process.env.OPEN_ROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get user from DB to check credits
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, credits: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { expiringItems, otherItems } = await req.json();

  if (!expiringItems || !Array.isArray(expiringItems) || expiringItems.length === 0) {
    if (!otherItems || !Array.isArray(otherItems) || otherItems.length === 0) {
      return NextResponse.json({ error: "No ingredients provided" }, { status: 400 });
    }
  }

  // Normalize and hash ingredients
  const allIngredients = [...(expiringItems || []), ...(otherItems || [])].map(i => i.trim().toLowerCase()).sort();
  const ingredientsHash = crypto.createHash('sha256').update(JSON.stringify(allIngredients)).digest('hex');

  // Check cache
  const cachedRecipe = await prisma.generatedRecipe.findUnique({
    where: { ingredientsHash },
  });

  if (cachedRecipe) {
    return NextResponse.json({ recipe: cachedRecipe.content, cached: true, credits: user.credits });
  }

  // Check credits
  if (user.credits <= 0) {
    return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });
  }

  try {
    const prompt = `
      You are a professional chef. Create a creative recipe using the following ingredients:
      
      Expiring soon (Prioritize these): ${expiringItems?.join(", ")}
      Other available ingredients: ${otherItems?.join(", ")}
      
      You can assume basic pantry staples like salt, pepper, oil, water are available.
      Format the output as a clean Markdown recipe with a Title, Description, Ingredients, and Instructions.
    `;

    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.0-flash-exp:free", // Using free model as per plan, or fall back to user preference
      messages: [
        { role: "system", content: "You are a helpful culinary assistant." },
        { role: "user", content: prompt },
      ],
    });

    const content = completion.choices[0]?.message?.content || "Sorry, I couldn't generate a recipe.";

    // Save to DB
    await prisma.generatedRecipe.create({
      data: {
        ingredientsHash,
        ingredients: allIngredients,
        content,
        userId: user.id,
      },
    });

    // Deduct credit
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { credits: { decrement: 1 } },
      select: { credits: true },
    });

    return NextResponse.json({ recipe: content, credits: updatedUser.credits });

  } catch (error) {
    console.error("Recipe generation error:", error);
    return NextResponse.json({ error: "Failed to generate recipe" }, { status: 500 });
  }
}
