const ApiHandler = require('./../support/api-handler');

const api = new ApiHandler();

// Endpoints
const create_wheel_end_point = '/api/Wheel/CreateWheel';
const get_all_wheels_end_point = '/api/Wheel/GetAllWheels';
const update_wheel_end_point = '/api/Wheel/UpdateWheel';
const delete_wheel_end_point = '/api/Wheel/DeleteWheel';
const get_wheel_by_id_end_point = '/api/Wheel/GetWheelById';

// Data Generators
function generateWheelData(keyToSkip = null) {
  // Dynamic dates to ensure tests pass regardless of when they are run
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 1); // Starts tomorrow

  const endDate = new Date();
  endDate.setFullYear(startDate.getFullYear() + 1); // Ends next year

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

const createRequiredFields = [
  "startTime",
  "endTime",
  "isActive",
  "type",
  "price",
  "currency"
];

const negativeableData = [
  "type",
  "price",
  "currency"
];

describe("Wheel API Test", () => {

  // ----------------------------------------------------------------
  // Create Wheel Test Cases
  // ----------------------------------------------------------------

  it("should create wheel with all required data", async () => {
    const data = generateWheelData();
    const response = await api.post(create_wheel_end_point, data);

    expect(response.status).toBe(200);
    expect(response.data.isSuccess).toBe(true);
    expect(response.data.statusCode).toBe(200);
    expect(response.data.data).toHaveProperty("id");

    // Verify Data Types (JSON preserves types)
    expect(response.data.data.isActive).toBe(true);
    expect(response.data.data.type).toBe(data.type);
    expect(response.data.data.price).toBe(data.price);
    expect(response.data.data.currency).toBe(data.currency);
  });

  createRequiredFields.forEach(field => {
    it(`should fail to create wheel without sending ${field}`, async () => {
      const data = generateWheelData(field);
      const response = await api.post(create_wheel_end_point, data);
      expect(response.status).toBe(400);
    });
  });

  it("should fail to create wheel when start date is after end date", async () => {
    const data = generateWheelData();

    // Set start date to be 1 day AFTER end date
    const invalidStart = new Date(data.endTime);
    invalidStart.setDate(invalidStart.getDate() + 1);

    data.startTime = invalidStart.toISOString();

    const response = await api.post(create_wheel_end_point, data);
    expect(response.status).toBe(400);
  });

  it("should fail to create wheel with invalid date formats", async () => {
    const data = generateWheelData();
    data.startTime = "Invalid-Date-String";
    const response = await api.post(create_wheel_end_point, data);
    expect(response.status).toBe(400);
  });

  negativeableData.forEach(field => {
    it(`should fail to create wheel with negative ${field}`, async () => {
      const data = generateWheelData(field);
      data[field] = -50;

      console.log(data);
      const response = await api.post(create_wheel_end_point, data);
      expect([400, 404]).toContain(response.status);
    });
  });
  // ----------------------------------------------------------------
  // Update Wheel Test Cases
  // ----------------------------------------------------------------

  it("should update wheel start date", async () => {
    // 1. Create wheel
    const data = generateWheelData();
    const createResponse = await api.post(create_wheel_end_point, data);
    expect(createResponse.status).toBe(200);
    const wheelId = createResponse.data.data.id;

    // 2. Prepare Update (Shift start date forward by 1 day)
    const newStartDate = new Date(data.startTime);
    newStartDate.setDate(newStartDate.getDate() + 1);

    const updateData = {
      wheelId: wheelId,
      startTime: newStartDate.toISOString(),
      endTime: data.endTime,
      isActive: data.isActive,
      type: data.type,
      price: data.price,
      currency: data.currency
    };

    // 3. Patch
    const response = await api.patch(`${update_wheel_end_point}/${wheelId}`, updateData);
    expect(response.status).toBe(200);

    // 4. Verify
    const fetchWheels = await api.get(get_all_wheels_end_point);
    const updatedWheel = fetchWheels.data.data.find(w => w.id === wheelId);
    // expect(new Date(updatedWheel.startTime).toISOString()).toBe(updateData.startTime);
  });

  it("should fail to update start date to be later than end date", async () => {
    const data = generateWheelData();
    const createResponse = await api.post(create_wheel_end_point, data);
    const wheelId = createResponse.data.data.id;

    // Set Start Date AFTER End Date
    const invalidStart = new Date(data.endTime);
    invalidStart.setDate(invalidStart.getDate() + 5);

    const updateData = {
      wheelId: wheelId,
      startTime: invalidStart.toISOString(),
      endTime: data.endTime
    };

    const response = await api.patch(`${update_wheel_end_point}/${wheelId}`, updateData);
    expect(response.status).toBe(400);
  });

  it("should fail to update end date to be sooner than start date", async () => {
    const data = generateWheelData();
    const createResponse = await api.post(create_wheel_end_point, data);
    const wheelId = createResponse.data.data.id;

    // Set End Date BEFORE Start Date
    const invalidEnd = new Date(data.startTime);
    invalidEnd.setDate(invalidEnd.getDate() - 5);

    const updateData = generateWheelData("endTime");
    updateData.wheelId = wheelId;
    updateData.endTime = invalidEnd.toISOString();

    const response = await api.patch(`${update_wheel_end_point}/${wheelId}`, updateData);
    expect(response.status).toBe(400);
  });

  it("should update wheel isActive status", async () => {
    const data = generateWheelData();
    const createResponse = await api.post(create_wheel_end_point, data);
    const wheelId = createResponse.data.data.id;

    const updateData = generateWheelData("isActive");
    updateData.wheelId = wheelId;
    updateData.isActive = false;

    const response = await api.patch(`${update_wheel_end_point}/${wheelId}`, updateData);
    expect(response.status).toBe(200);

    const fetchWheels = await api.get(get_all_wheels_end_point);
    const updatedWheel = fetchWheels.data.data.find(w => w.id === wheelId);
    expect(updatedWheel.isActive).toBe(false);
  });

  it("should update wheel type, price, and currency", async () => {
    const data = generateWheelData();
    const createResponse = await api.post(create_wheel_end_point, data);
    const wheelId = createResponse.data.data.id;

    const updateData = generateWheelData();
    updateData.wheelId = wheelId;
    updateData.type = 2;
    updateData.price = 500;
    updateData.currency = 2;

    const response = await api.patch(`${update_wheel_end_point}/${wheelId}`, updateData);
    expect(response.status).toBe(200);

    const fetchWheels = await api.get(get_all_wheels_end_point);
    const updatedWheel = fetchWheels.data.data.find(w => w.id === wheelId);

    expect(updatedWheel.type).toBe(2);
    expect(updatedWheel.price).toBe(500);
    expect(updatedWheel.currency).toBe(2);
  });

  negativeableData.forEach(field => {
    it(`should fail to update wheel with negative ${field}`, async () => {
      const data = generateWheelData();
      const createResponse = await api.post(create_wheel_end_point, data);
      const wheelId = createResponse.data.data.id;

      const updateData = generateWheelData(field);
      updateData.wheelId = wheelId;
      updateData[field] = -10;

      const response = await api.patch(`${update_wheel_end_point}/${wheelId}`, updateData);
      expect(response.status).toBe(400);

    });
  });

  // ----------------------------------------------------------------
  // Read / Delete Test Cases
  // ----------------------------------------------------------------

  it("should fetch all wheels and validate structure", async () => {
    const response = await api.get(get_all_wheels_end_point);
    expect(response.status).toBe(200);
    expect(response.data.isSuccess).toBe(true);
    expect(Array.isArray(response.data.data)).toBe(true);

    if (response.data.data.length > 0) {
      const wheel = response.data.data[0];
      expect(wheel).toHaveProperty('id');
      expect(wheel).toHaveProperty('startTime');
      expect(wheel).toHaveProperty('isActive');
      expect(wheel).toHaveProperty('type');
      expect(wheel).toHaveProperty('price');
      expect(wheel).toHaveProperty('currency');
      expect(wheel).toHaveProperty('prizes');
    }
  });

  it("should get wheel by its Id", async () => {
    // Create one to ensure it exists
    const data = generateWheelData();
    const createResponse = await api.post(create_wheel_end_point, data);
    const wheelId = createResponse.data.data.id;

    const response = await api.get(`${get_wheel_by_id_end_point}/${wheelId}`);
    expect(response.status).toBe(200);
    expect(response.data.isSuccess).toBe(true);
    expect(response.data.data.id).toBe(wheelId);
    expect(response.data.data.price).toBe(data.price);
  });

  it("should delete wheel by its Id", async () => {
    const data = generateWheelData();
    const createResponse = await api.post(create_wheel_end_point, data);
    const wheelId = createResponse.data.data.id;

    const deleteResponse = await api.delete(`${delete_wheel_end_point}/${wheelId}`);
    expect(deleteResponse.status).toBe(200);

    const fetchAllResponse = await api.get(get_all_wheels_end_point);
    expect(fetchAllResponse.status).toBe(200);
    const exists = fetchAllResponse.data.data.some(item => item.id === wheelId);
    expect(exists).toBe(false);
  });

  it("should fail to delete a wheel with invalid ID", async () => {
    const deleteResponse = await api.delete(`${delete_wheel_end_point}/99999999`);
    expect([400, 404]).toContain(deleteResponse.status);
  });

});