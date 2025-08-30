// Basic test to verify Jest setup
describe("Basic Test Setup", () => {
  test("should pass basic test", () => {
    expect(1 + 1).toBe(2);
  });

  test("should have test utilities available", () => {
    expect(global.testUtils).toBeDefined();
    expect(global.testConfig).toBeDefined();
    expect(typeof global.testUtils.generateTestToken).toBe("function");
  });

  test("should have database utilities available", () => {
    expect(global.testDb).toBeDefined();
    expect(global.prisma).toBeDefined();
    expect(typeof global.testDb.cleanup).toBe("function");
  });
});
