import { HealthController } from './health.controller';

describe('HealthController', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-06-11T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns an ok payload with an ISO timestamp', () => {
    const controller = new HealthController();

    expect(controller.check()).toEqual({
      status: 'ok',
      timestamp: '2026-06-11T12:00:00.000Z',
    });
  });
});
