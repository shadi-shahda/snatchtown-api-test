const ApiHandler = require("./../support/api-handler");

const api = new ApiHandler();

const create_package_end_point = '/api/Package/CreatePackage';
const purchase_package_end_point = '/api/Package/PurchasePackage';
const get_all_packages_end_point = '/api/Package/GetAllPackages';
const get_package_by_id_end_point = '/api/Package/GetPackageById';
const patch_package_by_id_end_point = '/api/Package/UpdatePackage';
const delete_package_by_id_end_point = '/api/Package/DeletePackage';
const player_profile_end_point = '/api/User/GetPlayerProfile';

const register_end_point = "/api/Auth/Register";
const registerData = {
  userName: "shadi",
  googleId: "string",
  profileImage: "",
  deviceToken: "",
};

const staff_login_end_point = '/api/Auth/StaffLogin';
const staffLoginData = {
  "email": "mabco-test3@gmail.com",
  "password": "string!1S"
};

function generatePackageData(keyToSkip = null) {
  const packageData = {
    "title": "package title",
    "price": 100,
    "currency": 2,
    "diamondAmount": 10
  };
  if (keyToSkip) {
    delete packageData[keyToSkip];
  }
  return packageData;
}

function generatePurchaseData(keyToSkip = null) {
  const purchaseData = {
    "packageId": 1,
    "playerId": "00468646-3ba9-478b-b432-d65bf7196973"
  };
  if (keyToSkip) {
    delete purchaseData[keyToSkip];
  }
  return purchaseData;
}

const createRequiredFields = ["title", "price", "currency", "diamondAmount"];
const fieldsShouldntBeNegative = ["price", "currency", "diamondAmount"];

const purchaseRequiredFields = ["packageId", "playerId"];

describe("Package Test", () => {
  it("create package with all required data", async () => {
    const packageData = generatePackageData();
    const response = await api.post(create_package_end_point, packageData);
    expect(response.status).toBe(200);
    expect(response.data.data).toHaveProperty("id");
    expect(response.data.data.title).toBe(packageData.title);
    expect(response.data.data.price).toBe(packageData.price);
    expect(response.data.data.diamondAmount).toBe(packageData.diamondAmount);
    expect(response.data.data.currency).toBe(packageData.currency);
  });

  createRequiredFields.forEach(field => {
    it(`should fail to create package without ${field}`, async () => {
      const packageData = generatePackageData(field);
      const response = await api.post(create_package_end_point, packageData);
      expect(response.status).toBe(400);
    });
  });

  it("should fail to create packge with invalid currency", async () => {
    const packageData = generatePackageData();
    packageData.currency = 99;
    const response = await api.post(create_package_end_point, packageData);
    expect(response.status).toBe(400);
  });

  fieldsShouldntBeNegative.forEach(field => {
    it(`should fail to create package with negative ${field}`, async () => {
      let packageData = generatePackageData(field);
      
      packageData[field] = -1;
      console.log(packageData);
      const response = await api.post(create_package_end_point, packageData);
      expect(response.status).toBe(400);
    });
  });
  // ----------------------------------------------------------------
  // Update Package Test Cases
  // ----------------------------------------------------------------

  it("should update package data (title, price, currency, diamondAmount)", async () => {
    // 1. Create a package first
    const packageData = generatePackageData();
    const createResponse = await api.post(create_package_end_point, packageData);
    expect(createResponse.status).toBe(200);
    const packageId = createResponse.data.data.id;

    // 2. Prepare update data
    const updateData = {
      packageId: packageId,
      title: "Updated Package Title",
      price: 200,
      currency: 3, // Valid range: 0-3
      diamondAmount: 50
    };

    // 3. Send update request
    const response = await api.patch(`${patch_package_by_id_end_point}/${packageId}`, updateData);
    expect(response.status).toBe(200);

    // 4. Verify updates
    const packageResponse = await api.get(`${get_package_by_id_end_point}/${packageId}`);
    expect(packageResponse.status).toBe(200);
    expect(packageResponse.data.data.title).toBe(updateData.title);
    expect(packageResponse.data.data.price).toBe(updateData.price);
    expect(packageResponse.data.data.currency).toBe(updateData.currency);
    expect(packageResponse.data.data.diamondAmount).toBe(updateData.diamondAmount);
  });

  const invalidCurrencies = [-1, 4, 99];
  invalidCurrencies.forEach(currency => {
    it(`should fail to update package with invalid currency: ${currency} (Must be 0-3)`, async () => {
      // Create package
      const packageData = generatePackageData();
      const createResponse = await api.post(create_package_end_point, packageData);
      const packageId = createResponse.data.data.id;

      // Update with invalid currency
      const updateData = {
        packageId: packageId,
        title: "Invalid Currency Update",
        price: 100,
        currency: currency,
        diamondAmount: 10
      };

      const response = await api.patch(`${patch_package_by_id_end_point}/${packageId}`, updateData);
      expect(response.status).toBe(400);
    });
  });

  const invalidValues = [
    { field: "price", value: 0 },
    { field: "price", value: -10 },
    { field: "diamondAmount", value: 0 },
    { field: "diamondAmount", value: -5 }
  ];

  invalidValues.forEach(({ field, value }) => {
    it(`should fail to update package with invalid ${field}: ${value} (Must be > 0)`, async () => {
      // Create package
      const packageData = generatePackageData();
      const createResponse = await api.post(create_package_end_point, packageData);
      const packageId = createResponse.data.data.id;

      // Base valid update data
      const updateData = {
        packageId: packageId,
        title: "Invalid Value Update",
        price: 100,
        currency: 1,
        diamondAmount: 10
      };

      // Inject invalid value
      updateData[field] = value;

      const response = await api.patch(`${patch_package_by_id_end_point}/${packageId}`, updateData);
      expect(response.status).toBe(400);
    });
  });

  it("purchase package with valid data", async () => {
    const packageData = generatePackageData();
    const createResponse = await api.post(create_package_end_point, packageData);
    expect(createResponse.status).toBe(200);
    const packageId = createResponse.data.data.id;
    const packageDiamonds = packageData.diamondAmount;

    const registerResponse = await api.post(register_end_point, registerData);
    expect(registerResponse.status).toBe(200);
    const userRegisteredResponse = new ApiHandler({ authToken: registerResponse.data.data.accessToken });
    const profileResponse = await userRegisteredResponse.get(player_profile_end_point);
    expect(profileResponse.status).toBe(200);
    const userDiamonds = profileResponse.data.data.diamonds;

    const purchaseData = generatePurchaseData();

    const staffLoginResponse = await api.post(staff_login_end_point, staffLoginData);
    expect(staffLoginResponse.status).toBe(200);
    const accessToken = staffLoginResponse.data.data.accessToken;
    const registeredApi = new ApiHandler({ authToken: accessToken });

    purchaseData.playerId = registerResponse.data.data.user.id;
    purchaseData.packageId = packageId;

    const purchaseResponse = await registeredApi.post(purchase_package_end_point, purchaseData);
    expect(purchaseResponse.status).toBe(200);

    const secondProfileResponse = await userRegisteredResponse.get(player_profile_end_point);
    expect(secondProfileResponse.status).toBe(200);
    const newUserDiamonds = secondProfileResponse.data.data.diamonds;
    expect(newUserDiamonds).toBe(userDiamonds + packageDiamonds);
  });

  purchaseRequiredFields.forEach(field => {
    it(`should fail to purchase package without ${field}`, async () => {
      const registerResponse = await api.post(register_end_point, registerData);
      expect(registerResponse.status).toBe(200);
      const accessToken = registerResponse.data.data.accessToken;
      const registeredApi = new ApiHandler({ authToken: accessToken });
      const purchaseData = generatePurchaseData(field);
      const response = await registeredApi.post(purchase_package_end_point, purchaseData);
      expect(response.status).toBe(400);
    });
  });

  it("should retreive all packages", async () => {
    const response = await api.get(get_all_packages_end_point);
    expect(response.status).toBe(200);
    expect(response.data.statusCode).toBe(200);
    expect(response.data.isSuccess).toBe(true);
    expect(response.data.message).toBe("Packages fetched successfully");
    expect(Array.isArray(response.data.data)).toBe(true);

    const packages = response.data.data;
    packages.forEach(pkg => {
      expect(pkg).toHaveProperty("id");
      expect(pkg).toHaveProperty("title");
      expect(pkg).toHaveProperty("price");
      expect(pkg).toHaveProperty("currency");
      expect(pkg).toHaveProperty("diamondAmount");
    });
  });

  it("should retrieve package by id", async () => {

    const packageData = generatePackageData();
    const createResponse = await api.post(create_package_end_point, packageData);
    expect(createResponse.status).toBe(200);
    const packageId = createResponse.data.data.id;


    const response = await api.get(`${get_package_by_id_end_point}/${packageId}`);
    expect(response.status).toBe(200);
    expect(response.data.statusCode).toBe(200);
    expect(response.data.isSuccess).toBe(true);
    expect(response.data.message).toBe("Package fetched successfully");
    expect(response.data.data).toHaveProperty("id", packageId);
    expect(response.data.data).toHaveProperty("title", packageData.title);
    expect(response.data.data).toHaveProperty("price", packageData.price);
    expect(response.data.data).toHaveProperty("currency", packageData.currency);
    expect(response.data.data).toHaveProperty("diamondAmount", packageData.diamondAmount);
  });

  it("should delete package by its id", async () => {
    const packageData = generatePackageData();
    const createPackageResponse = await api.post(create_package_end_point, packageData);
    expect(createPackageResponse.status).toBe(200);
    const packageId = createPackageResponse.data.data.id;
    const deletePackageResponse = await api.delete(`${delete_package_by_id_end_point}/${packageId}`);
    expect(deletePackageResponse.status).toBe(200);
    const fetchPackages = await api.get(get_all_packages_end_point);
    expect(fetchPackages.status).toBe(200);
    const packages = fetchPackages.data.data;
    const exists = packages.some(item => item.id === packageId);

    if (!exists) {
      console.log("Item is NOT in the list");
    }
  });

  it("should fail to delete a package with invalid id", async () => {
    const deletePackageResponse = await api.delete(`${delete_package_by_id_end_point}/9999`);
    expect([400, 404]).toContain(deletePackageResponse.status);
  });
});