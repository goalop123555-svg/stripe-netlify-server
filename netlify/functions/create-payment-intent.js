import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function handler(event, context) {
  console.log("Event body received:", event.body); // 🔹 логируем body

  try {
    if (!event.body) {
      console.log("❌ Event body is empty!");
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'No data received in request body' }),
      };
    }

    let parsedBody;
    try {
      parsedBody = JSON.parse(event.body);
      console.log("✅ Parsed body:", parsedBody);
    } catch (parseErr) {
      console.log("❌ Failed to parse JSON:", parseErr.message);
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Invalid JSON in request body' }),
      };
    }

    const { amount, currency } = parsedBody;

    if (!amount || !currency) {
      console.log("❌ Amount or currency missing:", parsedBody);
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Amount and currency are required' }),
      };
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      automatic_payment_methods: { enabled: true },
    });

    console.log("✅ PaymentIntent created:", paymentIntent.id);

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ clientSecret: paymentIntent.client_secret }),
    };
  } catch (err) {
    console.error("❌ Error in handler:", err);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: err.message }),
    };
  }
}
