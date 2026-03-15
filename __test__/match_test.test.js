const ApiHandler = require('./../support/api-handler');

describe('Match API Test (Spin/Game)', () => {
  let api = new ApiHandler();
  let accessToken;
  let currentUserId;

  // Endpoints
  const start_match_end_point = '/api/Match/StartMatch';
  const end_match_end_point = '/api/Match/EndMatch';
  const register_end_point = '/api/Auth/Register';

  // Base Data Containers
  let baseStartMatchData = {};
  let baseEndMatchData = {};

  const registerData = {
    "userName": "tester_" + Date.now(), // Unique username to prevent conflicts
    "googleId": "76d7a2eb-ceb7-4777-9a94-d3821abcfc92"
  };

  beforeEach(async () => {
    // 1. Reset Data Schemas before every test
    baseStartMatchData = {
      "levelNumber": 1,
      "usedFireBooster": true,
      "usedRocketBooster": true,
      "usedBigBombBooster": true
    };

    baseEndMatchData = {
      "matchId": 0, // Will be replaced dynamically
      "won": true,
      "rockstarCounter": 1,
      "boxesCounter": 1,
      "iceCounter": 1,
      "fireCounter": 1,
      "bombCounter": 1,
      "candyCounter": 1,
      "starsCounter": 1,
      "extraMovesBought": 0,
      "candyHorseCounter": 1,
      "urchinCounter": 1,
      "coolerCounter": 1,
      "fireworkCounter": 1,
      "remainingMoves": 5
    };

    // 2. Register and Get Token
    const result = await api.post(register_end_point, registerData);
    expect(result.status).toBe(200);

    // Capture Token and User ID for verification
    accessToken = result.data.data.accessToken;
    currentUserId = result.data.data.user.id;

    // Re-init API with token
    api = new ApiHandler({ authToken: accessToken });
  });

  // ==========================================
  // START MATCH TESTS
  // ==========================================
  describe('Start Match Scenarios', () => {

    it('should successfully start a match with all boosters', async () => {
      const result = await api.post(start_match_end_point, baseStartMatchData);

      expect(result.status).toBe(200);
      expect(result.data.isSuccess).toBe(true);
      expect(result.data.data.levelNumber).toBe(baseStartMatchData.levelNumber);

      // Verify the match is assigned to the current user (if returned)
      if (result.data.data.userId) {
        expect(result.data.data.userId).toBe(currentUserId);
      }
    });

    it('should successfully start a match without boosters (false flags)', async () => {
      let data = {
        ...baseStartMatchData,
        usedFireBooster: false,
        usedRocketBooster: false,
        usedBigBombBooster: false
      };

      const result = await api.post(start_match_end_point, data);
      expect(result.status).toBe(200);
    });

    it('should fail to start match without levelNumber', async () => {
      let data = { ...baseStartMatchData };
      delete data.levelNumber;

      const result = await api.post(start_match_end_point, data);
      expect(result.status).toBe(400);
    });

    it('should fail to start match with invalid levelNumber (e.g. negative)', async () => {
      let data = { ...baseStartMatchData, levelNumber: -1 };

      const result = await api.post(start_match_end_point, data);
      // Expecting 400 Bad Request for invalid logic
      expect(result.status).toBe(400);
    });

    it('should to start a NEW match with new match id', async () => {
      // 1. Start first match
      const firstMatch = await api.post(start_match_end_point, baseStartMatchData);
      expect(firstMatch.status).toBe(200);

      // 2. Try to start second match immediately
      const secondMatch = await api.post(start_match_end_point, baseStartMatchData);

      // If the game logic requires ending a match before starting a new one:
      expect(secondMatch.status).toBe(200);
      console.log('firstMatch.data.data.id:', firstMatch.data.data.id,
        'secondMatch.data.data.id:', secondMatch.data.data.id);

      expect(firstMatch.data.data.id).not.toBe(secondMatch.data.data.id);
    });

    it.only("shouldn't start match without all previous ones", async () => {
      const register = await api.post(register_end_point, registerData);
      expect(register.status).toBe(200);
      const registeredApi = new ApiHandler({ authToken: register.data.data.accessToken });

      // Start first match
      const firstMatch = await registeredApi.post(start_match_end_point, baseStartMatchData);
      expect(firstMatch.status).toBe(200);
      // lose first match
      baseEndMatchData.won = false;
      baseEndMatchData.matchId = firstMatch.data.data.id;
      const endFirstMatch = await registeredApi.post(end_match_end_point, baseEndMatchData);
      expect(endFirstMatch.status).toBe(200);
      // Try to start second match
      const secondMatchData = baseStartMatchData;
      secondMatchData.levelNumber = 2;
      const secondMatch = await registeredApi.post(start_match_end_point, secondMatchData);
      expect(secondMatch.status).toBe(400);
    });
  });

  // ==========================================
  // END MATCH TESTS
  // ==========================================
  describe('End Match Scenarios', () => {

    // Helper to start a match and return the ID
    const startMatchAndGetId = async () => {
      const res = await api.post(start_match_end_point, baseStartMatchData);
      expect(res.status).toBe(200);
      return res.data.data.id;
    };

    it('should successfully end a valid match', async () => {
      const matchId = await startMatchAndGetId();

      let endData = { ...baseEndMatchData, matchId: matchId };

      const result = await api.post(end_match_end_point, endData);
      expect(result.status).toBe(200);
      expect(result.data.isSuccess).toBe(true);
    });

    it('should fail to end a match that is already ended (Double Submission)', async () => {
      const matchId = await startMatchAndGetId();
      let endData = { ...baseEndMatchData, matchId: matchId };

      // First End - Success
      const firstEnd = await api.post(end_match_end_point, endData);
      expect(firstEnd.status).toBe(200);

      // Second End - Fail
      const secondEnd = await api.post(end_match_end_point, endData);
      expect(secondEnd.status).toBe(400);
    });

    it('should fail to end a match using a non-existent matchId', async () => {
      let endData = { ...baseEndMatchData, matchId: 9999999 };
      const result = await api.post(end_match_end_point, endData);
      expect(result.status).toBe(400); // Or 404 depending on API design
    });

    it('should fail to end match without sending matchId', async () => {
      let endData = { ...baseEndMatchData };
      delete endData.matchId;

      const result = await api.post(end_match_end_point, endData);
      expect(result.status).toBe(400);
    });

    // ---------------------------------------------------------
    // Dynamic Validation for Missing Fields
    // This loop replaces the repetitive individual tests
    // ---------------------------------------------------------
    
    it(`should fail to end match without sending match id`, async () => {
      const matchId = await startMatchAndGetId();

      let endData = { ...baseEndMatchData};

      const result = await api.post(end_match_end_point, endData);
      expect(result.status).toBe(400);
    });

    // ---------------------------------------------------------
    // Dynamic Validation for Negative Values (Integer Fields)
    // ---------------------------------------------------------
    const integerFields = [
      'rockstarCounter',
      'boxesCounter',
      'iceCounter',
      'fireCounter',
      'bombCounter',
      'candyCounter',
      'starsCounter',
      'extraMovesBought',
      'candyHorseCounter',
      'urchinCounter',
      'coolerCounter',
      'fireworkCounter',
      'remainingMoves'
    ];

    integerFields.forEach(field => {
      it(`should fail to end match with negative ${field}`, async () => {
        const matchId = await startMatchAndGetId();

        let endData = { ...baseEndMatchData, matchId: matchId };
        endData[field] = -1; // Set field to negative value

        const result = await api.post(end_match_end_point, endData);
        expect(result.status).toBe(400);
      });
    });

    it('should handle "Lost" match correctly (won = false)', async () => {
      const matchId = await startMatchAndGetId();

      let endData = {
        ...baseEndMatchData,
        matchId: matchId,
        won: false,
        remainingMoves: 0
      };

      const result = await api.post(end_match_end_point, endData);
      expect(result.status).toBe(200);
    });
  });
});