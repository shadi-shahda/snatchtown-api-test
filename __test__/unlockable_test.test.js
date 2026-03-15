const ApiHandler = require('./../support/api-handler');

describe('spin api test', () => {
  const api = new ApiHandler();
  const formData = new FormData();
  const customHeaders = { 'Content-Type': 'application/form-data' };
  const create_unLockable_end_point = '/api/Unlockable/CreateUnlockable';

  beforeEach(() => {
    formData.append('name', 'unLockable 1');
    formData.append('type', 'type 1');
  });

  //! Failed | response status code is 500
  it.only('should create unLockable with all required fields', async () => {
    const result = await api.post(create_unLockable_end_point, formData, customHeaders);
    expect(result.status).toBe(200);
    expect(result.data.isSuccess).toBe(true);
    expect(result.data.statusCode).toBe(200);
    expect(result.data.data.name).toBe(formData.get('name'));
    expect(result.data.data.type).toBe(formData.get('type'));
  });

  it('shouldn\'t create unLockable without sending name', async () => {
    let data = formData;
    data.delete('name');
    const result = await api.post(create_unLockable_end_point, formData, data, customHeaders);
    expect(result.status).toBe(400);
  });

  it('shouldn\'t create unLockable without sending type', async () => {
    let data = formData;
    data.delete('type');
    const result = await api.post(create_unLockable_end_point, formData, data, customHeaders);
    expect(result.status).toBe(400);
  });

  //Todo test the rest unLockable crud apis

});
