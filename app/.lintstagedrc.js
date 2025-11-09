const buildEslintCommand = (filenames) =>
  `eslint ${filenames.join(' ')} --fix`;

const buildPrettierCommand = (filenames) =>
  `prettier ${filenames
    .join(' ')} -w`;

export default {
  'src/**/*.{js,jsx,ts,tsx}': [buildEslintCommand],
  'src/**/*.{js,jsx,ts,tsx,md,html,css}': [buildPrettierCommand],
};
