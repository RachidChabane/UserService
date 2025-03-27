import axios from 'axios';
import { auth0Service } from '../../src/services/auth0.service';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Auth0 Service', () => {
  const mockAccessToken = 'mock-access-token';
  const mockManagementToken = 'mock-management-token';
  const mockAuth0Domain = 'test-domain.auth0.com';
  const mockAuth0Audience = 'https://api.test.com';
  const mockUserId = 'auth0|user123';

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock environment variables
    process.env.AUTH0_CLIENT_ID = 'test-client-id';
    process.env.AUTH0_CLIENT_SECRET = 'test-client-secret';
  });

  describe('getUserInfo', () => {
    it('should fetch user info from Auth0', async () => {
      const mockUserInfo = {
        sub: mockUserId,
        email: 'user@example.com',
        name: 'Test User'
      };

      mockedAxios.get.mockResolvedValueOnce({ data: mockUserInfo });

      const result = await auth0Service.getUserInfo(mockAccessToken);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `https://${auth0Service['domain']}/userinfo`,
        {
          headers: {
            Authorization: `Bearer ${mockAccessToken}`
          }
        }
      );
      expect(result).toEqual(mockUserInfo);
    });

    it('should throw error when Auth0 API fails', async () => {
      const errorMsg = 'API Error';
      mockedAxios.get.mockRejectedValueOnce(new Error(errorMsg));

      await expect(auth0Service.getUserInfo(mockAccessToken))
        .rejects.toThrow('Failed to fetch user info from Auth0');
    });
  });

  describe('getManagementToken', () => {
    it('should get a new management token when none exists', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          access_token: mockManagementToken,
          expires_in: 86400, // 24 hours
          token_type: 'Bearer'
        }
      });

      // Use private method accessor for testing
      const token = await (auth0Service as any).getManagementToken();

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `https://${auth0Service['domain']}/oauth/token`,
        {
          client_id: process.env.AUTH0_CLIENT_ID,
          client_secret: process.env.AUTH0_CLIENT_SECRET,
          audience: `https://${auth0Service['domain']}/api/v2/`,
          grant_type: 'client_credentials'
        }
      );
      expect(token).toBe(mockManagementToken);
    });

    it('should reuse existing token if not expired', async () => {
      // First call to get token
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          access_token: mockManagementToken,
          expires_in: 86400, // 24 hours
          token_type: 'Bearer'
        }
      });

      // First call
      await (auth0Service as any).getManagementToken();
      
      // Reset mock to verify it's not called again
      mockedAxios.post.mockClear();
      
      // Second call - should use cached token
      const token = await (auth0Service as any).getManagementToken();
      
      expect(mockedAxios.post).not.toHaveBeenCalled();
      expect(token).toBe(mockManagementToken);
    });
  });

  describe('getUserDetailsById', () => {
    it('should get user details by ID', async () => {
      const mockUserDetails = {
        user_id: mockUserId,
        email: 'user@example.com',
        name: 'Test User'
      };

      // Mock getManagementToken
      jest.spyOn(auth0Service as any, 'getManagementToken')
        .mockResolvedValueOnce(mockManagementToken);
      
      mockedAxios.get.mockResolvedValueOnce({ data: mockUserDetails });

      const result = await auth0Service.getUserDetailsById(mockUserId);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `https://${auth0Service['domain']}/api/v2/users/${encodeURIComponent(mockUserId)}`,
        {
          headers: {
            Authorization: `Bearer ${mockManagementToken}`
          }
        }
      );
      expect(result).toEqual(mockUserDetails);
    });
  });

  describe('assignRolesToUser', () => {
    it('should assign roles to a user', async () => {
      const roleIds = ['role1', 'role2'];
      
      // Mock getManagementToken
      jest.spyOn(auth0Service as any, 'getManagementToken')
        .mockResolvedValueOnce(mockManagementToken);
      
      mockedAxios.post.mockResolvedValueOnce({ data: {} });

      await auth0Service.assignRolesToUser(mockUserId, roleIds);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `https://${auth0Service['domain']}/api/v2/users/${encodeURIComponent(mockUserId)}/roles`,
        { roles: roleIds },
        {
          headers: {
            Authorization: `Bearer ${mockManagementToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
    });
  });
});