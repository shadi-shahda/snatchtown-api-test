const FormData = require('form-data');
const ApiHandler = require('../support/api-handler');
let api = new ApiHandler();
const get_player_profile_end_point = '/api/User/GetPlayerProfile';
const get_player_balance_end_point = '/api/User/GetPlayerBalance';
const get_player_prizes_end_point = '/api/User/GetPlayerPrizes';
const get_player_achievements_end_point = '/api/User/GetPlayerAchievements';
const get_all_players_end_point = '/api/User/GetAllPlayersInfo';
const update_profile_end_point = '/api/User/UpdateProfile';
const soft_delete_end_point = '/api/User/SoftDeleteAccount';

const allPlayersRequiredFields = [
  "id", "userId", "userName", "profileImage", "currentLevel", "coins", "diamonds", "starsCollected", "boostersUsed", "totalCoinsEarned"];

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


const register_end_point = '/api/Auth/Register';
const userName = 'shadi1';
const registerData = {
  "displayName": "update profile test",
  "googleId": "update profile test",
  "playerDeviceId": "update profile test",
  "isGoogleAuthenticated": true,
  "profileImage": "",
  "deviceToken": ""
};

const requiredFields = ['id', 'typeId', 'weight', 'amount'];

function generateUpdateProfileData() {
  return {
    "UserName": "new name",
    "ProfileImage": "Screenshot.png"
  };
}

function buildFormData(data) {
  const form = new FormData();

  Object.keys(data).forEach(key => {
    if (key === 'ProfileImage') {
      const fileBuffer = Buffer.from(data[key]);
      form.append('ProfileImage', fileBuffer, { filename: data[key], contentType: 'image/jpeg' });
    } else {
      form.append(key, data[key]);
    }
  });

  return form;
}

const rolesWithoutAdmin = [
  "Player",
  "MabcoEmployee"
];

function uniqueName() {
  return crypto.randomUUID();
}

describe('prize api test', () => {

  beforeEach(async () => {
    // const result = await api.post(register_end_point, registerData);
    // expect(result.status).toBe(200);
    // accessToken = result.data.data.accessToken;
    // api = new ApiHandler({ authToken: accessToken });
  });



  it('try to get player profile', async () => {
    const result = await api.get(get_player_profile_end_point);
    expect(result.status).toBe(200);
    expect(result.data.statusCode).toBe(200);
    expect(result.data.isSuccess).toBe(true);
    expect(result.data.message).toBe('Profile retrieved successfully');
    expect(result.data.data.userName).toBe(userName);
  });

  it('try to get player balance', async () => {
    const result = await api.get(get_player_balance_end_point);
    expect(result.status).toBe(200);
    expect(result.data.statusCode).toBe(200);
    expect(result.data.isSuccess).toBe(true);
  });

  it('try to get player prizes', async () => {
    const result = await api.get(get_player_prizes_end_point);
    expect(result.status).toBe(200);
    expect(result.data.statusCode).toBe(200);
    expect(result.data.isSuccess).toBe(true);
    expect(Array.isArray(result.data.data)).toBe(true);
    result.data.data.forEach((level, index) => {
      requiredFields.forEach(field => {
        expect(level).toHaveProperty(field);
      });
    });
  });

  it('try to get player achievements', async () => {
    const result = await api.get(get_player_achievements_end_point);
    expect(result.status).toBe(200);
    expect(result.data.statusCode).toBe(200);
    expect(result.data.isSuccess).toBe(true);
    expect(Array.isArray(result.data.data)).toBe(true);
    result.data.data.forEach((level, index) => {
      requiredFields.forEach(field => {
        expect(level).toHaveProperty(field);
      });
    });
  });

  it("shouldn't get all players without being authorized", async () => {
    const users = await api.get(get_all_players_end_point);
    expect(users.status).toBe(401);
  });

  it("shouldn't get all players if registered as user", async () => {
    const registerResponse = await api.post(register_end_point, registerData);
    expect(registerResponse.status).toBe(200);
    const accessToken = registerResponse.data.data.accessToken;
    const registeredApi = new ApiHandler({ authToken: accessToken });
    const users = await registeredApi.get(get_all_players_end_point);
    expect([401, 403]).toContain(users.status);
  });

  rolesWithoutAdmin.forEach(role => {
    it("should get all players if authorized as not admin roll", async () => {
      const name = uniqueName();
      const createStaffAccountData = generateStaffAccountData();
      createStaffAccountData.name = name;
      createStaffAccountData.email = `${name}@gmail.com`;
      createStaffAccountData.password = `${name}!1S`;
      createStaffAccountData.role = role;
      const createStaffResponse = await api.post(create_staff_account_end_point, createStaffAccountData);
      expect(createStaffResponse.status).toBe(200);

      const staffLoginData = generateStaffLoginData();
      staffLoginData.email = createStaffAccountData.email;
      staffLoginData.password = createStaffAccountData.password;
      const staffLoginResponse = await api.post(staff_login_end_point, staffLoginData);
      expect(staffLoginResponse.status).toBe(200);
      const accessToken = staffLoginResponse.data.data.accessToken;
      const staffApi = new ApiHandler({ authToken: accessToken });
      const users = await staffApi.get(get_all_players_end_point);
      expect([401, 403]).toContain(users.status);
    });
  });

  //! Failed | user name was null and coins and diamonds were 0 for all users
  it("fetch all players", async () => {
    const name = uniqueName();
    const createStaffAccountData = generateStaffAccountData();
    createStaffAccountData.name = name;
    createStaffAccountData.email = `${name}@gmail.com`;
    createStaffAccountData.password = `${name}!1S`;
    createStaffAccountData.role = "Administrator";
    const createStaffResponse = await api.post(create_staff_account_end_point, createStaffAccountData);
    expect(createStaffResponse.status).toBe(200);

    const staffLoginData = generateStaffLoginData();
    staffLoginData.email = createStaffAccountData.email;
    staffLoginData.password = createStaffAccountData.password;
    const staffLoginResponse = await api.post(staff_login_end_point, staffLoginData);
    expect(staffLoginResponse.status).toBe(200);
    const accessToken = staffLoginResponse.data.data.accessToken;
    const staffApi = new ApiHandler({ authToken: accessToken });
    const users = await staffApi.get(get_all_players_end_point);
    expect(users.status).toBe(200);

    users.data.data.forEach((player) => {
      Object.entries(player).forEach(([key, value]) => {
        expect(allPlayersRequiredFields).toContain(key);
        expect(value).not.toBeNull();
      });
    });
  });


  //! Failed
  it('try to delete user soft delete', async () => {
    const register = await api.post(register_end_point, registerData);
    expect(register.status).toBe(200);
    const userId = register.data.data.user.id;
    const accessToken = register.data.data.accessToken;
    const registeredApi = new ApiHandler({ authToken: accessToken });
    const getUserProfileResponse = await registeredApi.post(get_player_profile_end_point);
    expect(getUserProfileResponse.status).toBe(200);
    const softDeleteResponse = await api.patch(`${soft_delete_end_point}/${userId}`);
    expect(softDeleteResponse.status).toBe(200);
    const getUserProfileAgainResponse = await registeredApi.get(get_player_profile_end_point);
    expect([400, 404]).toContain(getUserProfileAgainResponse.status);
    const registerWithDeletedUser = await api.post(register_end_point, registerData);
    expect([400, 404]).toBe(registerWithDeletedUser.status);
  });

  it('user try to delete themselves', async () => {
    registerData.userName = "ssss";
    const register = await api.post(register_end_point, registerData);
    expect(register.status).toBe(200);
    const userId = register.data.data.user.id;
    const accessToken = register.data.data.accessToken;
    const registeredApi = new ApiHandler({ authToken: accessToken });
    const softDeleteResponse = await registeredApi.patch(`${soft_delete_end_point}/${userId}`);
    expect([400, 404]).toContain(softDeleteResponse.status);
  });

  it("try to update player user name", async () => {
    const register = await api.post(register_end_point, registerData);
    expect(register.status).toBe(200);
    const accessToken = register.data.data.accessToken;
    const registeredApi = new ApiHandler({ authToken: accessToken });
    const getprofileResponse = await registeredApi.get(get_player_profile_end_point);
    expect(getprofileResponse.status).toBe(200);
    const updateProfileData = generateUpdateProfileData();
    updateProfileData.UserName = "updated name";
    const formData = buildFormData(updateProfileData);
    const updateProfileResponse = await registeredApi.patch(update_profile_end_point, formData, formData.getHeaders());
    expect(updateProfileResponse.status).toBe(200);
    expect(updateProfileResponse.data.isSuccess).toBe(true);
    const getProfileAgainResponse = await registeredApi.get(get_player_profile_end_point);
    expect(getProfileAgainResponse.status).toBe(200);
    expect(getProfileAgainResponse.data.data.userName).toBe(updateProfileData.UserName);
    expect(getProfileAgainResponse.data.data.profileImage).not.toBe(getprofileResponse.data.data.userName);
  });

  it("try to update player user name with invalid data", async () => {
    const register = await api.post(register_end_point, registerData);
    expect(register.status).toBe(200);
    const accessToken = register.data.data.accessToken;
    const registeredApi = new ApiHandler({ authToken: accessToken });
    const getprofileResponse = await registeredApi.get(get_player_profile_end_point);
    expect(getprofileResponse.status).toBe(200);
    const updateProfileData = generateUpdateProfileData();
    updateProfileData.UserName = "";
    const formData = buildFormData(updateProfileData);
    const updateProfileResponse = await registeredApi.patch(update_profile_end_point, formData, formData.getHeaders());
    expect(updateProfileResponse.status).toBe(400);
  });

  it("try to update player profile image", async () => {
    const register = await api.post(register_end_point, registerData);
    expect(register.status).toBe(200);
    const accessToken = register.data.data.accessToken;
    const registeredApi = new ApiHandler({ authToken: accessToken });
    const getprofileResponse = await registeredApi.get(get_player_profile_end_point);
    expect(getprofileResponse.status).toBe(200);
    const updateProfileData = generateUpdateProfileData();
    updateProfileData.ProfileImage = "Screenshot.png";
    const formData = buildFormData(updateProfileData);
    const updateProfileResponse = await registeredApi.patch(update_profile_end_point, formData, formData.getHeaders());
    expect(updateProfileResponse.status).toBe(200);
    expect(updateProfileResponse.data.isSuccess).toBe(true);
    const getProfileAgainResponse = await registeredApi.get(get_player_profile_end_point);
    expect(getProfileAgainResponse.status).toBe(200);
    expect(getProfileAgainResponse.data.data.profileImage.endsWith(updateProfileData.ProfileImage)).toBe(true);
  });
});