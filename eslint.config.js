import eslint from '@eslint/js';
import gitignore from 'eslint-config-flat-gitignore';
import prettierConfig from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

export default tseslint.config(gitignore(), eslint.configs.recommended, tseslint.configs.recommended, prettierConfig);
