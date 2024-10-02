import { test, expect, Page } from '@playwright/test';
import { addToCartByProductName, removeItemFromCart } from '../utils/cart';
import { addCheckoutInfo } from '../utils/checkout';
import { login } from '../utils/login';
import { userInfo, products } from '../constants/appConstants';

test.describe('Swag Labs - Cart and Checkout Functionality', () => {
  test.beforeEach('should login', async ({ page }) => {
    await login(page);
  });
  test('should add items to cart and checkout', async ({ page }) => {
    await addToCartByProductName(page, products.product1);
    await addToCartByProductName(page, products.product2);

    await page.getByTestId('shopping-cart-link').click();

    const cartItems = page.locator('[data-test="inventory-item-name"]');

    const itemCount = await cartItems.count();

    for (let i = 0; i < itemCount; i++) {
      const itemText = await cartItems.nth(i).textContent();
      expect(itemText).not.toContain(products.excludedItem);
    }

    const backpackItem = cartItems.filter({ hasText: 'Sauce Labs Backpack' });
    const bikeLightItem = cartItems.filter({
      hasText: 'Sauce Labs Bike Light',
    });

    await expect(backpackItem).toHaveCount(1);
    await expect(bikeLightItem).toHaveCount(1);

    await removeItemFromCart(page, products.backPackId);

    await expect(backpackItem).not.toBeAttached();
    await expect(bikeLightItem).toBeVisible();

    await page.getByRole('button', { name: 'Checkout' }).click();

    const checkoutPageStepOneTitle = page.getByText(
      'Checkout: Your Information'
    );
    await expect(checkoutPageStepOneTitle).toBeVisible();

    await addCheckoutInfo(
      page,
      userInfo.firstName,
      userInfo.lastName,
      userInfo.postcode
    );
    await page.getByTestId('continue').click();

    const checkoutPageStepTwoTitle = page.getByTestId('title');
    await expect(checkoutPageStepTwoTitle).toBeVisible();
    await expect(checkoutPageStepTwoTitle).toContainText('Checkout');

    // Locate the item price
    async function getPriceFromText(page: Page, textId: string) {
      const text = await page.getByTestId(textId).textContent();

      if (text === null) {
        throw new Error(`Text not found for testId: ${textId}`);
      }
      // Return the parsed price if the text exists
      return parseFloat(text.replace(/[^\d.]/g, '').trim());
    }

    const itemTotal = getPriceFromText(page, 'subtotal-label');
    const taxValue = await getPriceFromText(page, 'tax-label');
    const priceTotal = await getPriceFromText(page, 'total-label');

    const roundToTwoDecimals = (value: number) => Math.round(value * 100) / 100;

    const expectedTotal = (await (itemTotal ?? 0)) + (taxValue ?? 0);
    expect(roundToTwoDecimals(expectedTotal)).toEqual(
      roundToTwoDecimals(priceTotal ?? 0)
    );

    await page.getByRole('button', { name: 'Finish' }).click();
    const checkoutComplete = page.getByTestId('complete-header');
    await expect(checkoutComplete).toBeVisible();
  });
  test.afterEach(async ({ page }) => {
    await page.getByRole('button', { name: 'Open Menu' }).click();
    await page.getByRole('link', { name: 'Logout' }).click();
  });
});
