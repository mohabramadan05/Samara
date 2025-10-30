import {supabase} from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 🧩 Extract data from request body
    const {
      user_id,
      checkout_id,
      status,
      country,
      city,
      street,
      floor,
      landmark,
      f_name,
      s_name,
      phone,
      email,
      notes,
      donation,
      discount_type,
      discount_amount,
      promocode,
      final_price,
      price
    } = body;

    const { data, error } = await supabase
      .from('order_payment_confirmation')
      .insert([
        {
          user_id: user_id,
          checkout_id: checkout_id,
          status: status,
          country: country,
          city: city,
          street: street,
          floor: floor,
          landmark: landmark,
          f_name: f_name,
          s_name: s_name,
          phone: phone,
          email: email,
          notes: notes,
          donation: donation,
          discount_type: discount_type,
          discount_amount: discount_amount,
          promocode: promocode,
          final_price: final_price,
          price:price
        },
      ])
      .select('*');

    if (error) {
      console.error('Insert error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('Server error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    
  }
}