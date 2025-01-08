import type { PathConfigMap } from '@react-navigation/core';
import type { RouteNode } from '../router/Route';
import type { OneRouter } from '../interfaces/router';
type Options<ParamList extends object> = {
    initialRouteName?: string;
    screens: PathConfigMap<ParamList>;
};
type ParseConfig = Record<string, (value: string) => any>;
type InitialRouteConfig = {
    initialRouteName: string;
    parentScreens: string[];
};
export declare function getUrlWithReactNavigationConcessions(path: string, baseUrl?: string | undefined): {
    nonstandardPathname: string;
    inputPathnameWithoutHash: string;
    url: null;
} | {
    nonstandardPathname: string;
    url: URL;
    inputPathnameWithoutHash?: undefined;
};
/**
 * Utility to parse a path string to initial state object accepted by the container.
 * This is useful for deep linking when we need to handle the incoming URL.
 *
 * @example
 * ```js
 * getStateFromPath(
 *   '/chat/jane/42',
 *   {
 *     screens: {
 *       Chat: {
 *         path: 'chat/:author/:id',
 *         parse: { id: Number }
 *       }
 *     }
 *   }
 * )
 * ```
 * @param path Path string to parse and convert, e.g. /foo/bar?count=42.
 * @param options Extra options to fine-tune how to parse the path.
 */
export default function getStateFromPath<ParamList extends object>(path: string, options?: Options<ParamList>): OneRouter.ResultState | undefined;
export declare function getMatchableRouteConfigs<ParamList extends object>(options?: Options<ParamList>): {
    configs: {
        isInitial: boolean;
        screen: string;
        regex?: RegExp;
        path: string;
        pattern: string;
        routeNames: string[];
        parse?: ParseConfig;
        hasChildren: boolean;
        userReadableName: string;
        _route?: RouteNode;
    }[];
    initialRoutes: InitialRouteConfig[];
};
export declare function stripBaseUrl(path: string, baseUrl?: string | undefined): string;
export {};
//# sourceMappingURL=getStateFromPath.d.ts.map