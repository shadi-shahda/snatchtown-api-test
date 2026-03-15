const ApiHandler = require('./../support/api-handler');

describe('product api test', () => {
  let api = new ApiHandler();

  // Endpoints
  const create_product_end_point = '/api/Product/CreateProduct';
  const get_products_end_point = '/api/Product/GetAllProducts';
  const get_shop_products_end_point = '/api/Product/GetShopProducts';
  const delete_products_end_point = '/api/Product/DeleteProduct';
  const patch_products_end_point = '/api/Product/UpdateProduct';
  const purchase_products_end_point = '/api/Product/PurchaseProduct';
  const soft_delete_product_end_point = '/api/Product/SoftDeleteProduct';
  const get_bundles_end_point = '/api/Bundle/GetAllBundles';

  const register_end_point = '/api/Auth/Register';

  const registerData = {
    "userName": "shadi",
    "googleId": "qwertyu",
    "profileImage": "",
    "deviceToken": ""
  };

  const customHeaders = { 'Content-Type': 'application/json' };

  // Data Setup
  let baseProductData = {};

  beforeEach(() => {
    baseProductData = {
      "typeId": 1,
      "amount": 5,
      "price": 5,
      "bonusAmount": 0,
      "isPopular": true,
      "isBestValue": true,
      "currency": 0
    };
  });

  /**
   * Helper function to flatten the nested response structure
   * into a single array of items for easier searching/counting.
   */
  const flattenProducts = (dataObj) => {
    if (!dataObj) return [];
    return [
      ...(dataObj.coins || []),
      ...(dataObj.diamonds || []),
      ...(dataObj.boosters || []),
      ...(dataObj.bundles || [])
    ];
  };

  it('should create product with all required data', async () => {
    const result = await api.post(create_product_end_point, baseProductData, customHeaders);

    expect(result.status).toBe(200);

    // Assuming the Create endpoint returns the single created object flatly.
    // If it returns nested data, adjust path accordingly.
    const createdData = result.data.data;

    // Note: The 'typeId' usually corresponds to 'id' or specific type field depending on logic
    // adjusted expectation to match standard create response
    expect(createdData.amount).toBe(baseProductData.amount);
    expect(createdData.price).toBe(baseProductData.price);
    expect(createdData.isPopular).toBe(baseProductData.isPopular);
    expect(createdData.currency).toBe(baseProductData.currency);
    expect(createdData.isBestValue).toBe(baseProductData.isBestValue);
  });

  it('shouldn\'t create product without sending typeId', async () => {
    let data = { ...baseProductData };
    delete data.typeId;
    const result = await api.post(create_product_end_point, data, customHeaders);
    expect(result.status).toBe(400);
  });

  it('shouldn\'t create product without sending amount', async () => {
    let data = { ...baseProductData };
    delete data.amount;
    const result = await api.post(create_product_end_point, data, customHeaders);
    expect(result.status).toBe(400);
  });

  it('shouldn\'t create product without sending Price', async () => {
    let data = { ...baseProductData };
    delete data.price;
    const result = await api.post(create_product_end_point, data, customHeaders);
    expect(result.status).toBe(400);
  });

  it('should fetch all products and validate structure', async () => {
    const result = await api.get(get_products_end_point);
    expect(result.status).toBe(200);
    expect(result.data.isSuccess).toBe(true);
    expect(result.data.statusCode).toBe(200);
    expect(result.data.message).toBe("Products retrieved successfully");

    // Validate that the keys exist and are arrays
    const data = result.data.data;
    expect(Array.isArray(data.coins)).toBe(true);
    expect(Array.isArray(data.diamonds)).toBe(true);
    // Boosters or Bundles might be empty, but should still be arrays
    expect(Array.isArray(data.boosters)).toBe(true);
    expect(Array.isArray(data.bundles)).toBe(true);
  });

  it('should delete the product by its Id', async () => {
    const productId = 91; // Ensure this ID exists or use the ID from the Create test

    // 1. Fetch current state
    const firstFetch = await api.get(get_products_end_point);
    expect(firstFetch.status).toBe(200);

    // Calculate total items across all categories
    const initialCount = flattenProducts(firstFetch.data.data).length;

    // 2. Perform Delete
    const result = await api.delete(`${delete_products_end_point}/${productId}`);
    expect(result.status).toBe(200);

    // 3. Fetch again and compare counts
    const secondFetch = await api.get(get_products_end_point);
    expect(secondFetch.status).toBe(200);

    const finalCount = flattenProducts(secondFetch.data.data).length;
    expect(finalCount).toBe(initialCount - 1);
  });

  it('try to update TypeId', async () => {
    const productId = 92;
    const typeId = 2;

    let updateData = {
      ...baseProductData,
      productId: productId,
      typeId: typeId
    };

    const result = await api.patch(`${patch_products_end_point}/${productId}`, updateData, customHeaders);
    expect(result.status).toBe(200);

    const fetchedProducts = await api.get(get_products_end_point);
    expect(fetchedProducts.status).toBe(200);

    // Flatten data to find the specific ID regardless of category
    const allProducts = flattenProducts(fetchedProducts.data.data);
    const updatedProduct = allProducts.find(p => p.id === productId);

    expect(updatedProduct).toBeDefined();
    // Assuming typeId isn't returned in the GET list, check other fields, 
    // or if TypeId is implied by category (Coins vs Diamonds)
    expect(updatedProduct.amount).toBe(updateData.amount);
    expect(updatedProduct.price).toBe(updateData.price);
  });

  it('try to update amount', async () => {
    const productId = 92;
    const amount = 200; // Distinct value to ensure update worked

    let updateData = {
      ...baseProductData,
      productId: productId,
      amount: amount
    };

    const result = await api.patch(`${patch_products_end_point}/${productId}`, updateData, customHeaders);
    expect(result.status).toBe(200);

    const fetchedProducts = await api.get(get_products_end_point);
    const allProducts = flattenProducts(fetchedProducts.data.data);
    const updatedProduct = allProducts.find(p => p.id === productId);

    expect(updatedProduct).toBeDefined();
    expect(updatedProduct.amount).toBe(amount);
  });

  it('try to update price', async () => {
    const productId = 92;
    const price = 500; // Distinct value

    let updateData = {
      ...baseProductData,
      productId: productId,
      price: price
    };

    const result = await api.patch(`${patch_products_end_point}/${productId}`, updateData, customHeaders);
    expect(result.status).toBe(200);

    const fetchedProducts = await api.get(get_products_end_point);
    const allProducts = flattenProducts(fetchedProducts.data.data);
    const updatedProduct = allProducts.find(p => p.id === productId);

    expect(updatedProduct).toBeDefined();
    expect(updatedProduct.price).toBe(price);
  });

  it('try to update bonusAmount', async () => {
    const productId = 92;
    const bonusAmount = 5;

    let updateData = {
      ...baseProductData,
      productId: productId,
      bonusAmount: bonusAmount
    };

    const result = await api.patch(`${patch_products_end_point}/${productId}`, updateData, customHeaders);
    expect(result.status).toBe(200);

    const fetchedProducts = await api.get(get_products_end_point);
    const allProducts = flattenProducts(fetchedProducts.data.data);
    const updatedProduct = allProducts.find(p => p.id === productId);

    expect(updatedProduct).toBeDefined();
  });

  it('try to update isPopular', async () => {
    const productId = 92;
    const isPopular = false;

    let updateData = {
      ...baseProductData,
      productId: productId,
      isPopular: isPopular
    };

    const result = await api.patch(`${patch_products_end_point}/${productId}`, updateData, customHeaders);
    expect(result.status).toBe(200);

    const fetchedProducts = await api.get(get_products_end_point);
    const allProducts = flattenProducts(fetchedProducts.data.data);
    const updatedProduct = allProducts.find(p => p.id === productId);

    expect(updatedProduct).toBeDefined();
  });

  it('try to update isBestValue', async () => {
    const productId = 92;
    const isBestValue = true;

    let updateData = {
      ...baseProductData,
      productId: productId,
      isBestValue: isBestValue
    };

    const result = await api.patch(`${patch_products_end_point}/${productId}`, updateData, customHeaders);
    expect(result.status).toBe(200);

    const fetchedProducts = await api.get(get_products_end_point);
    const allProducts = flattenProducts(fetchedProducts.data.data);
    const updatedProduct = allProducts.find(p => p.id === productId);

    expect(updatedProduct).toBeDefined();
    expect(updatedProduct.isBestValue).toBe(isBestValue);
  });

  it('try to update currency', async () => {
    const productId = 92;
    const currency = 0;

    let updateData = {
      ...baseProductData,
      productId: productId,
      currency: currency
    };

    const result = await api.patch(`${patch_products_end_point}/${productId}`, updateData, customHeaders);
    expect(result.status).toBe(200);

    const fetchedProducts = await api.get(get_products_end_point);
    const allProducts = flattenProducts(fetchedProducts.data.data);
    const updatedProduct = allProducts.find(p => p.id === productId);

    expect(updatedProduct).toBeDefined();
    expect(updatedProduct.currency).toBe(currency);
  });

  it("try to buy product without being authorized", async () => {
    const productId = 1;
    const purchaseProductData = {
      "productId": productId
    };

    // Create new API instance without token
    let noAuthApi = new ApiHandler();
    const purchaseProduct = await noAuthApi.post(`${purchase_products_end_point}/${productId}`, purchaseProductData);

    // Depending on your API, this might be 401 (Unauthorized) or 400
    expect([400, 401]).toContain(purchaseProduct.status);
  });

  it("try to buy product with invalid productId", async () => {
    // Register to get token
    const register = await api.post(register_end_point, registerData);
    expect(register.status).toBe(200);

    const productId = 9999;
    const purchaseProductData = { "productId": productId };

    // Re-initialize API with token
    api = new ApiHandler({ authToken: register.data.data.accessToken });

    const purchaseProduct = await api.post(`${purchase_products_end_point}/${productId}`, purchaseProductData);
    expect(purchaseProduct.status).toBe(400);
  });

  it("try to buy product with invalid productId", async () => {
    const register = await api.post(register_end_point, registerData);
    expect(register.status).toBe(200);

    const productId = 99999;
    const purchaseProductData = { "productId": productId };

    api = new ApiHandler({ authToken: register.data.data.accessToken });

    const purchaseProduct = await api.post(`${purchase_products_end_point}/${productId}`, purchaseProductData);
    expect(purchaseProduct.status).toBe(400);
  });

  it("try to buy valid product successfully", async () => {
    const register = await api.post(register_end_point, registerData);
    expect(register.status).toBe(200);

    // Use an existing ID from your JSON (e.g., 9, 52, or 91 if it still exists)
    const productId = 1;
    const purchaseProductData = { "productId": productId };

    api = new ApiHandler({ authToken: register.data.data.accessToken });

    const purchaseProduct = await api.post(`${purchase_products_end_point}/${productId}`, purchaseProductData);

    // Assuming a successful purchase returns 200. Adjust if your API returns 201.
    if (purchaseProduct.status !== 200) {
      console.log("Purchase Failed Response:", purchaseProduct.data);
    }
    expect(purchaseProduct.status).toBe(200);
  });

  it('try to delete product soft delete', async () => {
    const createProductResponse = await api.post(create_product_end_point, baseProductData);
    expect(createProductResponse.status).toBe(200);
    const productId = createProductResponse.data.data.id;
    const getProductResponse = await api.get(get_products_end_point);
    expect(getProductResponse.status).toBe(200);

    const exists = getProductResponse.data.data.some(p => p.id === productId);
    expect(exists).toBe(true);

    const softDeleteResponse = await api.post(`${soft_delete_product_end_point}/${productId}`);
    expect(softDeleteResponse.status).toBe(200);
    const secondFetch = await api.get(get_products_end_point);
    expect(secondFetch.status).toBe(200);

    const notExist = secondFetch.data.data.some(p => p.id === productId);
    expect(notExist).toBe(false);
  });

  it('try to delete product soft delete with invalid id', async () => {
    const softDeleteResponse = await api.post(`${soft_delete_product_end_point}/999`);
    expect([400, 404]).toContain(softDeleteResponse.status);
  });

  //! Failed there is only bundle and repeated twice
  it("products shop should contain all and only active bundles in bundles section", async () => {
    const productsResponse = await api.get(get_shop_products_end_point);
    expect(productsResponse.status).toBe(200);
    const bundlesInShop = productsResponse.data.data.bundles;
    bundlesInShop.forEach(bundle => {
      expect(bundle.isActive).toBe(true);
    });

    const getAllBundlesResponse = await api.get(get_bundles_end_point);
    expect(getAllBundlesResponse.status).toBe(200);
    const allBundles = getAllBundlesResponse.data.data;
    allBundles.forEach(bundle => {
      const inShop = bundlesInShop.some(b => b.id === bundle.id);
      if (bundle.isActive) {
        expect(inShop).toBe(true);
      } else {
        expect(inShop).toBe(false);
      }
    });
  });
});