// /api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
});

// Define types for API responses
interface Category {
    id: number;
    name: string;
    desc?: string;
}

interface Product {
    id: number;
    name: string;
    categoryName: string;
    price: number;
    unitName?: string;
}

interface City {
    id: number;
    name: string;
}

async function fetchData<T>(url: string): Promise<T> {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch from ${url}`);
    return res.json();
}


export async function POST(req: NextRequest) {
    const baseUrl = 'https://samarashop.ie';

    try {
        const { messages } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json(
                { error: 'No messages provided or invalid format' },
                { status: 400 }
            );
        }

        // Fetch current categories, products, and cities
        const [categoriesRes, productsRes, citiesRes] = await Promise.all([
            fetchData<{ categories: Category[] }>(`${baseUrl}/api/categories`),
            fetchData<{ products: Product[] }>(`${baseUrl}/api/products`),
            fetchData<{ cities: City[] }>(`${baseUrl}/api/cities`),
        ]);

        const categories = categoriesRes.categories || [];
        const products = productsRes.products || [];
        const cities = citiesRes.cities || [];

        // Format data for system prompt
        const categoriesText = categories
            .map((c) => `- ${c.name} (${c.desc || 'No description'})`)
            .join('\n') || 'No categories available';

        const productsText = products
            .map((p) => `- ${p.name} (Category: ${p.categoryName}, Price: ${p.price} ${p.unitName || ''})`)
            .join('\n') || 'No products available';

        const citiesText = cities.map((c) => `- ${c.name}`).join('\n') || 'No cities available';

        const systemPrompt = `
You are Samara AI Assistant — a helpful support chatbot for Samara website selling food in Ireland.
You can respond in Arabic or English depending on the user's input language.
Focus only on the topics below:

1. Food categories available:
${categoriesText}
and if any user wants the url here it is "https://samarashop.ie/category/#VALUE#" but replace #VALUE# with the category id 

2. Products available:
${productsText}
and if any user wants the url here it is "https://samarashop.ie/product/#VALUE#" but replace #VALUE# with the product id 

3. Cities where delivery is available:
${citiesText}

4. Online food sales and delivery
5. Food safety and Irish e-commerce regulations
6. Internal staff and operations questions

If a question is unrelated, politely explain you can only help with food e-commerce topics in Ireland.
`;

        // Send chat request to OpenAI
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                ...messages,
            ],
        });

        const reply = completion.choices[0].message;

        return NextResponse.json({
            message: {
                id: crypto.randomUUID(),
                role: reply.role,
                content: reply.content,
            },
        });
    } catch (error: unknown) {
        console.error('OpenAI API error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: 'OpenAI API error', details: errorMessage },
            { status: 500 }
        );
    }
}
