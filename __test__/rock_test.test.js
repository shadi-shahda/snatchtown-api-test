const ApiHandler = require('./../support/api-handler');

describe('rock api test', () => {
  const api = new ApiHandler();
  const formData = new FormData();
  const customHeaders = { 'Content-Type': 'application/form-data' };
  const create_rock_end_point = '/api/Rock/CreateRock';
  const get_rock_end_point = '/api/Rock/GetAllRocks';
  const patch_rock_end_point = '/api/Rock/UpdateRock';
  const delete_rock_end_point = '/api/Rock/DeleteRock';


  const requiredFields = ['id', 'name', 'imagePath'];

  beforeEach(() => {
    formData.append('name', 'rock 1')
  })

  it('should create rock with all required fields', async () => {
    const result = await api.post(create_rock_end_point, formData, customHeaders);
    expect(result.status).toBe(200);
    expect(result.data.isSuccess).toBe(true);
    expect(result.data.data.name).toBe(formData.get('name'));
  });

  it('shouldn\'t created rock without sending name', async () => {
    let data = formData;
    data.delete('name');
    const result = await api.post(create_rock_end_point, data, customHeaders);
    expect(result.status).toBe(400);
  });

  it('should fetch all rocks', async () => {
    const result = await api.get(get_rock_end_point);
    expect(result.status).toBe(200);
    expect(result.data.isSuccess).toBe(true);
    expect(result.data.statusCode).toBe(200);
    expect(result.data.message).toBe("Rock created successfully");
    expect(Array.isArray(result.data.data)).toBe(true);
    result.data.data.forEach((level, index) => {
      requiredFields.forEach(field => {
        expect(level).toHaveProperty(field);
      });
    });
  });


  it('should update rock name', async () => {
    const rockId = 5;
    const Name = "rock 2";
    let data = formData;
    data.set('name', Name);
    data.append('rockId', rockId);
    const result = await api.patch(`${patch_rock_end_point}/${rockId}`, data, customHeaders);
    expect(result.status).toBe(200);
    const result1 = await api.get(get_rock_end_point);
    expect(result1.status).toBe(200);
    expect(result1.data.data[rockId - 1].name).toBe(Name);
  });

  it('should delete rock by its id', async () => {
    const rockId = 5;
    const firstFetch = await api.get(get_rock_end_point);
    expect(firstFetch.status).toBe(200);
    const result = await api.delete(`${delete_rock_end_point}/${rockId}`);
    expect(result.status).toBe(200);
    const secondFetch = await api.get(get_rock_end_point);
    expect(secondFetch.status).toBe(200);
    expect(secondFetch.data.data.length).toBe(firstFetch.data.data.length - 1);
  });

});
