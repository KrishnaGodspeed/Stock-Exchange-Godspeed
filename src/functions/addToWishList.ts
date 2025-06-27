import { GSStatus, logger, GSContext } from "@godspeedsystems/core";
import {PrismaClient} from "../datasources/prisma-clients/schema"

export default async function (ctx: GSContext){
    const {inputs: {
        data : {
            query,
            user
        }
    }, logger, datasources, functions} = ctx;

    const prismaClient: PrismaClient = await datasources.schema.client;
    const existingOptions = await prismaClient.intraday.findFirst({
    where: {
      function: query.function,
      symbol: query.symbol,
      interval: query.interval,
      adjusted: query.adjusted,
      extended_hours: query.extended_hours,
      month: query.month,
      outputsize: query.outputsize,
      datatype: query.datatype,
    },
  });

if (existingOptions){
    const result = await functions["create_wishlist_workflow"](ctx, {body : {
      userId : user.id,
      optionsId: existingOptions.id
    }});
    return new GSStatus(result);
}

}
