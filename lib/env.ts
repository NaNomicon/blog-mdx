import { z } from "zod/v4";

// Environment variable schema using Zod v4
const envSchema = z.object({
    // Node.js environment
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

    // Analytics
    NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN: z.string().optional(),

    // Build configuration
    ANALYZE: z
        .string()
        .optional()
        .transform((val) => val === "true"),
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

// Export validated environment variables
export const env = parseEnv();
export { parseEnv };

// Type exports for TypeScript
export type Env = typeof env;
