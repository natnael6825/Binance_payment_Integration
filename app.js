const express = require('express');
const admin = require('firebase-admin');
const axios = require('axios');
const crypto = require('crypto');
const dotenv = require('dotenv');
const request = require('request');
const fs = require('fs');

dotenv.config();

const app = express();
app.use(express.json()); // To parse JSON bodies

// Initialize Firebase Admin SDK with service account credentials
const serviceAccount = require('./key/keys.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Access Firestore collection
const db = admin.firestore();
const soldRef = db.collection('sold');

const port = process.env.PORT || 3000;



// Binance API credentials from .env file
const binanceApiKey = process.env.BINANCE_API_KEY;
const binanceApiSecret = process.env.BINANCE_API_SECRET;

app.get('/', async (req, res) => {

  res.send('I am awake now');
});







const orderendpoint = 'https://bpay.binanceapi.com/binancepay/openapi/v2/order';



app.post('/create-order', async (req, res) => {
  const { amount, userId } = req.body;

  console.log(amount);

  function generateNonce(length) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let nonce = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      nonce += charset[randomIndex];
    }
    return nonce;
  }

  const merchantTradeNo = generateNonce(32);

  const bodys = JSON.stringify({
    "env": {
      "terminalType": "APP"
    },
    "merchantTradeNo": merchantTradeNo,
    "orderAmount": amount.toString(),
    "currency": "USDT",
    "description": "very good Ice Cream",
    "goods": {
      "goodsType": "01",
      "goodsCategory": "D000",
      "referenceGoodsId": "7876763A6B",
      "goodsName": "Phone Number"
    }
  });

  try {
    const timestamp = new Date().getTime();
    const nonce = generateNonce(32);

    const payload = timestamp + '\n' + nonce + '\n' + bodys + '\n';
    const signature = crypto.createHmac('sha512', binanceApiSecret).update(payload).digest('hex').toUpperCase();

    const headers = {
      'content-type': 'application/json',
      'BinancePay-Timestamp': timestamp,
      'BinancePay-Nonce': nonce,
      'BinancePay-Certificate-SN': binanceApiKey,
      'BinancePay-Signature': signature
    };

    const response = await fetch(orderendpoint, {
      method: 'POST',
      headers: headers,
      body: bodys
    });

    const responseData = await response.json();

    console.log(response)

    if (response.ok) {
      // Save transaction details to Firestore using prepayId instead of merchantTradeNo
      const prepayId = responseData.data.prepayId;

      await db.collection('transaction').add({
        userId: userId,
        amount: amount,
        prepayId: prepayId,
        responseData: responseData,
        status: "unpaid",
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    res.json(responseData);

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});













const queryOrderEndpoint = 'https://bpay.binanceapi.com/binancepay/openapi/v2/order/query';


 


app.post('/check_if_paid', async (req, res) => {
  console.log("1");

  const { prepayId, userId } = req.body; // Including userId from the request body

  const bodys = JSON.stringify({
    "prepayId": prepayId
  });

  function generateNonce(length) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let nonce = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      nonce += charset[randomIndex];
    }
    return nonce;
  }

  try {
    const timestamp = new Date().getTime();
    const nonce = generateNonce(32);

    const payload = timestamp + '\n' + nonce + '\n' + bodys + '\n';
    const signature = crypto.createHmac('sha512', binanceApiSecret).update(payload).digest('hex').toUpperCase();

    const headers = {
      'content-type': 'application/json',
      'BinancePay-Timestamp': timestamp,
      'BinancePay-Nonce': nonce,
      'BinancePay-Certificate-SN': binanceApiKey,
      'BinancePay-Signature': signature
    };

    console.log("2");

    const response = await fetch(queryOrderEndpoint, {
      method: 'POST',
      headers: headers,
      body: bodys
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Network response was not ok. Status: ${response}, Response: ${errorText}`);
      throw new Error(`Network response was not ok. Status: ${response.status}, Response: ${errorText}`);
    }

    const responseData = await response.json();
    if (responseData.data && responseData.data.status === 'PAID') {
      const orderAmount = parseFloat(responseData.data.orderAmount); // Assuming orderAmount is part of the response data

      // Update the transaction status to 'paid' in Firestore
      const transactionRef = db.collection('transaction').where('prepayId', '==', prepayId).where('userId', '==', userId);
      const snapshot = await transactionRef.get();

      if (!snapshot.empty) {
        snapshot.forEach(async (doc) => {
          await doc.ref.update({ status: 'paid' });
        });

        // Retrieve and update the user's balance
        const balanceRef = db.collection('balance').doc(userId);
        const balanceDoc = await balanceRef.get();

        if (balanceDoc.exists) {
          const currentBalance = balanceDoc.data().balance;
          const newBalance = currentBalance + orderAmount;
          await balanceRef.update({ balance: newBalance });
        } else {
          // If the balance document does not exist, create it with initial balance of zero and add the order amount
          await balanceRef.set({ balance: orderAmount });
        }
      }
    }

    res.json(responseData);

  } catch (error) {
    console.error('Error querying order:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
