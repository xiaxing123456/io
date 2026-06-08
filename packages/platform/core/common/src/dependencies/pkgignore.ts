const globalDependenciesNames = [
    'vue',
    'vue-demi',
    'vuex',
    'vue-router',
    'vue-i18n',
    'pinia',
] as const;

const moduleImportMap: AnyObj = {
    vue: () => import('vue'),
    'vue-router': () => import('vue-router'),
    'vue-demi': () => import('vue-demi'),
    'vue-i18n': () => import('vue-i18n'),
    pinia: () => import('pinia'),
};

type GlobalSources = {
    [key in (typeof globalDependenciesNames)[number]]: string;
};

const globalSources: GlobalSources = {} as GlobalSources;

const kebabCaseToUpperCase = (name: string) => {
    return name.replace(/(-\w)|^\w/g, match => match.charAt(match.length - 1).toUpperCase());
};

// eslint-disable-next-line no-restricted-syntax
for (const name of globalDependenciesNames) {
    globalSources[name] = kebabCaseToUpperCase(name);
}

export { globalDependenciesNames, globalSources, kebabCaseToUpperCase, moduleImportMap };
export type { GlobalSources };
