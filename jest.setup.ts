import { configure } from '@testing-library/react-native';

// The default of 1 s for findBy* and waitFor is easy to exceed on a cold transform cache or a busy machine, which
// made suites fail intermittently. This only lengthens the wait: a condition that never happens still fails.
configure({ asyncUtilTimeout: 5_000 });

jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);
