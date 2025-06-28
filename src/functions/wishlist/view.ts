import {
  GSContext,
  GSDataSource,
  logger,
} from '@godspeedsystems/core';
import { PrismaClient } from '../../datasources/prisma-clients/schema';

export default async function (ctx: GSContext) {
  const prismaClient: PrismaClient = ctx.datasources.schema.client;
  const client: GSDataSource = ctx.datasources.api;
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

    // Find the wishlist item
    const wishlistItem = await prismaClient.wishList.findFirst({
      where: {
        userId,
        name
      }
    });

    if (!wishlistItem) {
      return {
        code: 404,
        data: {
          success: false,
          message: 'Wishlist item not found'
        }
      };
    }

    // Build query string from saved options
    const options = wishlistItem.options as Record<string, any>;
    let stringified_query = '';

    Object.entries(options).forEach(([key, value]) => {
      stringified_query += `${key}=${value}&`;
    });

    // Fetch data from Alpha Vantage API
    const res = await client.execute(ctx, {
      meta: {
        method: 'get',
        url: `/query?${stringified_query}apikey=${ctx.config.stockexchange.ALPHA_VANTAGE_API_KEY}`,
      },
    });

    logger.info('Wishlist item data fetched successfully:', { userId, name });

    return {
      code: 200,
      data: {
        success: true,
        message: 'Data fetched successfully',
        data: res.data,
        options: wishlistItem.options
      }
    };

  } catch (error) {
    logger.error('Error fetching wishlist item data:', error);
    return {
      code: 500,
      data: {
        success: false,
        message: 'Internal server error'
      }
    };
  }
}
