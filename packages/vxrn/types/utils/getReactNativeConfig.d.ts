import { type InlineConfig, type Plugin, type UserConfig } from 'vite';
import type { VXRNOptionsFilled } from './getOptionsFilled';
export declare function getReactNativeConfig(options: VXRNOptionsFilled, internal: {
    mode?: "dev" | "prod";
    assetsDest?: string;
} | undefined, platform: 'ios' | 'android'): Promise<{
    plugins: any[];
    appType: "custom";
    root: string;
    clearScreen: false;
    optimizeDeps: {
        esbuildOptions: {
            jsx: "automatic";
        };
        include: string[];
        exclude: string[];
        needsInterop: string[];
    };
    resolve: {
        dedupe: string[];
    };
    mode: string;
    define: {
        'process.env.NODE_ENV': string;
        'process.env.ONE_SERVER_URL': string;
    };
    build: {
        ssr: false;
        minify: false;
        commonjsOptions: {
            transformMixedEsModules: true;
            ignore(id: string): id is "react/jsx-runtime" | "react/jsx-dev-runtime";
        };
        rollupOptions: {
            input: string;
            treeshake: false;
            preserveEntrySignatures: "strict";
            output: {
                preserveModules: true;
                format: "cjs";
            };
            onwarn(message: import("rollup").RollupLog, warn: import("rollup").LoggingFunction): void;
            onLog(level: import("rollup").LogLevel, log: import("rollup").RollupLog, handler: import("rollup").LogOrStringHandler): void;
        };
    };
}>;
export declare function getReactNativeResolvedConfig(): Readonly<Omit<UserConfig, "plugins" | "css" | "assetsInclude" | "optimizeDeps" | "worker" | "build" | "dev" | "environments"> & {
    configFile: string | undefined;
    configFileDependencies: string[];
    inlineConfig: InlineConfig;
    root: string;
    base: string;
    publicDir: string;
    cacheDir: string;
    command: "build" | "serve";
    mode: string;
    isWorker: boolean;
    isProduction: boolean;
    envDir: string;
    env: Record<string, any>;
    resolve: Required<import("vite").ResolveOptions> & {
        alias: import("vite").Alias[];
    };
    plugins: readonly Plugin[];
    css: import("vite").ResolvedCSSOptions;
    esbuild: import("vite").ESBuildOptions | false;
    server: import("vite").ResolvedServerOptions;
    dev: import("vite").ResolvedDevEnvironmentOptions;
    builder: Required<import("vite").BuilderOptions>;
    build: import("vite").ResolvedBuildOptions;
    preview: import("vite").ResolvedPreviewOptions;
    ssr: import("vite").ResolvedSSROptions;
    assetsInclude: (file: string) => boolean;
    logger: import("vite").Logger;
    createResolver: (options?: Partial<import("vite").InternalResolveOptions>) => import("vite").ResolveFn;
    optimizeDeps: import("vite").DepOptimizationOptions;
    worker: import("vite").ResolvedWorkerOptions;
    appType: import("vite").AppType;
    experimental: import("vite").ExperimentalOptions;
    environments: Record<string, {
        define?: Record<string, any>;
        resolve: Required<import("vite").ResolveOptions>;
        consumer: "client" | "server";
        webCompatible: boolean;
        dev: import("vite").ResolvedDevEnvironmentOptions;
        build: import("vite").ResolvedBuildEnvironmentOptions;
    }>;
} & import("vite").PluginHookUtils> | null;
//# sourceMappingURL=getReactNativeConfig.d.ts.map