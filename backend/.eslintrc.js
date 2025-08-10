module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    '@typescript-eslint/recommended-requiring-type-checking',
    'plugin:@typescript-eslint/strict',
    'prettier',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
    es2022: true,
  },
  ignorePatterns: [
    '.eslintrc.js',
    'dist/',
    'node_modules/',
    'coverage/',
    '*.js',
    'prisma/migrations/',
  ],
  rules: {
    // TypeScript specific rules
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/no-misused-promises': 'error',
    '@typescript-eslint/require-await': 'error',
    '@typescript-eslint/no-unnecessary-type-assertion': 'error',
    '@typescript-eslint/prefer-as-const': 'error',
    '@typescript-eslint/no-inferrable-types': 'error',
    '@typescript-eslint/consistent-type-imports': [
      'error',
      { prefer: 'type-imports' },
    ],
    '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
    '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
    '@typescript-eslint/member-ordering': [
      'error',
      {
        default: [
          'static-field',
          'instance-field',
          'static-method',
          'instance-method',
        ],
      },
    ],

    // General ESLint rules
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',
    'no-alert': 'error',
    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-arrow-callback': 'error',
    'arrow-spacing': 'error',
    'no-duplicate-imports': 'error',
    'no-useless-rename': 'error',
    'object-shorthand': 'error',
    'prefer-destructuring': [
      'error',
      {
        array: false,
        object: true,
      },
    ],
    'prefer-template': 'error',
    'template-curly-spacing': 'error',
    'no-useless-concat': 'error',
    'no-multi-spaces': 'error',
    'no-trailing-spaces': 'error',
    'comma-dangle': ['error', 'always-multiline'],
    'semi': ['error', 'always'],
    'quotes': ['error', 'single', { avoidEscape: true }],
    'indent': 'off', // Handled by Prettier
    'max-len': [
      'error',
      {
        code: 100,
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreComments: true,
      },
    ],
    'max-lines': ['warn', { max: 300, skipBlankLines: true, skipComments: true }],
    'max-lines-per-function': [
      'warn',
      { max: 50, skipBlankLines: true, skipComments: true },
    ],
    'complexity': ['warn', 10],
    'max-depth': ['warn', 4],
    'max-nested-callbacks': ['warn', 3],
    'max-params': ['warn', 4],

    // Import rules
    'sort-imports': [
      'error',
      {
        ignoreCase: true,
        ignoreDeclarationSort: true,
      },
    ],

    // Security rules
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-script-url': 'error',

    // Performance rules
    'no-loop-func': 'error',
    'no-await-in-loop': 'warn',
  },
  overrides: [
    {
      files: ['*.spec.ts', '*.e2e-spec.ts', 'test/**/*.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        'max-lines-per-function': 'off',
        'max-lines': 'off',
      },
    },
    {
      files: ['*.dto.ts', '*.entity.ts', '*.interface.ts'],
      rules: {
        '@typescript-eslint/no-inferrable-types': 'off',
        'max-lines': 'off',
      },
    },
    {
      files: ['src/database/migrations/*.ts', 'src/database/seeds/*.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'max-lines': 'off',
        'max-lines-per-function': 'off',
      },
    },
  ],
};

