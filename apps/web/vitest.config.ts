import baseConfig from "@repo/config/vitest.config";
import { mergeConfig } from "vite";

export default mergeConfig(baseConfig, {
	test: {
		setupFiles: ["./src/setupTests.ts"],
	},
});
