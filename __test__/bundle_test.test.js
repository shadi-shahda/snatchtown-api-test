const ApiHandler = require('../support/api-handler');
describe('bundle api test', () => {
  let api = new ApiHandler();
  const create_bundle_end_point = '/api/Bundle/CreateBundle';
  const get_bundle_end_point = '/api/Bundle/GetAllBundles';
  const get_bundle_by_id_end_point = '/api/Bundle/GetBundleById';
  const patch_bundle_end_point = '/api/Bundle/UpdateBundle';
  const delete_bundle_end_point = '/api/Bundle/DeleteBundle';
  const soft_delete_end_point = '/api/Bundle/SoftDeleteBundle';
  const player_profile_end_point = '/api/User/GetPlayerProfile';
  const register_end_point = '/api/Auth/Register';

  const registerData = {
    "displayName": "shadi",
    "googleId": "string",
    "playerDeviceId": "string",
    "isGoogleAuthenticated": true,
    "profileImage": "",
    "deviceToken": "string"
  };

  const requiredFields = ['id', 'title', 'subtitle', 'price', 'isActive', 'startDate', 'endDate', 'products'];

  const patch_bundle_data = {
    "name": "updated bundle",
    "subtitle": "updated subtitle",
    "price": 15,
    "isActive": false,
    "startDate": "2026-02-23",
    "endDate": "2027-02-22",
    "products": [
      {
        "productId": 9,
        "amount": 2
      }
    ]
  };

  const create_bundle_data = {
    "title": "new bundle",
    "subTitle": "bundle subtitle",
    "price": 10,
    "isActive": true,
    "startDate": "2026-12-15",
    "endDate": "2027-12-20",
    "products": [
      {
        "productId": 29,
        "amount": 10
      },
      {
        "productId": 31,
        "amount": 10
      }
    ]
  };

  it("try to create bundle with all required data", async () => {
    const result = await api.post(create_bundle_end_point, create_bundle_data);
    expect(result.status).toBe(200);
  });

  it("shouldn\'t create bundle without sending title", async () => {
    let data = { ...create_bundle_data };
    delete data.title;
    const result = await api.post(create_bundle_end_point, data);
    expect(result.status).toBe(400);
  });

  it("shouldn\'t create bundle without sending subTitle", async () => {
    let data = { ...create_bundle_data };
    delete data.subTitle;
    const result = await api.post(create_bundle_end_point, data);
    expect(result.status).toBe(400);
  });

  it("shouldn\'t create bundle without sending price", async () => {
    let data = { ...create_bundle_data };
    delete data.price;
    const result = await api.post(create_bundle_end_point, data);
    expect(result.status).toBe(400);
  });

  it("shouldn\'t create bundle without sending isActive", async () => {
    let data = { ...create_bundle_data };
    delete data.isActive;
    const result = await api.post(create_bundle_end_point, data);
    expect(result.status).toBe(400);
  });

  it("shouldn\'t create bundle without sending startDate", async () => {
    let data = { ...create_bundle_data };
    delete data.startDate;
    const result = await api.post(create_bundle_end_point, data);
    expect(result.status).toBe(400);
  });

  it("shouldn\'t create bundle without sending endDate", async () => {
    let data = { ...create_bundle_data };
    delete data.endDate;
    const result = await api.post(create_bundle_end_point, data);
    expect(result.status).toBe(400);
  });

  it("shouldn\'t create bundle with endDate before startDate", async () => {
    let data = { ...create_bundle_data };
    data.endDate = "2025-11-30";
    const result = await api.post(create_bundle_end_point, data);
    expect(result.status).toBe(400);
  });

  it("shouldn\'t create bundle with startDate after endDate", async () => {
    let data = { ...create_bundle_data };
    data.endDate = "2025-12-02";
    const result = await api.post(create_bundle_end_point, data);
    expect(result.status).toBe(400);
  });

  it("shouldn\'t create bundle without sending products", async () => {
    let data = { ...create_bundle_data };
    delete data.products;
    const result = await api.post(create_bundle_end_point, data);
    expect(result.status).toBe(400);
  });

  it("shouldn\'t create bundle with empty products array", async () => {
    let data = { ...create_bundle_data };
    data.products = [];
    const result = await api.post(create_bundle_end_point, data);
    expect(result.status).toBe(400);
  });

  it("shouldn\'t create bundle with product missing productId", async () => {
    let data = { ...create_bundle_data };
    delete data.products[0].productId;
    const result = await api.post(create_bundle_end_point, data);
    expect(result.status).toBe(400);
  });

  it("shouldn\'t create bundle with product missing amount", async () => {
    let data = { ...create_bundle_data };
    delete data.products[0].amount;
    const result = await api.post(create_bundle_end_point, data);
    expect(result.status).toBe(400);
  });

  it("shouldn\'t create bundle with product amount less than 1", async () => {
    let data = { ...create_bundle_data };
    data.products[0].amount = 0;
    const result = await api.post(create_bundle_end_point, data);
    expect(result.status).toBe(400);
  });

  it("shouldn't create bundle with product amount as negative number", async () => {
    let data = { ...create_bundle_data };
    data.products[0].amount = -2;
    const result = await api.post(create_bundle_end_point, data);
    expect(result.status).toBe(400);
  });

  it("shouldn\'t create bundle with duplicate productIds", async () => {
    let data = { ...create_bundle_data };
    data.products[1].productId = data.products[0].productId;
    const result = await api.post(create_bundle_end_point, data);
    expect(result.status).toBe(400);
  });

  it("shouldn\'t create bundle with non-existing productId", async () => {
    let data = { ...create_bundle_data };
    data.products[0].productId = 99999;
    const result = await api.post(create_bundle_end_point, data);
    expect(result.status).toBe(400);
  });

  it("shouldn\'t create bundle if price is greater than sum of individual product prices", async () => {
    let data = { ...create_bundle_data };
    data.price = 1000;
    const result = await api.post(create_bundle_end_point, data);
    expect(result.status).toBe(400);
  });

  it("should fetch all bundles", async () => {
    const result = await api.get(get_bundle_end_point);
    expect(result.status).toBe(200);
  });

  it("should update bundle with valid data", async () => {
    const productId = 11;
    const updateResult = await api.patch(`${patch_bundle_end_point}/${productId}`, patch_bundle_data);
    expect(updateResult.status).toBe(200);
    // Verify the updated fields on swagger
  });

  it("should delete bundle", async () => {
    // First, create a bundle to delete
    const createResult = await api.post(create_bundle_end_point, create_bundle_data);
    expect(createResult.status).toBe(200);
    const bundleId = createResult.data.data.id;
    // Now, delete the created bundle
    const deleteResult = await api.delete(`${delete_bundle_end_point}/${bundleId}`);
    expect(deleteResult.status).toBe(200);
  });

  it("shouldn\'t delete non-existing bundle", async () => {
    const nonExistingBundleId = 99999;
    const deleteResult = await api.delete(`${delete_bundle_end_point}/${nonExistingBundleId}`);
    expect(deleteResult.status).toBe(400);
  });

  it("try to delete a product after creating a bundle with it", async () => {
    const productId = 9;
    const data = {
      "title": "bundle with product to delete",
      "subTitle": "bundle subtitle",
      "price": 15,
      "isActive": true,
      "startDate": "2025-12-05",
      "endDate": "2025-12-10",
      "products": [
        {
          "productId": productId,
          "amount": 1
        }
      ]
    };
    // First, create a bundle with a specific product
    const createResult = await api.post(create_bundle_end_point, data);
    expect(createResult.status).toBe(200);
    // Now, try to delete the product used in the bundle
    const deleteProductResult = await api.delete(`/api/Product/DeleteProduct/${productId}`);
    expect(deleteProductResult.status).toBe(200);
    // verify on swagger if the product is deleted or not (succeeded)
  });

  it('try to delete bundle soft delete', async () => {
    const createBundleResponse = await api.post(create_bundle_end_point, create_bundle_data);
    expect(createBundleResponse.status).toBe(200);
    const bundleId = createBundleResponse.data.data.id;
    const getBundleResponse = await api.get(`${get_bundle_by_id_end_point}/${bundleId}`);
    expect(getBundleResponse.status).toBe(200);
    const softDeleteResponse = await api.post(`${soft_delete_end_point}/${bundleId}`);
    expect(softDeleteResponse.status).toBe(200);

    const getBundleResponseFailed = await api.get(`${get_bundle_by_id_end_point}/${bundleId}`);
    expect([400, 404]).toContain(getBundleResponseFailed.status);
    expect(getBundleResponseFailed.data.errors[0].description).toMatch("Bundle not found");
  });

  it('try to delete bundle soft delete with invalid id', async () => {
    const softDeleteResponse = await api.post(`${soft_delete_end_point}/999`);
    expect([400, 404]).toContain(softDeleteResponse.status);
  });

  it.only("try to purchase bundle", async () => {
    const createBundleResponse = await api.post(create_bundle_end_point, create_bundle_data);
    expect(createBundleResponse.status).toBe(200);
    const bundleId = createBundleResponse.data.data.id;
    
    const registerReponse = await api.post(register_end_point, registerData);
    expect(registerReponse.status).toBe(200);
    const accessToken = registerReponse.data.data.accessToken;
    const registeredApi = new ApiHandler({ authToken: accessToken });
    
    const playerProfile = await registeredApi.get(player_profile_end_point);

      const purchaseResponse = await registeredApi.post(`/api/Bundle/PurchaseBundle/${bundleId}`);
      expect(purchaseResponse.status).toBe(200);

  });
});
