import {
  GSContext,
  GSDataSource,
  logger,
  PlainObject,
} from '@godspeedsystems/core';
import { PrismaClient } from '../datasources/prisma-clients/schema';

interface options {
  function: string;
  symbol: string;
  interval: string;
  adjusted?: string;
  extended_hours?: string;
  month?: string;
  outputsize?: string;
  datatype?: string;
}

export default async function (ctx: GSContext) {
  const client: GSDataSource = ctx.datasources.api;
  const prismaClient: PrismaClient = ctx.datasources.schema.client;
  const query: options = ctx.inputs.data.body.options;
  let stringified_query = '';

  Object.entries(query).forEach(([key, value]) => {
    stringified_query += `${key}=${value}&`;
  });

  // const existingOptions = await prismaClient.intraday.findFirst({
  //   where: {
  //     function: query.function,
  //     symbol: query.symbol,
  //     interval: query.interval,
  //     adjusted: query.adjusted,
  //     extended_hours: query.extended_hours,
  //     month: query.month,
  //     outputsize: query.outputsize,
  //     datatype: query.datatype,
  //   },
  // });
  //
  // if (!existingOptions) {
  //   await prismaClient.intraday.create({
  //     data: {
  //       ...query,
  //     },
  //   });
  // }

  const res = await client.execute(ctx, {
    meta: {
      method: 'get',
      url: `/query?${stringified_query}apikey=${ctx.config.stockexchange.ALPHA_VANTAGE_API_KEY}`,
    },
  });

  logger.info('Response for intraday data:', res);
  return res;
}
