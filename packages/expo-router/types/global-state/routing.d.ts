import type { RouterStore } from './router-store';
import type { ExpoRouter } from '../interfaces/expo-router';
export declare function navigate(this: RouterStore, url: ExpoRouter.Href): void;
export declare function push(this: RouterStore, url: ExpoRouter.Href): void;
export declare function dismiss(this: RouterStore, count?: number): void;
export declare function replace(this: RouterStore, url: ExpoRouter.Href): void;
export declare function dismissAll(this: RouterStore): void;
export declare function goBack(this: RouterStore): void;
export declare function canGoBack(this: RouterStore): boolean;
export declare function canDismiss(this: RouterStore): boolean;
export declare function setParams(this: RouterStore, params?: Record<string, string | number>): any;
export declare function linkTo(this: RouterStore, href: string, event?: string): void;
//# sourceMappingURL=routing.d.ts.map