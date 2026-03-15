const ApiHandler = require('./../support/api-handler');
const FormData = require('form-data');

const api = new ApiHandler();

// Endpoints
const create_global_type_end_point = '/api/GlobalType/CreateGlobalType';
const get_all_global_types_end_point = '/api/GlobalType/GetAllGlobalTypes';
const update_global_type_end_point = '/api/GlobalType/UpdateGlobalType';
const delete_global_type_end_point = '/api/GlobalType/DeleteGlobalType';

// Data Generators
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

const createRequiredFields = [
  "Name",
  "Category",
  "InGame",
  "Image"
];

describe("Global Types API Test", () => {

  it("create global type with all required data", async () => {
    const data = generateGlobalTypeData();
    const form = buildFormData(data);

    // Merge headers for FormData boundaries
    const headers = form.getHeaders();

    const response = await api.post(create_global_type_end_point, form, headers);

    expect(response.status).toBe(200);
    expect(response.data.isSuccess).toBe(true);
    expect(response.data.data).toHaveProperty("id");
    expect(response.data.data.name).toBe(data.Name);
    // Note: API might return boolean (false) even if sent as string "false"
    expect(String(response.data.data.inGame)).toBe("false");
    expect(Number(response.data.data.category)).toBe(Number(data.Category));
    expect(response.data.data).toHaveProperty('imagePath');
  });

  createRequiredFields.forEach(field => {
    it(`should fail to create global type without ${field}`, async () => {
      const data = generateGlobalTypeData(field);
      const form = buildFormData(data);
      const headers = form.getHeaders();

      const response = await api.post(create_global_type_end_point, form, headers);
      expect(response.status).toBe(400);
    });
  });

  it("should fail to create global type with empty Name", async () => {
    const data = generateGlobalTypeData();
    data.Name = ""; // Invalid empty string
    const form = buildFormData(data);
    const headers = form.getHeaders();

    const response = await api.post(create_global_type_end_point, form, headers);
    expect(response.status).toBe(400);
  });

  it("should fail to crate global type with invalid category", async () => {
    const data = generateGlobalTypeData();
    data.category = 10;
    const form = buildFormData(data);
    const headers = form.getHeaders();
    const response = await api.post(create_global_type_end_point, form, headers);
    expect(response.status).toBe(400);
  });

  // ----------------------------------------------------------------
  // Update Global Type Test Cases
  // ----------------------------------------------------------------

  it("should update global type data (Name, InGame, Category)", async () => {
    // 1. Create item first
    const data = generateGlobalTypeData();
    const formCreate = buildFormData(data);
    const createResponse = await api.post(create_global_type_end_point, formCreate, formCreate.getHeaders());
    expect(createResponse.status).toBe(200);
    const globalTypeId = createResponse.data.data.id;

    // 2. Prepare update data
    const updateData = {
      globalTypeId: globalTypeId, // ID is usually required in body for FormData updates
      Name: "Updated Name Fully",
      Category: "0",
      InGame: "true"
    };

    const formUpdate = buildFormData(updateData);
    const headers = formUpdate.getHeaders();

    // 3. Send update request
    const response = await api.patch(`${update_global_type_end_point}/${globalTypeId}`, formUpdate, headers);
    expect(response.status).toBe(200);

    // 4. Verify updates via Fetch
    const fetchResponse = await api.get(get_all_global_types_end_point);
    const updatedItem = fetchResponse.data.data.find(item => item.id === globalTypeId);

    expect(updatedItem.name).toBe(updateData.Name);
    expect(String(updatedItem.category)).toBe(updateData.Category);
    expect(String(updatedItem.inGame)).toBe("true");
  });

  it("should fail to update global type category to invalid category", async () => {
    // 1. Create item first
    const data = generateGlobalTypeData();
    const formCreate = buildFormData(data);
    const createResponse = await api.post(create_global_type_end_point, formCreate, formCreate.getHeaders());
    expect(createResponse.status).toBe(200);
    const globalTypeId = createResponse.data.data.id;

    // 2. Prepare update data
    const updateData = {
      globalTypeId: globalTypeId, // ID is usually required in body for FormData updates
      Name: "Updated Name Fully",
      Category: 10,
      InGame: "true"
    };

    const formUpdate = buildFormData(updateData);
    const headers = formUpdate.getHeaders();

    // 3. Send update request
    const response = await api.patch(`${update_global_type_end_point}/${globalTypeId}`, formUpdate, headers);
    expect(response.status).toBe(400);

  });

  it("should retrieve all global types", async () => {
    const response = await api.get(get_all_global_types_end_point);
    expect(response.status).toBe(200);
    expect(response.data.isSuccess).toBe(true);
    expect(Array.isArray(response.data.data)).toBe(true);

    const types = response.data.data;
    if (types.length > 0) {
      const type = types[0];
      expect(type).toHaveProperty("id");
      expect(type).toHaveProperty("name");
      expect(type).toHaveProperty("inGame");
      expect(type).toHaveProperty("category");
      expect(type).toHaveProperty("imagePath");
    }
  });

  it("should delete global type by its id", async () => {
    const data = generateGlobalTypeData();
    const form = buildFormData(data);
    const createResponse = await api.post(create_global_type_end_point, form, form.getHeaders());
    expect(createResponse.status).toBe(200);
    const globalTypeId = createResponse.data.data.id;

    const deleteResponse = await api.delete(`${delete_global_type_end_point}/${globalTypeId}`);
    expect(deleteResponse.status).toBe(200);

    const fetchAllResponse = await api.get(get_all_global_types_end_point);
    expect(fetchAllResponse.status).toBe(200);
    const exists = fetchAllResponse.data.data.some(item => item.id === globalTypeId);

    if (!exists) {
      console.log("Item is NOT in the list");
    }
    expect(exists).toBe(false);
  });

  it("should fail to delete a global type with invalid id", async () => {
    const deleteResponse = await api.delete(`${delete_global_type_end_point}/9999999`);
    expect([400, 404]).toContain(deleteResponse.status);
  });

});