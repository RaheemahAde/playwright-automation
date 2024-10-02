import { test, expect } from '@playwright/test';
import {
  addToCartByProductName,
  removeItemFromCart,
} from '../helpers/cartHelpers';
import { completeCheckout } from '../helpers/checkoutHelpers';
import * as constants from '../config/constants';

let itemTotal;
let taxValue;
let priceTotal;

test.describe('Swag Labs - Cart and Checkout Functionality', () => {
  test.beforeEach('should login', async ({ page }) => {
    await page.goto(constants.url);
    await expect(page).toHaveTitle(constants.expectedPageTitle);

    await page.getByPlaceholder('Username').fill(constants.username);
    await page.getByPlaceholder('Password').fill(constants.password);
    await page.getByText('Login').click();
    await expect(page).toHaveURL(constants.productUrl);
  });
  test('add items to cart, checkout and make payment', async ({ page }) => {
    await addToCartByProductName(page, constants.product1);
    await addToCartByProductName(page, constants.product2);

    await page.getByTestId('shopping-cart-link').click();

    const cartItems = page.locator('[data-test="inventory-item-name"]');

    const itemCount = await cartItems.count();

    for (let i = 0; i < itemCount; i++) {
      const itemText = await cartItems.nth(i).textContent();
      expect(itemText).not.toContain(constants.excludedItem);
    }

    const backpackItem = cartItems.filter({ hasText: 'Sauce Labs Backpack' });
    const bikeLightItem = cartItems.filter({
      hasText: 'Sauce Labs Bike Light',
    });

    await expect(backpackItem).toHaveCount(1);
    await expect(bikeLightItem).toHaveCount(1);

    await removeItemFromCart(page, constants.backPackId);

    await expect(backpackItem).not.toBeVisible();
    await expect(bikeLightItem).toBeVisible();

    await page.getByRole('button', { name: 'Checkout' }).click();

    const checkoutPageTitle = page.getByText('Checkout: Your Information');
    await expect(checkoutPageTitle).toBeVisible();

    await completeCheckout(
      page,
      constants.firstName,
      constants.lastName,
      constants.postcode
    );
    await page.getByTestId('continue').click();
    //await expect(page).to

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
