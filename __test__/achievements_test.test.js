const ApiHandler = require('../support/api-handler');
const path = require('path');
const fs = require('fs');
const FormData = require("form-data");

describe('Spin API - Achievement & Claim Tests', () => {
  let api = new ApiHandler();

  // --- Endpoints ---
  const create_achievements_end_point = '/api/Achievement/CreateAchievement';
  const get_achievements_end_point = '/api/Achievement/GetAllAchievements';
  const patch_achievements_end_point = '/api/Achievement/UpdateAchievement';
  const delete_achievements_end_point = '/api/Achievement/DeleteAchievement';
  const claim_achievements_end_point = '/api/Achievement/ClaimAchievement';
  const register_end_point = "/api/Auth/Register";

  // --- Data & State ---
  const requiredFields = ['id', 'type', 'name'];

  const registerData = {
    "displayName": "shadi",
    "googleId": "string",
    "playerDeviceId": "string",
    "isGoogleAuthenticated": true,
    "profileImage": "",
    "deviceToken": "string"
  };

  function getRegisterData(prefix = "achievement-user") {
    return {
      ...registerData,
      userName: `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`
    };
  }

  /**
   * Helper to generate fresh FormData for every test.
   * This prevents one test from "deleting" keys that the next test needs.
   */
  function getBaseFormData(keyToSkip = null) {
    const form = new FormData();

    if (keyToSkip !== 'Type') form.append('Type', 1);
    if (keyToSkip !== 'Name') form.append("Name", 'Achievement Name');
    if (keyToSkip !== 'FinalTarget') form.append('FinalTarget', 10);
    if (keyToSkip !== 'BackgroundColor') form.append('BackgroundColor', '#FFFFFF');

    // Handle File
    if (keyToSkip !== 'Icon') {
      const iconCandidates = [
        path.resolve(__dirname, '../support/Screenshot.png'),
        path.resolve(__dirname, '../support/Screenshot1.png')
      ];
      const iconPath = iconCandidates.find(candidate => fs.existsSync(candidate));

      if (iconPath) {
        form.append('Icon', fs.createReadStream(iconPath));
      }
    }

    // Nested objects (Milestones)
    if (keyToSkip !== 'Milestones') {
      if (keyToSkip !== 'Milestones[0].title') form.append('Milestones[0].title', 'First Step');
      if (keyToSkip !== 'Milestones[0].description') form.append('Milestones[0].description', 'Begin');
      if (keyToSkip !== 'Milestones[0].order') form.append('Milestones[0].order', 1);
      if (keyToSkip !== 'Milestones[0].target') form.append('Milestones[0].target', 2);

      if (keyToSkip !== 'Milestones[0].rewards') {
        if (keyToSkip !== 'Milestones[0].rewards[0].typeId') form.append('Milestones[0].rewards[0].typeId', 2);
        if (keyToSkip !== 'Milestones[0].rewards[0].milestoneId') form.append('Milestones[0].rewards[0].milestoneId', 0);
        if (keyToSkip !== 'Milestones[0].rewards[0].amount') form.append('Milestones[0].rewards[0].amount', 1);
      }

      if (keyToSkip !== 'Milestones[1].title') form.append('Milestones[1].title', 'Second Step');
      if (keyToSkip !== 'Milestones[1].description') form.append('Milestones[1].description', 'continue');
      if (keyToSkip !== 'Milestones[1].order') form.append('Milestones[1].order', 1);
      if (keyToSkip !== 'Milestones[1].target') form.append('Milestones[1].target', 5);

      if (keyToSkip !== 'Milestones[1].rewards') {
        if (keyToSkip !== 'Milestones[1].rewards[0].typeId') form.append('Milestones[1].rewards[0].typeId', 2);
        if (keyToSkip !== 'Milestones[1].rewards[0].milestoneId') form.append('Milestones[1].rewards[0].milestoneId', 0);
        if (keyToSkip !== 'Milestones[1].rewards[0].amount') form.append('Milestones[1].rewards[0].amount', 2);
      }
    }

    return form;
  };

  // =========================================================================
  // 1. CREATE TESTS
  // =========================================================================

  it("try to create achievement with all required data", async () => {
    const data = getBaseFormData();

    const result = await api.post(create_achievements_end_point, data, { ...data.getHeaders() });
    expect(result.status).toBe(200);

    const deleteResponse = await api.delete(`${delete_achievements_end_point}/${result.data.data.id}`);
    expect(deleteResponse.status).toBe(200);
  });

  it("shouldn't create achievement without sending Name", async () => {
    const data = getBaseFormData("Name");

    const result = await api.post(create_achievements_end_point, data, { ...data.getHeaders() });
    expect(result.status).toBe(400);
  });

  it("shouldn't create achievement without sending FinalTarget", async () => {
    const data = getBaseFormData("FinalTarget");
    const result = await api.post(create_achievements_end_point, data, { ...data.getHeaders() });
    expect(result.status).toBe(400);
  });

  it("shouldn't create achievement without sending BackgroundColor", async () => {
    const data = getBaseFormData("BackgroundColor");
    const result = await api.post(create_achievements_end_point, data, { ...data.getHeaders() });
    expect(result.status).toBe(400);
  });

  it("shouldn't create achievement without sending Milestones", async () => {
    const data = getBaseFormData("Milestones");
    const result = await api.post(create_achievements_end_point, data, { ...data.getHeaders() });
    expect(result.status).toBe(400);
  });

  it("shouldn't create achievement without sending Milestone title", async () => {
    const data = getBaseFormData("Milestones[0].title");
    const result = await api.post(create_achievements_end_point, data, { ...data.getHeaders() });
    expect(result.status).toBe(400);
  });

  it("shouldn't create achievement without sending Milestone description", async () => {
    const data = getBaseFormData("Milestones[0].description");
    const result = await api.post(create_achievements_end_point, data, { ...data.getHeaders() });
    expect(result.status).toBe(400);
  });

  it("shouldn't create achievement without sending Milestone order", async () => {
    const data = getBaseFormData("Milestones[0].order");
    const result = await api.post(create_achievements_end_point, data, { ...data.getHeaders() });
    expect(result.status).toBe(400);
  });

  it("shouldn't create achievement without sending Milestones Target", async () => {
    const data = getBaseFormData("Milestones[0].target");

    const result = await api.post(create_achievements_end_point, data, { ...data.getHeaders() });
    expect(result.status).toBe(400);
  });

  it("shouldn't create achievement without sending Milestone rewards", async () => {
    const data = getBaseFormData("Milestones[0].rewards");
    const result = await api.post(create_achievements_end_point, data, { ...data.getHeaders() });
    expect(result.status).toBe(400);
  });

  it("shouldn't create achievement without sending Milestone reward typeId", async () => {
    const data = getBaseFormData("Milestones[0].rewards[0].typeId");
    const result = await api.post(create_achievements_end_point, data, { ...data.getHeaders() });
    expect(result.status).toBe(400);
  });

  it("shouldn't create achievement without sending Milestone reward amount", async () => {
    const data = getBaseFormData("Milestones[0].rewards[0].amount");
    const result = await api.post(create_achievements_end_point, data, { ...data.getHeaders() });
    expect(result.status).toBe(400);
  });

  // =========================================================================
  // 2. READ TESTS
  // =========================================================================

  it('should fetch achievements', async () => {
    const result = await api.get(get_achievements_end_point);
    expect(result.status).toBe(200);
    expect(result.data.isSuccess).toBe(true);
    expect(Array.isArray(result.data.data)).toBe(true);
    result.data.data.forEach((level) => {
      requiredFields.forEach(field => {
        expect(level).toHaveProperty(field);
      });
    });
  });

  // =========================================================================
  // 3. UPDATE TESTS
  // =========================================================================

  it('should update type successfully', async () => {
    const createData = getBaseFormData();
    const createResponse = await api.post(create_achievements_end_point, createData, { ...createData.getHeaders() });
    expect(createResponse.status).toBe(200);
    const createdAchievementId = createResponse.data.data.id;

    const data = getBaseFormData("Type");
    data.append("Type", 1);
    const result = await api.put(`${patch_achievements_end_point}/${createdAchievementId}`, data,
      { ...data.getHeaders() });

    expect(result.status).toBe(200);

    // Verify
    const check = await api.get(get_achievements_end_point);
    const updatedItem = check.data.data.find(x => x.id === createdAchievementId);
    expect(updatedItem.type.toString()).toBe("1");

    const deleteResponse = await api.delete(`${delete_achievements_end_point}/${createResponse.data.data.id}`);
    expect(deleteResponse.status).toBe(200);
  });

  it('should update name successfully', async () => {
    const createData = getBaseFormData();
    const createResponse = await api.post(create_achievements_end_point, createData, { ...createData.getHeaders() });
    expect(createResponse.status).toBe(200);
    const createdAchievementId = createResponse.data.data.id;

    const newName = "Updated Name " + Date.now();
    const data = getBaseFormData("Name");
    data.append("Name", newName);

    const result = await api.put(`${patch_achievements_end_point}/${createdAchievementId}`, data, {
      ...data.getHeaders()
    });

    expect(result.status).toBe(200);

    const check = await api.get(get_achievements_end_point);
    const updatedItem = check.data.data.find(x => x.id === createdAchievementId);
    expect(updatedItem.name).toBe(newName);

    const deleteResponse = await api.delete(`${delete_achievements_end_point}/${createResponse.data.data.id}`);
    expect(deleteResponse.status).toBe(200);
  });

  it('should update final target successfully', async () => {
    const createData = getBaseFormData();
    const createResponse = await api.post(create_achievements_end_point, createData, { ...createData.getHeaders() });
    expect(createResponse.status).toBe(200);
    const createdAchievementId = createResponse.data.data.id;

    const data = getBaseFormData("FinalTarget");
    data.append("FinalTarget", 50);

    const result = await api.put(`${patch_achievements_end_point}/${createdAchievementId}`, data, {
      ...data.getHeaders()
    });

    expect(result.status).toBe(200);

    const deleteResponse = await api.delete(`${delete_achievements_end_point}/${createResponse.data.data.id}`);
    expect(deleteResponse.status).toBe(200);
  });

  it('should update background color successfully', async () => {
    const createData = getBaseFormData();
    const createResponse = await api.post(create_achievements_end_point, createData, { ...createData.getHeaders() });
    expect(createResponse.status).toBe(200);
    const createdAchievementId = createResponse.data.data.id;

    const newColor = "#000000";
    const data = getBaseFormData("BackgroundColor");
    data.append("BackgroundColor", newColor);

    const result = await api.put(`${patch_achievements_end_point}/${createdAchievementId}`, data, {
      ...data.getHeaders()
    });

    expect(result.status).toBe(200);

    const deleteResponse = await api.delete(`${delete_achievements_end_point}/${createResponse.data.data.id}`);
    expect(deleteResponse.status).toBe(200);
  });

  it('should update Icon successfully', async () => {
    const createData = getBaseFormData();
    const createResponse = await api.post(create_achievements_end_point, createData, { ...createData.getHeaders() });
    expect(createResponse.status).toBe(200);
    const createdAchievementId = createResponse.data.data.id;

    const data = getBaseFormData("Icon");
    const iconPath = path.resolve(__dirname, '../support/Screenshot.png');
    if (fs.existsSync(iconPath)) {
      data.append('Icon', fs.createReadStream(iconPath));
    }

    const result = await api.put(`${patch_achievements_end_point}/${createdAchievementId}`, data, {
      ...data.getHeaders()
    });

    expect(result.status).toBe(200);

    const deleteResponse = await api.delete(`${delete_achievements_end_point}/${createResponse.data.data.id}`);
    expect(deleteResponse.status).toBe(200);
  });

  // --- Update: Bad Scenarios ---

  it("shouldn't update a non-existent Achievement", async () => {
    const invalidId = 9999999;
    const data = getBaseFormData();

    const result = await api.put(`${patch_achievements_end_point}/${invalidId}`, data, {
      ...data.getHeaders()
    });

    // Depending on API/controller behavior this may be 400, 404, or 405.
    expect([400, 404, 405]).toContain(result.status);
  });

  it("shouldn't update Name to an empty string", async () => {
    const createData = getBaseFormData();
    const createResponse = await api.post(create_achievements_end_point, createData, { ...createData.getHeaders() });
    expect(createResponse.status).toBe(200);
    const createdAchievementId = createResponse.data.data.id;

    const data = new FormData();
    data.append("Name", "");

    const result = await api.put(`${patch_achievements_end_point}/${createdAchievementId}`, data, {
      ...data.getHeaders()
    });

    expect(result.status).toBe(400);

    const deleteResponse = await api.delete(`${delete_achievements_end_point}/${createResponse.data.data.id}`);
    expect(deleteResponse.status).toBe(200);
  });

  // =========================================================================
  // 4. CLAIM TESTS (Happy & Bad Scenarios)
  // =========================================================================

  it("try to claim achievement (Happy Scenario)", async () => {
    const data = getBaseFormData();
    const formHeaders = data.getHeaders();

    const response = await api.post(create_achievements_end_point, data, { ...formHeaders });
    expect(response.status).toBe(200);

    const createdAchievementId = response.data.data.id;

    // 1. Register User
    const register = await api.post(register_end_point, getRegisterData("claim-happy"));
    expect(register.status).toBe(200);

    // 2. Get Token & Create Auth Instance
    const accessToken = register.data.data.accessToken;
    const registeredApi = new ApiHandler({ authToken: accessToken });

    // 3. Claim
    const claimData = new FormData();
    claimData.append("AchievementId", createdAchievementId);

    const claimResponse = await registeredApi.post(claim_achievements_end_point, claimData, claimData.getHeaders());

    expect(claimResponse.status).toBe(200);
    // Add specific assertions if response returns data
    // expect(claimResponse.data.isSuccess).toBe(true);

    const deleteResponse = await api.delete(`${delete_achievements_end_point}/${response.data.data.id}`);
    expect(deleteResponse.status).toBe(200);
  });

  it("shouldn't claim achievement without sending AchievementId (Bad Request)", async () => {
    // Register to get a valid token, but send invalid data
    const register = await api.post(register_end_point, getRegisterData("claim-bad-missing-id"));
    const accessToken = register.data.data.accessToken;
    const registeredApi = new ApiHandler({ authToken: accessToken });

    const claimData = new FormData();

    const claimResponse = await registeredApi.post(claim_achievements_end_point, claimData,
      { 'Content-Type': 'multipart/form-data' });

    expect(claimResponse.status).toBe(400);
  });

  it("shouldn't claim a non-existent achievement (Not Found/Bad Request)", async () => {
    const register = await api.post(register_end_point, getRegisterData("claim-bad-invalid-id"));
    const accessToken = register.data.data.accessToken;
    const registeredApi = new ApiHandler({ authToken: accessToken });

    const claimData = new FormData();
    claimData.append("AchievementId", 999999); // Invalid ID

    const claimResponse = await registeredApi.post(claim_achievements_end_point, claimData,
      { 'Content-Type': 'multipart/form-data' });

    // Expecting 404 (Not Found) or 400 (Bad Request) depending on API design
    expect([400, 404]).toContain(claimResponse.status);
  });

  it("shouldn't allow unauthorized user to claim achievement (Unauthorized)", async () => {
    const data = getBaseFormData();
    const formHeaders = data.getHeaders();

    const response = await api.post(create_achievements_end_point, data, { ...formHeaders });
    expect(response.status).toBe(200);
    const createdAchievementId = response.data.data.id;

    const registeredResponse = await api.post(register_end_point, getRegisterData("claim-unauthorized"));
    expect(registeredResponse.status).toBe(200);
    const accessToken = registeredResponse.data.data.accessToken;
    const registeredApi = new ApiHandler({ authToken: accessToken });

    const claimData = new FormData();
    claimData.append("AchievementId", createdAchievementId);

    const claimResponse = await registeredApi.post(claim_achievements_end_point, claimData,
      { 'Content-Type': 'multipart/form-data' });

    expect(claimResponse.status).toBe(401);

    const deleteResponse = await api.delete(`${delete_achievements_end_point}/${response.data.data.id}`);
    expect(deleteResponse.status).toBe(200);
  });

  // =========================================================================
  // 5. DELETE TESTS
  // =========================================================================

  it.only('should delete the achievement by its Id', async () => {
    const data = getBaseFormData();
    const formHeaders = data.getHeaders();

    const response = await api.post(create_achievements_end_point, data, { ...formHeaders });
    expect(response.status).toBe(200);
    const createdAchievementId = response.data.data.id;

    const result = await api.delete(`${delete_achievements_end_point}/${createdAchievementId}`);
    expect(result.status).toBe(200);

    // Verify Deletion
    const secondFetch = await api.get(get_achievements_end_point);
    const exists = secondFetch.data.data.find(el => el.id === createdAchievementId);
    expect(exists).toBeUndefined();
  });

  it.only('shouldn\'t delete the achievement for invalid id', async () => {
    const result = await api.delete(`${delete_achievements_end_point}/9999`);
    expect(result.status).toBe(400);
  });
});