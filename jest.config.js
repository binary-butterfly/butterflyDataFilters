module.exports = {
    verbose: true,
    reporters: ['default', 'jest-junit'],
    coverageReporters: ['html', 'lcov', 'text', 'text-summary'],
    transform: {
        '^.+\\.(js|ts)$': 'babel-jest',
    },
};
