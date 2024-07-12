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
```
## Installation

### Install the dependencies:

```sh
npm install express firebase-admin axios crypto dotenv request fs
