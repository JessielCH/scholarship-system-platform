import * as appModule from './app.module';

describe('AppModule', () => {
  it('should export AppModule without errors', () => {
    expect(appModule.AppModule).toBeDefined();
  });
});
