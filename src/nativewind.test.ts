describe('nativewind runtime', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('does not trigger the react-native SafeAreaView deprecation warning when registering components', () => {
    // Arrange
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    // Act
    // The JSX runtime skips this module when NODE_ENV is "test", so it is loaded directly:
    // it is the module that registers className support for react-native components at app startup.
    jest.isolateModules(() => {
      require('react-native-css-interop/dist/runtime/components');
    });

    // Assert
    const deprecationWarnings = warn.mock.calls
      .map(([message]) => String(message))
      .filter((message) => message.includes('SafeAreaView has been deprecated'));

    expect(deprecationWarnings).toEqual([]);
  });
});
