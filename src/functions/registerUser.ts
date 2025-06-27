import { GSContext, GSStatus } from '@godspeedsystems/core';
import { PrismaClient } from '../datasources/prisma-clients/schema';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export default async function (ctx: GSContext) {
  const {
    inputs: {
      data: { body },
    },
    logger,
    datasources,
  } = ctx;

  logger.info('register data recieved %o', body);

  const salt = 10;
  const client: PrismaClient = await datasources.schema.client;
  try {
    const user = await client.user.create({
      data: {
        email: body.email,
        name: body.name,
        password: await bcrypt.hash(body.password, salt),
      },
    });
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
    return new GSStatus(
      true,
      201,
      'Registration Successful',
      { JWT: token },
      {},
    );
  } catch (err) {
    return new GSStatus(false, 409, 'Registration Failed', err);
  }
}
