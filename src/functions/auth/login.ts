import {
  GSContext,
  logger,
  GSStatus,
} from '@godspeedsystems/core';
import { PrismaClient } from '../../datasources/prisma-clients/schema';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

interface LoginData {
  email: string;
  password: string;
}

export default async function (ctx: GSContext) {
  const prismaClient: PrismaClient = ctx.datasources.schema.client;
  const { email, password }: LoginData = ctx.inputs.data.body;
  

  try {
    // Find user by email
    const user = await prismaClient.user.findUnique({
      where: { email }
    });

    if (!user) {
      return {
        code: 401,
        data: {
          success: false,
          message: 'Invalid email or password'
        }
      };
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return {
        code: 401,
        data: {
          success: false,
          message: 'Invalid email or password'
        }
      };
    }

    // Generate JWT token
    const jwtSecret = ctx.config.stockexchange.jwtSecret;
    if (!jwtSecret) {
      logger.error('JWT secret not configured');
      return {
        code: 500,
        data: {
          success: false,
          message: 'Server configuration error'
        }
      };
    }

    const token = jwt.sign(
      { 
        id: user.id
      },
      jwtSecret,
      {
         expiresIn: '1h', issuer: ctx.config.stockexchange.issuer, audience: ctx.config.stockexchange.audience 
      }
    );

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;

    return {
      code: 200,
      data: {
        success: true,
        message: 'Login successful',
        token,
        user: userWithoutPassword
      }
    };


  } catch (error) {
    logger.error('Error during user login:', error);
    return {
      code: 500,
      data: {
        success: false,
        message: 'Internal server error'
      }
    };
  }
}
