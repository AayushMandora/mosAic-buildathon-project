import mongoose from "mongoose";

const faqSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    qAndA: [{
        q: {
            type: String,
        },
        a: {
            type: String
        }
    }],
}, { timestamps: true });

const faqModel = mongoose.model("FAQ", faqSchema);
export default faqModel;