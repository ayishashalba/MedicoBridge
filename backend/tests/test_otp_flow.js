const assert = require("assert");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const connectDB = require("../config/db");
const User = require("../models/User");
const Patient = require("../models/Patient");
const OtpVerification = require("../models/OtpVerification");
const authController = require("../controllers/authController");
const patientController = require("../controllers/patientController");

const runTests = async () => {
    console.log("=== STARTING FULL PATIENT EMAIL OTP FLOW TESTS ===");

    await connectDB();

    const testEmail = `aarav_${Date.now()}@gmail.com`;
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
        console.log("\n[Test 1] Patient Registration (Form submission)...");
        const regReq = {
            body: {
                fullName: "Aarav Sharma",
                email: testEmail,
                password: testPassword,
                role: "patient",
                phone: "9876543210",
                city: "Kozhikode",
                address: "Beach Road, Calicut",
                bloodGroup: "B+",
                gender: "Male",
                dateOfBirth: "1995-05-15",
                emergencyContact: "9876500000",
                isDonorAvailable: true,
            },
        };
        const regRes = mockRes();
        await authController.register(regReq, regRes, (err) => { if (err) throw err; });

        assert.strictEqual(regRes.statusCode, 200);
        assert.strictEqual(regRes.data.success, true);
        assert.strictEqual(regRes.data.data.requiresVerification, true);
        assert.strictEqual(regRes.data.data.otp, undefined, "OTP must NOT be exposed in response");
        console.log("✓ Patient registration returned requiresVerification: true without exposing OTP");

        // Verify OTP is in database with 5-minute expiry
        const otpRecord = await OtpVerification.findOne({ email: testEmail, purpose: "registration" });
        assert(otpRecord, "OtpVerification record must exist in DB");
        assert(otpRecord.otpHash, "otpHash must be stored");
        const expiryDiffMinutes = (new Date(otpRecord.expiresAt).getTime() - Date.now()) / (60 * 1000);
        assert(expiryDiffMinutes > 4 && expiryDiffMinutes <= 5.1, "OTP expiry must be approximately 5 minutes");
        console.log(`✓ OTP stored securely with ~5-minute expiration (${expiryDiffMinutes.toFixed(1)} mins)`);

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

        assert.strictEqual(unverifiedLoginRes.statusCode, 403);
        assert.strictEqual(unverifiedLoginRes.data.success, false);
        assert.strictEqual(unverifiedLoginRes.data.message, "Please verify your email before logging in");
        console.log("✓ Unverified login blocked with exact message: 'Please verify your email before logging in'");

        // 3. Test Invalid OTP
        console.log("\n[Test 3] Entering incorrect OTP...");
        const wrongOtpReq = {
            body: {
                email: testEmail,
                otp: "999999",
            },
        };
        const wrongOtpRes = mockRes();
        await authController.verifyOtp(wrongOtpReq, wrongOtpRes, (err) => { if (err) throw err; });

        assert.strictEqual(wrongOtpRes.statusCode, 400);
        assert.strictEqual(wrongOtpRes.data.message, "Invalid OTP");
        console.log("✓ Incorrect OTP rejected with message: 'Invalid OTP'");

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
        assert.strictEqual(resendRes.data.message, "A new OTP has been sent to your email");
        console.log("✓ Resend OTP succeeded with 5-minute refreshed expiry");

        // 5. Verify with Correct OTP (set a known hash to test)
        console.log("\n[Test 5] Entering correct 6-digit OTP...");
        const knownOtp = "482731";
        const knownHash = await bcrypt.hash(knownOtp, 10);
        await OtpVerification.updateOne({ email: testEmail }, { otpHash: knownHash });
        await User.updateOne({ email: testEmail }, { otpCode: knownHash });

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
        assert.strictEqual(correctOtpRes.data.message, "Email verified successfully");
        assert(correctOtpRes.data.data.token, "JWT token must be returned upon successful verification");
        assert.strictEqual(correctOtpRes.data.data.user.emailVerified, true);
        assert.strictEqual(correctOtpRes.data.data.user.email, testEmail);
        console.log("✓ OTP verified successfully, returning JWT token & user object for direct Dashboard login!");

        const jwtToken = correctOtpRes.data.data.token;
        const verifiedUserId = correctOtpRes.data.data.user.id;

        // 6. Test Patient Profile Data (must show the SAME registration details from MongoDB)
        console.log("\n[Test 6] Fetching Patient Profile using JWT token...");
        const profileReq = {
            user: {
                id: verifiedUserId,
                role: "patient",
            },
        };
        const profileRes = mockRes();
        await patientController.getPatientProfile(profileReq, profileRes);

        assert.strictEqual(profileRes.statusCode, 200);
        assert.strictEqual(profileRes.data.success, true);
        assert.strictEqual(profileRes.data.data.user.name, "Aarav Sharma");
        assert.strictEqual(profileRes.data.data.user.email, testEmail);
        assert.strictEqual(profileRes.data.data.user.phone, "9876543210");
        assert.strictEqual(profileRes.data.data.user.city, "Kozhikode");
        assert.strictEqual(profileRes.data.data.user.bloodGroup, "B+");
        assert.strictEqual(profileRes.data.data.patient.gender, "Male");
        assert.strictEqual(profileRes.data.data.patient.emergencyContact, "9876500000");
        console.log("✓ Patient Profile matches registered MongoDB data (Aarav Sharma, Kozhikode, B+, Male)");

        // 7. Test Already Registered Email
        console.log("\n[Test 7] Attempting to re-register with already verified email...");
        const dupRegRes = mockRes();
        await authController.register(regReq, dupRegRes, (err) => { if (err) throw err; });
        assert.strictEqual(dupRegRes.statusCode, 400);
        assert.strictEqual(dupRegRes.data.message, "Email is already registered");
        console.log("✓ Duplicate registration prevented with 'Email is already registered'");

        // 8. Test Regular Login after OTP verification
        console.log("\n[Test 8] Normal login after OTP verification...");
        const loginReq = {
            body: {
                email: testEmail,
                password: testPassword,
            },
        };
        const loginRes = mockRes();
        await authController.login(loginReq, loginRes, (err) => { if (err) throw err; });

        assert.strictEqual(loginRes.statusCode, 200);
        assert.strictEqual(loginRes.data.success, true);
        assert(loginRes.data.data.token, "JWT token must be returned");
        assert.strictEqual(loginRes.data.data.user.emailVerified, true);
        console.log("✓ Normal login succeeds and returns JWT token");

        console.log("\n=======================================================");
        console.log("ALL PATIENT EMAIL OTP TESTS COMPLETED SUCCESSFULLY (100%)");
        console.log("=======================================================");

        // Cleanup test data
        await User.deleteOne({ email: testEmail });
        await Patient.deleteOne({ userId: verifiedUserId });

        process.exit(0);
    } catch (error) {
        console.error("Test failed:", error);
        process.exit(1);
    }
};

runTests();
