export default {
    preset: 'ts-jest/presets/default-esm',
    testEnvironment: 'node',
    testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
    transform: {
        '^.+\\.ts$': ['ts-jest', { useESM: true }],
    },
    extensionsToTreatAsEsm: ['.ts'],
    transformIgnorePatterns: ['node_modules/(?!(lowdb|steno)/)'],
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    }
};
