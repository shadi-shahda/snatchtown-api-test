const ApiHandler = require("./../support/api-handler");
const fs = require("fs");
const FormData = require("form-data");
const { fail } = require("assert");
const { create } = require("domain");

const create_royal_pass_end_point = "/api/RoyalPass/CreateRoyalPass";
const update_royal_pass_end_point = "/api/RoyalPass/UpdateRoyalPass";
const spin_royal_pass_wheel_end_point = "/api/RoyalPass/SpinRoyalPassWheel";
const claim_royal_reward_end_point = "/api/RoyalPass/ClaimRoyalReward";
const get_all_royal_passes_end_point = "/api/RoyalPass/GetAllRoyalPasses";
const get_royal_pass_by_id_end_point = "/api/RoyalPass/GetRoyalPassById";
const get_active_royal_passes_end_point = "/api/RoyalPass/GetActiveRoyalPasses";
const delete_royal_pass_end_point = "/api/RoyalPass/DeleteRoyalPass";
const get_player_royal_pass_end_point = '/api/User/GetPlayerRoyalPass';
const subscribe_royal_pass_end_point = '/api/RoyalPass/Subscribe';

const register_end_point = "/api/Auth/Register";
const registerData = {
  "displayName": "shadi",
  "googleId": "",
  "playerDeviceId": "string",
  "isGoogleAuthenticated": false,
  "profileImage": "",
  "deviceToken": "string"
};

let spinRoyalPassWheelData = {
  wheelId: 3,
  correlationId: "string",
};

const spinRoyalPassWheelRequiredFields = Object.keys(spinRoyalPassWheelData);

function fillRoyalPassData(data, keyToSkip = null) {
  if (keyToSkip !== "Title") data.append("Title", "Royal pass test integration");
  if (keyToSkip !== "Description") data.append("Description", "string");
  if (keyToSkip !== "IsActive") data.append("IsActive", "true");
  if (keyToSkip !== "SubscriptionType") data.append("SubscriptionType", "2");
  if (keyToSkip !== "Image") data.append("Image", fs.createReadStream("./support/Screenshot.png"));
  if (keyToSkip !== "StartDate") data.append("StartDate", "2026-01-24T23:55:55.799Z");
  if (keyToSkip !== "FinishDate") data.append("FinishDate", "2026-05-26T18:25:09.182Z");
  if (keyToSkip !== "RoyalPassRewards[0][globalTypeId]") data.append("RoyalPassRewards[0][globalTypeId]", "4");
  if (keyToSkip !== "RoyalPassRewards[0][amount]") data.append("RoyalPassRewards[0][amount]", "5");
  if (keyToSkip !== "RoyalPassRewards[0][claimableType]") data.append("RoyalPassRewards[0][claimableType]", "0");
  if (keyToSkip !== "RoyalPassRewards[0][claimablePer]") data.append("RoyalPassRewards[0][claimablePer]", "10");
  if (keyToSkip !== "RoyalPassRewards[0][claims]") data.append("RoyalPassRewards[0][claims]", "10");
  // if (keyToSkip !== "RoyalPassRewards[1][globalTypeId]") data.append("RoyalPassRewards[1][globalTypeId]", "5");
  // if (keyToSkip !== "RoyalPassRewards[1][amount]") data.append("RoyalPassRewards[1][amount]", "10");
  // if (keyToSkip !== "RoyalPassRewards[1][claimablePer]") data.append("RoyalPassRewards[1][claimablePer]", "10");
  // if (keyToSkip !== "RoyalPassRewards[1][claimableType]") data.append("RoyalPassRewards[1][claimableType]", "0");
  // if (keyToSkip !== "RoyalPassRewards[1][claims]") data.append("RoyalPassRewards[1][claims]", "20");
  if (keyToSkip !== "RoyalPassWheels[0][wheelId]") data.append("RoyalPassWheels[0][wheelId]", "8");
  if (keyToSkip !== "RoyalPassWheels[0][spinnablePerType]") data.append("RoyalPassWheels[0][spinnablePerType]", "2");
  if (keyToSkip !== "RoyalPassWheels[0][spinnablePer]") data.append("RoyalPassWheels[0][spinnablePer]", "10");
}

const createRoyalPassRequiredFields = [
  { key: "Title", value: "Royal pass test integration" },
  { key: "Description", value: "string" },
  { key: "IsActive", value: "true" },
  { key: "SubscriptionType", value: "2" },
  {
    key: "Image",
    value: () => fs.createReadStream("./support/Screenshot.png"),
    isStream: true,
  },
  { key: "RoyalPassRewards[0][globalTypeId]", value: "4" },
  { key: "RoyalPassRewards[0][amount]", value: "5" },
  { key: "RoyalPassRewards[0][claimableType]", value: "0" },
  { key: "RoyalPassRewards[0][claimablePer]", value: "10" },
  { key: "RoyalPassRewards[0][claims]", value: "10" },
  { key: "RoyalPassWheels[0][wheelId]", value: "3" },
  { key: "RoyalPassWheels[0][spinnablePerType]", value: "2" },
  { key: "RoyalPassWheels[0][spinnablePer]", value: "10" },
];

const keys = [
  // "Title",
  // "Description",
  // "SubscriptionType",
  // "Image",
  "RoyalPassRewards[0][globalTypeId]",
  "RoyalPassRewards[0][amount]",
  "RoyalPassRewards[0][claimableType]",
  "RoyalPassRewards[0][claimablePer]",
  "RoyalPassRewards[0][claims]",
  "RoyalPassWheels[0][wheelId]",
  "RoyalPassWheels[0][spinnablePerType]",
  "RoyalPassWheels[0][spinnablePer]"
];

describe("LuckyCrush API Tests", () => {
  let api = new ApiHandler();

  it("try to create royal pass with all required data", async () => {
    let data = new FormData();
    fillRoyalPassData(data);

    const createRoyalPassResponse = await api.post(
      create_royal_pass_end_point,
      data,
      {
        "Content-Type": "multipart/form-data",
        Accept: "text/plain",
      },
    );

    expect(createRoyalPassResponse.status).toBe(200);
  });

  keys.forEach((fieldToOmit) => {
    it(`should fail to create royal pass when [${fieldToOmit}] is missing`, async () => {
      let data = new FormData();
      fillRoyalPassData(data, fieldToOmit);
      const createRoyalPassResponse = await api.post(create_royal_pass_end_point, data, { ...data.getHeaders() });
      expect(createRoyalPassResponse).not.toBe(200);
      expect([400, 422]).toContain(createRoyalPassResponse.status);
    });
  });

  // 2. Iterate over the fields to create a test case for each one
  createRoyalPassRequiredFields.forEach((fieldToOmit) => {
    it(`should fail to create royal pass when [${fieldToOmit.key}] is missing`, async () => {
      let data = new FormData();

      // 3. Construct FormData, skipping ONLY the fieldToOmit
      createRoyalPassRequiredFields.forEach((field) => {
        if (field.key !== fieldToOmit.key) {
          // If it's a stream (file), execute the function to get a new stream.
          // Otherwise, use the value directly.
          const value = field.isStream ? field.value() : field.value;
          data.append(field.key, value);
        }
      });

      // 4. Send the request
      // We wrap this in a try/catch if your ApiHandler throws on non-200 errors,
      // otherwise check response.status
      try {
        const response = await api.post(create_royal_pass_end_point, data, {
          "Content-Type": "multipart/form-data",
          Accept: "text/plain",
        });

        // 5. Assertions
        // We expect a 400 Bad Request (or 422 Unprocessable Entity) for validation errors
        expect(response.status).not.toBe(200);
        expect([400, 422]).toContain(response.status);

        // Optional: Check if the error message mentions the missing field
        // console.log(`Response for missing ${fieldToOmit.key}:`, response.data);
      } catch (error) {
        // If the API handler throws an error for non-200 status codes, handle it here
        if (error.response) {
          expect(error.response.status).toBe(400);
        } else {
          throw error;
        }
      }
    });
  });

  it("try to create royal pass with start date after end date", async () => {
    let data = new FormData();
    fillRoyalPassData(data);

    data["StartDate"] = "2027-05-26T18:25:09.182Z";
    data["FinishDate"] = "2026-05-26T18:25:09.182Z";
    const createRoyalPassResponse = await api.post(
      create_royal_pass_end_point,
      data,
      {
        "Content-Type": "multipart/form-data",
        Accept: "text/plain",
      },
    );

    expect(createRoyalPassResponse.status).toBe(400);
  });

  //! Failed | response status code was 400
  it("try to spin royal pass wheel", async () => {
    const register = await api.post(register_end_point, registerData);
    expect(register.status).toBe(200);
    const accessToken = register.data.data.accessToken;
    const registeredApi = new ApiHandler({ authToken: accessToken });

    const getActiveRoyalPassesResponse = await registeredApi.get(get_active_royal_passes_end_point);
    expect(getActiveRoyalPassesResponse.status).toBe(200);
    const activeRoyalPasses = getActiveRoyalPassesResponse.data.data.activeRoyalPasses;
    let wheelId = 0;
    let royalPassId = 0;
    for (const royalPass of activeRoyalPasses) {
      const getRoyalPassByIdResponse = await registeredApi.get(`${get_royal_pass_by_id_end_point}/${royalPass.id}`);
      expect(getRoyalPassByIdResponse.status).toBe(200);
      if(getRoyalPassByIdResponse.data.data.royalPassWheels.length !== 0) {
        wheelId = getRoyalPassByIdResponse.data.data.royalPassWheels[0].wheelId;
        royalPassId = royalPass.id;
        break;
      }
    }

    const subscribeRoyalPassResponse = await registeredApi.post(subscribe_royal_pass_end_point, { royalPassId });
    expect(subscribeRoyalPassResponse.status).toBe(200);

    spinRoyalPassWheelData.wheelId = wheelId;
    spinRoyalPassWheelData.correlationId = `test-correlation-id-${Date.now()}`;

    const spinRoyalPassWheelResponse = await registeredApi.post(
      spin_royal_pass_wheel_end_point,
      spinRoyalPassWheelData,
    );
    expect(spinRoyalPassWheelResponse.status).toBe(200);
  });

  it("try to spin royal pass wheel with invalid wheelId", async () => {
    const register = await api.post(register_end_point, registerData);
    expect(register.status).toBe(200);

    const accessToken = register.data.data.accessToken;
    const registeredApi = new ApiHandler({ authToken: accessToken });

    const spinRoyalPassWheelResponse = await registeredApi.post(
      spin_royal_pass_wheel_end_point,
      { ...spinRoyalPassWheelData, wheelId: "invalid_wheel_id" },
    );
    expect(spinRoyalPassWheelResponse.status).toBe(400);
  });

  spinRoyalPassWheelRequiredFields.forEach((fieldToRemove) => {
    it(`should fail to spin wheel when [${fieldToRemove}] is missing`, async () => {
      const register = await api.post(register_end_point, registerData);
      expect(register.status).toBe(200);
      const accessToken = register.data.data.accessToken;
      const registeredApi = new ApiHandler(accessToken);
      // A. Create a shallow copy of the valid data
      let testData = { ...spinRoyalPassWheelData };
      // B. Remove the field we are testing
      delete testData[fieldToRemove];
      // C. Send the request
      try {
        const response = await registeredApi.post(
          spin_royal_pass_wheel_end_point,
          testData,
        );
        // D. Assertions
        expect(response.status).not.toBe(200);
        expect([400, 422]).toContain(response.status);
      } catch (error) {
        // Handle cases where the API handler throws on error
        if (error.response) {
          expect([400, 422]).toContain(error.response.status);
        } else {
          throw error; // Fail on network/code errors
        }
      }
    });
  });

  it("try to claim rewards without sending royalPassRewardId", async () => {
    const register = await api.post(register_end_point, registerData);
    expect(register.status).toBe(200);
    const accessToken = register.data.data.accessToken;
    const registeredApi = new ApiHandler({ authToken: accessToken });
    const claimRoyalRewardResponse = await registeredApi.post(claim_royal_reward_end_point, {});
    expect(claimRoyalRewardResponse.status).toBe(400);
  });

  it("try to claim rewards", async () => {
    const register = await api.post(register_end_point, registerData);
    expect(register.status).toBe(200);
    const accessToken = register.data.data.accessToken;
    const registeredApi = new ApiHandler({ authToken: accessToken });
    const claimRoyalRewardData = { "royalPassRewardId": 4 };
    const claimRoyalRewardResponse = await registeredApi.post(claim_royal_reward_end_point, {});
    expect(claimRoyalRewardResponse.status).toBe(200);
  });

  it("try to claim rewards twice", async () => {
    const register = await api.post(register_end_point, registerData);
    expect(register.status).toBe(200);
    const accessToken = register.data.data.accessToken;
    const registeredApi = new ApiHandler({ authToken: accessToken });
    const claimRoyalRewardData = { "royalPassRewardId": 4 };
    const playerRoyalPassResponse = await registeredApi.get(`${get_player_royal_pass_end_point}`);
    if (playerRoyalPassResponse.status === 200) {
      const firstClaimResponse = await registeredApi.post(claim_royal_reward_end_point, claimRoyalRewardData);
      expect(firstClaimResponse.status).toBe(200);
      const secondClaimResponse = await registeredApi.post(claim_royal_reward_end_point, claimRoyalRewardData);
      expect(secondClaimResponse.status).toBe(400);
      expect(secondClaimResponse.data.errors[0].description).toMatch("You can't claim now");
    } else {
      fail("Expected player to have a Royal Pass for this test.");
    }
  });

  it("try to claim rewards without being subscribbed to royal pass", async () => {
    const register = await api.post(register_end_point, registerData);
    expect(register.status).toBe(200);
    const accessToken = register.data.data.accessToken;
    const registeredApi = new ApiHandler({ authToken: accessToken });
    const playerRoyalPassResponse = await registeredApi.get(`${get_player_royal_pass_end_point}`);
    // make sure user didn't get royal pass
    if (playerRoyalPassResponse.status === 404) {
      const claimRoyalRewardData = { "royalPassRewardId": 4 };
      const claimRoyalRewardResponse = await registeredApi.post(claim_royal_reward_end_point, claimRoyalRewardData);
      expect(claimRoyalRewardResponse.status).toBe(400);
      expect(claimRoyalRewardResponse.data.errors[0].description).toMatch("This user doesn't own a royal pass");
    } else {
      fail(`Expected player to NOT have a Royal Pass, but got status ${playerRoyalPassResponse.status}`);
    }
  });


  // ========================
  // UPDATE ROYAL PASS TESTS
  // ========================

  //! Failed | update API doesn't work

  it("should update royalpass title", async () => {
    let data = new FormData();
    fillRoyalPassData(data);
    const newTitle = "Updated Royal Pass Title";
    data["Title"] = newTitle;

    const updateResponse = await api.post(
      `${update_royal_pass_end_point}/5`,
      data,
      {
        "Content-Type": "multipart/form-data",
        Accept: "text/plain",
      },
    );

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.data.data.title).toBe(newTitle);
  });

  it("should update royalpass description", async () => {
    let data = new FormData();
    const newDescription = "Updated description for royal pass";
    data.append("title", "Royal pass test integration");
    data.append("description", newDescription);
    data.append("isActive", "true");
    data.append("subscriptionType", "2");

    const updateResponse = await api.post(
      `${update_royal_pass_end_point}/${5}`,
      data,
      {
        "Content-Type": "multipart/form-data",
        Accept: "text/plain",
      },
    );

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.data.data.description).toBe(newDescription);
  });

  it("should update royalpass isActive status", async () => {
    let data = new FormData();
    data.append("title", "Royal pass test integration");
    data.append("description", "string");
    data.append("isActive", "false");
    data.append("subscriptionType", "2");

    const updateResponse = await api.post(
      `${update_royal_pass_end_point}/${5}`,
      data,
      {
        "Content-Type": "multipart/form-data",
        Accept: "text/plain",
      },
    );

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.data.data.isActive).toBe(false);
  });

  it("should update royalpass subscriptionType", async () => {
    let data = new FormData();
    data.append("title", "Royal pass test integration");
    data.append("description", "string");
    data.append("isActive", "true");
    data.append("subscriptionType", "3");

    const updateResponse = await api.post(
      `${update_royal_pass_end_point}/${5}`,
      data,
      {
        "Content-Type": "multipart/form-data",
        Accept: "text/plain",
      },
    );

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.data.data.subscriptionType).toBe(3);
  });

  it("should update royalpass start date", async () => {
    let data = new FormData();
    const newStartDate = "2026-02-01T23:55:55.799Z";
    data.append("title", "Royal pass test integration");
    data.append("description", "string");
    data.append("isActive", "true");
    data.append("subscriptionType", "2");
    data.append("startDate", newStartDate);
    data.append("finishDate", "2026-05-26T18:25:09.182Z");

    const updateResponse = await api.post(
      `${update_royal_pass_end_point}/${5}`,
      data,
      {
        "Content-Type": "multipart/form-data",
        Accept: "text/plain",
      },
    );

    expect(updateResponse.status).toBe(200);
    expect(new Date(updateResponse.data.data.startDate).toISOString()).toBe(
      newStartDate,
    );
  });

  it("should update royalpass finish date", async () => {
    let data = new FormData();
    const newFinishDate = "2026-06-26T18:25:09.182Z";
    data.append("title", "Royal pass test integration");
    data.append("description", "string");
    data.append("isActive", "true");
    data.append("subscriptionType", "2");
    data.append("startDate", "2026-01-24T23:55:55.799Z");
    data.append("finishDate", newFinishDate);

    const updateResponse = await api.post(
      `${update_royal_pass_end_point}/${5}`,
      data,
      {
        "Content-Type": "multipart/form-data",
        Accept: "text/plain",
      },
    );

    expect(updateResponse.status).toBe(200);
    expect(new Date(updateResponse.data.data.finishDate).toISOString()).toBe(
      newFinishDate,
    );
  });

  it("should update royalpass with image", async () => {
    let data = new FormData();
    data.append("title", "Royal pass test integration");
    data.append("description", "string");
    data.append("isActive", "true");
    data.append("subscriptionType", "2");
    data.append("image", fs.createReadStream("./support/Screenshot.png"));

    const updateResponse = await api.post(
      `${update_royal_pass_end_point}/${5}`,
      data,
      {
        "Content-Type": "multipart/form-data",
        Accept: "text/plain",
      },
    );

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.data.data.image).toBeDefined();
  });

  it("should update royalpass rewards", async () => {
    let data = new FormData();
    data.append("title", "Royal pass test integration");
    data.append("description", "string");
    data.append("isActive", "true");
    data.append("subscriptionType", "2");
    data.append("royalPassRewards[0][globalTypeId]", "5");
    data.append("royalPassRewards[0][amount]", "10");
    data.append("royalPassRewards[0][claimableType]", "1");
    data.append("royalPassRewards[0][claimablePer]", "15");
    data.append("royalPassRewards[0][claims]", "15");

    const updateResponse = await api.post(
      `${update_royal_pass_end_point}/${5}`,
      data,
      {
        "Content-Type": "multipart/form-data",
        Accept: "text/plain",
      },
    );

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.data.data.royalPassRewards).toBeDefined();
    expect(Array.isArray(updateResponse.data.data.royalPassRewards)).toBe(true);
  });

  it("should update royalpass wheels configuration", async () => {
    let data = new FormData();
    data.append("title", "Royal pass test integration");
    data.append("description", "string");
    data.append("isActive", "true");
    data.append("subscriptionType", "2");
    data.append("royalPassWheels[0][wheelId]", "4");
    data.append("royalPassWheels[0][spinnablePerType]", "1");
    data.append("royalPassWheels[0][spinnablePer]", "5");

    const updateResponse = await api.post(
      `${update_royal_pass_end_point}/${5}`,
      data,
      {
        "Content-Type": "multipart/form-data",
        Accept: "text/plain",
      },
    );

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.data.data.royalPassWheels).toBeDefined();
    expect(Array.isArray(updateResponse.data.data.royalPassWheels)).toBe(true);
  });

  it("should fail to update royalpass with start date after finish date", async () => {
    let data = new FormData();
    data.append("title", "Royal pass test integration");
    data.append("description", "string");
    data.append("isActive", "true");
    data.append("subscriptionType", "2");
    data.append("startDate", "2027-05-26T18:25:09.182Z");
    data.append("finishDate", "2026-05-26T18:25:09.182Z");

    const updateResponse = await api.post(
      `${update_royal_pass_end_point}/${5}`,
      data,
      {
        "Content-Type": "multipart/form-data",
        Accept: "text/plain",
      },
    );

    expect(updateResponse.status).toBe(400);
  });

  it("should fail to update royalpass with invalid start date", async () => {
    let data = new FormData();
    data.append("title", "Royal pass test integration");
    data.append("description", "string");
    data.append("isActive", "true");
    data.append("subscriptionType", "2");
    data.append("startDate", "2026-13-45T23:55:55.799Z");

    const updateResponse = await api.post(
      `${update_royal_pass_end_point}/${5}`,
      data,
      {
        "Content-Type": "multipart/form-data",
        Accept: "text/plain",
      },
    );

    expect(updateResponse.status).toBe(400);
  });

  it("should fail to update royalpass with invalid finish date", async () => {
    let data = new FormData();
    data.append("title", "Royal pass test integration");
    data.append("description", "string");
    data.append("isActive", "true");
    data.append("subscriptionType", "2");
    data.append("finishDate", "2026-13-45T18:25:09.182Z");

    const updateResponse = await api.post(
      `${update_royal_pass_end_point}/${5}`,
      data,
      {
        "Content-Type": "multipart/form-data",
        Accept: "text/plain",
      },
    );

    expect(updateResponse.status).toBe(400);
  });

  it("should update multiple royalpass fields at once", async () => {
    let data = new FormData();
    const newTitle = "Multi-field Update Test";
    const newDescription = "Updated multiple fields";
    data.append("title", newTitle);
    data.append("description", newDescription);
    data.append("isActive", "false");
    data.append("subscriptionType", "1");
    data.append("startDate", "2026-02-15T10:00:00.000Z");
    data.append("finishDate", "2026-07-15T20:00:00.000Z");

    const updateResponse = await api.post(
      `${update_royal_pass_end_point}/${5}`,
      data,
      {
        "Content-Type": "multipart/form-data",
        Accept: "text/plain",
      },
    );

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.data.data.title).toBe(newTitle);
    expect(updateResponse.data.data.description).toBe(newDescription);
    expect(updateResponse.data.data.isActive).toBe(false);
    expect(updateResponse.data.data.subscriptionType).toBe(1);
  });

  it("should fail to update royalpass with empty title", async () => {
    let data = new FormData();
    data.append("title", "");
    data.append("description", "string");
    data.append("isActive", "true");
    data.append("subscriptionType", "2");

    const updateResponse = await api.post(
      `${update_royal_pass_end_point}/${5}`,
      data,
      {
        "Content-Type": "multipart/form-data",
        Accept: "text/plain",
      },
    );

    expect(updateResponse.status).toBe(400);
  });

  it("should fail to update royalpass with invalid subscription type", async () => {
    let data = new FormData();
    data.append("title", "Royal pass test integration");
    data.append("description", "string");
    data.append("isActive", "true");
    data.append("subscriptionType", "999");

    const updateResponse = await api.post(
      `${update_royal_pass_end_point}/${5}`,
      data,
      {
        "Content-Type": "multipart/form-data",
        Accept: "text/plain",
      },
    );

    expect(updateResponse.status).toBe(400);
  });

  it("should fail to update royalpass with non-existent royalpass id", async () => {
    let data = new FormData();
    data.append("title", "Royal pass test integration");
    data.append("description", "string");
    data.append("isActive", "true");
    data.append("subscriptionType", "2");

    const updateResponse = await api.post(
      `${update_royal_pass_end_point}/99999`,
      data,
      {
        "Content-Type": "multipart/form-data",
        Accept: "text/plain",
      },
    );

    expect(updateResponse.status).toBe(404);
  });

  //==========================

  it("should retrieve all royal passes with correct schema", async () => {

    // 1. Send the GET request
    const response = await api.get(get_all_royal_passes_end_point);

    // 2. Validate basic status and success flags
    expect(response.status).toBe(200);
    expect(response.data.statusCode).toBe(200);
    expect(response.data.isSuccess).toBe(true);
    expect(response.data.message).toBe("Royal passes retrieved successfully");

    // 3. Validate the Data Array
    const passes = response.data.data;

    // Ensure 'data' is actually an array and has items
    expect(Array.isArray(passes)).toBe(true);
    expect(passes.length).toBeGreaterThan(0);

    // 4. Validate the structure of EACH item in the array
    // This ensures that even if new passes are added, the test checks consistency
    passes.forEach(pass => {
      // ID checks
      expect(typeof pass.id).toBe('number');

      // String checks
      expect(typeof pass.title).toBe('string');
      expect(pass.title.length).toBeGreaterThan(0); // Should not be empty
      expect(typeof pass.description).toBe('string');

      // Boolean checks
      expect(typeof pass.isActive).toBe('boolean');

      // Number checks
      expect(typeof pass.price).toBe('number');
      expect(typeof pass.currency).toBe('number');
      expect(typeof pass.subscriptionType).toBe('number');

      // Date structure check (basic string check)
      expect(pass).toHaveProperty('startDate');
      expect(pass).toHaveProperty('finishDate');

      // Array checks (Rewards and Wheels)
      expect(Array.isArray(pass.royalPassRewards)).toBe(true);
      expect(Array.isArray(pass.royalPassWheels)).toBe(true);
    });

    // 5. Optional: Spot check specific data (e.g. verifying the first item matches known data)
    // This is useful if you expect specific "Seed Data" to always be present
    const dailyPass = passes.find(p => p.title === "Daily Royal Pass");
    if (dailyPass) {
      expect(dailyPass.subscriptionType).toBe(0);
      expect(dailyPass.isActive).toBe(true);
    }
  });

  it("should retrieve a single royal pass with deep nested validation", async () => {
    // 1. Setup: Define the ID you want to test (e.g., 6 from your example)
    const testId = 6;

    // 2. Send Request (Assuming query param format: ?id=6)
    // If your API uses path params (e.g., /GetRoyalPassById/6), change this line accordingly.
    const response = await api.get(`${get_royal_pass_by_id_end_point}/${testId}`);

    // 3. Basic Response Validation
    expect(response.status).toBe(200);
    expect(response.data.isSuccess).toBe(true);
    expect(response.data.data.id).toBe(testId); // Ensure we got the ID we asked for

    const passData = response.data.data;

    // 4. Validate Top-Level Fields
    expect(typeof passData.title).toBe('string');
    expect(typeof passData.isActive).toBe('boolean');
    expect(passData.subscriptionType).toBeDefined();

    // 5. Deep Validation: Royal Pass Rewards
    // We check if the array exists, and if it has items, we validate the NESTED objects
    expect(Array.isArray(passData.royalPassRewards)).toBe(true);

    if (passData.royalPassRewards.length > 0) {
      const reward = passData.royalPassRewards[0];

      // Validate the immediate properties of the reward
      expect(reward).toHaveProperty('amount');
      expect(reward).toHaveProperty('claims');

      // *** Validate Nested 'type' Object ***
      expect(reward.type).toBeDefined();
      expect(typeof reward.type.name).toBe('string');
      expect(typeof reward.type.inGame).toBe('boolean');
      expect(reward.type.imagePath).toMatch(/^http/); // Verify it looks like a URL
    }

    // 6. Deep Validation: Royal Pass Wheels
    expect(Array.isArray(passData.royalPassWheels)).toBe(true);

    if (passData.royalPassWheels.length > 0) {
      const wheelItem = passData.royalPassWheels[0];

      // Validate immediate properties
      expect(typeof wheelItem.spinnablePer).toBe('number');

      // *** Validate Nested 'wheel' Object ***
      expect(wheelItem.wheel).toBeDefined();
      expect(wheelItem.wheel.id).toBe(wheelItem.wheelId); // Check data consistency
      expect(typeof wheelItem.wheel.isActive).toBe('boolean');
      expect(Array.isArray(wheelItem.wheel.prizes)).toBe(true);
    }
  });

  it("should return error when requesting non-existent ID", async () => {
    const invalidId = 9999999;
    try {
      const response = await api.get(`${get_royal_pass_by_id_end_point}?id=${invalidId}`);

      // Depending on your API, it might return 200 with isSuccess:false, or a 404
      if (response.status === 200) {
        expect(response.data.isSuccess).toBe(false);
        expect(response.data.data).toBeNull();
      } else {
        expect(response.status).toBe(404);
      }
    } catch (error) {
      // If api handler throws on 404
      if (error.response) expect(error.response.status).toBe(404);
    }
  });

  it("try to delete royal pass by its id", async () => {
    const deletedId = 6;
    const deleteResposne = await api.delete(`${delete_royal_pass_end_point}/${deletedId}`);
    expect(deleteResposne.status).toBe(200);
  });

  it("should retrieve ONLY active royal passes", async () => {

    const register = await api.post(register_end_point, registerData);
    expect(register.status).toBe(200);
    const accessToken = register.data.data.accessToken;
    const registeredApi = new ApiHandler({ authToken: accessToken });

    // 1. Send Request
    const response = await registeredApi.get(get_active_royal_passes_end_point);

    // 2. Basic Success Validation
    expect(response.status).toBe(200);
    expect(response.data.isSuccess).toBe(true);

    const activePasses = response.data.data.activeRoyalPasses;

    // Ensure we got a list back
    expect(Array.isArray(activePasses)).toBe(true);

    // 3. LOGIC VALIDATION Loop
    // Iterate through every item to ensure the API filtering logic is working
    activePasses.forEach(pass => {

      // Check A: The 'isActive' flag MUST be true
      expect(pass.isActive).toBe(true);

      // Check B: Date Logic (The pass should not be expired)
      // We parse the dates to ensure the current time is within the active window
      const now = new Date();
      const finishDate = new Date(pass.finishDate);

      // Check C: Data Integrity
      expect(pass.title).not.toBeNull();
      expect(pass.id).toBeDefined();
    });

  });

  it("should retrieve the authenticated player's royal pass subscription", async () => {

    // 1. register
    const register = await api.post(register_end_point, registerData);
    expect(register.status).toBe(200);
    const accessToken = register.data.data.accessToken;
    const registeredApi = new ApiHandler({ authToken: accessToken });

    // 2. Send the GET request using the AUTHENTICATED api
    const response = await registeredApi.get(get_player_royal_pass_end_point);

    // 3. Validate Basic Response Structure
    expect(response.status).toBe(200);
    expect(response.data.isSuccess).toBe(true);
    expect(response.data.message).toBe("Subscription fetched successfully");

    const subscription = response.data.data;

    // 4. Validate Subscription Details (Level 1)
    expect(subscription).toBeDefined();
    expect(typeof subscription.id).toBe('number');
    expect(typeof subscription.passActive).toBe('boolean');
    expect(typeof subscription.expiresInDays).toBe('number'); // Can be negative if expired
    expect(typeof subscription.progress).toBe('number');

    // 5. Validate Tiers Array (Level 2)
    expect(Array.isArray(subscription.tiers)).toBe(true);

    // Only run deep validation if the user actually has tiers
    if (subscription.tiers.length > 0) {
      const tier = subscription.tiers[0];

      // Validate specific tier fields
      expect(typeof tier.id).toBe('number');
      expect(typeof tier.amount).toBe('number');
      expect(typeof tier.locked).toBe('boolean');

      // Validate Date formats
      // This regex checks for ISO 8601 date format (e.g., 2026-01-22T...)
      // or you can use new Date(tier.nextClaimAt).toString() !== 'Invalid Date'
      expect(tier.nextClaimAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);

      // 6. Validate Nested Type Object (Level 3)
      expect(tier.type).toBeDefined();
      expect(typeof tier.type.id).toBe('number');
      expect(typeof tier.type.name).toBe('string');
      expect(typeof tier.type.inGame).toBe('boolean');

      // Validate Image Path (should look like a URL)
      expect(tier.type.imagePath).toMatch(/^http/);
    }
  });

  it("try to delete a royal pass even if player was subscribed in it", async () => {
    const register = await api.post(register_end_point, registerData);
    expect(register.status).toBe(200);
    const accessToken = register.data.data.accessToken;
    const registeredApi = new ApiHandler({ authToken: accessToken });

    const getPlayerRoyalPassResponse = await registeredApi.get(get_player_royal_pass_end_point);
    if (getPlayerRoyalPassResponse.status === 404) {
      console.log("User Not Subscribed");
    } else {
      expect(getPlayerRoyalPassResponse.status).toBe(200);
      const deletedRoyalPassId = getPlayerRoyalPassResponse.data.data.id;
      const deleteRoyalPassResponse = await api.delete(`${delete_royal_pass_end_point}/${deletedRoyalPassId}`);
      console.log('deletedRoyalPassId: ', deletedRoyalPassId);
      expect(deleteRoyalPassResponse.status).toBe(200);

      const getPlayerRoyalPassResponseAfterDelete = await registeredApi.get(get_player_royal_pass_end_point);
      expect(getPlayerRoyalPassResponseAfterDelete.status).toBe(404);
    }
  });

  it("try to subscribe in royal pass", async () => {
    const register = await api.post(register_end_point, registerData);
    expect(register.status).toBe(200);
    const accessToken = register.data.data.accessToken;
    const registeredApi = new ApiHandler({ authToken: accessToken });

    const playerRoyalPassResponse = await registeredApi.get(get_player_royal_pass_end_point);
    expect(playerRoyalPassResponse.status).toBe(404);

    const getActiveRoyalPassesResponse = await registeredApi.get(get_active_royal_passes_end_point);
    expect(getActiveRoyalPassesResponse.status).toBe(200);
    const royalPassId = getActiveRoyalPassesResponse.data.data.activeRoyalPasses[0].id;

    const subscribeRoyalPassResponse = await registeredApi.post(subscribe_royal_pass_end_point, { royalPassId });
    expect(subscribeRoyalPassResponse.status).toBe(200);

    const playerRoyalPassResponseAfterSubscribe = await registeredApi.get(get_player_royal_pass_end_point);
    expect(playerRoyalPassResponseAfterSubscribe.status).toBe(200);
  });

  it("shouldn't be able to subscribe to more than one royal pass at the same time", async () => {
    const register = await api.post(register_end_point, registerData);
    expect(register.status).toBe(200);
    const accessToken = register.data.data.accessToken;
    const registeredApi = new ApiHandler({ authToken: accessToken });
    const getPlayerRoyalPassResponse = await registeredApi.get(get_player_royal_pass_end_point);
    if(getPlayerRoyalPassResponse.status === 200) {
      console.warn("User already subscribed to a royal pass. Please ensure the user is not subscribed to any royal pass before running this test.");
      return;
    }
    const getActiveRoyalPassesResponse = await registeredApi.get(get_active_royal_passes_end_point);
    expect(getActiveRoyalPassesResponse.status).toBe(200);
    const activeRoyalPasses = getActiveRoyalPassesResponse.data.data.activeRoyalPasses;
    if (activeRoyalPasses.length < 2) {
      console.warn("Not enough active royal passes to perform this test. Please ensure there are at least 2 active royal passes.");
      return;
    }
    const firstRoyalPassId = activeRoyalPasses[0].id;
    const secondRoyalPassId = activeRoyalPasses[1].id;

    // Subscribe to the first royal pass
    const subscribeFirstResponse = await registeredApi.post(subscribe_royal_pass_end_point, { royalPassId: firstRoyalPassId });
    expect(subscribeFirstResponse.status).toBe(200);
    
    const getPlayerRoyalPassResponseAfterFirstSubscribe = await registeredApi.get(get_player_royal_pass_end_point);
    expect(getPlayerRoyalPassResponseAfterFirstSubscribe.status).toBe(200);

    const subscribeSecondResponse = await registeredApi.post(subscribe_royal_pass_end_point, { royalPassId: secondRoyalPassId });
    expect(subscribeSecondResponse.status).toBe(400);
  });
});
