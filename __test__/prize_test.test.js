const ApiHandler = require('./../support/api-handler');
const FormData = require('form-data');

let api = new ApiHandler();

const create_prize_end_point = '/api/Prize/CreatePrize';
const get_prize_end_point = '/api/Prize/GetAllPrizes';
const patch_prize_end_point = '/api/Prize/UpdatePrize';
const delete_prize_end_point = '/api/Prize/DeletePrize';
const claim_prize_via_qr_end_point = '/api/Prize/ClaimPrize';
const get_user_balance_end_point = '/api/User/GetPlayerBalance';

const create_wheel_end_point = '/api/Wheel/CreateWheel';
const get_wheel_by_id_end_point = '/api/Wheel/GetWheelById';
function generateWheelData(keyToSkip = null) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 1);

  const endDate = new Date();
  endDate.setFullYear(startDate.getFullYear() + 1);

  const wheelData = {
    "startTime": startDate.toISOString(),
    "endTime": endDate.toISOString(),
    "isActive": true,
    "type": 1,
    "price": 1,
    "currency": 1
  };

  if (keyToSkip) {
    delete wheelData[keyToSkip];
  }
  return wheelData;
}

const create_global_type_end_point = '/api/GlobalType/CreateGlobalType';
function generateGlobalTypeData(keyToSkip = null) {
  const globalTypeData = {
    "Name": "Auto Test Global Type",
    "InGame": "false", // FormData sends booleans as strings usually
    "Category": "1",
    "Image": "fake_image_content" // Placeholder for logic below
  };

  if (keyToSkip) {
    delete globalTypeData[keyToSkip];
  }
  return globalTypeData;
}

// Helper to convert object to FormData (Required for this specific controller)
function buildFormData(data) {
  const form = new FormData();

  Object.keys(data).forEach(key => {
    if (key === 'Image') {
      const fileBuffer = Buffer.from(data[key]);
      form.append('Image', fileBuffer, { filename: 'Screenshot.png', contentType: 'image/jpeg' });
    } else {
      form.append(key, data[key]);
    }
  });

  return form;
}

function uniqueName() {
  return crypto.randomUUID();
}

const spin_end_point = '/api/Spin/Spin';
function generateSpinData() {
  return {
    "wheelId": 0,
    "correlationId": uniqueName()
  };
}

const register_end_point = "/api/Auth/Register";
const registerData = {
  userName: "shadi",
  googleId: "string",
  profileImage: "",
  deviceToken: "",
};

function generatePrizeData(keyToSkip = null) {
  const prizeData = {
    "wheelId": 8,
    "typeId": 2,
    "amount": 5,
    "weight": 5
  };
  if (keyToSkip) {
    delete prizeData[keyToSkip];
  }
  return prizeData;
}

const staff_login_end_point = '/api/Auth/StaffLogin';
function generateStaffLoginData() {
  return {
    "email": "new-account@gmail.com",
    "password": "string!1S"
  };
}

const create_staff_account_end_point = '/api/Staff/CreateStaffAccount';
function generateStaffAccountData() {
  return {
    "name": "string",
    "email": "string",
    "password": "string",
    "role": "string"
  };
}

const createDataKeys = ["wheelId", "typeId", "amount", "weight"];

const requiredFields = ['id', 'type', 'weight', 'amount'];

describe('prize api test', () => {


  it('should create prize when sending all required data', async () => {
    const wheelData = generateWheelData();
    const createWheelResponse = await api.post(create_wheel_end_point, wheelData);
    expect(createWheelResponse.status).toBe(200);
    const wheelId = createWheelResponse.data.data.id;
    const data = generatePrizeData();
    data.wheelId = wheelId;
    const result = await api.post(create_prize_end_point, data);
    expect(result.status).toBe(200);
    expect(String(result.data.data.type.id)).toBe(data.typeId.toString());
    expect(String(result.data.data.weight)).toBe(data.weight.toString());
    expect(String(result.data.data.amount)).toBe(data.amount.toString());
  });

  createDataKeys.forEach(key => {
    it(`shouldn't create prize without sending ${key}`, async () => {
      const data = generatePrizeData(key);
      const result = await api.post(create_prize_end_point, data);
      expect(result.status).toBe(400);
    });
  });

  it("try to create with invalid typeId", async () => {
    let data = generatePrizeData();
    data.typeId = 9999;
    const result = await api.post(create_prize_end_point, data);
    expect(result.status).toBe(404);
  });

  it("try to create with invalid wheelId", async () => {
    let data = generatePrizeData();
    data.wheelId = 9999;
    const result = await api.post(create_prize_end_point, data);
    expect(result.status).toBe(404);
  });

  it("try to create with zero weight", async () => {
    let data = generatePrizeData();
    data.weight = 0;
    const result = await api.post(create_prize_end_point, data);
    expect(result.status).toBe(400);
  });

  createDataKeys.forEach(key => {
    it(`shouldn't create with sending negative ${key}`, async () => {
      let data = generatePrizeData();
      data[key] = -1;
      const result = await api.post(create_prize_end_point, data);
      expect([400, 404]).toContain(result.status);
    });
  });

  it('should fetch prizes', async () => {
    const result = await api.get(get_prize_end_point);
    expect(result.status).toBe(200);
    expect(result.data.isSuccess).toBe(true);
    expect(result.data.statusCode).toBe(200);
    expect(result.data.message).toBe("Prizes fetched successfully");
    expect(Array.isArray(result.data.data)).toBe(true);
    result.data.data.forEach((level, index) => {
      requiredFields.forEach(field => {
        expect(level).toHaveProperty(field);
      });
    });
  });

  it('should update prize amount', async () => {
    const createData = generatePrizeData();
    const createResult = await api.post(create_prize_end_point, createData);
    expect(createResult.status).toBe(200);
    const prizeId = createResult.data.data.id;
    let data = generatePrizeData();
    data.prizeId = prizeId;
    data.amount = 100;
    const result = await api.patch(`${patch_prize_end_point}/${prizeId}`, data);
    expect(result.status).toBe(200);
    const prize = await api.get(get_prize_end_point);
    prize.data.data.forEach(element => {
      if (element.id === prizeId) {
        expect(String(element.amount)).toBe(String(data.amount));
        expect(String(element.weight)).toBe(String(data.weight));
        expect(String(element.type.id)).toBe(String(data.typeId));
      }
    });
  });

  //! Failed | didn't update prize wheel id
  it.only('should update prize wheel id', async () => {
    const createWheelData = generateWheelData();
    const createWheelResponse = await api.post(create_wheel_end_point, createWheelData);
    expect(createWheelResponse.status).toBe(200);
    const oldWheelId = createWheelResponse.data.data.id;

    const createPrizeData = generatePrizeData();
    createPrizeData.wheelId = oldWheelId;

    const createPrizeResult = await api.post(create_prize_end_point, createPrizeData);
    expect(createPrizeResult.status).toBe(200);
    const prizeId = createPrizeResult.data.data.id;

    const createNewWheelData = generateWheelData();
    const createNewWheelResponse = await api.post(create_wheel_end_point, createNewWheelData);
    expect(createNewWheelResponse.status).toBe(200);
    const newWheelId = createWheelResponse.data.data.id;

    let updatePrizeData = generatePrizeData();
    updatePrizeData.prizeId = prizeId;
    updatePrizeData.wheelId = newWheelId;
    const result = await api.patch(`${patch_prize_end_point}/${prizeId}`, updatePrizeData);
    expect(result.status).toBe(200);
    const prize = await api.get(get_prize_end_point);
    prize.data.data.forEach(element => {
      if (element.id === prizeId) {
        expect(String(element.amount)).toBe(String(updatePrizeData.amount));
        expect(String(element.weight)).toBe(String(updatePrizeData.weight));
        expect(String(element.type.id)).toBe(String(updatePrizeData.typeId));
      }
    });

    const fetchOldWheelsResponse = await api.get(`${get_wheel_by_id_end_point}/${oldWheelId}`);
    expect(fetchOldWheelsResponse.status).toBe(200);
    const oldWheelPrizes = fetchOldWheelsResponse.data.data.prizes;
    const exists = oldWheelPrizes.some(item => item.id === prizeId);
    expect(exists).toBe(false);

    const fetchNewWheelsResponse = await api.get(`${get_wheel_by_id_end_point}/${newWheelId}`);
    expect(fetchNewWheelsResponse.status).toBe(200);
    const newWheelPrizes = fetchNewWheelsResponse.data.data.prizes;
    const shouldExists = newWheelPrizes.some(item => item.id === prizeId);
    expect(shouldExists).toBe(true);

  });

  it('should update prize weight', async () => {
    const createData = generatePrizeData();
    const createResult = await api.post(create_prize_end_point, createData);
    expect(createResult.status).toBe(200);
    const prizeId = createResult.data.data.id;
    let data = generatePrizeData();
    data.prizeId = prizeId;
    data.weight = 30;
    const result = await api.patch(`${patch_prize_end_point}/${prizeId}`, data);
    expect(result.status).toBe(200);
    const prize = await api.get(get_prize_end_point);
    prize.data.data.forEach(element => {
      if (element.id === prizeId) {
        expect(String(element.amount)).toBe(String(data.amount));
        expect(String(element.weight)).toBe(String(data.weight));
        expect(String(element.type.id)).toBe(String(data.typeId));
      }
    });
  });

  it('should update type id', async () => {
    const createData = generatePrizeData();
    const createResult = await api.post(create_prize_end_point, createData);
    expect(createResult.status).toBe(200);
    const prizeId = createResult.data.data.id;
    let data = generatePrizeData();
    data.prizeId = prizeId;
    data.typeId = 3;
    const result = await api.patch(`${patch_prize_end_point}/${prizeId}`, data);
    expect(result.status).toBe(200);
    const prize = await api.get(get_prize_end_point);
    prize.data.data.forEach(element => {
      if (element.id === prizeId) {
        expect(String(element.amount)).toBe(String(data.amount));
        expect(String(element.weight)).toBe(String(data.weight));
        expect(String(element.type.id)).toBe(String(data.typeId));
      }
    });
  });

  it('should delete the prize by its Id', async () => {
    const createData = generatePrizeData();
    const createResult = await api.post(create_prize_end_point, createData);
    expect(createResult.status).toBe(200);
    const prizeId = createResult.data.data.id;
    const firstFetch = await api.get(get_prize_end_point);
    expect(firstFetch.status).toBe(200);
    const result = await api.delete(`${delete_prize_end_point}/${prizeId}`);
    console.log('result:', result);

    expect(result.data.statusCode).toBe(200);
    const secondFetch = await api.get(`${get_prize_end_point}`);
    expect(secondFetch.status).toBe(200);
    expect(secondFetch.data.data.length).toBe(firstFetch.data.data.length - 1);
  });

  //! Failed | user not found
  it("should claim prize via qr code", async () => {
    const wheelData = generateWheelData();
    const createWheelResponse = await api.post(create_wheel_end_point, wheelData);
    expect(createWheelResponse.status).toBe(200);
    const wheelId = createWheelResponse.data.data.id;

    const data = generateGlobalTypeData();
    const form = buildFormData(data);
    const headers = form.getHeaders();
    const response = await api.post(create_global_type_end_point, form, headers);
    expect(response.status).toBe(200);
    const globalTypeId = response.data.data.id;

    const createPrizeData = generatePrizeData();
    createPrizeData.wheelId = wheelId;
    createPrizeData.typeId = globalTypeId;
    const createPrizeResponse = await api.post(create_prize_end_point, createPrizeData);
    expect(createPrizeResponse.status).toBe(200);
    const prizeId = createPrizeResponse.data.data.id;

    const registerResponse = await api.post(register_end_point, registerData);
    expect(registerResponse.status).toBe(200);
    const accessToken = registerResponse.data.data.accessToken;
    const registeredApi = new ApiHandler({ authToken: accessToken });

    const spinData = generateSpinData();
    spinData.wheelId = wheelId;
    const spinResponse = await registeredApi.post(spin_end_point, spinData);
    expect(spinResponse.status).toBe(200);

    const playerBalanceResponse = await registeredApi.get(get_user_balance_end_point);
    expect(playerBalanceResponse.status).toBe(200);

    let qrCode = '';
    playerBalanceResponse.data.data.cosmetics.forEach(item => {
      qrCode = item.qrToken;
    });

    const name = uniqueName();
    const createStaffAccountData = generateStaffAccountData();
    createStaffAccountData.name = name;
    createStaffAccountData.email = `${name}@gmail.com`;
    createStaffAccountData.password = `${name}!1S`;
    createStaffAccountData.role = 'MabcoEmployee';
    const createStaffResponse = await api.post(create_staff_account_end_point, createStaffAccountData);
    expect(createStaffResponse.status).toBe(200);

    const staffLoginData = generateStaffLoginData();
    staffLoginData.email = createStaffAccountData.email;
    staffLoginData.password = createStaffAccountData.password;
    const staffLoginResponse = await api.post(staff_login_end_point, staffLoginData);
    expect(staffLoginResponse.status).toBe(200);
    const staffAccessToken = staffLoginResponse.data.data.accessToken;
    const staffApi = new ApiHandler({ authToken: staffAccessToken });

    const claimViaQrResponse = await staffApi.post(`${claim_prize_via_qr_end_point}/${qrCode}`);
    expect(claimViaQrResponse.status).toBe(200);
  });
});
