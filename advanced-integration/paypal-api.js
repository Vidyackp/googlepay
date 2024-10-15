import fetch from "node-fetch";

// set some important variables
const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_MERCHANT_ID , BASE_URL } = process.env;
// const sandbox = "https://api-m.sandbox.paypal.com";
// const production = "https://api-m.paypal.com";
const base = `${BASE_URL}`

// call the create order method
export async function createOrder() {
  const purchaseAmount = "0.10"; // TODO: pull prices from a database
  const accessToken = await generateAccessToken();
  const url = `${base}/v2/checkout/orders`;
  const response = await fetch(url, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({

      "intent": "CAPTURE",
    "purchase_units": [{
      "reference_id": "d9f80740-38f0-11e8-b467-0ed5f89f718b",
      "amount": {
       "currency_code": "USD",
        "value": "10.00"
      }
    }],
      "payment_source": {
        "google_pay": {
          "stored_credential": {
            "payment_initiator": "CUSTOMER",
            "payment_type": "RECURRING"
          },
          "attributes": {
            "vault": {
              "store_in_vault": "ON_SUCCESS"
            }
          }
        }
      }

    }),
  });

  return handleResponse(response);
}

// capture payment for an order
export async function capturePayment(orderId) {
  const accessToken = await generateAccessToken();
  const url = `${base}/v2/checkout/orders/${orderId}/capture`;
  const response = await fetch(url, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return handleResponse(response);
}

// generate access token
export async function generateAccessToken() {
  const auth = Buffer.from(PAYPAL_CLIENT_ID + ":" + PAYPAL_CLIENT_SECRET).toString("base64");
  const response = await fetch(`${base}/v1/oauth2/token`, {
    method: "post",
    body: "grant_type=client_credentials",
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });
  const jsonData = await handleResponse(response);
  return jsonData.access_token;
}

// generate client token
export async function generateClientToken() {
  const accessToken = await generateAccessToken();
  const response = await fetch(`${base}/v1/identity/generate-token`, {
    method: "post",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Accept-Language": "en_US",
      "Content-Type": "application/json",
    },
  });
  console.log('response', response.status)
  const jsonData = await handleResponse(response);
  return jsonData.client_token;
}

async function handleResponse(response) {
  if (response.status === 200 || response.status === 201) {
    return response.json();
  }

  const errorMessage = await response.text();
  throw new Error(errorMessage);
}

export async function getOrder(orderId) {
  const accessToken = await generateAccessToken();
  const url = `${base}/v2/checkout/orders/${orderId}`;
  const response = await fetch(url, {
    method: "get",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return handleResponse(response);
}