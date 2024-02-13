import slugify from "slugify";

import * as fs from "fs";

// Generate slug
export function generateSlug(input: string): string {
  const slug = slugify(input, {
    replacement: "_",
    remove: undefined,
    lower: true,
    strict: true,
  });

  return slug;
}

// return url
export function getUrl(path: string): string {
  // read from nestjs app
  const host = process.env.APP_URL;
  return `${host}/${path}`;
}

export const deleteFile = (path: string) => {
  fs.unlink(path, err => {
    if (err) {
      console.error(err);
      return;
    }
  });
};

