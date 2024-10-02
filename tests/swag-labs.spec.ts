import { test, expect } from '@playwright/test';



test.describe('Swag Labs - Cart and Checkout Functionality', () => {
  test.beforeEach(async ({ page }) => {
    const url = 'https://www.saucedemo.com/';
    const expectedPageTitle = 'Swag Labs';
      
    await page.goto(url);
    await expect(page).toHaveTitle(expectedPageTitle);
    });
  test('should login, add items to cart, checkout and make payment', async ({ page }) => {
    const url = 'https://www.saucedemo.com/inventory.html';
    const expectedTitle = 'Products';

    await page.getByPlaceholder('Username').fill('standard_user');
    await page.getByPlaceholder('Password').fill('secret_sauce');
    await page.getByText('Login').click();

    await expect(page).toHaveURL(url);
    await page.pause();

    async function addToCartByProductName(
      page: { locator: (arg0: string, arg1: { hasText: string }) => any },
      productName: string
    ) {
      const product = page.locator('[data-test="inventory-item"]', { hasText: productName });
      await product.getByRole('button', { name: 'Add to cart' }).click();
    }

    await addToCartByProductName(page, 'Sauce Labs Backpack');
    await addToCartByProductName(page, 'Sauce Labs Bike Light');

    await page.locator('[data-test="shopping-cart-link"]').click();

    const cartItems = page.locator('[data-test="inventory-item-name"]');
    const excludedItem = 'Test.allTheThings() T-Shirt (Red)';

    // Get the count of items and print each item's text
    const itemCount = await cartItems.count();

    for (let i = 0; i < itemCount; i++) {
      const itemText = await cartItems.nth(i).textContent();
      expect(itemText).not.toContain(excludedItem);
    }

    const backpackItem = cartItems.filter({ hasText: 'Sauce Labs Backpack' });
    const bikeLightItem = cartItems.filter({ hasText: 'Sauce Labs Bike Light' });

    await expect(backpackItem).toHaveCount(1);
    await expect(bikeLightItem).toHaveCount(1);

    const removeItem = page.locator('[data-test="remove-sauce-labs-backpack"]');
    await removeItem.click();

    await expect(backpackItem).not.toBeVisible();
    await expect(bikeLightItem).toBeVisible();

    await page.getByRole('button', { name: 'Checkout' }).click();
    await page.pause();

    const checkoutPageTitle = page.getByText('Checkout: Your Information');
    await expect(checkoutPageTitle).toBeVisible();
  });
});
