module.exports = {
    env: {
        browser: true,
        commonjs: true,
        es2021: true,
    },
    extends: 'airbnb-base',
    overrides: [
    ],
    parserOptions: {
        ecmaVersion: 'latest',
    },
    rules: {
        semi: ['error', 'never'],
        indent: ['error', 4],
        curly: ['error', 'multi'],
        'arrow-parens': ['error', 'as-needed'],
    },
}
