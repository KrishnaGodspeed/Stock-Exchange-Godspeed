import {
  GSContext,
  logger
} from '@godspeedsystems/core';
import { PrismaClient } from '../../datasources/prisma-clients/schema';

export default async function (ctx: GSContext) {
  const prismaClient: PrismaClient = ctx.datasources.schema.client;

  try {
    // Extract user ID from authenticated context
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

    // Fetch wishlist items for this user
    const wishlistItems = await prismaClient.wishList.findMany({
      where: { userId }
    });

    return {
      code: 200,
      data: {
        success: true,
        message: 'Wishlist items retrieved successfully',
        wishlist: wishlistItems
      }
    };

  } catch (error) {
    logger.error('Error retrieving wishlist:', error);
    return {
      code: 500,
      data: {
        success: false,
        message: 'Internal server error'
      }
    };
  }
}
