import { test, expect, Page } from '@playwright/test';
import { addToCartByProductName, removeItemFromCart } from '../utils/cart';
import { addCheckoutInfo } from '../utils/checkout';
import { login } from '../utils/login';
import { userInfo, products } from '../constants/appConstants';

test.describe('Swag Labs - Cart and Checkout Functionality', () => {
  
  // Hook to log in before each test
  test.beforeEach('should login', async ({ page }) => {
    await login(page); // Logs in using the login function
  });

  // Test to add items to the cart and proceed with the checkout
  test('should add items to cart and complete checkout', async ({ page }) => {
    
    // Add two specific products to the cart
    await addToCartByProductName(page, products.product1);
    await addToCartByProductName(page, products.product2);

    // Navigate to the cart page by clicking the shopping cart icon
    await page.getByTestId('shopping-cart-link').click();

    // Get all cart items based on the locator for item names
    const cartItems = page.locator('[data-test="inventory-item-name"]');

    // Count the number of items in the cart
    const itemCount = await cartItems.count();

    // Ensure that none of the cart items is an excluded product
    for (let i = 0; i < itemCount; i++) {
      const itemText = await cartItems.nth(i).textContent();
      expect(itemText).not.toContain(products.excludedItem);
    }

    // Verify that specific items (backpack and bike light) are present in the cart
    const backpackItem = cartItems.filter({ hasText: 'Sauce Labs Backpack' });
    const bikeLightItem = cartItems.filter({
      hasText: 'Sauce Labs Bike Light',
    });

    // Check that there is exactly 1 backpack and 1 bike light in the cart
    await expect(backpackItem).toHaveCount(1);
    await expect(bikeLightItem).toHaveCount(1);

    // Remove the backpack item from the cart
    await removeItemFromCart(page, products.backPackId);

    // Ensure the backpack is removed and the bike light is still visible
    await expect(backpackItem).not.toBeAttached();
    await expect(bikeLightItem).toBeVisible();

    // Proceed to the checkout process by clicking the checkout button
    await page.getByRole('button', { name: 'Checkout' }).click();

    // Verify that the user is on the "Checkout: Your Information" page
    const checkoutPageStepOneTitle = page.getByText(
      'Checkout: Your Information'
    );
    await expect(checkoutPageStepOneTitle).toBeVisible();

    // Fill out the checkout information (first name, last name, and postcode)
    await addCheckoutInfo(
      page,
      userInfo.firstName,
      userInfo.lastName,
      userInfo.postcode
    );
    
    // Continue to the next step in the checkout process
    await page.getByTestId('continue').click();

    // Verify that the user is on the second step of the checkout process
    const checkoutPageStepTwoTitle = page.getByTestId('title');
    await expect(checkoutPageStepTwoTitle).toBeVisible();
    await expect(checkoutPageStepTwoTitle).toContainText('Checkout');

    // Function to extract and parse the price from an element identified by test ID
    async function getPriceFromText(page: Page, textId: string) {
      const text = await page.getByTestId(textId).textContent();

      // Throw an error if no text is found
      if (text === null) {
        throw new Error(`Text not found for testId: ${textId}`);
      }
      // Return the parsed price after stripping non-numeric characters
      return parseFloat(text.replace(/[^\d.]/g, '').trim());
    }

    // Calculate item total, tax, and final price by extracting and parsing text content
    const itemTotal = getPriceFromText(page, 'subtotal-label');
    const taxValue = await getPriceFromText(page, 'tax-label');
    const priceTotal = await getPriceFromText(page, 'total-label');

    // Utility function to round numbers to two decimal places
    const roundToTwoDecimals = (value: number) => Math.round(value * 100) / 100;

    // Ensure that the total price equals the sum of item total and tax
    const expectedTotal = (await (itemTotal ?? 0)) + (taxValue ?? 0);
    expect(roundToTwoDecimals(expectedTotal)).toEqual(
      roundToTwoDecimals(priceTotal ?? 0)
    );

    // Finish the checkout process
    await page.getByRole('button', { name: 'Finish' }).click();

    // Verify that the checkout is complete
    const checkoutComplete = page.getByTestId('complete-header');
    await expect(checkoutComplete).toBeVisible();
  });

  // Hook to log out after each test
  test.afterEach('should ensure user is logged out after test', async ({ page }) => {
    await page.getByRole('button', { name: 'Open Menu' }).click(); // Open the menu
    await page.getByRole('link', { name: 'Logout' }).click(); // Click the logout link

  // Check for the presence of the login button
    const loginButton = page.getByRole('button', { name: 'Login' });
    await expect(loginButton).toBeVisible();
  });
});
