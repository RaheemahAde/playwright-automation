import { expect, Page } from '@playwright/test';
import * as constants from '../config/constants';

export async function login(page: Page) {
  await page.goto(constants.url);
  await expect(page).toHaveTitle(constants.expectedPageTitle);

  await page.getByPlaceholder('Username').fill(constants.username);
  await page.getByPlaceholder('Password').fill(constants.password);
  await page.getByText('Login').click();
  await expect(page).toHaveURL(constants.productUrl);
}
