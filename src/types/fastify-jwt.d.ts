// Minimal ambient declaration so fastify-jwt@4 (untyped) can be imported without TS errors
declare module "fastify-jwt" {
  const plugin: any;
  export default plugin;
}
