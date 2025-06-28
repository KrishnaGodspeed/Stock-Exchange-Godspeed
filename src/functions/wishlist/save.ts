import {
  GSContext,
  logger,
} from '@godspeedsystems/core';
import { PrismaClient } from '../../datasources/prisma-clients/schema';

interface SaveWishlistData {
  name: string;
  options: Record<string, any>;
}

export default async function (ctx: GSContext) {
  const prismaClient: PrismaClient = ctx.datasources.schema.client;
  const { name, options }: SaveWishlistData = ctx.inputs.data.body;
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

    // Check if wishlist item with same name already exists for this user
    const existingItem = await prismaClient.wishList.findFirst({
      where: {
        userId,
        name
      }
    });

    if (existingItem) {
      return {
        code: 400,
        data: {
          success: false,
          message: 'Wishlist item with this name already exists'
        }
      };
    }

    // Create new wishlist item
    const wishlistItem = await prismaClient.wishList.create({
      data: {
        name,
        options,
        userId
      }
    });

    logger.info('Wishlist item saved successfully:', { userId, name });

    return {
      code: 201,
      data: {
        success: true,
        message: 'Wishlist item saved successfully',
        wishlistItem
      }
    };

  } catch (error) {
    logger.error('Error saving wishlist item:', error);
    return {
      code: 500,
      data: {
        success: false,
        message: 'Internal server error'
      }
    };
  }
}
