import { connectDb } from "./utils/connectDb.js";
import faqModel from "./model/FAQ.js";
import dotenv from "dotenv";

dotenv.config();

const sampleFAQs = [
    {
        qAndA: [
            {
                q: "What are your opening hours?",
                a: "We're open Monday to Friday from 9:00 AM to 6:00 PM, and Saturday from 10:00 AM to 4:00 PM. We're closed on Sundays."
            },
            {
                q: "How can I contact customer support?",
                a: "You can contact our customer support team by phone at 1-800-123-4567, email at support@company.com, or through our live chat feature on our website."
            },
            {
                q: "What is your return policy?",
                a: "We offer a 30-day return policy for all products. Items must be in original condition with tags attached. Returns are free within the first 14 days."
            },
            {
                q: "Do you offer free shipping?",
                a: "Yes! We offer free shipping on all orders over $50. For orders under $50, standard shipping is $5.99."
            },
            {
                q: "How long does shipping take?",
                a: "Standard shipping takes 3-5 business days. Express shipping (1-2 business days) is available for an additional $9.99."
            },
            {
                q: "Can I track my order?",
                a: "Yes, once your order ships, you'll receive a tracking number via email. You can track your package on our website or the carrier's website."
            },
            {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, Apple Pay, Google Pay, and bank transfers."
            },
            {
                q: "Is my personal information secure?",
                a: "Absolutely! We use industry-standard SSL encryption to protect your personal and payment information. We never share your data with third parties."
            },
            {
                q: "Do you have a mobile app?",
                a: "Yes, our mobile app is available for both iOS and Android devices. You can download it from the App Store or Google Play Store."
            },
            {
                q: "Can I cancel my order?",
                a: "You can cancel your order within 1 hour of placing it if it hasn't been processed yet. After that, you'll need to return the item once received."
            },
            {
                q: "Do you offer international shipping?",
                a: "Yes, we ship to over 50 countries worldwide. International shipping rates and delivery times vary by destination."
            },
            {
                q: "What if I receive a damaged item?",
                a: "If you receive a damaged item, please contact us immediately with photos of the damage. We'll send a replacement or provide a full refund."
            },
            {
                q: "How do I create an account?",
                a: "Click on 'Sign Up' in the top right corner of our website, enter your email and create a password. You'll receive a confirmation email to verify your account."
            },
            {
                q: "Can I change my order after placing it?",
                a: "You can modify your order within 1 hour of placing it if it hasn't been processed. After that, you'll need to contact customer support."
            },
            {
                q: "Do you offer student discounts?",
                a: "Yes! Students with a valid .edu email address can get 10% off their first order. Just verify your student status during checkout."
            }
        ]
    }
];

async function seedFAQs() {
    try {
        await connectDb();

        // Clear existing FAQs
        await faqModel.deleteMany({});
        console.log("Cleared existing FAQ data");

        // Insert sample FAQs
        const result = await faqModel.insertMany(sampleFAQs);
        console.log(`Successfully seeded ${result.length} FAQ documents`);
        console.log(`Total Q&A pairs: ${result[0].qAndA.length}`);

        process.exit(0);
    } catch (error) {
        console.error("Error seeding FAQs:", error);
        process.exit(1);
    }
}

seedFAQs();
