import { test, expect, Page } from '@playwright/test';
import { addToCartByProductName, removeItemFromCart } from '../utils/cart';
import { addCheckoutInfo } from '../utils/checkout';
import { login } from '../utils/login';
import { userInfo, products } from '../constants/appConstants';
//
test.describe('Swag Labs - Cart and Checkout Functionality', () => {
  let page: Page;

  // Log in once before all tests, and keep session active
  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    await login(page); // Logs in only once before all tests
  });

  // Test to add items to the cart
  test('should add items to cart', async () => {
    await addToCartByProductName(page, products.backpack);
    await addToCartByProductName(page, products.bikeLight);

    // Navigate to the cart page
    await page.getByTestId('shopping-cart-link').click();

    // Get all cart items and verify count
    const cartItems = page.locator('[data-test="inventory-item-name"]');
    await expect(cartItems).toHaveCount(2);

    // Ensure specific items are in the cart
    const backpackItem = cartItems.filter({ hasText: 'Sauce Labs Backpack' });
    const bikeLightItem = cartItems.filter({
      hasText: 'Sauce Labs Bike Light',
    });
    await expect(backpackItem).toHaveCount(1);
    await expect(bikeLightItem).toHaveCount(1);
  });

  // Test to remove items from the cart
  test('should remove items from cart', async () => {
    await page.getByTestId('shopping-cart-link').click();
    await removeItemFromCart(page, products.backPackId);

    const cartItems = page.locator('[data-test="inventory-item-name"]');
    const backpackItem = cartItems.filter({ hasText: 'Sauce Labs Backpack' });
    await expect(backpackItem).not.toBeAttached();
  });

  // Test to complete the checkout process
  test('should complete checkout', async () => {
    // Proceed to the checkout process
    await page.getByRole('button', { name: 'Checkout' }).click();

    // Verify that the user is on the "Checkout: Your Information" page
    const checkoutPageStepOneTitle = page.getByText('Checkout: Your Information');
    await expect(checkoutPageStepOneTitle).toBeVisible();

    // Fill out the checkout information (first name, last name, and postcode)
    await addCheckoutInfo(page, userInfo.firstName, userInfo.lastName, userInfo.postcode);

    // Continue to the next step in the checkout process
    await page.getByTestId('continue').click();

    // Verify that the user is on the second step of the checkout process
    const checkoutPageStepTwoTitle = page.getByTestId('title');
    await expect(checkoutPageStepTwoTitle).toBeVisible();
    await expect(checkoutPageStepTwoTitle).toContainText('Checkout');

    // Function to extract and parse the price
    async function getPriceFromText(page: Page, textId: string) {
      const text = await page.getByTestId(textId).textContent();
      if (text === null) {
        throw new Error(`Text not found for testId: ${textId}`);
      }
      return parseFloat(text.replace(/[^\d.]/g, '').trim());
    }

    const itemTotal = getPriceFromText(page, 'subtotal-label');
    const taxValue = await getPriceFromText(page, 'tax-label');
    const priceTotal = await getPriceFromText(page, 'total-label');

    // Utility function to round numbers
    const roundToTwoDecimals = (value: number) => Math.round(value * 100) / 100;

    // Ensure that the total price equals the sum of item total and tax
    const expectedTotal = (await (itemTotal ?? 0)) + (taxValue ?? 0);
    expect(roundToTwoDecimals(expectedTotal)).toEqual(roundToTwoDecimals(priceTotal ?? 0));

    // Finish the checkout process
    await page.getByRole('button', { name: 'Finish' }).click();

    // Verify that the checkout is complete
    const checkoutComplete = page.getByTestId('complete-header');
    await expect(checkoutComplete).toBeVisible();
  });

  // Log out after all tests are complete
  test.afterAll(async () => {
    await page.getByRole('button', { name: 'Open Menu' }).click(); // Open the menu
    await page.getByRole('link', { name: 'Logout' }).click(); // Click the logout link
    await page.close(); // Close the page
  });
});
