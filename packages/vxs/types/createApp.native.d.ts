import './polyfills-native';
export type CreateAppProps = {
    routes: Record<string, () => Promise<unknown>>;
};
export declare function createApp(options: CreateAppProps): void;
//# sourceMappingURL=createApp.native.d.ts.map