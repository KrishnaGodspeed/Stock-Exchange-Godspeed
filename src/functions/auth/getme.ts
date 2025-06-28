import {
  GSContext,
  logger,
} from '@godspeedsystems/core';
import { PrismaClient } from '../../datasources/prisma-clients/schema';

export default async function (ctx: GSContext) {
  const prismaClient: PrismaClient = ctx.datasources.schema.client;
  
  try {
    // Get user ID from the authenticated context
    const userId = ctx.inputs.data.user.id;
    
    if (!userId) {
      return {
        code: 401,
        data: {
          success: false,
          message: 'User not authenticated'
        }
      };
    }

    // Fetch user data from database
    const user = await prismaClient.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    });

    if (!user) {
      return {
        code: 404,
        data: {
          success: false,
          message: 'User not found'
        }
      };
    }
    

    return {
      code: 200,
      data: {
        success: true,
        message: 'User profile retrieved successfully',
        user
      }
    };

  } catch (error) {
    logger.error('Error retrieving user profile:', error);
    console.log('Error retrieving user profile:', error);
    
    return {
      code: 500,
      data: {
        success: false,
        message: 'Internal server error'
      }
    };
  }
}
