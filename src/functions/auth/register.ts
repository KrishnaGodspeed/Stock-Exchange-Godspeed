import {
  GSContext,
  logger,
} from '@godspeedsystems/core';
import { PrismaClient } from '../../datasources/prisma-clients/schema';
// import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

interface RegisterData {
  email: string;
  name?: string;
  password: string;
}

export default async function (ctx: GSContext) {
  const prismaClient: PrismaClient = ctx.datasources.schema.client;
  const { email, name, password }: RegisterData = ctx.inputs.data.body;

  try {
    // Check if user already exists
    const existingUser = await prismaClient.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return {
        code: 400,
        data: {
          success: false,
          message: 'User with this email already exists'
        }
      };
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = await prismaClient.user.create({
      data: {
        email,
        name,
        password: hashedPassword
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    });

    logger.info('User registered successfully:', newUser.email);

    return {
      code: 201,
      data: {
        success: true,
        message: 'User registered successfully',
        user: newUser
      }
    };

  } catch (error) {
    logger.error('Error during user registration:', error);
    return {
      code: 500,
      data: {
        success: false,
        message: 'Internal server error'
      }
    };
  }
}
