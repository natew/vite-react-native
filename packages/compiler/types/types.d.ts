<<<<<<< HEAD
import type { TransformBabelOptions } from './transformBabel';
=======
import type { Options as SWCOptions } from '@swc/core';
>>>>>>> main
export type Environment = 'ios' | 'android' | 'ssr' | 'client';
export type Options = {
    environment: Environment;
    mode: 'serve' | 'serve-cjs' | 'build';
    forceJSX?: boolean;
    noHMR?: boolean;
    production?: boolean;
<<<<<<< HEAD
    babel?: TransformBabelOptions;
    fixNonTypeSpecificImports?: boolean;
};
=======
    fixNonTypeSpecificImports?: boolean;
    transform?: GetTransform;
};
export type GetTransformProps = {
    id: string;
    code: string;
    development: boolean;
    environment: Environment;
    reactForRNVersion: '18' | '19';
};
export type GetTransform = (props: GetTransformProps) => GetTransformResponse;
export type GetTransformResponse = boolean | 'babel' | 'swc' | TransformOptions;
export type TransformOptions = BabelTransformOptions | SWCTransformOptions;
export type SWCTransformOptions = {
    transform: 'swc';
} & SWCOptions;
export type BabelTransformOptions = {
    transform: 'babel';
    excludeDefaultPlugins?: boolean;
} & babel.TransformOptions;
>>>>>>> main
//# sourceMappingURL=types.d.ts.map