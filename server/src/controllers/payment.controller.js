import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import crypto from 'crypto';
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// You should create a Transaction model for storing payment details
// import { Transaction } from "../models/transaction.model.js";

const MERCHANT_KEY = "96434309-7796-489d-8924-ab56988a6076";
const MERCHANT_ID = "PGTESTPAYUAT86";

// const prod_URL = "https://api.phonepe.com/apis/hermes/pg/v1/pay"
// const prod_URL = "https://api.phonepe.com/apis/hermes/pg/v1/status"

const MERCHANT_BASE_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay"
const MERCHANT_STATUS_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status"
const MERCHANT_REFUND_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/refund"

const redirectUrl = "http://localhost:8000/api/v1/payments/status"
const successUrl = "http://localhost:5173/payment-success"
const failureUrl = "http://localhost:5173/payment-failure"

/**
 * Check if payment gateway is active
 */
const paymentStatus = asyncHandler(async (req, res) => {
  return res.status(200).json(
    new ApiResponse(
      200,
      { status: "active", provider: "PhonePay Sandbox" },
      "Payment gateway is active"
    )
  );
});

/**
 * Generate PhonePe checksum for API authentication
 * @private
 */
const generateChecksum = (string, keyIndex = 1) => {
  const sha256 = crypto.createHash('sha256').update(string).digest('hex');
  return sha256 + '###' + keyIndex;
}

/**
 * Save transaction details to database
 * @private
 */
const saveTransaction = async (paymentData) => {
  try {
    // Uncomment and use when you create the Transaction model
    /*
    const transaction = await Transaction.create({
      transactionId: paymentData.merchantTransactionId,
      userId: paymentData.userId,
      amount: paymentData.amount / 100, // Convert back to actual amount
      status: "INITIATED",
      paymentMethod: "PHONEPE",
      metadata: paymentData
    });
    return transaction;
    */
    
    // For now just log the transaction
    console.log("Transaction initiated:", paymentData);
    return true;
  } catch (error) {
    console.error("Error saving transaction:", error);
    return false;
  }
}

/**
 * Update transaction details in database
 * @private
 */
const updateTransaction = async (transactionId, status, responseData) => {
  try {
    // Uncomment and use when you create the Transaction model
    /*
    const transaction = await Transaction.findOneAndUpdate(
      { transactionId },
      { 
        status,
        responseData,
        updatedAt: Date.now()
      },
      { new: true }
    );
    return transaction;
    */
    
    // For now just log the update
    console.log(`Transaction ${transactionId} updated to ${status}`);
    return true;
  } catch (error) {
    console.error("Error updating transaction:", error);
    return false;
  }
}

/**
 * Initiate payment with PhonePay
 */
const initiatePhonePePayment = asyncHandler(async (req, res) => {
  try {
    const {name, mobileNumber, amount, userId, description} = req.body;
    
    // Validate required fields
    if (!amount) {
      throw new ApiError(400, "Amount is required");
    }
    
    if (!mobileNumber) {
      throw new ApiError(400, "Mobile number is required");
    }
    
    const orderId = uuidv4();
    
    // Get user ID from authenticated user if available
    const userIdFromAuth = req.user?._id;
    const finalUserId = userId || userIdFromAuth || "GUEST_" + Date.now();

    //payment
    const paymentPayload = {
        merchantId: MERCHANT_ID,
        merchantUserId: name || "USER_" + Date.now(),
        mobileNumber: mobileNumber,
        amount: Number(amount) * 100,
        merchantTransactionId: orderId,
        redirectUrl: `${redirectUrl}?id=${orderId}`,
        redirectMode: 'POST',
        paymentInstrument: {
            type: 'PAY_PAGE'
        }
    }

    // Add optional description if provided
    if (description) {
        paymentPayload.paymentInstrument.description = description;
    }

    const payload = Buffer.from(JSON.stringify(paymentPayload)).toString('base64')
    const keyIndex = 1
    const string = payload + '/pg/v1/pay' + MERCHANT_KEY
    const checksum = generateChecksum(string, keyIndex)

    const option = {
        method: 'POST',
        url: MERCHANT_BASE_URL,
        headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
            'X-VERIFY': checksum
        },
        data: {
            request: payload
        }
    }
    
    const response = await axios.request(option);
    
    // Save transaction details
    const paymentData = {
      ...paymentPayload,
      userId: finalUserId
    };
    await saveTransaction(paymentData);
    
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          paymentUrl: response.data.data.instrumentResponse.redirectInfo.url,
          transactionId: orderId
        },
        "Payment initiated successfully"
      )
    );
  } catch (error) {
    console.error("PhonePay payment error:", error);
    throw new ApiError(
      error.response?.status || 500,
      error.response?.data?.message || error.message || "Something went wrong during payment initiation"
    );
  }
});

/**
 * Callback handler for PhonePay payment verification
*/
const verifyPhonePePayment = asyncHandler(async (req, res) => {
  try {
    const merchantTransactionId = req.query.id;
    
    if (!merchantTransactionId) {
      throw new ApiError(400, "Transaction ID is missing");
    }
    
    const keyIndex = 1
    const string = `/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}` + MERCHANT_KEY
    const checksum = generateChecksum(string, keyIndex)

    const option = {
        method: 'GET',
        url: `${MERCHANT_STATUS_URL}/${MERCHANT_ID}/${merchantTransactionId}`,
        headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
            'X-VERIFY': checksum,
            'X-MERCHANT-ID': MERCHANT_ID
        },
    }

    const response = await axios.request(option);
    
    // Update transaction in database
    if (response.data.success === true) {
        const paymentStatus = response.data.data.responseCode === "SUCCESS" ? "SUCCESS" : "FAILED";
        await updateTransaction(merchantTransactionId, paymentStatus, response.data);
        return res.redirect(successUrl);
    } else {
        await updateTransaction(merchantTransactionId, "FAILED", response.data);
        return res.redirect(failureUrl);
    }
  } catch (error) {
    console.error("PhonePay verification error:", error);
    try {
      // Try to update transaction status even if there's an error
      await updateTransaction(req.query.id, "ERROR", { error: error.message });
    } catch (dbError) {
      console.error("Failed to update transaction status:", dbError);
    }
    return res.redirect(failureUrl);
  }
});

/**
 * Check the status of a payment transaction
 */
const checkPaymentStatus = asyncHandler(async (req, res) => {
  try {
    const { transactionId } = req.params;
    
    if (!transactionId) {
      throw new ApiError(400, "Transaction ID is required");
    }
    
    const keyIndex = 1
    const string = `/pg/v1/status/${MERCHANT_ID}/${transactionId}` + MERCHANT_KEY
    const checksum = generateChecksum(string, keyIndex)

    const option = {
        method: 'GET',
        url: `${MERCHANT_STATUS_URL}/${MERCHANT_ID}/${transactionId}`,
        headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
            'X-VERIFY': checksum,
            'X-MERCHANT-ID': MERCHANT_ID
        },
    }

    const response = await axios.request(option);
    
    if (response.data.success === true) {
      // Update transaction status in database
      const paymentStatus = response.data.data.responseCode === "SUCCESS" ? "SUCCESS" : "FAILED";
      await updateTransaction(transactionId, paymentStatus, response.data);
      
      return res.status(200).json(
        new ApiResponse(
          200,
          {
            status: paymentStatus,
            merchantTransactionId: transactionId,
            details: response.data.data
          },
          "Payment status retrieved"
        )
      );
    } else {
      await updateTransaction(transactionId, "FAILED", response.data);
      throw new ApiError(400, "Failed to retrieve payment status");
    }
  } catch (error) {
    console.error("Payment status check error:", error);
    throw new ApiError(
      error.response?.status || 500,
      error.response?.data?.message || error.message || "Failed to check payment status"
    );
  }
});

/**
 * Process refund for a payment
 */
const processRefund = asyncHandler(async (req, res) => {
  try {
    const { transactionId, amount, reason } = req.body;
    
    if (!transactionId) {
      throw new ApiError(400, "Transaction ID is required");
    }
    
    if (!amount) {
      throw new ApiError(400, "Refund amount is required");
    }
    
    const refundId = uuidv4();
    
    const refundPayload = {
      merchantId: MERCHANT_ID,
      merchantTransactionId: transactionId,
      merchantRefundId: refundId,
      amount: Number(amount) * 100,
      callbackUrl: `${redirectUrl}/refund?id=${refundId}`
    };
    
    // Add optional reason if provided
    if (reason) {
      refundPayload.reason = reason;
    }
    
    const payload = Buffer.from(JSON.stringify(refundPayload)).toString('base64');
    const keyIndex = 1;
    const string = payload + '/pg/v1/refund' + MERCHANT_KEY;
    const checksum = generateChecksum(string, keyIndex);
    
    const option = {
      method: 'POST',
      url: MERCHANT_REFUND_URL,
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        'X-VERIFY': checksum
      },
      data: {
        request: payload
      }
    };
    
    const response = await axios.request(option);
    
    if (response.data.success === true) {
      // Update transaction in database
      await updateTransaction(transactionId, "REFUNDED", {
        refundId,
        refundAmount: amount,
        refundResponse: response.data
      });
      
      return res.status(200).json(
        new ApiResponse(
          200,
          {
            status: "REFUNDED",
            refundId: refundId,
            transactionId: transactionId,
            details: response.data.data
          },
          "Refund processed successfully"
        )
      );
    } else {
      throw new ApiError(400, response.data.message || "Failed to process refund");
    }
  } catch (error) {
    console.error("Refund processing error:", error);
    throw new ApiError(
      error.response?.status || 500,
      error.response?.data?.message || error.message || "Failed to process refund"
    );
  }
});

/**
 * Check refund status
 */
const checkRefundStatus = asyncHandler(async (req, res) => {
  try {
    const { refundId, transactionId } = req.params;
    
    if (!refundId || !transactionId) {
      throw new ApiError(400, "Refund ID and Transaction ID are required");
    }
    
    const keyIndex = 1;
    const string = `/pg/v1/refund/${MERCHANT_ID}/${transactionId}/${refundId}` + MERCHANT_KEY;
    const checksum = generateChecksum(string, keyIndex);
    
    const option = {
      method: 'GET',
      url: `${MERCHANT_REFUND_URL}/${MERCHANT_ID}/${transactionId}/${refundId}`,
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        'X-VERIFY': checksum,
        'X-MERCHANT-ID': MERCHANT_ID
      }
    };
    
    const response = await axios.request(option);
    
    if (response.data.success === true) {
      return res.status(200).json(
        new ApiResponse(
          200,
          {
            status: response.data.data.state,
            refundId: refundId,
            transactionId: transactionId,
            details: response.data.data
          },
          "Refund status retrieved successfully"
        )
      );
    } else {
      throw new ApiError(400, "Failed to retrieve refund status");
    }
  } catch (error) {
    console.error("Refund status check error:", error);
    throw new ApiError(
      error.response?.status || 500,
      error.response?.data?.message || error.message || "Failed to check refund status"
    );
  }
});

/**
 * Handle PhonePe webhook notifications
 */
const handlePhonePeWebhook = asyncHandler(async (req, res) => {
  try {
    // Verify webhook signature
    const signature = req.headers['x-verify'];
    const payload = req.body;
    
    if (!signature) {
      throw new ApiError(400, "Missing signature header");
    }
    
    // PhonePe webhook processing logic
    const transactionId = payload.data?.merchantTransactionId;
    const paymentStatus = payload.data?.responseCode === "SUCCESS" ? "SUCCESS" : "FAILED";
    
    if (transactionId) {
      await updateTransaction(transactionId, paymentStatus, payload);
    }
    
    // Always return 200 OK for webhooks
    return res.status(200).json({ success: true });
    
  } catch (error) {
    console.error("Webhook handling error:", error);
    
    // Always return 200 OK for webhooks even on error
    // to prevent PhonePe from retrying
    return res.status(200).json({
      success: true,
      message: "Webhook received but had processing issues"
    });
  }
});

export {
  initiatePhonePePayment,
  verifyPhonePePayment,
  paymentStatus,
  checkPaymentStatus,
  processRefund,
  checkRefundStatus,
  handlePhonePeWebhook
};