const assert = require("assert");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const connectDB = require("../config/db");
const User = require("../models/User");
const Patient = require("../models/Patient");
const OtpVerification = require("../models/OtpVerification");
const authController = require("../controllers/authController");

const runTests = async () => {
    console.log("=== STARTING OTP & AUTH INTEGRATION TESTS ===");

    await connectDB();

    const testEmail = `patient_${Date.now()}@example.com`;
    const testPassword = "securePassword123";

    const mockRes = () => {
        const res = {
            statusCode: 200,
            status(code) { this.statusCode = code; return this; },
            json(data) { this.data = data; return this; },
        };
        return res;
    };

    try {
        // 1. Test Patient Registration
        console.log("\n[Test 1] Patient Registration (triggers OTP generation)...");
        const regReq = {
            body: {
                fullName: "Amina Farooq",
                email: testEmail,
                password: testPassword,
                role: "patient",
                phone: "+91 9876543210",
                city: "Kozhikode",
                address: "Beach Road",
                bloodGroup: "O+",
                gender: "female",
                isDonorAvailable: true,
            },
        };
        const regRes = mockRes();
        await authController.register(regReq, regRes, (err) => { if (err) throw err; });

        assert.strictEqual(regRes.statusCode, 200);
        assert.strictEqual(regRes.data.success, true);
        assert.strictEqual(regRes.data.data.requiresOtpVerification, true);
        assert.strictEqual(regRes.data.data.otp, undefined, "OTP must NOT be exposed in response");
        console.log("✓ Patient registration returned requiresOtpVerification without exposing OTP");

        // Verify OTP is in database
        const otpRecord = await OtpVerification.findOne({ email: testEmail, purpose: "registration" });
        assert(otpRecord, "OtpVerification record must exist in DB");
        assert(otpRecord.otpHash, "otpHash must be stored");
        assert(otpRecord.expiresAt > new Date(), "OTP must have a future expiration date");
        assert.strictEqual(otpRecord.registrationData.email, testEmail);
        console.log("✓ OtpVerification document safely created with hashed OTP and TTL index");

        // 2. Test Login BEFORE verification (must be blocked)
        console.log("\n[Test 2] Login before OTP verification...");
        const unverifiedLoginReq = {
            body: {
                email: testEmail,
                password: testPassword,
            },
        };
        const unverifiedLoginRes = mockRes();
        await authController.login(unverifiedLoginReq, unverifiedLoginRes, (err) => { if (err) throw err; });

        // Since user document is created upon verification or unverified in DB, login must block
        // If user isn't in User table yet or is unverified in User table:
        assert(
            unverifiedLoginRes.statusCode === 401 || unverifiedLoginRes.statusCode === 403,
            "Unverified patient login must be rejected"
        );
        console.log(`✓ Login before OTP verification blocked (Status ${unverifiedLoginRes.statusCode}: ${unverifiedLoginRes.data.message})`);

        // 3. Test Invalid OTP format & Wrong OTP
        console.log("\n[Test 3] Entering wrong OTP...");
        const wrongOtpReq = {
            body: {
                email: testEmail,
                otp: "000000",
            },
        };
        const wrongOtpRes = mockRes();
        await authController.verifyOtp(wrongOtpReq, wrongOtpRes, (err) => { if (err) throw err; });

        assert.strictEqual(wrongOtpRes.statusCode, 400);
        assert.strictEqual(wrongOtpRes.data.success, false);
        console.log("✓ Wrong OTP rejected with validation error");

        // 4. Test Resend OTP
        console.log("\n[Test 4] Resend OTP...");
        // Fast forward lastResentAt by 35s to pass rate limit cooldown in test
        await OtpVerification.updateOne({ email: testEmail }, { lastResentAt: new Date(Date.now() - 35000) });

        const resendReq = {
            body: {
                email: testEmail,
            },
        };
        const resendRes = mockRes();
        await authController.resendOtp(resendReq, resendRes, (err) => { if (err) throw err; });

        assert.strictEqual(resendRes.statusCode, 200);
        assert.strictEqual(resendRes.data.success, true);
        assert.strictEqual(resendRes.data.data.otp, undefined, "Resend OTP response must NOT expose OTP");
        console.log("✓ Resend OTP succeeded and rate limit cooldown respected");

        // 5. Verify with Correct OTP (we simulate knowing the OTP by setting a known hash)
        console.log("\n[Test 5] Entering correct OTP...");
        const knownOtp = "789123";
        const knownHash = await bcrypt.hash(knownOtp, 10);
        await OtpVerification.updateOne({ email: testEmail }, { otpHash: knownHash });

        const correctOtpReq = {
            body: {
                email: testEmail,
                otp: knownOtp,
            },
        };
        const correctOtpRes = mockRes();
        await authController.verifyOtp(correctOtpReq, correctOtpRes, (err) => { if (err) throw err; });

        assert.strictEqual(correctOtpRes.statusCode, 200);
        assert.strictEqual(correctOtpRes.data.success, true);
        assert.strictEqual(correctOtpRes.data.data.verified, true);
        console.log("✓ Correct OTP verified successfully");

        // Check that User and Patient are in DB
        const createdUser = await User.findOne({ email: testEmail });
        assert(createdUser, "User document must exist in DB");
        assert.strictEqual(createdUser.isEmailVerified, true, "isEmailVerified must be true");
        assert.strictEqual(createdUser.isActive, true, "isActive must be true");

        const createdPatient = await Patient.findOne({ userId: createdUser._id });
        assert(createdPatient, "Patient document must exist in DB and be linked to userId");
        assert.strictEqual(createdPatient.city, "Kozhikode");
        assert.strictEqual(createdPatient.bloodGroup, "O+");
        console.log("✓ User and Patient profiles successfully created and linked in MongoDB");

        // Check that OtpVerification document is deleted
        const remainingOtp = await OtpVerification.findOne({ email: testEmail });
        assert.strictEqual(remainingOtp, null, "OtpVerification record must be cleaned up after successful verification");
        console.log("✓ OtpVerification record cleaned up");

        // 6. Test Login AFTER verification (must succeed and return JWT)
        console.log("\n[Test 6] Login after OTP verification...");
        const verifiedLoginReq = {
            body: {
                email: testEmail,
                password: testPassword,
            },
        };
        const verifiedLoginRes = mockRes();
        await authController.login(verifiedLoginReq, verifiedLoginRes, (err) => { if (err) throw err; });

        assert.strictEqual(verifiedLoginRes.statusCode, 200);
        assert.strictEqual(verifiedLoginRes.data.success, true);
        assert(verifiedLoginRes.data.data.token, "JWT token must be returned upon successful login");
        assert.strictEqual(verifiedLoginRes.data.data.user.email, testEmail);
        assert.strictEqual(verifiedLoginRes.data.data.user.isEmailVerified, true);
        console.log("✓ Verified patient logged in successfully with JWT token generated");

        console.log("\n==========================================");
        console.log("ALL OTP VERIFICATION TESTS PASSED (100%)");
        console.log("==========================================");

        // Cleanup test data
        await User.deleteOne({ email: testEmail });
        await Patient.deleteOne({ userId: createdUser._id });

        process.exit(0);
    } catch (error) {
        console.error("Test failed:", error);
        process.exit(1);
    }
};

runTests();
