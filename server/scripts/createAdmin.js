import mongoose from "mongoose"
import bcrypt from "bcrypt"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"
import { dirname } from "path"

// Setup environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, "../.env") })

// Database name
const DB_NAME = "PixelNet"

// Admin Schema - temporary copy to avoid model loading issues
const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "super-admin"],
      default: "admin",
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
)

// Hash password before saving
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()

  this.password = await bcrypt.hash(this.password, 10)
  next()
})

const Admin = mongoose.model("Admin", adminSchema)

// Admin user details - replace these with your preferred values
const adminDetails = {
  name: "Super Admin",
  email: "admin@championsarena.com",
  password: "password", // This will be automatically hashed
  role: "super-admin",
}

const createAdmin = async () => {
  try {
    // Connect to database
    console.log("Connecting to database...")
    await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
    console.log("Connected to database successfully")

    // Check if super-admin already exists
    const adminExists = await Admin.findOne({ role: "super-admin" })

    if (adminExists) {
      console.log("Super admin already exists!")
      console.log(`Email: ${adminExists.email}`)
      console.log("No changes made.")
    } else {
      // Create super-admin
      const admin = await Admin.create(adminDetails)

      console.log("========================================")
      console.log("ADMIN CREATED SUCCESSFULLY")
      console.log("========================================")
      console.log(`Name: ${admin.name}`)
      console.log(`Email: ${admin.email}`)
      console.log(`Password: ${adminDetails.password}`) // Show unencrypted password
      console.log(`Role: ${admin.role}`)
      console.log("========================================")
      console.log("IMPORTANT: Save these credentials and delete this script!")
      console.log("========================================")
    }
  } catch (error) {
    console.error("Error creating admin:", error)
  } finally {
    // Self-destruct option
    console.log("Disconnecting from database...")
    await mongoose.disconnect()
    console.log("Disconnected from database")

    console.log("SECURITY NOTICE: For security, delete this script after use!")
    process.exit(0)
  }
}

// Run the function
createAdmin()
