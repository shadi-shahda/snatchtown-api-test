const ApiHandler = require('./../support/api-handler');
let api = new ApiHandler();

const create_reward_end_point = '/api/Reward/CreateReward';
const get_reward_end_point = '/api/Reward/GetAllRewards';
const patch_reward_end_point = '/api/Reward/UpdateReward';
const delete_reward_end_point = '/api/Reward/DeleteReward';
const requiredFields = ['id', 'typeId', 'milestoneId', 'amount'];

function generateRewardData(keyToSkip = null) {
  const rewardData = {
    "typeId": 1,
    "milestoneId": 1,
    "amount": 5
  };
  if (keyToSkip) {
    delete rewardData[keyToSkip];
  }
  return rewardData;
}

describe('reward api test', () => {

  it('create reward with all required fields', async () => {
    const data = generateRewardData();
    const result = await api.post(create_reward_end_point, data);
    expect(result.status).toBe(200);
    expect(result.data.isSuccess).toBe(true);
    expect(result.data.statusCode).toBe(200);
    expect(result.data.data.typeId.toString()).toBe(data.typeId.toString());
    expect(result.data.data.milestoneId.toString()).toBe(data.milestoneId.toString());
    expect(result.data.data.amount.toString()).toBe(data.amount.toString());
  });

  it('shouldn\'t create reward without sending typeId', async () => {
    let data = generateRewardData('typeId');
    const result = await api.post(create_reward_end_point, data);
    expect(result.status).toBe(400);
  });

  it('shouldn\'t create reward without sending milestone', async () => {
    let data = generateRewardData('milestoneId');
    const result = await api.post(create_reward_end_point, data);
    expect(result.status).toBe(400);
  });

  it('shouldn\'t create reward without sending amount', async () => {
    let data = generateRewardData('amount');
    const result = await api.post(create_reward_end_point, data);
    expect(result.status).toBe(400);
  });

  it.only("try to create with invalid typeId", async () => {
    let data = generateRewardData();
    data.typeId = 9999;
    const result = await api.post(create_reward_end_point, data);
    expect(result.status).toBe(400);
  });

  it.only("try to create with invalid milestoneId", async () => {
    let data = generateRewardData();
    data.milestoneId = 9999;
    const result = await api.post(create_reward_end_point, data);
    expect(result.status).toBe(400);
  });

  it('should fetch all products', async () => {
    const result = await api.get(get_reward_end_point);
    expect(result.status).toBe(200);
    expect(result.data.isSuccess).toBe(true);
    expect(result.data.statusCode).toBe(200);
    expect(Array.isArray(result.data.data)).toBe(true);
    result.data.data.forEach((level, index) => {
      requiredFields.forEach(field => {
        expect(level).toHaveProperty(field);
      });
    });
  });

  it('try to change type id for a reward', async () => {
    const createData = generateRewardData();
    const createResult = await api.post(create_reward_end_point, createData);
    expect(createResult.status).toBe(200);
    const rewardId = createResult.data.data.id;

    let rewardData = generateRewardData();
    rewardData.rewardId = rewardId;
    rewardData.typeId = 2;
    const result = await api.patch(`${patch_reward_end_point}/${rewardId}`, rewardData);
    expect(result.status).toBe(200);

    const fetchProducts = await api.get(get_reward_end_point);
    fetchProducts.data.data.forEach(element => {
      if (element.id === rewardId) {
        expect(element.typeId.toString()).toBe(rewardData.typeId.toString());
        expect(element.amount.toString()).toBe(rewardData.amount.toString());
        expect(element.milestoneId.toString()).toBe(rewardData.milestoneId.toString());
      }
    });
  });

  it('try to change milestone id for a reward', async () => {
    const createData = generateRewardData();
    const createResult = await api.post(create_reward_end_point, createData);
    expect(createResult.status).toBe(200);
    const rewardId = createResult.data.data.id;

    let rewardData = generateRewardData();
    rewardData.rewardId = rewardId;
    rewardData.milestoneId = 2;
    const result = await api.patch(`${patch_reward_end_point}/${rewardId}`, rewardData);
    expect(result.status).toBe(200);

    const fetchProducts = await api.get(get_reward_end_point);
    fetchProducts.data.data.forEach(element => {
      if (element.id === rewardId) {
        expect(element.typeId.toString()).toBe(rewardData.typeId.toString());
        expect(element.amount.toString()).toBe(rewardData.amount.toString());
        expect(element.milestoneId.toString()).toBe(rewardData.milestoneId.toString());
      }
    });
  });

  it('try to change amount for a reward', async () => {
    const createData = generateRewardData();
    const createResult = await api.post(create_reward_end_point, createData);
    expect(createResult.status).toBe(200);
    const rewardId = createResult.data.data.id;
    let rewardData = generateRewardData();
    rewardData.rewardId = rewardId;
    rewardData.amount = 10;
    const result = await api.patch(`${patch_reward_end_point}/${rewardId}`, rewardData);
    expect(result.status).toBe(200);

    const fetchProducts = await api.get(get_reward_end_point);
    fetchProducts.data.data.forEach(element => {
      if (element.id === rewardId) {
        expect(element.typeId.toString()).toBe(rewardData.typeId.toString());
        expect(element.amount.toString()).toBe(rewardData.amount.toString());
        expect(element.milestoneId.toString()).toBe(rewardData.milestoneId.toString());
      }
    });
  });

  it('should delete the reward by its Id', async () => {
    const createData = generateRewardData();
    const createResult = await api.post(create_reward_end_point, createData);
    expect(createResult.status).toBe(200);
    const rewardId = createResult.data.data.id;

    const firstFetch = await api.get(get_reward_end_point);
    expect(firstFetch.status).toBe(200);
    const result = await api.delete(`${delete_reward_end_point}/${rewardId}`);
    expect(result.status).toBe(200);
    const secondFetch = await api.get(get_reward_end_point);
    expect(secondFetch.status).toBe(200);
    expect(secondFetch.data.data.length).toBe(firstFetch.data.data.length - 1);
  });
});