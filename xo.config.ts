const xoConfig = {
    prettier: true,
    rules: {
        // Turned off as this is idiomatic CDK
        'no-new': 'off',
        // Turned off as we would otherwise have to define a lot of exceptions
        // for interacting with third party modules
        '@typescript-eslint/naming-convention': 'off',
    },
    space: true,
};

export default xoConfig;