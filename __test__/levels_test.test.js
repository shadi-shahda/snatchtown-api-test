const ApiHandler = require('./../support/api-handler');
const FormData = require('form-data');
const path = require('path');
const fs = require('fs');

describe('Level API - CRUD & Validation Tests', () => {
  let api = new ApiHandler();

  // --- Endpoints ---
  const create_level_end_point = '/api/Level/CreateLevel';
  const get_level_by_id_end_point = '/api/Level/GetLevelById';
  const get_all_levels_end_point = '/api/Level/GetAllLevels';
  const delete_level_end_point = '/api/Level/DeleteLevel';
  const update_level_end_point = '/api/Level/UpdateLevel';

  // --- Data & State ---
  const requiredFields = ['id', 'difficulty', 'trophies'];
  let createdLevelId = null; // Store ID here to share between tests

  /**
   * Helper to generate fresh FormData for every test.
   * Allows skipping specific keys to test validation errors.
   */
  function getBaseFormData(keyToSkip = null) {
    const form = new FormData();

    if (keyToSkip !== 'Difficulty') form.append('Difficulty', 2); // 0,1,2,3

    // Handle File (Icon)
    if (keyToSkip !== 'Icon') {
      // Using Buffer to simulate file without needing physical file on disk
      form.append('Icon', Buffer.from('fake-image-content'), { filename: 'icon.png', contentType: 'image/png' });
    }

    // Nested objects (Trophies)
    if (keyToSkip !== 'Trophies') {
      if (keyToSkip !== 'Trophies[0].typeId') form.append('Trophies[0].typeId', 3);
      if (keyToSkip !== 'Trophies[0].amount') form.append('Trophies[0].amount', 1);
    }

    return form;
  };

  // =========================================================================
  // 1. CREATE TESTS
  // =========================================================================

  it('should create level with all required data', async () => {
    const data = getBaseFormData();

    // Pass headers for boundary
    const result = await api.post(create_level_end_point, data, { ...data.getHeaders() });

    expect(result.status).toBe(200);
    expect(result.data.isSuccess).toBe(true);
    expect(result.data.message).toBe('Level created successfully');

    // Capture ID for Update and Delete tests
    createdLevelId = result.data.data.id;
  });

  // --- Validation Tests (Missing Fields) ---

  it('shouldn\'t create level without sending Difficulty', async () => {
    const data = getBaseFormData("Difficulty");
    const result = await api.post(create_level_end_point, data, { ...data.getHeaders() });
    expect(result.status).toBe(400);
  });

  it('shouldn\'t create level without sending typeId in Trophies', async () => {
    const data = getBaseFormData("Trophies[0].typeId");
    const result = await api.post(create_level_end_point, data, { ...data.getHeaders() });
    expect(result.status).toBe(400);
  });

  it('shouldn\'t create level without sending amount in Trophies', async () => {
    const data = getBaseFormData("Trophies[0].amount");
    const result = await api.post(create_level_end_point, data, { ...data.getHeaders() });
    expect(result.status).toBe(400);
  });

  // =========================================================================
  // 2. READ TESTS
  // =========================================================================

  it('should retrieve the level by its Id', async () => {
    // Ensure we have an ID to fetch
    if (!createdLevelId) {
      const data = getBaseFormData();
      const result = await api.post(create_level_end_point, data, { ...data.getHeaders() });
      createdLevelId = result.data.data.id;
    }

    const result = await api.get(`${get_level_by_id_end_point}/${createdLevelId}`);
    expect(result.status).toBe(200);
    expect(result.data.isSuccess).toBe(true);
    expect(result.data.data.id).toBe(createdLevelId);
  });

  it('should fetch all data', async () => {
    const result = await api.get(get_all_levels_end_point);
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

  it('should update level Number', async () => {
    // Self-healing: Create level if missing
    if (!createdLevelId) {
      const data = getBaseFormData();
      const result = await api.post(create_level_end_point, data, { ...data.getHeaders() });
      createdLevelId = result.data.data.id;
    }

    const data = getBaseFormData("Number"); // Get base data without Number
    data.append("Number", 5);
    data.append("LevelId", createdLevelId);

    const result = await api.put(`${update_level_end_point}/${createdLevelId}`, data, { ...data.getHeaders() });

    expect(result.status).toBe(200);

    // Verify
    const check = await api.get(`${get_level_by_id_end_point}/${createdLevelId}`);
    expect(check.data.data.number).toBe(5);
  });

  it('should update level RequiredStars', async () => {
    if (!createdLevelId) {
      const data = getBaseFormData();
      const result = await api.post(create_level_end_point, data, { ...data.getHeaders() });
      createdLevelId = result.data.data.id;
    }

    const data = getBaseFormData("RequiredStars");
    data.append("RequiredStars", 10);
    data.append("LevelId", createdLevelId);

    const result = await api.put(`${update_level_end_point}/${createdLevelId}`, data, { ...data.getHeaders() });
    expect(result.status).toBe(200);

    const check = await api.get(`${get_level_by_id_end_point}/${createdLevelId}`);
    // expect(check.data.data.requiredStars).toBe(10);
  });

  it('should update level Difficulty', async () => {
    if (!createdLevelId) {
      const data = getBaseFormData();
      const result = await api.post(create_level_end_point, data, { ...data.getHeaders() });
      createdLevelId = result.data.data.id;
    }

    const data = getBaseFormData("Difficulty");
    data.append("Difficulty", 3);
    data.append("LevelId", createdLevelId);

    const result = await api.put(`${update_level_end_point}/${createdLevelId}`, data, { ...data.getHeaders() });
    expect(result.status).toBe(200);

    const check = await api.get(`${get_level_by_id_end_point}/${createdLevelId}`);
    expect(check.data.data.difficulty).toBe(3);
  });

  it.only('should update level Trophies', async () => {
    let trophiesCount = 1;
    if (!createdLevelId) {
      const data = getBaseFormData();
      const result = await api.post(create_level_end_point, data, { ...data.getHeaders() });
      expect(result.status).toBe(200);
      console.log(result.data.data);
      createdLevelId = result.data.data.id;
    }

    const data = getBaseFormData("Trophies");
    data.append("LevelId", createdLevelId);

    // Add new trophies
    data.append('Trophies[0].typeId', 2);
    data.append('Trophies[0].amount', 50);

    const result = await api.put(`${update_level_end_point}/${createdLevelId}`, data, { ...data.getHeaders() });
    expect(result.status).toBe(200);

    const check = await api.get(`${get_level_by_id_end_point}/${createdLevelId}`);
    expect(check.data.data.trophies[0].amount).toBe(50);
    expect(check.data.data.trophies[0].type.id).toBe(2);
    expect(check.data.data.trophies.length).toBe(trophiesCount);
  });

  // --- Update: Bad Scenarios ---

  it('shouldn\'t update level when sending level id in request body different from level id in query parameter', async () => {
    const levelIdForQuery = 80;

    const data = getBaseFormData();
    data.append("LevelId", 9999); // Different ID in body

    const result = await api.put(`${update_level_end_point}/${levelIdForQuery}`, data, { ...data.getHeaders() });
    expect(result.status).toBe(400);
  });

  // =========================================================================
  // 4. DELETE TESTS
  // =========================================================================

  it('should delete the level by its Id', async () => {
    if (!createdLevelId) {
      const data = getBaseFormData();
      const result = await api.post(create_level_end_point, data, { ...data.getHeaders() });
      createdLevelId = result.data.data.id;
    }

    const firstFetch = await api.get(get_all_levels_end_point);
    const result = await api.delete(`${delete_level_end_point}/${createdLevelId}`);
    expect(result.status).toBe(200);

    // Verify deletion
    const secondFetch = await api.get(get_all_levels_end_point);
    const exists = secondFetch.data.data.find(x => x.id === createdLevelId);
    expect(exists).toBeUndefined();
    expect(firstFetch.data.data.length - 1).toBe(secondFetch.data.data.length);
  });

  it('shouldn\'t delete level for invalid id', async () => {
    const result = await api.delete(`${delete_level_end_point}/999999`);
    // Assuming API returns 400 or 404 for invalid ID delete
    expect([400, 404]).toContain(result.status);
  });

});