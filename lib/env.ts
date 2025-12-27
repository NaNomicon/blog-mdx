import { z } from "zod/v4";

// Environment variable schema using Zod v4
const envSchema = z.object({
    // Node.js environment
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

    // Telegram Bot Configuration
    TELEGRAM_BOT_TOKEN: z.string().optional(),
    TELEGRAM_CHAT_ID: z.string().optional(),
    TELEGRAM_NOTIFICATIONS_ENABLED: z
        .string()
        .optional()
        .default("false")
        .transform((val) => val === "true"),

    // Analytics
    NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN: z.string().optional(),

    // TinaCMS Configuration
    TINA_PUBLIC_IS_LOCAL: z.string().optional().default("0"),
    NEXT_PUBLIC_TINA_GQL_URL: z.string().optional(),
    MONGODB_URI: z.string().optional(),
    GITHUB_PERSONAL_ACCESS_TOKEN: z.string().optional(),
    GITHUB_OWNER: z.string().optional(),
    GITHUB_REPO: z.string().optional(),
    TINA_TOKEN: z.string().optional(),
    NEXT_PUBLIC_TINA_BRANCH: z.string().optional().default("main"),

    // Build configuration
    ANALYZE: z
        .string()
        .optional()
        .transform((val) => val === "true"),
});

// Derived schema for Telegram configuration validation
const telegramConfigSchema = z.object({
    TELEGRAM_BOT_TOKEN: z.string().min(1, "Telegram bot token is required"),
    TELEGRAM_CHAT_ID: z.string().min(1, "Telegram chat ID is required"),
    TELEGRAM_NOTIFICATIONS_ENABLED: z.literal(true),
});

// Parse and validate environment variables
function parseEnv() {
    try {
        return envSchema.parse(process.env);
    } catch (error) {
        console.error("❌ Environment validation failed:");
        if (error instanceof z.ZodError) {
            error.issues.forEach((issue) => {
                console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
            });
        }
        throw new Error("Invalid environment configuration");
    }
}

// Validate Telegram configuration specifically
function validateTelegramConfig(env: ReturnType<typeof parseEnv>) {
    if (!env.TELEGRAM_NOTIFICATIONS_ENABLED) {
        return {
            isValid: false,
            missingVars: [],
            message: "Telegram notifications are disabled",
        };
    }

    try {
        telegramConfigSchema.parse(env);
        return {
            isValid: true,
            missingVars: [],
            message: "Telegram configuration is valid",
        };
    } catch (error) {
        if (error instanceof z.ZodError) {
            const missingVars = error.issues.map((issue) => issue.path.join("."));
            return {
                isValid: false,
                missingVars,
                message: `Missing required Telegram configuration: ${missingVars.join(", ")}`,
            };
        }
        return {
            isValid: false,
            missingVars: [],
            message: "Unknown Telegram configuration error",
        };
    }
}

// Export validated environment variables
export const env = parseEnv();

// Export validation functions
export { validateTelegramConfig };

// Type exports for TypeScript
export type Env = typeof env;
export type TelegramConfig = z.infer<typeof telegramConfigSchema>; 