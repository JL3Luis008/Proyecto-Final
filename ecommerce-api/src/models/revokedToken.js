import mongoose from "mongoose";

const revokedTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true,
    },
    expiresAt: {
        type: Date,
        required: true,
        // TTL Index: Mongoose expects expires to be defined on a Date field.
        // '0s' means the document expires exactly at the Datetime specified in `expiresAt`
        expires: "0s",
    },
    // We can also store the user ID for auditing purposes if needed
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
});

const RevokedToken = mongoose.model("RevokedToken", revokedTokenSchema);

export default RevokedToken;
