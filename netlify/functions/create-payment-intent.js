import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function handler(event) {
  // ✅ Разрешаем CORS
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // или укажи конкретный домен: https://cartiora.com
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: "",
    };
  }

  try {
    const { amount, currency } = JSON.parse(event.body);

    if (!amount || !currency) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ error: "Amount and currency are required." }),
      };
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
    });

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        clientSecret: paymentIntent.client_secret,
      }),
    };
  } catch (error) {
    console.error("Stripe error:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ error: error.message }),
    };
  }
}
