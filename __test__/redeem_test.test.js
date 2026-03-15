const ApiHandler = require('./../support/api-handler');

describe('redeem api test (email / phone based)', () => {
  let api = new ApiHandler();

  const register_end_point = '/api/Auth/Register';
  const create_redeem_end_point = '/api/Redeem/CreateRedeem';
  const get_redeem_end_point = '/api/Redeem/GetAllRedeems';
  const retrieve_redeem_end_point = '/api/Redeem/GetRedeemById';
  const patch_redeem_end_point = '/api/Redeem/UpdateRedeem';
  const delete_redeem_end_point = '/api/Redeem/DeleteRedeem';
  const active_redeem_end_point = '/api/Redeem/ActivateCode';

  const registerData = {
    userName: "shadi",
    googleId: "qwerty",
    profileImage: "",
    deviceToken: ""
  };

  // -------------------------------
  // Helpers
  // -------------------------------

  const getGlobalRedeemData = ({ useEmail = true } = {}) => {
    if (useEmail === null) {
      throw new Error('Either email or phoneNumber must be provided');
    }

    return {
      packageId: 16,
      ...(useEmail
        ? { email: `user_${Date.now()}@test.com` }
        : { phoneNumber: `+2010${Math.floor(10000000 + Math.random() * 89999999)}` }
      )
    };
  };

  // -------------------------------
  // Create Redeem
  // -------------------------------

  it("should create redeem using EMAIL only", async () => {
    const data = getGlobalRedeemData({ useEmail: true });

    const response = await api.post(create_redeem_end_point, data);
    expect(response.status).toBe(200);
    expect(response.data.data).toHaveProperty('id');
  });

  it("should create redeem using PHONE NUMBER only", async () => {
    const data = getGlobalRedeemData({ useEmail: false });

    const response = await api.post(create_redeem_end_point, data);
    expect(response.status).toBe(200);
    expect(response.data.data).toHaveProperty('id');
  });

  it("should fail when BOTH email and phoneNumber are sent", async () => {
    const invalidData = {
      packageId: 0,
      email: "test@test.com",
      phoneNumber: "+201012345678"
    };

    const response = await api.post(create_redeem_end_point, invalidData);
    expect(response.status).toBe(400);
  });

  it("should fail when NEITHER email nor phoneNumber is sent", async () => {
    const invalidData = {
      packageId: 0
    };

    const response = await api.post(create_redeem_end_point, invalidData);
    expect(response.status).toBe(400);
  });

  // -------------------------------
  // Get / Retrieve
  // -------------------------------

  it("should get all redeems", async () => {
    const response = await api.get(get_redeem_end_point);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data.data)).toBe(true);
  });

  it("should retrieve redeem by id", async () => {
    const createResponse = await api.post(
      create_redeem_end_point,
      getGlobalRedeemData()
    );

    const redeemId = createResponse.data.data.id;
    const retrieveResponse = await api.get(`${retrieve_redeem_end_point}/${redeemId}`);

    expect(retrieveResponse.status).toBe(200);
    expect(retrieveResponse.data.data.id).toBe(redeemId);
  });

  // -------------------------------
  // Delete
  // -------------------------------

  it("should delete redeem by id", async () => {
    const createResponse = await api.post(
      create_redeem_end_point,
      getGlobalRedeemData()
    );

    const redeemId = createResponse.data.data.id;

    const beforeDelete = await api.get(get_redeem_end_point);
    const initialCount = beforeDelete.data.data.length;

    const deleteResponse = await api.delete(`${delete_redeem_end_point}/${redeemId}`);
    expect(deleteResponse.status).toBe(200);

    const afterDelete = await api.get(get_redeem_end_point);
    expect(afterDelete.data.data.length).toBe(initialCount - 1);
  });

  // -------------------------------
  // Activation
  // -------------------------------

  it("should activate redeem code successfully", async () => {
    const register = await api.post(register_end_point, registerData);
    api = new ApiHandler({ authToken: register.data.data.accessToken });

    const createResponse = await api.post(
      create_redeem_end_point,
      getGlobalRedeemData()
    );

    const activateResponse = await api.post(active_redeem_end_point, {
      code: createResponse.data.data.code
    });

    expect(activateResponse.status).toBe(200);
  });

  it("should fail activating same code twice", async () => {
    const register = await api.post(register_end_point, registerData);
    api = new ApiHandler({ authToken: register.data.data.accessToken });

    const createResponse = await api.post(
      create_redeem_end_point,
      getGlobalRedeemData()
    );

    const code = createResponse.data.data.code;

    await api.post(active_redeem_end_point, { code });

    const secondActivation = await api.post(active_redeem_end_point, { code });
    expect(secondActivation.status).toBe(400);
  });

  it("should fail activation with empty code", async () => {
    const register = await api.post(register_end_point, registerData);
    api = new ApiHandler({ authToken: register.data.data.accessToken });

    const response = await api.post(active_redeem_end_point, { code: "" });
    expect(response.status).toBe(400);
  });
});
