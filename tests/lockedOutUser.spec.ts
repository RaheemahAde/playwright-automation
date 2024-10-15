import { test, expect} from '@playwright/test';
import { urls, userInfo, messages} from '../constants/appConstants';

test ('should not allow locked out user to login', async({page}) => {
    await page.goto(urls.baseUrl)
    await page.getByPlaceholder('username').fill(userInfo.lockedOutUsername);
    await page.getByPlaceholder('password').fill(userInfo.password);
    await page.getByRole('button', {name:'Login'}).click();

    // Assert that the error message is displayed
    await expect (page.locator('h3[data-test="error"]')).toContainText(messages.errorMessage)
    await expect(page).toHaveURL(urls.baseUrl)
})
