import dotenv from "dotenv";

dotenv.config();

console.log("VENDOR_SECRET:", process.env.VENDOR_SECRET);
console.log("CLIENT_SECRET:", process.env.CLIENT_SECRET);
