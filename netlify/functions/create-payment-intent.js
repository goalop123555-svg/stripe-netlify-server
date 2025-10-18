// netlify/functions/create-payment-intent.js
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Разреши конкретный домен (тут укажи свой, например https://cartiora.com)
const ALLOWED_ORIGIN = 'https://cartiora.com';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

export async function handler(event, context) {
  console.log('Event method:', event.httpMethod);
  console.log('Event body:', event.body);

  // Ответ на preflight OPTIONS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: ''
    };
  }

  // Только POST дальше
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  if (!event.body) {
    return {
      statusCode: 400,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'No data received in request body' })
    };
  }

  let parsed;
  try {
    parsed = JSON.parse(event.body);
  } catch (err) {
    console.error('JSON parse error:', err);
    return {
      statusCode: 400,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Invalid JSON' })
    };
  }

  const { amount, currency } = parsed;
  if (!amount || !currency) {
    return {
      statusCode: 400,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Amount and currency are required' })
    };
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: { enabled: true }
    });

    console.log('PaymentIntent created:', paymentIntent.id);

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ clientSecret: paymentIntent.client_secret })
    };
  } catch (err) {
    console.error('Error creating PaymentIntent:', err);
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ error: err.message })
    };
  }
}
