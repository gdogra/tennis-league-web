import { ZodSchema, ZodError } from 'zod'

/**
 * Validate body with zod or throw { status, msg } that our handlers catch.
 */
export function validate<T>(schema: ZodSchema<T>, body: unknown): T {
  try {
    return schema.parse(body)
  } catch (e) {
    if (e instanceof ZodError) {
      throw { status: 400, msg: e.issues[0].message }
    }
    throw e
  }
}

