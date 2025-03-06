import {z} from 'zod';

function create(image: any) {
  return z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      tags: z.array(z.string()).optional(),
      card_image: image().optional(),
      links: z
        .array(z.object({ name: z.string(), link: z.string() }))
        .optional(),
    });
}