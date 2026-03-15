const ApiHandler = require('./../support/api-handler');

describe('spin api test', () => {
  let api = new ApiHandler();
  const spin_end_point = '/api/Spin/Spin';
  const get_all_spins_end_point = '/api/Spin/GetAllSpins';
  let userId = '';

  const register_end_point = '/api/Auth/Register';
  const userName = 'shadi1';
  const registerData = {
    "userName": userName,
    "googleId": "76d7a2eb-ceb7-4777-9a94-d3821abcfc92"
  };

  const spinData = {
    "wheelId": 1,
    "correlationId": "de8fd358-aca4-45e5-9e4c-a0812330a563"
  };

  const requiredFields = ['id', 'userId', 'wheelId', 'prize', 'spinAt', 'type'];

  beforeEach(async () => {
    const result = await api.post(register_end_point, registerData);
    expect(result.status).toBe(200);
    accessToken = result.data.data.accessToken;
    api = new ApiHandler({ authToken: accessToken });
    userId = result.data.data.user.balance.userId;
  });

  it('try to spin', async () => {
    const result = await api.post(spin_end_point, spinData);
    expect(result.status).toBe(200);
    expect(result.data.data.userId).toBe(userId);
    expect(result.data.data.wheelId).toBe(spinData.wheelId);
  });

  it('should return same spin id if sending same correlation id', async () => {
    const firstSpin = await api.post(spin_end_point, spinData);
    expect(firstSpin.status).toBe(200);
    let data = spinData;
    data.wheelId = 2;
    const secondSpin = await api.post(spin_end_point, data);
    expect(secondSpin.status).toBe(200);
    expect(firstSpin.data.id).toBe(secondSpin.data.id);
  });

  it('should fetch all spins', async () => {
    const result = await api.get(get_all_spins_end_point);
    expect(result.status).toBe(200);
    expect(result.data.isSuccess).toBe(true);
    expect(result.data.statusCode).toBe(200);
    expect(Array.isArray(result.data.data)).toBe(true);
    result.data.data.forEach((level, index) => {
      requiredFields.forEach(field => {
        expect(level).toHaveProperty(field);
      });
    });
  });

});