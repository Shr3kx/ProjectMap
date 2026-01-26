// import { httpRouter } from "convex/server";
// import { authComponent, createAuth } from "./auth";

// const http = httpRouter();

// authComponent.registerRoutes(http, createAuth);

// export default http;

import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

const http = httpRouter();

http.route({
  path: "/",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    return new Response(`Hello from ${request.url}`);
  }),
});
export default http;
