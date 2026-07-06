module.exports = {
  stories: ["../src/components/**/*.stories.@(js|jsx|ts|tsx)"],


  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-a11y",
    "@chromatic-com/storybook"
  ],

  framework: "@storybook/react-vite",

  docs: {
    autodocs: true
  }
};
