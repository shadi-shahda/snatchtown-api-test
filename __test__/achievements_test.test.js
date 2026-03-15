const { log } = require('console');
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
  let createdAchievementId = null; // Store ID here to share between tests

  const registerData = {
    userName: `shadi`,
    googleId: "string",
    profileImage: "",
    deviceToken: "",
  };

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
    const iconPath = path.resolve(__dirname, '../support/Screenshot1.png');
    if (fs.existsSync(iconPath)) {
      form.append('Icon', fs.createReadStream(iconPath));
    }

    // Nested objects (Milestones)
    if (keyToSkip !== 'Milestones') {
      if (keyToSkip !== 'Milestones[0].title') form.append('Milestones[0].title', 'First Step');
      if (keyToSkip !== 'Milestones[0].description') form.append('Milestones[0].description', 'Begin');
      if (keyToSkip !== 'Milestones[0].order') form.append('Milestones[0].order', 1);

      if (keyToSkip !== 'Milestones[0].target') form.append('Milestones[0].target', 2);
      if (keyToSkip !== 'Milestones[1].title') form.append('Milestones[1].title', 'Second Step');
      if (keyToSkip !== 'Milestones[1].description') form.append('Milestones[1].description', 'continue');
      if (keyToSkip !== 'Milestones[1].order') form.append('Milestones[1].order', 1);

      if (keyToSkip !== 'Milestones[1].target') form.append('Milestones[1].target', 1);
    }

    return form;
  };

  // =========================================================================
  // 1. CREATE TESTS
  // =========================================================================

  it.only("try to create achievement with all required data", async () => {
    const data = getBaseFormData();

    const result = await api.post(create_achievements_end_point, data, { ...data.getHeaders() });
    expect(result.status).toBe(200);

    // Capture ID for the Claim and Delete tests
    createdAchievementId = result.data.data.id;
  });

  it("shouldn't create achievement without sending Type", async () => {
    const data = getBaseFormData("Type");

    const result = await api.post(create_achievements_end_point, data);
    expect(result.status).toBe(400);
  });

  it("shouldn't create achievement without sending Name", async () => {
    const data = getBaseFormData("Name");

    const result = await api.post(create_achievements_end_point, data);
    expect(result.status).toBe(400);
  });

  it("shouldn't create achievement without sending FinalTarget", async () => {
    const data = getBaseFormData("FinalTarget");
    const result = await api.post(create_achievements_end_point, data);
    expect(result.status).toBe(400);
  });

  it("shouldn't create achievement without sending BackgroundColor", async () => {
    const data = getBaseFormData("BackgroundColor");
    const result = await api.post(create_achievements_end_point, data);
    expect(result.status).toBe(400);
  });

  it("shouldn't create achievement without sending Milestones", async () => {
    const data = getBaseFormData("Milestones");
    const result = await api.post(create_achievements_end_point, data);
    expect(result.status).toBe(400);
  });

  it("shouldn't create achievement without sending Milestone title", async () => {
    const data = getBaseFormData("Milestones[0].title");
    const result = await api.post(create_achievements_end_point, data);
    expect(result.status).toBe(400);
  });

  it("shouldn't create achievement without sending Milestone description", async () => {
    const data = getBaseFormData("Milestones[0].description");
    const result = await api.post(create_achievements_end_point, data);
    expect(result.status).toBe(400);
  });

  it("shouldn't create achievement without sending Milestone order", async () => {
    const data = getBaseFormData("Milestones[0].order");
    const result = await api.post(create_achievements_end_point, data);
    expect(result.status).toBe(400);
  });

  it("shouldn't create achievement without sending Milestones Target", async () => {
    const data = getBaseFormData("Milestones[0].target");

    const result = await api.post(create_achievements_end_point, data);
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
    // Self-healing: Create achievement if missing
    if (!createdAchievementId) {
      const data = getBaseFormData();

      const result = await api.post(create_achievements_end_point, data, { ...data.getHeaders() });
      expect(result.status).toBe(200);
      expect(result.status).toBe(200);
      createdAchievementId = result.data.data.id;
    }

    const data = getBaseFormData("Type");
    data.append("Type", 1);
    const result = await api.patch(`${patch_achievements_end_point}/${createdAchievementId}`, data,
      { ...data.getHeaders() });

    expect(result.status).toBe(200);

    // Verify
    const check = await api.get(get_achievements_end_point);
    const updatedItem = check.data.data.find(x => x.id === createdAchievementId);
    expect(updatedItem.type.toString()).toBe("1");
  });

  it('should update name successfully', async () => {
    if (!createdAchievementId) {
      const data = getBaseFormData();

      const result = await api.post(create_achievements_end_point, data, { ...data.getHeaders() });
      expect(result.status).toBe(200);
      expect(result.status).toBe(200);
      createdAchievementId = result.data.data.id;
    }

    const newName = "Updated Name " + Date.now();
    const data = getBaseFormData("Name");
    data.append("Name", newName);

    const result = await api.patch(`${patch_achievements_end_point}/${createdAchievementId}`, data, {
      ...data.getHeaders()
    });

    expect(result.status).toBe(200);

    const check = await api.get(get_achievements_end_point);
    const updatedItem = check.data.data.find(x => x.id === createdAchievementId);
    expect(updatedItem.name).toBe(newName);
  });

  it('should update final target successfully', async () => {
    if (!createdAchievementId) {
      const data = getBaseFormData();

      const result = await api.post(create_achievements_end_point, data, { ...data.getHeaders() });
      expect(result.status).toBe(200);
      createdAchievementId = result.data.data.id;
    }

    const data = getBaseFormData("FinalTarget");
    data.append("FinalTarget", 50);

    const result = await api.patch(`${patch_achievements_end_point}/${createdAchievementId}`, data, {
      ...data.getHeaders()
    });

    expect(result.status).toBe(200);
  });

  it('should update background color successfully', async () => {
    if (!createdAchievementId) {
      const data = getBaseFormData();

      const result = await api.post(create_achievements_end_point, data, { ...data.getHeaders() });
      expect(result.status).toBe(200);
      createdAchievementId = result.data.data.id;
    }

    const newColor = "#000000";
    const data = getBaseFormData("BackgroundColor");
    data.append("BackgroundColor", newColor);

    const result = await api.patch(`${patch_achievements_end_point}/${createdAchievementId}`, data, {
      ...data.getHeaders()
    });

    expect(result.status).toBe(200);
  });

  it('should update Icon successfully', async () => {
    if (!createdAchievementId) {
      const data = getBaseFormData();

      const result = await api.post(create_achievements_end_point, data, { ...data.getHeaders() });
      expect(result.status).toBe(200);
      createdAchievementId = result.data.data.id;
    }

    const data = getBaseFormData("Icon");
    const iconPath = path.resolve(__dirname, '../support/Screenshot.png');
    if (fs.existsSync(iconPath)) {
      data.append('Icon', fs.createReadStream(iconPath));
    }

    const result = await api.patch(`${patch_achievements_end_point}/${createdAchievementId}`, data, {
      ...data.getHeaders()
    });

    expect(result.status).toBe(200);
  });

  // --- Update: Bad Scenarios ---

  it("shouldn't update a non-existent Achievement", async () => {
    const invalidId = 9999999;
    const data = getBaseFormData();

    const result = await api.patch(`${patch_achievements_end_point}/${invalidId}`, data, {
      ...data.getHeaders()
    });

    // 404 Not Found or 400 Bad Request
    expect([400, 404]).toContain(result.status);
  });

  it("shouldn't update Name to an empty string", async () => {
    if (!createdAchievementId) {
      const data = getBaseFormData();

      const result = await api.post(create_achievements_end_point, data, { ...data.getHeaders() });
      expect(result.status).toBe(200);
      expect(result.status).toBe(200);
      createdAchievementId = result.data.data.id;
    }

    const data = new FormData();
    data.append("Name", "");

    const result = await api.patch(`${patch_achievements_end_point}/${createdAchievementId}`, data, {
      ...data.getHeaders()
    });

    expect(result.status).toBe(400);
  });

  // =========================================================================
  // 4. CLAIM TESTS (Happy & Bad Scenarios)
  // =========================================================================

  it("try to claim achievement (Happy Scenario)", async () => {
    if (!createdAchievementId) {
      const data = getBaseFormData();

      const formHeaders = data.getHeaders();

      const result = await api.post(create_achievements_end_point, data, { ...formHeaders });
      expect(result.status).toBe(200);

      // Capture ID for the Claim and Delete tests
      createdAchievementId = result.data.data.id;
    };

    // 1. Register User
    const register = await api.post(register_end_point, registerData);
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
  });

  it("shouldn't claim achievement without sending AchievementId (Bad Request)", async () => {
    // Register to get a valid token, but send invalid data
    const register = await api.post(register_end_point, { ...registerData, userName: "BadUser1" });
    const accessToken = register.data.data.accessToken;
    const registeredApi = new ApiHandler({ authToken: accessToken });

    const claimData = new FormData();

    const claimResponse = await registeredApi.post(claim_achievements_end_point, claimData,
      { 'Content-Type': 'multipart/form-data' });

    expect(claimResponse.status).toBe(400);
  });

  it("shouldn't claim a non-existent achievement (Not Found/Bad Request)", async () => {
    const register = await api.post(register_end_point, { ...registerData, userName: "BadUser2" });
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
    if (!createdAchievementId) {
      const data = getBaseFormData();

      const formHeaders = data.getHeaders();

      const result = await api.post(create_achievements_end_point, data, { ...formHeaders });
      expect(result.status).toBe(200);

      createdAchievementId = result.data.data.id;
    };

    const registeredResponse = await api.post(register_end_point, registerData);
    expect(registeredResponse.status).toBe(200);
    const accessToken = registeredResponse.data.data.accessToken;
    const registeredApi = new ApiHandler({ authToken: accessToken });

    const claimData = new FormData();
    claimData.append("AchievementId", createdAchievementId);

    const claimResponse = await registeredApi.post(claim_achievements_end_point, claimData,
      { 'Content-Type': 'multipart/form-data' });

    expect(claimResponse.status).toBe(401);
  });

  // =========================================================================
  // 5. DELETE TESTS
  // =========================================================================

  it('should delete the achievement by its Id', async () => {
    if (!createdAchievementId) {
      const data = getBaseFormData();

      const formHeaders = data.getHeaders();

      const result = await api.post(create_achievements_end_point, data, { ...formHeaders });
      expect(result.status).toBe(200);

      createdAchievementId = result.data.data.id;
    };

    const result = await api.delete(`${delete_achievements_end_point}/${createdAchievementId}`);
    expect(result.status).toBe(200);

    // Verify Deletion
    const secondFetch = await api.get(get_achievements_end_point);
    const exists = secondFetch.data.data.find(el => el.id === createdAchievementId);
    expect(exists).toBeUndefined();
  });

  it('shouldn\'t delete the achievement for invalid id', async () => {
    const result = await api.delete(`${delete_achievements_end_point}/9999`);
    expect(result.status).toBe(400);
  });
});