export async function handler(event, context) {
  const headers = {
    "Access-Control-Allow-Origin": "https://cartiora.com", // разрешаем твой домен
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };

  // Обработка preflight запроса (OPTIONS)
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers,
      body: ""
    };
  }

  try {
    if (!event.body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "No data received in request body" })
      };
    }

    const { amount, currency } = JSON.parse(event.body);

    if (!amount || !currency) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Amount and currency are required" })
      };
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: { enabled: true },
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ clientSecret: paymentIntent.client_secret })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
}
