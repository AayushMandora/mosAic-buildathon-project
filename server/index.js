import express from "express";
import dotenv from "dotenv";
import axios from "axios";
import cors from "cors";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

import multer from "multer";

// Using alternative free services instead of OpenAI

import { connectDb } from "./utils/connectDb.js";
import faqModel from "./model/FAQ.js";
import User from "./model/user.js";

const app = express();
app.use(express.json());
app.use(cors());
dotenv.config();
connectDb();

// Auth setup
const jwtSecret = process.env.JWT_SECRET || "dev_secret_change_me";
const googleClientId = process.env.GOOGLE_CLIENT_ID || "";
const googleClient = new OAuth2Client(googleClientId);

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Initialize FAQ data storage
// let faqData = [];

// // Initialize FAQ retrieval system using simple text matching
// async function initializeFAQSystem() {
//     try {
//         // Get FAQ data from database
//         const dbFaqData = await faqModel.find();

//         if (dbFaqData.length === 0) {
//             console.log("No FAQ data found. Please add some FAQ entries.");
//             return;
//         }

//         // Flatten FAQ data for easier searching
//         faqData = [];
//         dbFaqData.forEach(faq => {
//             faq.qAndA.forEach(qa => {
//                 faqData.push({
//                     question: qa.q.toLowerCase(),
//                     answer: qa.a,
//                     originalQuestion: qa.q
//                 });
//             });
//         });

//         console.log(`FAQ system initialized with ${faqData.length} Q&A pairs`);
//     } catch (error) {
//         console.error("Error initializing FAQ system:", error);
//     }
// }

// JWT auth middleware
function authenticate(req, res, next) {
    try {
        const header = req.headers["authorization"] || "";
        const token = header.startsWith("Bearer ") ? header.slice(7) : null;
        if (!token) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const payload = jwt.verify(token, jwtSecret);
        req.userId = payload.sub;
        next();
    } catch (err) {
        return res.status(401).json({ error: "Invalid token" });
    }
}

// Google Auth endpoint
app.post("/auth/google", async (req, res) => {
    try {
        const { idToken } = req.body;
        if (!idToken) {
            return res.status(400).json({ error: "idToken is required" });
        }

        const ticket = await googleClient.verifyIdToken({ idToken, audience: googleClientId });
        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            return res.status(400).json({ error: "Invalid Google token" });
        }

        const email = payload.email;
        const name = payload.name || "";
        const profilePic = payload.picture || "";

        let user = await User.findOne({ email });
        if (!user) {
            user = await User.create({ name, email, profilePic });
        } else {
            // Keep profile fresh
            if (user.name !== name || user.profilePic !== profilePic) {
                user.name = name;
                user.profilePic = profilePic;
                await user.save();
            }
        }

        const token = jwt.sign({ sub: user._id.toString(), email: user.email }, jwtSecret, { expiresIn: "7d" });
        return res.json({ token, user: { id: user._id, name: user.name, email: user.email, profilePic: user.profilePic } });
    } catch (error) {
        console.error("Google Auth Error:", error);
        return res.status(500).json({ error: "Authentication failed" });
    }
});

// Simple text matching function for FAQ retrieval
function findBestFAQAnswer(userQuestion, faqData) {
    const question = userQuestion.toLowerCase();
    const keywords = question.split(' ').filter(word => word.length > 2);

    let bestMatch = null;
    let bestScore = 0;
    const matchedFAQs = [];

    faqData.forEach(faq => {
        let score = 0;
        const faqKeywords = faq.question.split(' ').filter(word => word.length > 2);

        // Calculate keyword overlap score
        keywords.forEach(keyword => {
            faqKeywords.forEach(faqKeyword => {
                if (faqKeyword.includes(keyword) || keyword.includes(faqKeyword)) {
                    score += 1;
                }
            });
        });

        // Check for exact phrase matches
        if (faq.question.includes(question) || question.includes(faq.question)) {
            score += 10;
        }

        // Check for individual word matches
        keywords.forEach(keyword => {
            if (faq.question.includes(keyword)) {
                score += 2;
            }
        });

        if (score > 0) {
            matchedFAQs.push({
                question: faq.originalQuestion,
                answer: faq.answer,
                score: score
            });
        }

        if (score > bestScore) {
            bestScore = score;
            bestMatch = {
                question: faq.originalQuestion,
                answer: faq.answer,
                score: score
            };
        }
    });

    // Sort by score and return top matches
    matchedFAQs.sort((a, b) => b.score - a.score);

    return {
        bestMatch,
        allMatches: matchedFAQs.slice(0, 3), // Top 3 matches
        confidence: bestScore > 0 ? Math.min(bestScore / 10, 1) : 0
    };
}

// Initialize the system
// initializeFAQSystem();

// 1. Text-to-Speech endpoint
app.post("/tts", async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ error: "Text is required" });
        }

        const response = await axios.post(
            "https://api.elevenlabs.io/v1/text-to-speech/JBFqnCBsd6RMkjVDRZzb",
            {
                text,
                model_id: "eleven_monolingual_v1",
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.5
                }
            },
            {
                headers: {
                    "xi-api-key": process.env.ELEVEN_LABS_KEY,
                    "Content-Type": "application/json"
                },
                responseType: 'arraybuffer'
            }
        );

        res.set({
            'Content-Type': 'audio/mpeg',
            'Content-Length': response.data.length
        });
        res.send(response.data);
    } catch (error) {
        console.error("TTS Error:", error);
        res.status(500).json({ error: "Failed to generate speech" });
    }
});


// 3. Bot/FAQ endpoint using simple text matching
app.post("/bot", async (req, res) => {
    try {
        const { message, userId } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        const dbFaqData = await faqModel.findOne({ user: userId });

        if (dbFaqData.length === 0) {
            console.log("No FAQ data found. Please add some FAQ entries.");
            return;
        }

        let faqData = [];

        dbFaqData.qAndA.forEach(qa => {
            faqData.push({
                question: qa.q.toLowerCase(),
                answer: qa.a,
                originalQuestion: qa.q
            });
        });

        // Ensure a common FAQ exists for all users
        faqData.push({
            question: "ask about my service, order, implementation",
            answer: "You can ask about our services, orders, and implementation details.",
            originalQuestion: "Ask about my service, order, implementation"
        });


        if (faqData.length === 0) {
            return res.status(500).json({
                error: "FAQ system not initialized. Please add FAQ data first."
            });
        }

        // Use simple text matching to find the best answer
        const result = findBestFAQAnswer(message, faqData);

        if (!result.bestMatch || result.confidence < 0.1) {
            // No good match found, provide a generic response
            const genericResponses = [
                "I'm sorry, I couldn't find a specific answer to your question. Could you please rephrase it or ask about our services, hours, or policies?",
                "I don't have information about that specific topic. Please try asking about our business hours, contact information, or general policies.",
                "I'm not sure about that. Could you ask about something else like our services, return policy, or how to contact us?"
            ];

            const randomResponse = genericResponses[Math.floor(Math.random() * genericResponses.length)];

            return res.json({
                answer: randomResponse,
                sourceDocuments: [],
                confidence: 0
            });
        }

        res.json({
            answer: result.bestMatch.answer,
            sourceDocuments: result.allMatches.map(match => ({
                question: match.question,
                answer: match.answer,
                score: match.score
            })),
            confidence: result.confidence
        });
    } catch (error) {
        console.error("Bot Error:", error);
        res.status(500).json({ error: "Failed to process question" });
    }
});

// Health check endpoint
// app.get("/health", (req, res) => {
//     res.json({
//         status: "OK",
//         faqInitialized: faqData.length > 0,
//         faqCount: faqData.length,
//         timestamp: new Date().toISOString()
//     });
// });

// // Refresh FAQ data endpoint (useful for adding new FAQs)
// app.post("/refresh-faq", async (req, res) => {
//     try {
//         await initializeFAQSystem();
//         res.json({ message: "FAQ system refreshed successfully" });
//     } catch (error) {
//         console.error("Refresh FAQ Error:", error);
//         res.status(500).json({ error: "Failed to refresh FAQ system" });
//     }
// });

// User-specific FAQ routes
// Get current user's FAQs
app.get("/faqs/me", authenticate, async (req, res) => {
    try {
        const faqs = await faqModel.findOne({ user: req.userId });
        res.json(faqs || { user: req.userId, qAndA: [] });
    } catch (error) {
        console.error("Get FAQs Error:", error);
        res.status(500).json({ error: "Failed to fetch FAQs" });
    }
});

// Add a new Q&A entry
app.post("/faqs", authenticate, async (req, res) => {
    try {
        const { q, a } = req.body;
        if (!q || !a) {
            return res.status(400).json({ error: "Both q and a are required" });
        }

        let doc = await faqModel.findOne({ user: req.userId });
        if (!doc) {
            doc = await faqModel.create({ user: req.userId, qAndA: [{ q, a }] });
        } else {
            doc.qAndA.push({ q, a });
            await doc.save();
        }

        // Refresh global cache for bot
        // await initializeFAQSystem();

        res.status(201).json(doc);
    } catch (error) {
        console.error("Add FAQ Error:", error);
        res.status(500).json({ error: "Failed to add FAQ" });
    }
});

// Edit an existing Q&A entry by index
app.put("/faqs/:index", authenticate, async (req, res) => {
    try {
        const idx = parseInt(req.params.index, 10);
        const { q, a } = req.body;
        if (Number.isNaN(idx)) {
            return res.status(400).json({ error: "Invalid index" });
        }
        if (!q && !a) {
            return res.status(400).json({ error: "Provide q or a to update" });
        }

        const doc = await faqModel.findOne({ user: req.userId });
        if (!doc || !doc.qAndA[idx]) {
            return res.status(404).json({ error: "FAQ entry not found" });
        }

        if (q) doc.qAndA[idx].q = q;
        if (a) doc.qAndA[idx].a = a;
        await doc.save();

        // Refresh global cache for bot
        // await initializeFAQSystem();

        res.json(doc);
    } catch (error) {
        console.error("Edit FAQ Error", error);
        res.status(500).json({ error: "Failed to edit FAQ" });
    }
});

// Delete an existing Q&A entry by index
app.delete("/faqs/:index", authenticate, async (req, res) => {
    try {
        const idx = parseInt(req.params.index, 10);
        if (Number.isNaN(idx)) {
            return res.status(400).json({ error: "Invalid index" });
        }

        const doc = await faqModel.findOne({ user: req.userId });
        if (!doc || !doc.qAndA[idx]) {
            return res.status(404).json({ error: "FAQ entry not found" });
        }

        doc.qAndA.splice(idx, 1);
        await doc.save();

        // await initializeFAQSystem();

        res.json(doc);
    } catch (error) {
        console.error("Delete FAQ Error", error);
        res.status(500).json({ error: "Failed to delete FAQ" });
    }
});

// Export app for serverless (Vercel)
export default app;

// Start server locally only
if (process.env.VERCEL !== '1') {
    app.listen(3000, () => {
        console.log("Server is running on port 3000");
        console.log("Available endpoints:");
        console.log("- POST /tts - Text-to-Speech");
        console.log("- POST /stt - Speech-to-Text");
        console.log("- POST /bot - FAQ Bot with RetrievalQA");
        console.log("- GET /health - Health check");
        console.log("- POST /refresh-faq - Refresh FAQ data");
    });
}
