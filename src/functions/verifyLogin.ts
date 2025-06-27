import {
  GSContext,
  PlainObject,
  GSStatus,
} from '@godspeedsystems/core';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '../datasources/prisma-clients/schema';
import bcrypt from "bcrypt";

export default async function(ctx: GSContext, args: PlainObject)  {
  const {
    inputs: {
      data: { body },
    },
    logger,
    datasources,
  } = ctx;


  logger.info('user info received %o', body);
  const client: PrismaClient = datasources.schema.client;

  const user = await client.user.findUnique({
    where: { email: body.email },
  });
  const saltRounds = 10;
  if (!user) return new GSStatus(false, 401, 'Failed, Invalid Credentials');
  else {
    const match = await bcrypt.compare(body.password, user.password);
    // const match = true;
    if (match) {
      const token = jwt.sign(
        { sub: '1234567890', name: user.name, password_hash: user.password },
        ctx.config.stockexchange.jwtSecret, // access Secret key from config
        {
          expiresIn: '1h',
          issuer: ctx.config.stockexchange.issuer,
          audience: ctx.config.stockexchange.audience,
        }, // jwt Options
      );
      logger.info('Token generated %s', token);
      return new GSStatus(true, 200, 'Login Successful', { JWT: token }, {});
    } else {
      return new GSStatus(false, 401, 'Failed, Invalid Credentials. Try again');
    }
  }
};
