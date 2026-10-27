/**
 * Request header the ORBIT edge entry point uses to hand the URL locale to the
 * server render. The root layout cannot see `searchParams`, so without this the
 * document language could not follow a `?locale=` navigation.
 */
export const ORBIT_LOCALE_HEADER = 'x-orbit-locale'
