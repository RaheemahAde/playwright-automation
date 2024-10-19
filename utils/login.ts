import { expect, Page } from '@playwright/test';
import { urls, userInfo, pageTitles } from '../constants/appConstants';

export async function login(page: Page) {
  await page.goto(urls.baseUrl);
  await expect(page).toHaveTitle(pageTitles.expectedPageTitle);

  await page.getByPlaceholder('Username').fill(userInfo.username);
  await page.getByPlaceholder('Password').fill(userInfo.password);
  await page.getByText('Login').click();
  await expect(page).toHaveURL(urls.productUrl);
  } 
