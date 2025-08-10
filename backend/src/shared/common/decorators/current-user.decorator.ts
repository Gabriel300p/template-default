import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator to extract the current user from the request
 * 
 * @example
 * ```typescript
 * @Get('profile')
 * getProfile(@CurrentUser() user: any) {
 *   return { user };
 * }
 * 
 * // Extract specific property
 * @Get('my-id')
 * getMyId(@CurrentUser('id') userId: string) {
 *   return { userId };
 * }
 * ```
 */
export const CurrentUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);

