import { test, expect, Page } from '@playwright/test';

test.describe('Swag Labs - Cart and Checkout Functionality', () => {
  test.beforeEach(async ({ page }) => {
    const url = 'https://www.saucedemo.com/';
    const expectedPageTitle = 'Swag Labs';

    await page.goto(url);
    await expect(page).toHaveTitle(expectedPageTitle);
  });
  test('should login, add items to cart, checkout and make payment', async ({
    page,
  }) => {
    const url = 'https://www.saucedemo.com/inventory.html';

    await page.getByPlaceholder('Username').fill('standard_user');
    await page.getByPlaceholder('Password').fill('secret_sauce');
    await page.getByText('Login').click();

    await expect(page).toHaveURL(url);

    async function addToCartByProductName(page: Page, productName: string) {
      const product = page.locator('[data-test="inventory-item"]', {
        hasText: productName,
      });
      await product.getByRole('button', { name: 'Add to cart' }).click();
    }

    await addToCartByProductName(page, 'Sauce Labs Backpack');
    await addToCartByProductName(page, 'Sauce Labs Bike Light');

    await page.getByTestId('shopping-cart-link').click();

    const cartItems = page.locator('[data-test="inventory-item-name"]');
    const excludedItem = 'Test.allTheThings() T-Shirt (Red)';

    const itemCount = await cartItems.count();

    for (let i = 0; i < itemCount; i++) {
      const itemText = await cartItems.nth(i).textContent();
      expect(itemText).not.toContain(excludedItem);
    }

    const backpackItem = cartItems.filter({ hasText: 'Sauce Labs Backpack' });
    const bikeLightItem = cartItems.filter({
      hasText: 'Sauce Labs Bike Light',
    });

    await expect(backpackItem).toHaveCount(1);
    await expect(bikeLightItem).toHaveCount(1);

    const removeItem = page.getByTestId('remove-sauce-labs-backpack');
    await removeItem.click();

    await expect(backpackItem).not.toBeVisible();
    await expect(bikeLightItem).toBeVisible();

    await page.getByRole('button', { name: 'Checkout' }).click();

    const checkoutPageTitle = page.getByText('Checkout: Your Information');
    await expect(checkoutPageTitle).toBeVisible();

    await page.getByPlaceholder('First Name').fill('Rose');
    await page.getByPlaceholder('Last Name').fill('May');
    await page.getByPlaceholder('Zip/Postal Code').fill('TA1 1JH');
    await page.getByTestId('continue').click();
    //await expect(page).to
    let itemTotal;
    let taxValue;
    let priceTotal;
    // Locate the item price
    const itemTotalText = await page
      .getByTestId('subtotal-label')
      .textContent();

    if (itemTotalText) {
      itemTotal = parseFloat(itemTotalText.replace(/[^\d.]/g, '').trim());
    } else {
      throw new Error('Price not found!');
    }

    // Locate the tax value
    const taxText = await page.getByTestId('tax-label').textContent();
    if (taxText) {
      taxValue = parseFloat(taxText.replace(/[^\d.]/g, '').trim());
    } else {
      throw new Error('Tax Value not found!');
    }
    // Locate the price total
    const totalText = await page.getByTestId('total-label').textContent();
    if (totalText) {
      priceTotal = parseFloat(totalText.replace(/[^\d.]/g, '').trim());
    } else {
      throw new Error('Price Total not found');
    }

    const expectedTotal = (itemTotal ?? 0) + (taxValue ?? 0);
    // Round both totals to 2 decimal places
    const roundedExpectedTotal = Math.round(expectedTotal * 100) / 100;
    const roundedPriceTotal = Math.round((priceTotal ?? 0) * 100) / 100;

    expect(roundedExpectedTotal).toEqual(roundedPriceTotal);
  });
});
