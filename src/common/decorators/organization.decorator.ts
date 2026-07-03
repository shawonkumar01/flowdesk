import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Organization = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return data ? request.organization?.[data] : request.organization;
  },
);
