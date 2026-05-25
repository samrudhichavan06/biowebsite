import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

const apiRouteFiles: Record<string, string> = {
  "/api/send-attendee-email": "./api/send-attendee-email.js",
  "/api/send-badge-email": "./api/send-badge-email.js",
  "/api/send-notification-email": "./api/send-notification-email.js",
  "/api/email-status": "./api/email-status.js",
};

const readRequestBody = (req: any) =>
  new Promise<string>((resolve, reject) => {
    const chunks: Buffer[] = [];

    req.on("data", (chunk: Buffer | string) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });

    req.on("end", () => {
      resolve(Buffer.concat(chunks).toString("utf8"));
    });

    req.on("error", reject);
  });

const serveLocalApiRoutes = (applyEmailEnv?: () => void) => ({
  name: "serve-local-api-routes",
  configureServer(server: any) {
    applyEmailEnv?.();

    server.middlewares.use(async (req: any, res: any, next: any) => {
      const requestPath = String(req.url || "").split("?")[0];
      const routeFile = apiRouteFiles[requestPath];

      if (!routeFile) {
        return next();
      }

      if (!req.method || !["POST", "OPTIONS"].includes(req.method)) {
        res.statusCode = 405;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Method not allowed" }));
        return;
      }

      try {
        const body = await readRequestBody(req);
        const moduleId = `/@fs/${path.resolve(__dirname, routeFile).replace(/\\/g, "/")}`;
        const handlerModule = await server.ssrLoadModule(moduleId);
        const handler = handlerModule.default;
        const headers = new Map<string, string>();
        let statusCode = 200;
        let ended = false;

        const mockResponse = {
          get statusCode() {
            return statusCode;
          },
          set statusCode(value: number) {
            statusCode = value;
          },
          setHeader(name: string, value: string) {
            headers.set(name, value);
          },
          end(payload = "") {
            if (ended) {
              return;
            }

            ended = true;
            headers.forEach((value, name) => res.setHeader(name, value));
            res.statusCode = statusCode;
            res.end(payload);
          },
        };

        await handler({ method: req.method, body }, mockResponse);

        if (!ended) {
          headers.forEach((value, name) => res.setHeader(name, value));
          res.statusCode = statusCode;
          res.end();
        }
      } catch (error) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({
            error: "Failed to run local API handler",
            details: error instanceof Error ? error.message : String(error),
          })
        );
      }
    });
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const loadedEnv = loadEnv(mode, process.cwd(), "");

  const applyEmailEnv = () => {
    for (const key of ["AWS_REGION", "AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_SES_FROM_EMAIL"] as const) {
      const loadedValue = loadedEnv[key];

      if (loadedValue) {
        process.env[key] = loadedValue;
      }
    }
  };

  return {
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
    },
    plugins: [
      react(),
      mode === "development" && componentTagger(),
      serveLocalApiRoutes(applyEmailEnv),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
    },
  };
});
