# Toy app integrating different payment processors, using Node.js & Hapi.js
Design constraint: use a minimum amount of 3rd party modules.

## How to launch
 * Get the dependencies: `npm install`
 * Declare some/all of the following app config environment variables:
  * (PayPal) `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`
  * (Braintree) `BRAINTREE_MERCHANT_ID`, `BRAINTREE_PUBLIC_KEY`, `BRAINTREE_PRIVATE_KEY`
 * Start the server: `npm start [port (default 3000)]`

## Tests
 * Unit and integration: `npm test`
 * End-to-end: `npm run test:e2e` _=>_ Requires the app config environent variables to be declared and refer to valid sandbox accounts
