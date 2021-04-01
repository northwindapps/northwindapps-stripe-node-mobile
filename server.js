require('dotenv').config()
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const server = express();
const port = 3000;

server.use(express.json());

server.get('/', (req, res) => {
    res.send('Api root that never be used in this project');
});

server.post('/ephemeral_keys', async (req, res) => {
    //TODO BETTER PUT AN AUTHENTICATION ON THE CLIENT SIDE BEFORE CONNECTING SDK
    var customerId = null;
    if (req.body !== undefined) {
        customerId = req.body.customerId;
    }
    var api_version = req.query.apiVersion;
    if (!api_version) {
        res.status(400).end();
        return;
    }
    if (!customerId) {
        let Customer = await stripe.customers.create({
            description: 'My First Test Customer (created for API docs)',
        });
        customerId = Customer.id;
    }
    let key = await stripe.ephemeralKeys.create(
        { customer: customerId },
        { apiVersion: api_version },
    );
    res.json(key);
});

server.post('/create_payment_intent', async (req, res) => {

    let EMOJI_STORE = {
        "👕": 2000,
        "👖": 4000,
        "👗": 3000,
        "👞": 700,
        "👟": 600,
        "👠": 1000,
        "👡": 2000,
        "👢": 2500,
        "👒": 800,
        "👙": 3000,
        "💄": 2000,
        "🎩": 5000,
        "👛": 5500,
        "👜": 6000,
        "🕶": 2000,
        "👚": 2500,
    }

    let products = req.body.products;
    let total_amount = products.reduce(calculate, 0);

    function calculate(sum, num) {
        return sum + EMOJI_STORE[num];
    }

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: 2000,
            currency: 'jpy',
            payment_method_types: ['card'],
            customer: 'cus_I6nUbZxaWqDylT'
        });

        const clientSecret = paymentIntent.client_secret
        var json = {
            "amount": total_amount,
            "currency": paymentIntent.currency,
            "secret": clientSecret,
            "product": paymentIntent.products,
            "shipping": paymentIntent.shipping
        }
        res.json(json);
    } catch (error) {
        res.json(error);
    }
});

server.listen(process.env.PORT || port, () => {
    console.log(`Example a:: listening at htttp://localhost:${process.env.PORT}`);
})