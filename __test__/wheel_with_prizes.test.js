const ApiHandler = require('./../support/api-handler');

describe('product api test', () => {
  let api = new ApiHandler();
  let createWheelData = new FormData();
  let spinData = {
    "wheelId": 23,
    "correlationId": "aedced1e-a205-4167-9b91-21d2e6ca544c"
  };
  const userName = 'shadi';
  const registerData = {
    "userName": "shadi",
    "googleId": "string",
    "profileImage": "",
    "deviceToken": ""
  };
  const register_end_point = '/api/Auth/Register';
  const customHeaders = { 'Content-Type': 'application/form-data' };
  const spin_end_point = '/api/Spin/Spin';

  beforeAll(async () => {
    const result = await api.post(register_end_point, registerData);
    api = new ApiHandler(result.data.data.accessToken);
  });

  it("try to spin an active wheel", async () => {
    const spinResponse = await api.post(spin_end_point, spinData);
    expect(spinResponse.status).toBe(200);
    expect(spinResponse.data.data).toHaveProperty('prize');
    expect(spinResponse.data.data.prize).toHaveProperty('id');
    expect(spinResponse.data.data.prize).toHaveProperty('type');
    expect(spinResponse.data.data.prize).toHaveProperty('weight');
    expect(spinResponse.data.data.prize).toHaveProperty('amount');
    expect(spinResponse.data.data.prize.type).toHaveProperty('name');
    expect(spinResponse.data.data.prize.type).toHaveProperty('inGame');
    expect(spinResponse.data.data.prize.type).toHaveProperty('category');
    //shouldn't be able to spin again because it is a daily spin
    const spinResponse2 = await api.post(spin_end_point, spinData);
    expect(spinResponse2.status).toBe(401);
  });

});