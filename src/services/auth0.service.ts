import axios from 'axios';
import { environment } from '../config/environment';
import logger from '../utils/logger';

// Define interfaces for Auth0 responses
interface Auth0UserInfo {
  sub: string;
  email: string;
  name?: string;
  nickname?: string;
  picture?: string;
  [key: string]: any;
}

interface Auth0ManagementTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

class Auth0Service {
  private domain: string;
  private audience: string;
  private managementToken: string | null = null;
  private tokenExpiresAt: number = 0;
  
  constructor(domain: string, audience: string) {
    this.domain = domain;
    this.audience = audience;
  }
  
  // Get user info from Auth0 using access token
  async getUserInfo(accessToken: string): Promise<Auth0UserInfo> {
    try {
      const response = await axios.get<Auth0UserInfo>(`https://${this.domain}/userinfo`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      
      return response.data;
    } catch (error) {
      logger.error('Error fetching user info from Auth0', { error });
      throw new Error('Failed to fetch user info from Auth0');
    }
  }
  
  // Get Management API token
  private async getManagementToken(): Promise<string> {
    // Check if we already have a valid token
    const now = Date.now();
    if (this.managementToken && now < this.tokenExpiresAt) {
      return this.managementToken;
    }
    
    try {
      const response = await axios.post<Auth0ManagementTokenResponse>(
        `https://${this.domain}/oauth/token`,
        {
          client_id: process.env.AUTH0_CLIENT_ID,
          client_secret: process.env.AUTH0_CLIENT_SECRET,
          audience: `https://${this.domain}/api/v2/`,
          grant_type: 'client_credentials'
        }
      );
      
      this.managementToken = response.data.access_token;
      // Set expiry time to 80% of the actual expiry to be safe
      this.tokenExpiresAt = now + (response.data.expires_in * 1000 * 0.8);
      
      return this.managementToken;
    } catch (error) {
      logger.error('Error getting Auth0 management token', { error });
      throw new Error('Failed to get Auth0 management token');
    }
  }
  
  // Get user details from Auth0 Management API
  async getUserDetailsById(userId: string): Promise<Auth0UserInfo> {
    try {
      const token = await this.getManagementToken();
      
      const response = await axios.get<Auth0UserInfo>(
        `https://${this.domain}/api/v2/users/${encodeURIComponent(userId)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      return response.data;
    } catch (error) {
      logger.error('Error fetching user details from Auth0', { error, userId });
      throw new Error('Failed to fetch user details from Auth0');
    }
  }
  
  // Assign roles to a user in Auth0
  async assignRolesToUser(userId: string, roleIds: string[]): Promise<void> {
    try {
      const token = await this.getManagementToken();
      
      await axios.post(
        `https://${this.domain}/api/v2/users/${encodeURIComponent(userId)}/roles`,
        { roles: roleIds },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (error) {
      logger.error('Error assigning roles to user in Auth0', { error, userId, roleIds });
      throw new Error('Failed to assign roles to user in Auth0');
    }
  }
}

export const auth0Service = new Auth0Service(
  environment.auth0.domain,
  environment.auth0.audience
);