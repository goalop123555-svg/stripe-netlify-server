import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function handler(event, context) {
  try {
    const { amount, currency } = JSON.parse(event.body); // Получаем данные от фронтенда

    if (!amount || !currency) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Amount and currency are required' }),
      };
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // сумма в центах, присланная с фронтенда
      currency: currency,
      automatic_payment_methods: { enabled: true },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ clientSecret: paymentIntent.client_secret }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}
