# Binance Pay API Integration

This project is an Express.js application that integrates with the Binance Pay API to create and query payment orders. It also utilizes Firebase Firestore to store transaction data.

## Prerequisites

Before running the application, ensure you have the following:

- **Node.js and npm installed**: These are necessary to run the application and manage dependencies.
- **A Firebase project with a Firestore database**: Firestore is used to store transaction and user balance data.
- **Binance Pay API credentials**: You'll need an API key and secret from Binance Pay.
- **An `.env` file with the necessary environment variables**: This file should contain your configuration details.
- **A Firebase service account JSON file**: This file is needed to authenticate and initialize the Firebase Admin SDK.

## Getting Started

### Installation

1. **Clone the repository**:

   ```sh
   git clone <repository_url>
   cd <repository_directory>
Install the dependencies:

sh
Copy code
npm install
Create an .env file in the root directory and add your environment variables:

env
Copy code
PORT=3000
BINANCE_API_KEY=your_binance_api_key
BINANCE_API_SECRET=your_binance_api_secret
Place your Firebase service account JSON file in the key directory and name it keys.json.

Running the Application
Start the server:

sh
Copy code
node app.js
The application will run on the port specified in your .env file or default to port 3000.

API Endpoints
Create Order
Endpoint: POST /create-order

Description: Creates a new order on Binance Pay and saves the transaction details to Firestore.

Request Body:

json
Copy code
{
  "amount": "number",
  "userId": "string"
}
Response:

On success, returns the Binance Pay order response.
On failure, returns an error message.
Check Order Payment Status
Endpoint: POST /check_if_paid

Description: Checks the payment status of an order and updates the transaction status and user balance in Firestore.

Request Body:

json

{
  "prepayId": "string",
  "userId": "string"
}
Response:

On success, returns the Binance Pay order status response.
On failure, returns an error message.
Project Structure
bash
Copy code
.
├── key
│   └── keys.json      # Firebase service account JSON file
├── .env               # Environment variables
├── app.js             # Main application file
└── package.json       # Project dependencies
Dependencies
express: Web framework for Node.js.
firebase-admin: Firebase Admin SDK for Node.js.
axios: Promise-based HTTP client for Node.js.
crypto: Node.js built-in library for cryptographic operations.
dotenv: Loads environment variables from a .env file.
request: Simplified HTTP client for Node.js.
fs: Node.js built-in library for file system operations.
Firebase Firestore Collections
transaction: Stores transaction details with fields userId, amount, prepayId, responseData, status, and timestamp.
balance: Stores user balances with balance field.
Security
Ensure that your Firebase service account JSON file and Binance API credentials are kept secure and not exposed in your version control system. Use environment variables to manage sensitive information.

Error Handling
The application handles errors gracefully by logging them and returning appropriate error messages to the client.

Conclusion
This project demonstrates how to integrate with the Binance Pay API using Node.js and Express, along with Firebase Firestore for storing transaction data. Modify the code as needed to fit your specific requirements.

vbnet
Copy code

This README file provides detailed information on how to set up, run, and use the application