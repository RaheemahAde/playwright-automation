import { Page } from '@playwright/test';

export async function addCheckoutInfo(
  page: Page,
  firstName: string,
  lastName: string,
  postcode: string
) {
  await page.getByPlaceholder('First Name').fill(firstName);
  await page.getByPlaceholder('Last Name').fill(lastName);
  await page.getByPlaceholder('Zip/Postal Code').fill(postcode);
}
