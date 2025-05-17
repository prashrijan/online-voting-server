import Stripe from "stripe";
import { ApiResponse } from "../utils/customResponse/ApiResponse.js";
import { conf } from "../conf/conf.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/customResponse/ApiError.js";

const stripe = new Stripe(conf.stripePrivateKey);

export const createCheckoutSession = async (req, res, next) => {
    try {
        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "aud",
                        product_data: {
                            name: "Chunaab.com Premium - Unlimited Election",
                        },
                        unit_amount: 500, //$5.00
                    },
                    quantity: 1,
                },
            ],
            success_url: `${conf.clientUrl}/user/payment-success`,
            // success_url: `${clientUrlProduction}/user/payment-success`,
            cancel_url: `${conf.clientUrl}/user`,
            // cancel_url: `${clientUrlProduction}/user`,
            metadata: {
                userId: req.user?._id.toString(),
            },
            client_reference_id: req.user?._id.toString(),
        });

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { url: session.url },
                    "Checkout session created. Redirect user to Stripe."
                )
            );
    } catch (error) {
        console.error(`Internal Server Error : ${error}`);
        return next(
            new ApiError(500, "Server error creating checkout session.")
        );
    }
};

export const webHookRoute = async (req, res, next) => {
    const sig = req.headers["stripe-signature"];
    const endPointSecret = conf.stripeWebhookSecret;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endPointSecret);
    } catch (error) {
        console.error("Webhook signature verification failed: ", error);
        return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    console.log("Webhook event type:", event.type);

    // Handle successful payment
    if (event.type == "checkout.session.completed") {
        const session = event.data.object;
        const userId = session.metadata.userId;

        try {
            await User.findByIdAndUpdate(userId, { isPaid: true });
            console.log(`User ${userId} marked as paid.`);
        } catch (error) {
            console.log("Error updating users after payment: ", error);
        }
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { recieved: true }, "Payment Successful"));
};
