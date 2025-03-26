import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  auth0Id: string;
  email: string;
  displayName?: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

// Interface for creating a user
export interface CreateUserDto {
  auth0Id: string;
  email: string;
  displayName?: string;
  role?: string;
}

// Interface for updating a user
export interface UpdateUserDto {
  displayName?: string;
  email?: string;
}

// Interface for user filters
export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
}

// Interface for paginated users response
export interface PaginatedUsers {
  users: IUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Define the User Schema
const userSchema = new Schema<IUser>(
  {
    auth0Id: {
      type: String,
      required: true,
      unique: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    displayName: {
      type: String
    },
    role: {
      type: String,
      required: true,
      enum: ['user', 'admin'],
      default: 'user'
    }
  },
  {
    timestamps: true, // adds createdAt and updatedAt fields
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      }
    }
  }
);

// Create and export User model
const User = mongoose.model<IUser>('User', userSchema);

export default User;