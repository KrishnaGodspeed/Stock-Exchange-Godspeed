import {
  GSContext,
  logger,
} from '@godspeedsystems/core';
import { PrismaClient } from '../../datasources/prisma-clients/schema';

export default async function (ctx: GSContext) {
  const prismaClient: PrismaClient = ctx.datasources.schema.client;
  const { name } = ctx.inputs.data.params;
  const userId = ctx.inputs.data.user.id;

  try {
    if (!userId) {
      return {
        code: 401,
        data: {
          success: false,
          message: 'User not authenticated'
        }
      };
    }

    // Find and delete the wishlist item
    const deletedItem = await prismaClient.wishList.deleteMany({
      where: {
        userId,
        name
      }
    });

    if (deletedItem.count === 0) {
      return {
        code: 404,
        data: {
          success: false,
          message: 'Wishlist item not found'
        }
      };
    }

    logger.info('Wishlist item deleted successfully:', { userId, name });

    return {
      code: 200,
      data: {
        success: true,
        message: 'Wishlist item deleted successfully'
      }
    };

  } catch (error) {
    logger.error('Error deleting wishlist item:', error);
    console.log('Error deleting wishlist item:', error);
    return {
      code: 500,
      data: {
        success: false,
        message: 'Internal server error'
      }
    };
  }
}
