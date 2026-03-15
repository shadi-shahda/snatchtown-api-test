const ApiHandler = require("./../support/api-handler");

const api = new ApiHandler();

const create_staff_end_point = '/api/Staff/CreateStaffAccount';

function generateStaffData(keyToSkip = null) {
  const staffData = {
    "userName": "test1",
    "email": "test@example.com",
    "password": "TestPassword123!",
    "role": "MabcoEmployee"
  };
  if (keyToSkip) {
    delete staffData[keyToSkip];
  }
  return staffData;
}

const staffRequiredFields = ["userName", "email", "password", "role"];

describe("Staff Test", () => {
  it.only("create staff account with all required data", async () => {
    const staffData = generateStaffData();
    const response = await api.post(create_staff_end_point, staffData);
    expect(response.status).toBe(200);
    expect(response.data.data).toHaveProperty("id");
    expect(response.data.data.userName).toBe(staffData.userName);
    expect(response.data.data.email).toBe(staffData.email);
    expect(response.data.data.role).toBe(staffData.role);
  });

  staffRequiredFields.forEach(field => {
    it.only(`should fail to create staff account without ${field}`, async () => {
      const staffData = generateStaffData(field);
      const response = await api.post(create_staff_end_point, staffData);
      expect(response.status).toBe(400);
    });
  });
});
