// tests/api.test.js
// .env is loaded automatically via api-handler.js import.
// No need to pass baseUrl - it uses process.env.BASE_URL.

const ApiHandler = require('./../support/api-handler');  // This triggers dotenv.config()

describe('auth api test', () => {
  let api = new ApiHandler();
  let accessToken;
  let refreshToken;
  const register_end_point = '/api/Auth/Register';
  const refresh_end_point = '/api/Auth/RefreshToken';

  const registerData = {
    "userName": "shadi",
    "googleId": "a8f1a1ef-a0e3-4235-9f48-9d1906eefb3c"
  };

  it('should register', async () => {
    const result = await api.post(register_end_point, registerData);
    expect(result.status).toBe(200);
    refreshToken = result.data.refreshToken;
    accessToken = result.data.data.accessToken;
  });

  it('should refresh token', async () => {
    console.log(refreshToken);
    
    const result = await api.post(refresh_end_point, { "refreshToken": refreshToken });
    expect(result.status).toBe(200);
    expect(result.data.refreshToken).toEqual(refreshToken);
  });

  it('shouldn\'t refresh token when sending access Token', async () => {
    const result = await api.post(refreshToken, { userName: "shadi" });
    accessToken = result.data.accessToken;
    const result1 = await api.post(refreshToken, { refreshToken: accessToken });
    expect(result1.status).toBe(401);
  })


});
