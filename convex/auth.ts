import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { components } from "./_generated/api";
import { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";
import { betterAuth } from "better-auth";
import authConfig from "./auth.config";

// Convex <-> Better Auth client
export const authComponent = createClient<DataModel>(components.betterAuth);

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  // Validate environment variables at runtime (not at module load time)
  const siteUrl = process.env.NEXT_PUBLIC_CONVEX_SITE_URL;
  if (!siteUrl) {
    throw new Error(
      "SITE_URL environment variable is not set in Convex. Set it using: npx convex env set SITE_URL http://localhost:3000",
    );
  }

  const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim();
  // Check both GOOGLE_CLIENT_SECRET and GOOGLE_CLIENT_SERVICE (for backwards compatibility)
  const googleClientSecret =
    process.env.GOOGLE_CLIENT_SECRET?.trim() ||
    process.env.GOOGLE_CLIENT_SERVICE?.trim();

  // Build social providers conditionally
  const socialProviders: Record<string, any> = {};

  // Only add Google provider if both credentials are provided (non-empty strings)
  // Silently skip if not configured - don't throw errors during module analysis
  if (googleClientId && googleClientSecret) {
    socialProviders.google = {
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    };
  }

  const betterAuthConfig: any = {
    baseURL: siteUrl,
    database: authComponent.adapter(ctx),

    // ✅ Email/password (already working)
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },

    plugins: [
      // Required Convex plugin
      convex({ authConfig }),
    ],
  };

  // Only add socialProviders if we have at least one provider configured
  if (Object.keys(socialProviders).length > 0) {
    betterAuthConfig.socialProviders = socialProviders;
  }

  return betterAuth(betterAuthConfig);
};

// Example query (already fine)
export const getCurrentUser = query({
  args: {},
  handler: async ctx => {
    return authComponent.getAuthUser(ctx);
  },
});
