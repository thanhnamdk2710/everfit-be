import rateLimit from "express-rate-limit";

import { getConfig } from "../../../infrastructure/config";

export const createRateLimiter = () => {
  const config = getConfig();

  return rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message: "Too many requests, please try again later.",
      },
    },
    // Use default keyGenerator which properly handles IPv6
    skip: () => process.env.NODE_ENV === "test",
    validate: { xForwardedForHeader: false },
  });
};
